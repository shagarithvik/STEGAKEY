async function extractStegoChunk(buffer) {
	const bytes = new Uint8Array(buffer);
	// search for custom chunk name sPas
	const marker = new TextEncoder().encode('sPas');
	for (let i = 0; i < bytes.length - 4; i++) {
		if (bytes[i]===marker[0] && bytes[i+1]===marker[1] && bytes[i+2]===marker[2] && bytes[i+3]===marker[3]) {
			const len = (bytes[i-4]<<24)|(bytes[i-3]<<16)|(bytes[i-2]<<8)|(bytes[i-1]);
			const start = i+4;
			return bytes.slice(start, start+len);
		}
	}
	return null;
}

