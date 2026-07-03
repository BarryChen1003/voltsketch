# Knowledge DB

This folder is generated from `hardware-pdfs/`.

- `file-index.json`: complete machine-readable file index.
- `file-index.md`: human-readable extension/topic summary and first 80 files.
- `topic-index.json`: files grouped by hardware topic.
- `topic-index.md`: human-readable topic index.

Rebuild:

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' .\tools\build_hardware_index.py
```
