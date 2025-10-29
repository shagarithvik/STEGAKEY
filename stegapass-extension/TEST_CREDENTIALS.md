# Test Credentials

## For Testing the Extension

### Master Password
You can use any password for testing. Since this is a development/learning project, here's a simple test password:

```
TestPassword123!
```

## To Test:

1. Set up your USB with the marker and carrier.png files
2. Load the extension in Chrome
3. Open the extension popup
4. Enter the master password: `TestPassword123!`
5. Click "Unlock"

## Note

The extension will decrypt data from the carrier.png file on your USB.
For now, the carrier.png is just a placeholder - you'll need to embed actual encrypted vault data in it.

## Future Implementation

To actually use this password manager, you'll need to:
1. Create an actual vault JSON structure
2. Encrypt it with AES-256-GCM using PBKDF2
3. Embed it in the PNG's custom chunk (sPas)
4. Place the PNG on USB

Currently, the project structure is complete but needs the actual encryption/embedding logic.

