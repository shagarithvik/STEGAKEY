==========================================
STEGAPASS USB VAULT FILES
==========================================

This folder contains the files needed to make your USB drive work with StegaPass.

SETUP INSTRUCTIONS:

1. Copy ALL files from this folder to the ROOT of your USB drive
   (not inside any subfolder)

2. The files that go on your USB root:
   - .stps_marker (marker file)
   - carrier.png (the steganographic PNG file)

3. Once copied, your USB should be detected by the StegaPass extension

4. The native host will scan drives D: through Z: for the .stps_marker file

IMPORTANT:
- The carrier.png file should be a PNG image (can be a regular image)
- When you have actual encrypted data to hide, it will be embedded in this PNG
- For now, carrier.png can be a simple placeholder image

==========================================

