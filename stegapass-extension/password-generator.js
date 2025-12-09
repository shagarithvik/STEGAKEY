function generatePassword(len=16, includeSymbols=true) {
	// Use cryptographically secure random number generator
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numbers = "0123456789";
	const symbols = "!@#$%&*()-_=+[]{}|;:,.<>?";
	
	let chars = lowercase + uppercase + numbers;
	if (includeSymbols) {
		chars += symbols;
	}
	
	const array = new Uint32Array(len);
	crypto.getRandomValues(array);
	
	let password = "";
	for(let i = 0; i < len; i++){
		password += chars.charAt(array[i] % chars.length);
	}
	
	// Ensure at least one of each type is included
	if (password.length >= 4) {
		const ensureArray = new Uint32Array(4);
		crypto.getRandomValues(ensureArray);
		
		const positions = [];
		for (let i = 0; i < Math.min(4, len); i++) {
			positions.push(ensureArray[i] % len);
		}
		
		const passwordArray = password.split('');
		passwordArray[positions[0] % len] = lowercase.charAt(ensureArray[0] % lowercase.length);
		passwordArray[positions[1] % len] = uppercase.charAt(ensureArray[1] % uppercase.length);
		passwordArray[positions[2] % len] = numbers.charAt(ensureArray[2] % numbers.length);
		if (includeSymbols && len > 3) {
			passwordArray[positions[3] % len] = symbols.charAt(ensureArray[3] % symbols.length);
		}
		password = passwordArray.join('');
	}
	
	return password;
}

