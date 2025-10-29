@echo off
REM Get the directory of this batch file
set SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%native_host.js"

