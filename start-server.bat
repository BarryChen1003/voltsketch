@echo off
rem 一鍵啟動本機伺服器（編輯器/IC庫都用 http 才正常）
rem 雙擊此檔 → 開瀏覽器到編輯器，並在本資料夾起 http server (port 8099)
cd /d "%~dp0"
start "" http://localhost:8099/index.html
echo HardwareAI 伺服器啟動中... 視窗別關，要看頁面就保持開著。
echo 編輯器:  http://localhost:8099/index.html
echo IC 元件庫: http://localhost:8099/ic-preview.html
python -m http.server 8099 || py -m http.server 8099
pause
