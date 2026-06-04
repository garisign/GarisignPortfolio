@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Website CR-scripts_locais-watch_portfolio.ps1"
pause