# StegaPass Setup Guide

Complete guide to set up and use the StegaPass USB Password Manager.

## Overview

StegaPass is an offline steganographic USB-based password manager that stores your passwords encrypted and hidden inside PNG images on a USB drive.

## Prerequisites

- Windows OS (for native host)
- Google Chrome browser
- USB flash drive
- Node.js installed (for native host)

## Installation Steps

### Step 1: Prepare Your USB Drive

1. **Create Carrier Image**
   - Open `stegapass-usb/CREATE_CARRIER.html` in your browser
   - Click "Generate Carrier Image" or upload your own PNG
   - Save the generated `carrier.png` file

2. **Create Encrypted Vault**
   ```bash
   cd stegapass-usb
   node create_vault.js
   ```
   This creates:
   - `vault_encrypted.txt` - Your encrypted vault data
   - `vault_info.txt` - Information about the vault
   - Default master password: `StegaPass2024!`

3. **Embed Vault into Carrier**
   ```bash
   node embed_vault_into_png.js
   ```
   This creates `carrier.stego.png` with your encrypted data hidden inside.

4. **Copy Files to USB Root**
   Copy these files to the ROOT of your USB drive:
   - `.stps_marker` - Tells the extension where to find the vault
   - `carrier.stego.png` - The PNG with hidden encrypted data

### Step 2: Install Browser Extension

1. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `stegapass-extension` folder

2. **Note Your Extension ID**
   - Copy the extension ID shown under the extension name
   - You'll need this for the native host setup

### Step 3: Install Native Host

1. **Update Native Host Configuration**
   - Open `stegapass-extension/native/stegapass_usb_host.json`
   - Update the `allowed_origins` field with your extension ID:
     ```json
     "allowed_origins": [
       "chrome-extension://YOUR_EXTENSION_ID_HERE/"
     ]
     ```

2. **Register Native Host (Run as Administrator)**
   ```batch
   cd stegapass-extension\native
   install_host.bat
   ```
   This registers the native messaging host with Chrome.

## Usage

### Unlocking Your Vault

1. Plug in your USB drive
2. Click the StegaPass extension icon
3. Wait for "✓ USB Vault Detected" status
4. Enter your master password (default: `StegaPass2024!`)
5. Click "🔓 Unlock"

### Generating Passwords

1. Set desired password length (8-64 characters)
2. Toggle "Include Symbols" if needed
3. Click "🔄 Generate Password"
4. View the strength indicator (weak/medium/strong)
5. Click "📋 Copy to Clipboard" to copy

### Managing Passwords

**View Stored Passwords:**
- After unlocking, scroll to "Stored Passwords" section
- Click 👁️ to show/hide password
- Click 📋 to copy password

**Add New Credential:**
1. Click "＋ Add New Credential"
2. Enter domain (e.g., `example.com`)
3. Enter username
4. Enter or generate password
5. Click "✓ Save"

**Auto-Save from Login Forms:**
- When you log in to a website, the extension detects it
- A save prompt appears in the popup
- Review and click "Save" to store the credentials

### Security Features

- **Offline Operation**: No internet connection required
- **USB Dependency**: Vault only accessible when USB is plugged in
- **Auto-Lock**: Removing USB instantly clears all passwords from memory
- **Steganography**: Passwords hidden in PNG images (invisible to casual inspection)
- **Strong Encryption**: AES-256-GCM with PBKDF2 key derivation (120,000 iterations)
- **Secure Password Generation**: Uses cryptographically secure random (`crypto.getRandomValues`)

## Troubleshooting

### Extension Can't Find USB
- Check that `.stps_marker` is in the USB root (not in a subfolder)
- Verify the `carrier_path` in `.stps_marker` points to correct file
- Try unplugging and replugging the USB

### Decryption Fails
- Double-check your master password
- Ensure `carrier.stego.png` was created correctly
- Verify the vault was embedded into the PNG

### Native Host Connection Error
- Verify the extension ID matches in `stegapass_usb_host.json`
- Re-run `install_host.bat` as Administrator
- Check Chrome console for specific error messages

## Changing Master Password

To use a different master password:

1. Edit `stegapass-usb/create_vault.js`
2. Change the `MASTER_PASSWORD` constant
3. Run `node create_vault.js` again
4. Run `node embed_vault_into_png.js` again
5. Copy the new `carrier.stego.png` to your USB

## File Structure

```
stegapass-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension UI
├── popup.js               # UI logic
├── background.js          # Background service worker
├── content.js             # Content script for web pages
├── crypto.js              # Encryption/decryption functions
├── stego.js               # Steganography (PNG chunk extraction)
├── password-generator.js  # Secure password generator
└── native/
    ├── native_host.js             # USB scanner (Node.js)
    ├── stegapass_usb_host.json    # Native host manifest
    ├── install_host.bat           # Installation script
    └── launch_host.bat            # Launcher script

stegapass-usb/
├── CREATE_CARRIER.html       # Create carrier PNG
├── create_vault.js           # Create encrypted vault
├── embed_vault_into_png.js   # Embed vault into PNG
├── .stps_marker              # USB marker file
└── carrier.stego.png         # Final carrier with embedded vault
```

## Best Practices

1. **Backup Your USB**: Keep a backup copy of your USB drive
2. **Strong Master Password**: Use a strong, unique master password
3. **Physical Security**: Keep your USB drive secure (it contains your passwords)
4. **Regular Updates**: Re-embed vault whenever you add passwords
5. **Test Before Relying**: Test the unlock process before storing critical passwords

## Advanced: Creating Custom Vaults

Edit `stegapass-usb/create_vault.js` to customize your vault structure:

```javascript
const vaultData = {
  "name": "My Vault",
  "entries": [
    {
      "domain": "example.com",
      "username": "myuser",
      "password": "mypassword",
      "notes": "Optional notes"
    }
    // Add more entries...
  ]
};
```

Then run:
```bash
node create_vault.js
node embed_vault_into_png.js
```

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for error messages
- Verify all files are in correct locations
- Ensure Node.js and dependencies are installed
