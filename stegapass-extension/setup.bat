@echo off
echo StegaPass Setup Script
echo.

REM Register native messaging host
echo Registering native messaging host...
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\stegapass_usb_host" /ve /t REG_SZ /d "%~dp0native\stegapass_usb_host.json" /f

if %ERRORLEVEL% EQU 0 (
    echo ✓ Native messaging host registered successfully!
) else (
    echo ✗ Failed to register native messaging host.
    pause
    exit /b 1
)

echo.
echo IMPORTANT: You need to update the extension ID in native\stegapass_usb_host.json
echo.
echo 1. Load the extension in Chrome (chrome://extensions)
echo 2. Copy your extension ID from the extension details
echo 3. Edit native\stegapass_usb_host.json
echo 4. Replace the allowed_origins field with your actual extension ID
echo 5. Restart Chrome
echo.
pause

