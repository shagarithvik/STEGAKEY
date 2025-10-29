# How to Fix "Access to native messaging host is forbidden"

## The Problem
Chrome is blocking access to the native messaging host because the extension ID in the configuration doesn't match your actual extension ID.

## Quick Fix (5 steps)

### 1. Get Your Extension ID
- Open Chrome and go to `chrome://extensions`
- Enable "Developer mode" (toggle in top right)
- Find "StegaPass USB Password Manager"
- Copy the Extension ID (it looks like: `abcdefghijklmnopqrstuvwxyz123456`)

### 2. Open the Config File
Open this file in a text editor:
```
native\stegapass_usb_host.json
```

### 3. Update allowed_origins
Currently it looks like:
```json
"allowed_origins": []
```

Change it to (replace YOUR_ACTUAL_ID with the ID you copied):
```json
"allowed_origins": [
  "chrome-extension://YOUR_ACTUAL_ID/"
]
```

Example:
```json
"allowed_origins": [
  "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/"
]
```

### 4. Save the File
Save the changes.

### 5. Reload the Extension
- Go back to `chrome://extensions`
- Click the refresh icon on the "StegaPass USB Password Manager" card
- The errors should now be gone!

## Verification
If the errors are gone, the native host is working. You can check by:
1. Opening the extension popup
2. The status should show "Waiting for USB..." or scan for drives

## Still Having Issues?
- Make sure Node.js is installed and working
- Check that the file path in `stegapass_usb_host.json` is correct
- Try restarting Chrome completely
- Check the browser console for any additional error messages

