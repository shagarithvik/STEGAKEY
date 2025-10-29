@echo off
echo Installing StegaPass native messaging host...

REM Get the current directory
set "CURRENT_DIR=%~dp0"
set "NODE_PATH=node"

REM Create native messaging host entry in Chrome registry
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\stegapass_usb_host" /ve /t REG_SZ /d "%CURRENT_DIR%stegapass_usb_host.json" /f

if %ERRORLEVEL% EQU 0 (
    echo Native messaging host registered successfully!
    echo.
    echo To use this extension:
    echo 1. Replace YOUR_EXTENSION_ID_HERE in stegapass_usb_host.json with your actual extension ID
    echo 2. Run: npm install (to install drivelist dependency)
    echo 3. Load the extension in Chrome
) else (
    echo Failed to register native messaging host.
    pause
)

