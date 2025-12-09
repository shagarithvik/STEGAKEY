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
		const passwordArray = password.split('');
		const posArray = new Uint32Array(len);
		crypto.getRandomValues(posArray);
		
		// Generate unique positions for each character type
		const positions = new Set();
		let posIndex = 0;
		while (positions.size < Math.min(includeSymbols ? 4 : 3, len)) {
			positions.add(posArray[posIndex % posArray.length] % len);
			posIndex++;
		}
		
		const positionsArray = Array.from(positions);
		const charArray = new Uint32Array(4);
		crypto.getRandomValues(charArray);
		
		passwordArray[positionsArray[0]] = lowercase.charAt(charArray[0] % lowercase.length);
		passwordArray[positionsArray[1]] = uppercase.charAt(charArray[1] % uppercase.length);
		passwordArray[positionsArray[2]] = numbers.charAt(charArray[2] % numbers.length);
		if (includeSymbols && positionsArray.length > 3) {
			passwordArray[positionsArray[3]] = symbols.charAt(charArray[3] % symbols.length);
		}
		password = passwordArray.join('');
	}
	
	return password;
}

