# StegaPass USB Extension

Offline steganographic USB-based password manager.

## How it Works
Plug in USB → marker detected → PNG read → custom chunk extracted → decrypted with master password → stored in session until unplug.
USB removal clears session.

## Quick Setup

1. **No Node dependencies needed** - The native host uses only built-in Node.js modules.

2. **Register native host** (run as Administrator):
   ```bash
   cd ..
   reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\stegapass_usb_host" /ve /t REG_SZ /d "%CD%\stegapass-extension\native\stegapass_usb_host.json" /f
   ```

3. **Load extension in Chrome:**
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `stegapass-extension` folder

4. **Update extension ID** (if needed):
   - Copy your extension ID from chrome://extensions
   - Edit `native/stegapass_usb_host.json` and update the `allowed_origins` field

See `INSTALL.md` for detailed instructions.

