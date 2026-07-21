/**
 * observe.js — 前端錯誤監控 + 輕量 analytics（無第三方、直打 Supabase REST）
 * 資料表見 supabase-observability.sql（error_logs / page_views，anon 可 INSERT、admin 才 SELECT）。
 * 設計原則：
 *   - 絕不因記錄本身而拋錯（全程 try/catch + 靜默失敗），不干擾使用者操作。
 *   - 不送 PII：只送 pathname（不含 query）、referrer 的 host、截斷後的訊息/stack/UA。
 *   - session id 存 sessionStorage（隨機、關頁即失效、無法回溯到人）。
 *   - 去重 + 每 session 上限，避免同一錯誤洗版或惡意灌量（非伺服器級限流，見 SQL 註記）。
 *   - AUTH_CONFIG 未設定（demo 模式）→ 整支 no-op。
 */
(function () {
  'use strict';

  var cfg = window.AUTH_CONFIG || {};
  var URL_BASE = cfg.url, KEY = cfg.anonKey;
  var ENABLED = URL_BASE && KEY && !/YOUR_/.test(String(URL_BASE) + String(KEY));
  var APP_VER = window.APP_VERSION || '';

  // ---- session id（隨機、非 PII）----
  function sid() {
    try {
      var s = sessionStorage.getItem('ha_sid');
      if (!s) {
        s = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
        sessionStorage.setItem('ha_sid', s);
      }
      return s;
    } catch (e) { return 'nosess'; }
  }

  function clip(v, n) { v = v == null ? '' : String(v); return v.length > n ? v.slice(0, n) : v; }

  // ---- 直打 REST（insert-only；失敗靜默）----
  function post(table, row) {
    if (!ENABLED) return;
    try {
      fetch(URL_BASE + '/rest/v1/' + table, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': KEY,
          'Authorization': 'Bearer ' + KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row),
        keepalive: true    // 分頁關閉時仍能送出（pageview/最後錯誤不漏）
      }).catch(function () {});
    } catch (e) { /* 靜默 */ }
  }

  // ================= 錯誤監控 =================
  var ERR_CAP = 20;              // 每 session 最多送 20 筆，防洗版/灌量
  var errSent = 0;
  var seen = {};                 // 去重：同簽章只送一次

  function shouldSkip(msg, src) {
    // 跨源 script error（無細節，送了也沒用）與已知無害噪音
    if (!msg) return true;
    if (/^Script error\.?$/i.test(msg)) return true;
    if (/ResizeObserver loop/i.test(msg)) return true;
    // 記錄器自身/擴充功能造成的雜訊
    if (src && /extension:\/\//.test(src)) return true;
    return false;
  }

  function logError(kind, message, source, lineno, colno, stack) {
    if (!ENABLED || errSent >= ERR_CAP) return;
    if (shouldSkip(message, source)) return;
    var sig = clip(message, 120) + '|' + clip(source, 80) + '|' + (lineno || 0);
    if (seen[sig]) return;
    seen[sig] = 1;
    errSent++;
    post('error_logs', {
      kind: kind,
      message: clip(message, 500),
      source: clip(source, 300),
      lineno: lineno || null,
      colno: colno || null,
      stack: clip(stack, 2000),
      page: clip(location.pathname, 200),
      ua: clip(navigator.userAgent, 300),
      sid: sid(),
      ver: clip(APP_VER, 40)
    });
  }

  window.addEventListener('error', function (e) {
    // 資源載入失敗（img/script 404）也會觸發 error，但無 e.error；仍記 message
    var stack = e.error && e.error.stack ? e.error.stack : '';
    logError('error', e.message || (e.error && e.error.message) || 'unknown error',
      e.filename || '', e.lineno, e.colno, stack);
  });

  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    var msg = (r && (r.message || r.toString && r.toString())) || 'unhandled rejection';
    var stack = (r && r.stack) || '';
    logError('unhandledrejection', msg, '', 0, 0, stack);
  });

  // ================= Analytics =================
  function refHost() {
    try {
      if (!document.referrer) return '';
      var u = new URL(document.referrer);
      // 同站導覽不記為外部來源
      if (u.host === location.host) return '(internal)';
      return u.host;                    // 只留 host，不留完整 URL（隱私）
    } catch (e) { return ''; }
  }

  function pageview() {
    if (!ENABLED) return;
    post('page_views', {
      kind: 'pageview',
      name: null,
      path: clip(location.pathname, 200),
      ref: clip(refHost(), 120),
      lang: clip((navigator.language || ''), 12),
      vw: window.innerWidth || null,
      vh: window.innerHeight || null,
      sid: sid()
    });
  }

  // 自訂事件（其他程式可呼叫 window.Observe.track('export_kicad')）
  function track(name, meta) {
    if (!ENABLED || !name) return;
    post('page_views', {
      kind: 'event',
      name: clip(name, 80),
      path: clip(location.pathname, 200),
      ref: meta && meta.ref ? clip(meta.ref, 120) : null,
      lang: clip((navigator.language || ''), 12),
      vw: window.innerWidth || null,
      vh: window.innerHeight || null,
      sid: sid()
    });
  }

  // 首屏送一次 pageview（DOM 已可用時）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pageview);
  } else {
    pageview();
  }

  window.Observe = { track: track, enabled: ENABLED, logError: logError };
})();
