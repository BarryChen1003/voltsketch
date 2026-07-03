from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


WORKSPACE = Path(__file__).resolve().parents[1]
SOURCE_DIR = WORKSPACE / "hardware-pdfs"
OUTPUT_DIR = WORKSPACE / "knowledge-db"


TOPIC_RULES = {
    "power_supply": {
        "label_zh": "電源設計 / DC-DC / PMIC",
        "label_en": "Power Supply / DC-DC / PMIC",
        "keywords": [
            "power", "supply", "switching", "regulator", "dc-dc", "dcdc", "buck",
            "boost", "pmic", "ldo", "gan", "電源", "开关电源", "升压", "降压",
            "穩壓", "稳压", "負載突降", "负载突降", "冷启动", "800 vdc",
        ],
    },
    "pcb_layout": {
        "label_zh": "PCB Layout / 走線",
        "label_en": "PCB Layout / Routing",
        "keywords": [
            "pcb", "layout", "routing", "走线", "走線", "布线", "佈線",
            "布局", "佈局", "return path", "switch node", "开关节点", "layout斛",
        ],
    },
    "emi_emc": {
        "label_zh": "EMI / EMC / 雜訊",
        "label_en": "EMI / EMC / Noise",
        "keywords": [
            "emi", "emc", "noise", "interference", "conducted", "radiated",
            "电磁", "電磁", "干扰", "干擾", "传导", "傳導", "輻射", "辐射",
        ],
    },
    "op_amp_analog": {
        "label_zh": "OP Amp / 類比電路",
        "label_en": "Op Amp / Analog Circuits",
        "keywords": [
            "op amp", "opamp", "operational amplifier", "analog", "amplifier",
            "运算放大", "運算放大", "运放", "運放", "模拟", "類比", "模擬",
        ],
    },
    "transistor_mosfet": {
        "label_zh": "BJT / MOSFET / 功率元件",
        "label_en": "BJT / MOSFET / Power Devices",
        "keywords": [
            "transistor", "mosfet", "fet", "bjt", "triac", "scr", "gan",
            "晶体管", "電晶體", "电晶体", "场效应", "場效應", "可控硅",
        ],
    },
    "digital_protocols": {
        "label_zh": "數位介面 / 通訊協定",
        "label_en": "Digital Interfaces / Protocols",
        "keywords": [
            "i2c", "i2s", "spi", "ssp", "uart", "usb", "usb4", "can",
            "pmbus", "smbus", "displayport", "协议", "協定", "总线", "匯流排",
        ],
    },
    "adc_dac": {
        "label_zh": "ADC / DAC / 資料轉換",
        "label_en": "ADC / DAC / Data Conversion",
        "keywords": ["adc", "dac", "data converter", "資料轉換", "数据转换"],
    },
    "automotive": {
        "label_zh": "車用電子",
        "label_en": "Automotive Electronics",
        "keywords": [
            "automotive", "vehicle", "radar", "infotainment", "汽车", "車用",
            "车载", "車載", "智能驾驶", "毫米波雷达",
        ],
    },
    "high_speed": {
        "label_zh": "高速數位 / 訊號完整性",
        "label_en": "High-Speed Digital / Signal Integrity",
        "keywords": [
            "high speed", "highspeed", "signal integrity", "si", "高速",
            "链路训练", "link training", "transmission line", "傳輸線", "传输线",
        ],
    },
    "protection_reliability": {
        "label_zh": "保護電路 / 可靠度",
        "label_en": "Protection / Reliability",
        "keywords": [
            "protection", "esd", "surge", "flyback", "load dump", "reverse",
            "reliability", "保护", "保護", "防反", "突波", "浪涌", "可靠性",
        ],
    },
    "test_measurement": {
        "label_zh": "測試 / 驗證 / 量測",
        "label_en": "Test / Validation / Measurement",
        "keywords": [
            "test", "measurement", "validation", "verify", "verification",
            "测试", "測試", "验证", "驗證", "量测", "量測",
        ],
    },
    "electronics_basics": {
        "label_zh": "電子學基礎 / 電路原理",
        "label_en": "Electronics Basics / Circuit Theory",
        "keywords": [
            "electronics", "basic", "fundamental", "circuit design", "电路",
            "電子", "电子", "基础", "基礎", "实例", "實例", "电路图",
        ],
    },
    "embedded_systems": {
        "label_zh": "嵌入式系統 / 硬體架構",
        "label_en": "Embedded Systems / Hardware Architecture",
        "keywords": ["embedded", "linux", "arm", "soc", "嵌入式", "硬體架構", "硬件架构"],
    },
}


