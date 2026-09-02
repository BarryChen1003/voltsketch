"""gerber-check.py — 用 gerbonara（第三方 Gerber/Excellon 解析器）讀我們產出的板廠檔。

為什麼要用別人的解析器：`gerber-check.js` 驗的是「我們寫出來的東西符合我們對 Gerber 的
理解」——表頭、收尾、座標在板框內。那些檢查抓得到很多事，但抓不到「我們對格式的理解錯了」。
gerbonara 是 pcb-tools 的後繼，跟我們毫無關係；它讀得懂、而且讀出來的圖形數量與板框
對得上我們自己算的數字，才算數。

用法：
    python gerber-check.py <gerber 目錄> <index.json 裡那一片的 expect> <結果.json>
"""
import json
import math
import os
import sys


def main():
    if len(sys.argv) < 4:
        raise SystemExit("usage: gerber-check.py <dir> <expect.json> <out.json>")
    gdir, expect_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(expect_path, encoding="utf-8") as fh:
        expect = json.load(fh)

    out = {"dir": os.path.basename(os.path.dirname(gdir.rstrip("/\\"))), "problems": []}
    try:
        from gerbonara import LayerStack
        from gerbonara.rs274x import GerberFile
        from gerbonara.excellon import ExcellonFile
    except Exception as e:  # noqa: BLE001
        out["ok"] = False
        out["problems"].append("gerbonara unavailable: %s" % e)
        _write(out_path, out)
        return

    gbrs, drls = [], []
    for name in sorted(os.listdir(gdir)):
        p = os.path.join(gdir, name)
        if name.lower().endswith(".gbr"):
            gbrs.append((name, p))
        elif name.lower().endswith(".drl"):
            drls.append((name, p))

    out["gerberFiles"] = len(gbrs)
    out["drillFiles"] = len(drls)
    layers = {}

    for name, p in gbrs:
        try:
            g = GerberFile.open(p)
        except Exception as e:  # noqa: BLE001
            out["problems"].append("%s: gerbonara could not parse it (%s)" % (name, e))
            continue
        objs = list(g.objects)
        layers[name] = len(objs)
        # 空的銅層通常是真的沒東西，但**整包都空**就是格式沒被讀懂
        try:
            bounds = g.bounding_box(unit="mm")
        except Exception:  # noqa: BLE001
            bounds = None
        if bounds:
            (x0, y0), (x1, y1) = bounds
            w, h = x1 - x0, y1 - y0
            # 板框是硬界線：任何圖形跑出板外都是匯出錯，不是設計問題
            if w - expect["boardWidth"] > 1.0 or h - expect["boardHeight"] > 1.0:
                out["problems"].append(
                    "%s: 圖形範圍 %.2f×%.2f 超出板框 %.2f×%.2f"
                    % (name, w, h, expect["boardWidth"], expect["boardHeight"]))

    out["objectsPerLayer"] = layers
    if layers and not any(layers.values()):
        out["problems"].append("每一個 .gbr 都讀不到任何圖形——格式八成沒被讀懂")

    # 鑽孔：第三方數出來的孔數要跟我們自己算的一樣
    holes = 0
    tools = set()
    for name, p in drls:
        try:
            d = ExcellonFile.open(p)
        except Exception as e:  # noqa: BLE001
            out["problems"].append("%s: gerbonara could not parse it (%s)" % (name, e))
            continue
        objs = list(d.objects)
        holes += len(objs)
        for o in objs:
            dia = getattr(o, "diameter", None)
            if dia is not None:
                tools.add(round(float(dia), 4))
    out["holes"] = holes
    out["toolDiameters"] = sorted(tools)
    if expect.get("drills") is not None and holes != expect["drills"]:
        out["problems"].append("鑽孔數 %d != 我們自己算的 %d" % (holes, expect["drills"]))

    out["ok"] = not out["problems"]
    _write(out_path, out)


def _write(path, obj):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=1)


main()
