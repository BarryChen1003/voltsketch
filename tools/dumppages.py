"""dumppages.py — fitz 抽 PDF 頁文字
用法:
  python dumppages.py file.pdf              # 全部頁
  python dumppages.py file.pdf 5-12         # 頁範圍(1-based)
  python dumppages.py file.pdf 3,7,9        # 指定頁
  python dumppages.py file.pdf --find "Pin Functions|PIN DESCRIPTION"  # 列出含關鍵字的頁號
"""
import sys, re
import fitz

pdf = sys.argv[1]
doc = fitz.open(pdf)

if len(sys.argv) > 3 and sys.argv[2] == "--find" or (len(sys.argv) > 2 and sys.argv[2] == "--find"):
    pat = re.compile(sys.argv[3] if len(sys.argv) > 3 else "Pin Functions", re.I)
    for i in range(doc.page_count):
        t = doc[i].get_text()
        if pat.search(t):
            first = pat.search(t).group(0)
            print(f"page {i+1}: {first}")
    sys.exit(0)

spec = sys.argv[2] if len(sys.argv) > 2 else None

def pages(spec, n):
    if not spec:
        return list(range(n))
    out = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-")
            out += list(range(int(a) - 1, int(b)))
        else:
            out.append(int(part) - 1)
    return [i for i in out if 0 <= i < n]

for i in pages(spec, doc.page_count):
    print(f"=== PAGE {i+1} ===")
    print(doc[i].get_text())
