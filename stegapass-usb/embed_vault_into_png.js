// Embed encrypted vault into a PNG as a custom chunk named 'sPas'
const fs = require('fs');
const path = require('path');

function crc32(buf) {
	// CRC-32 (IEEE 802.3) polynomial 0xEDB88320
	let crc = ~0 >>> 0;
	for (let i = 0; i < buf.length; i++) {
		crc ^= buf[i];
		for (let j = 0; j < 8; j++) {
			const mask = -(crc & 1);
			crc = (crc >>> 1) ^ (0xEDB88320 & mask);
		}
	}
	return (~crc) >>> 0;
}

function writeChunk(type, data) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length, 0);
	const typeBuf = Buffer.from(type, 'ascii');
	const crcBuf = Buffer.alloc(4);
	const crc = crc32(Buffer.concat([typeBuf, data]));
	crcBuf.writeUInt32BE(crc, 0);
	return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function embedChunk(inputPngPath, outputPngPath, payloadBase64) {
	const png = fs.readFileSync(inputPngPath);
	const sig = Buffer.from([137,80,78,71,13,10,26,10]);
	if (!png.slice(0,8).equals(sig)) throw new Error('Not a PNG');

	// Build sPas chunk data: store the raw bytes of the base64 string
	const payloadBytes = Buffer.from(payloadBase64, 'base64');
	const SPAS = writeChunk('sPas', payloadBytes);

	// Reconstruct PNG: sig + IHDR + sPas + rest
	let offset = 8;
	// Read IHDR
	const ihdrLen = png.readUInt32BE(offset); offset += 4;
	const ihdrType = png.slice(offset, offset+4).toString('ascii'); offset += 4;
	if (ihdrType !== 'IHDR') throw new Error('IHDR not found');
	const ihdrData = png.slice(offset, offset+ihdrLen); offset += ihdrLen;
	const ihdrCrc = png.slice(offset, offset+4); offset += 4;
	const IHDR = Buffer.concat([
		Buffer.from([0,0,0,ihdrLen]),
		Buffer.from('IHDR','ascii'),
		ihdrData,
		ihdrCrc
	]);

	const rest = png.slice(offset);
	const out = Buffer.concat([sig, IHDR, SPAS, rest]);
	fs.writeFileSync(outputPngPath, out);
}

function main() {
	const inPng = path.resolve(__dirname, 'carrier.png');
	const outPng = path.resolve(__dirname, 'carrier.stego.png');
	const payloadPath = path.resolve(__dirname, 'vault_encrypted.txt');
	if (!fs.existsSync(inPng)) throw new Error('carrier.png not found');
	if (!fs.existsSync(payloadPath)) throw new Error('vault_encrypted.txt not found');
	const payloadB64 = fs.readFileSync(payloadPath, 'utf8').trim();
	embedChunk(inPng, outPng, payloadB64);
	console.log('✓ Embedded vault into', outPng);
	// Update marker to point to new stego carrier
	const markerPath = path.resolve(__dirname, '.stps_marker');
	fs.writeFileSync(markerPath, JSON.stringify({ carrier_path: 'carrier.stego.png' }, null, 2));
	console.log('✓ Updated .stps_marker to use carrier.stego.png');
}

if (require.main === module) {
	main();
}


