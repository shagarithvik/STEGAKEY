async function extractStegoChunk(buffer) {
	if (!buffer || buffer.byteLength < 8) {
		console.warn('Buffer too small or invalid');
		return null;
	}
	
	const bytes = new Uint8Array(buffer);
	
	// Verify PNG signature
	const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
	let isPNG = true;
	for (let i = 0; i < 8; i++) {
		if (bytes[i] !== pngSignature[i]) {
			isPNG = false;
			break;
		}
	}
	
	if (!isPNG) {
		console.warn('Not a valid PNG file');
		return null;
	}
	
	// Search for custom chunk name 'sPas'
	const marker = new TextEncoder().encode('sPas');
	for (let i = 8; i < bytes.length - 4; i++) {
		if (bytes[i] === marker[0] && 
		    bytes[i+1] === marker[1] && 
		    bytes[i+2] === marker[2] && 
		    bytes[i+3] === marker[3]) {
			
			// Found the marker, read the length from 4 bytes before
			if (i < 4) continue; // Not enough space for length
			
			const len = (bytes[i-4] << 24) | (bytes[i-3] << 16) | (bytes[i-2] << 8) | bytes[i-1];
			
			if (len < 0 || len > bytes.length) {
				console.warn('Invalid chunk length:', len);
				continue;
			}
			
			const start = i + 4;
			const end = start + len;
			
			if (end > bytes.length) {
				console.warn('Chunk extends beyond buffer');
				continue;
			}
			
			console.log('Found sPas chunk with length:', len);
			return bytes.slice(start, end);
		}
	}
	
	console.warn('No sPas chunk found in PNG');
	return null;
}

