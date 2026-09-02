"""step-check.py — 用 FreeCAD 的 OCCT 核心開我們匯出的 STEP，獨立判斷它是不是好檔。

為什麼要用別人的核心：`step.test.js` 驗的是「我們寫出來的東西符合我們對 STEP 的理解」
（參照完整性、流形性、尤拉示性數）。那些檢查很硬，但它跟被驗的東西出自同一套假設——
如果我們對 AP214 的理解本身就錯了，自己驗自己永遠是綠的。實際上就錯了：2026-09-02
用 OCCT 開我們的 STEP，讀出來是**空的**（0 物件、shape isNull），而 62 條內部斷言全綠。
原因是檔裡沒有 PRODUCT_DEFINITION 那條產品結構——幾何一直是對的，只是沒有門讓人走進來。

OCCT 是真正的 CAD 核心（FreeCAD／CATIA 血統），它讀得進去、判定 shape 有效，
才是「這份檔在 CAD 裡打得開」的證據。

用法（由 verify.ps1 呼叫，也可單獨跑）：
    FreeCADCmd step-check.py <board.step> <結果.json> [期望實體數]

結果寫檔不走 stdout：FreeCADCmd 會把 banner 混進 stdout，而且 sys.exit 之後 print
不一定 flush 得出來——踩過一次，這裡就不要靠 stdout 傳資料。
"""
import json
import os
import sys


def analyse(path, want_solids):
    out = {"file": os.path.basename(path)}
    import Part

    shape = Part.Shape()
    try:
        shape.read(path)                        # OCCT 的 STEP reader
    except Exception as e:                      # noqa: BLE001
        out.update(ok=False, problems=["read failed: %s" % e])
        return out

    if shape.isNull():
        # 這正是「檔案看起來很大、CAD 開起來是空的」那個症狀
        out.update(ok=False, problems=["OCCT read the file but the shape is null (no product structure?)"])
        return out

    solids = shape.Solids
    out["solids"] = len(solids)
    out["faces"] = len(shape.Faces)
    out["edges"] = len(shape.Edges)
    out["vertexes"] = len(shape.Vertexes)
    try:
        bb = shape.BoundBox
        out["bbox"] = [round(bb.XLength, 4), round(bb.YLength, 4), round(bb.ZLength, 4)]
    except Exception:                           # noqa: BLE001
        out["bbox"] = None

    # isValid 是 OCCT 自己的拓樸／幾何檢查，跟我們的流形性檢查是兩套獨立的判準
    out["valid"] = bool(shape.isValid())
    out["invalidSolids"] = [i for i, s in enumerate(solids) if not s.isValid()][:10]
    # 封閉性：擠出來的柱體每一顆都該是封閉殼，破了就是漏面
    out["openSolids"] = [i for i, s in enumerate(solids) if not s.isClosed()][:10]
    try:
        out["volume"] = round(sum(s.Volume for s in solids), 4)
    except Exception:                           # noqa: BLE001
        out["volume"] = None

    problems = []
    if not out["valid"]:
        problems.append("shape.isValid() = False")
    if out["invalidSolids"]:
        problems.append("invalid solids: %s" % out["invalidSolids"])
    if out["openSolids"]:
        problems.append("open (non-closed) solids: %s" % out["openSolids"])
    if want_solids is not None and out["solids"] != want_solids:
        problems.append("solids %d != expected %d" % (out["solids"], want_solids))
    if out.get("volume") is not None and out["volume"] <= 0:
        problems.append("total volume <= 0")

    out["ok"] = not problems
    out["problems"] = problems
    return out


args = [a for a in sys.argv[1:] if not a.lower().endswith(".py")]
if len(args) < 2:
    raise SystemExit("usage: FreeCADCmd step-check.py <in.step> <out.json> [expectedSolids]")
step_path, json_path = args[0], args[1]
expected = int(args[2]) if len(args) > 2 else None

try:
    result = analyse(step_path, expected)
except Exception as exc:                        # noqa: BLE001
    result = {"file": os.path.basename(step_path), "ok": False, "problems": ["crashed: %s" % exc]}

with open(json_path, "w", encoding="utf-8") as fh:
    json.dump(result, fh, ensure_ascii=False, indent=1)
