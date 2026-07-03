// Supabase Edge Function: pcb-thermal
// 完整 IPC-2221 熱/載流量精算。只有「登入 + profiles.pcb_access=true(或 role=admin)」才回結果。
// 部署：supabase functions deploy pcb-thermal
// 此演算法只存在後端 → 前端無法讀取/繞過（真鎖）。
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    // 用呼叫者的 JWT 建 client → RLS 下只能讀自己的 profile
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return json({ error: '未登入' }, 401);

    const { data: prof } = await supa
      .from('profiles').select('pcb_access, role').eq('id', user.id).maybeSingle();
    if (!prof || (!prof.pcb_access && prof.role !== 'admin')) {
      return json({ error: '未解鎖 PCB 進階功能' }, 403);
    }

    const p = await req.json();
    const oz = num(p.oz, 1), dT = Math.max(1, num(p.dT, 10)), Ta = num(p.Ta, 25);
    const I = num(p.I, 1), P = num(p.P, 0.5), areaCm2 = num(p.areaCm2, 1), vias = num(p.vias, 0);
    const traces = Array.isArray(p.traces) ? p.traces : [];

    const tMil = oz * 1.378;          // 1oz ≈ 1.378 mil
    const k = 0.048;                  // IPC-2221 外層常數
    const mm2mil = 0.03937;
    const ampacity = (wMm: number) => {
      const A = (wMm / mm2mil) * tMil; // mil²
      return k * Math.pow(dT, 0.44) * Math.pow(A, 0.725);
    };
    const Aneed = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725);
    const wNeedMm = (Aneed / tMil) * mm2mil;

    const issues: { sev: string; msg: string }[] = [];
    issues.push({ sev: 'ok', msg: `載 ${I}A、ΔT ${dT}°C（${oz}oz）→ 建議最小線寬 ≈ ${wNeedMm.toFixed(2)} mm` });
    traces.slice(0, 8).forEach((t: any, i: number) => {
      const w = num(t.width, 0.3), cap = ampacity(w);
      const over = cap < I;
      issues.push({ sev: over ? 'warn' : 'info', msg: `走線#${i + 1} ${w}mm → 載流量 ≈ ${cap.toFixed(2)}A${over ? `（< 目標 ${I}A）` : ''}` });
    });
    const theta = Math.max(20, 80 / (1 + areaCm2 * 0.6 + vias * 0.08));
    const Tj = Ta + P * theta;
    const sev = Tj > 125 ? 'err' : Tj > 85 ? 'warn' : 'ok';
    issues.push({ sev, msg: `功率元件 Tj 精算 ≈ ${Tj.toFixed(0)}°C（θ_ja≈${theta.toFixed(0)}°C/W, P=${P}W, Ta=${Ta}°C）` });
    if (sev !== 'ok') issues.push({ sev: 'info', msg: '降溫：加大散熱銅面積、多打散熱孔、加厚銅、必要時加散熱片' });

    return json({ issues }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function num(v: unknown, d: number): number { const n = Number(v); return isNaN(n) ? d : n; }
function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
