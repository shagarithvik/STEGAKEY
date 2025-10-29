# Installation Guide

## Prerequisites
- Node.js installed
- Chrome browser

## Setup Steps

### 1. Install Native Host Dependencies
Navigate to the `native` directory and run:
```bash
cd native
npm install
```

### 2. Register Native Messaging Host

**Windows:**
Run `install_host.bat` as administrator, or manually:

```bash
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\stegapass_usb_host" /ve /t REG_SZ /d "C:\full\path\to\stegapass-extension\native\stegapass_usb_host.json" /f
```

### 3. Get Your Extension ID
1. Load the extension in Chrome (chrome://extensions)
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `stegapass-extension` folder
4. Copy the Extension ID

### 4. Update Native Host Configuration
1. Open `native/stegapass_usb_host.json`
2. Replace `YOUR_EXTENSION_ID_HERE` with your actual extension ID
3. Update the `path` field to point to `native_host.js` (or use full path)

### 5. Test the Extension
1. Reopen the extension popup
2. The USB detection should now work

## Troubleshooting
- If you see "native messaging host not found", double-check the registry entry
- Make sure Node.js and the `drivelist` dependency are installed
- Check that the extension ID matches in the JSON file

