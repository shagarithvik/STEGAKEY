async function deriveKey(password, salt) {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
	);
	return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt']);
}

async function decryptStegoBlob(b64, password) {
	const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
	const salt = raw.slice(0,16);
	const iv = raw.slice(16,28);
	// Support layouts:
	// A) salt(16) + iv(12) + ciphertext||tag
	// B) salt(16) + iv(12) + tag(16) + ciphertext (our create_vault.js output)
	let data = raw.slice(28);
	if (data.length > 16) {
		// Detect if tag is placed before ciphertext (layout B)
		// Heuristic: try to treat first 16 bytes as tag and rest as ciphertext
		const possibleTag = data.slice(0,16);
		const possibleCt = data.slice(16);
		// Recompose to ciphertext||tag for WebCrypto
		if (possibleCt.length > 0) {
			const recomposed = new Uint8Array(possibleCt.length + 16);
			recomposed.set(possibleCt, 0);
			recomposed.set(possibleTag, possibleCt.length);
			data = recomposed;
		}
	}
	const key = await deriveKey(password, salt);
	const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
	return new TextDecoder().decode(pt);
}

