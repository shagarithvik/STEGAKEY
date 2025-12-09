async function deriveKey(password, salt) {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
	);
	return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt']);
}

async function decryptStegoBlob(b64, password) {
	if (!b64 || !password) {
		throw new Error('Missing base64 data or password');
	}
	
	let raw;
	try {
		raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
	} catch (err) {
		throw new Error('Invalid base64 data: ' + err.message);
	}
	
	if (raw.length < 28) {
		throw new Error('Data too short to contain salt and IV');
	}
	
	const salt = raw.slice(0, 16);
	const iv = raw.slice(16, 28);
	
	// Support layouts:
	// A) salt(16) + iv(12) + ciphertext||tag (WebCrypto standard)
	// B) salt(16) + iv(12) + tag(16) + ciphertext (Node.js createCipheriv output)
	let data = raw.slice(28);
	
	if (data.length > 16) {
		// Try layout B first (tag before ciphertext)
		const possibleTag = data.slice(0, 16);
		const possibleCt = data.slice(16);
		
		if (possibleCt.length > 0) {
			// Recompose to ciphertext||tag for WebCrypto
			const recomposed = new Uint8Array(possibleCt.length + 16);
			recomposed.set(possibleCt, 0);
			recomposed.set(possibleTag, possibleCt.length);
			
			const key = await deriveKey(password, salt);
			
			try {
				// Try layout B
				const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, recomposed);
				return new TextDecoder().decode(pt);
			} catch (err) {
				// If layout B fails, try layout A (original data)
				try {
					const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
					return new TextDecoder().decode(pt);
				} catch (err2) {
					throw new Error('Decryption failed. Check your password.');
				}
			}
		}
	}
	
	// Fallback to direct decryption
	const key = await deriveKey(password, salt);
	try {
		const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
		return new TextDecoder().decode(pt);
	} catch (err) {
		throw new Error('Decryption failed. Check your password.');
	}
}