EXTENSION_TYPES = {
    ".pdf": "pdf",
    ".doc": "word",
    ".docx": "word",
    ".ppt": "presentation",
    ".pptx": "presentation",
    ".txt": "text",
    ".html": "web",
    ".url": "web",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".zip": "archive",
    ".rar": "archive",
}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def clean_text(value: object) -> str:
    if value is None:
        return ""
    text = str(value)
    text = text.replace("\x00", " ").strip()
    return re.sub(r"\s+", " ", text)


def classify(text: str) -> list[str]:
    haystack = text.lower()
    topics: list[str] = []
    for topic, rule in TOPIC_RULES.items():
        if any(keyword.lower() in haystack for keyword in rule["keywords"]):
            topics.append(topic)
    return topics or ["uncategorized"]


def pdf_info(path: Path) -> dict:
    info: dict = {
        "page_count": None,
        "encrypted": None,
        "metadata": {},
        "text_sample": "",
        "parse_error": None,
    }
    try:
        reader = PdfReader(str(path))
        info["encrypted"] = bool(reader.is_encrypted)
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                pass
        info["page_count"] = len(reader.pages)
        metadata = reader.metadata or {}
        for key in ("/Title", "/Author", "/Subject", "/Creator", "/Producer"):
            value = clean_text(metadata.get(key))
            if value:
                info["metadata"][key.lstrip("/").lower()] = value
        samples: list[str] = []
        for page in reader.pages[:2]:
            try:
                extracted = clean_text(page.extract_text() or "")
            except Exception:
                extracted = ""
            if extracted:
                samples.append(extracted)
        info["text_sample"] = clean_text(" ".join(samples))[:2500]
    except Exception as exc:
        info["parse_error"] = f"{type(exc).__name__}: {exc}"
    return info


