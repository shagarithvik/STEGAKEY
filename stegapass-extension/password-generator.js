function generatePassword(len=16) {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
	let o="";
	for(let i=0;i<len;i++){
		o += chars.charAt(Math.floor(Math.random()*chars.length));
	}
	return o;
}

