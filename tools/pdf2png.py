"""pdf2png.py — fitz 渲染 PDF 頁為 PNG（B 路視覺讀 pinout 用）
用法:
  python pdf2png.py file.pdf 5-8 outdir [dpi]     # 頁範圍(1-based)
  python pdf2png.py file.pdf 3,7 outdir [dpi]     # 指定頁
輸出: outdir/<pdf名>-p<頁號>.png；預設 dpi=150（pin 圖夠讀，檔小）
"""
import sys, os
import fitz

pdf = sys.argv[1]
spec = sys.argv[2]
outdir = sys.argv[3]
dpi = int(sys.argv[4]) if len(sys.argv) > 4 else 150

doc = fitz.open(pdf)
base = os.path.splitext(os.path.basename(pdf))[0]
os.makedirs(outdir, exist_ok=True)

pages = []
for part in spec.split(','):
    if '-' in part:
        a, b = part.split('-')
        pages.extend(range(int(a), int(b) + 1))
    else:
        pages.append(int(part))

for p in pages:
    if p < 1 or p > doc.page_count:
        print(f"skip page {p} (out of range 1..{doc.page_count})")
        continue
    pix = doc[p - 1].get_pixmap(dpi=dpi)
    out = os.path.join(outdir, f"{base}-p{p}.png")
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}")