def markdown_table(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    widths = [max(len(row[index]) for row in rows) for index in range(len(rows[0]))]
    lines = []
    for row_index, row in enumerate(rows):
        line = "| " + " | ".join(cell.ljust(widths[index]) for index, cell in enumerate(row)) + " |"
        lines.append(line)
        if row_index == 0:
            lines.append("| " + " | ".join("-" * widths[index] for index in range(len(row))) + " |")
    return "\n".join(lines)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(path for path in SOURCE_DIR.rglob("*") if path.is_file())
    entries: list[dict] = []
    topic_map: dict[str, list[dict]] = defaultdict(list)
    extension_counts: Counter[str] = Counter()
    duplicate_hashes: dict[str, list[str]] = defaultdict(list)

    for path in files:
        relative = path.relative_to(WORKSPACE).as_posix()
        stat = path.stat()
        extension = path.suffix.lower()
        entry = {
            "relative_path": relative,
            "source_folder": path.parent.relative_to(WORKSPACE).as_posix(),
            "file_name": path.name,
            "stem": path.stem,
            "extension": extension or "(none)",
            "file_type": EXTENSION_TYPES.get(extension, "other"),
            "size_bytes": stat.st_size,
            "modified_at": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
            "sha256": file_sha256(path),
            "pdf": None,
            "topics": [],
            "title_guess": path.stem,
        }
        duplicate_hashes[entry["sha256"]].append(relative)
        extension_counts[entry["extension"]] += 1

        classification_text = f"{relative} {path.stem}"
        if extension == ".pdf":
            pdf = pdf_info(path)
            entry["pdf"] = {
                "page_count": pdf["page_count"],
                "encrypted": pdf["encrypted"],
                "metadata": pdf["metadata"],
                "parse_error": pdf["parse_error"],
            }
            title = pdf["metadata"].get("title") if pdf["metadata"] else ""
            if title and len(title) >= 4:
                entry["title_guess"] = title
            classification_text = f"{classification_text} {json.dumps(pdf['metadata'], ensure_ascii=False)} {pdf['text_sample']}"

        entry["topics"] = classify(classification_text)
        for topic in entry["topics"]:
            topic_map[topic].append(
                {
                    "relative_path": relative,
                    "title_guess": entry["title_guess"],
                    "file_type": entry["file_type"],
                    "page_count": entry["pdf"]["page_count"] if entry["pdf"] else None,
                }
            )
        entries.append(entry)

    duplicate_groups = [
        {"sha256": sha, "files": paths}
        for sha, paths in duplicate_hashes.items()
        if len(paths) > 1
    ]
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_dir": SOURCE_DIR.relative_to(WORKSPACE).as_posix(),
        "total_files": len(entries),
        "extension_counts": dict(sorted(extension_counts.items())),
        "topic_counts": {topic: len(items) for topic, items in sorted(topic_map.items())},
        "duplicate_groups": duplicate_groups,
    }
    topic_index = {
        "topics": {
            topic: {
                "label_zh": TOPIC_RULES.get(topic, {}).get("label_zh", "未分類"),
                "label_en": TOPIC_RULES.get(topic, {}).get("label_en", "Uncategorized"),
                "count": len(items),
                "files": items,
            }
            for topic, items in sorted(topic_map.items())
        }
    }
    full_index = {
        "summary": summary,
        "files": entries,
    }

    (OUTPUT_DIR / "file-index.json").write_text(
        json.dumps(full_index, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUTPUT_DIR / "topic-index.json").write_text(
        json.dumps(topic_index, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    summary_rows = [["Extension", "Count"]] + [[ext, str(count)] for ext, count in sorted(extension_counts.items())]
    topic_rows = [["Topic", "Label", "Count"]] + [
        [topic, TOPIC_RULES.get(topic, {}).get("label_zh", "未分類"), str(len(items))]
        for topic, items in sorted(topic_map.items(), key=lambda item: (-len(item[1]), item[0]))
    ]
    sample_rows = [["File", "Type", "Pages", "Topics"]] + [
        [
            entry["relative_path"],
            entry["file_type"],
            "" if not entry["pdf"] else str(entry["pdf"]["page_count"] or ""),
            ", ".join(entry["topics"]),
        ]
        for entry in entries[:80]
    ]
    duplicate_lines = []
    if duplicate_groups:
        duplicate_lines.append("## Duplicate Candidates\n")
        for group in duplicate_groups:
            duplicate_lines.append(f"- `{group['sha256'][:12]}`: " + "; ".join(f"`{path}`" for path in group["files"]))
    else:
        duplicate_lines.append("## Duplicate Candidates\n\nNo duplicate file hashes found.")

    file_md = "\n\n".join(
        [
            "# Hardware File Index",
            f"Generated: `{summary['generated_at']}`",
            f"Source: `{summary['source_dir']}`",
            f"Total files: **{len(entries)}**",
            "## Extension Summary",
            markdown_table(summary_rows),
            "## Topic Summary",
            markdown_table(topic_rows),
            "## First 80 Files",
            markdown_table(sample_rows),
            "\n".join(duplicate_lines),
        ]
    )
    (OUTPUT_DIR / "file-index.md").write_text(file_md, encoding="utf-8")

    topic_sections = ["# Hardware Topic Index", f"Generated: `{summary['generated_at']}`"]
    for topic, items in sorted(topic_map.items(), key=lambda item: (-len(item[1]), item[0])):
        label = TOPIC_RULES.get(topic, {}).get("label_zh", "未分類")
        topic_sections.append(f"## {label} (`{topic}`) - {len(items)} files")
        rows = [["File", "Pages", "Title Guess"]] + [
            [
                item["relative_path"],
                "" if item["page_count"] is None else str(item["page_count"]),
                clean_text(item["title_guess"])[:80],
            ]
            for item in items[:40]
        ]
        topic_sections.append(markdown_table(rows))
        if len(items) > 40:
            topic_sections.append(f"_Only first 40 shown. Full list is in `topic-index.json`._")
    (OUTPUT_DIR / "topic-index.md").write_text("\n\n".join(topic_sections), encoding="utf-8")

    readme = """# Knowledge DB

This folder is generated from `hardware-pdfs/`.

- `file-index.json`: complete machine-readable file index.
- `file-index.md`: human-readable extension/topic summary and first 80 files.
- `topic-index.json`: files grouped by hardware topic.
- `topic-index.md`: human-readable topic index.

Rebuild:

```powershell
& 'C:\\Users\\User\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe' .\\tools\\build_hardware_index.py
```
"""
    (OUTPUT_DIR / "README.md").write_text(readme, encoding="utf-8")

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
