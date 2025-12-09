// Listen for messages from background script
chrome.runtime.onMessage.addListener(async (msg) => {
	if (msg.type === 'auto_fill') {
		// autofill password
		const domain = location.hostname;
		if (msg.vault && Array.isArray(msg.vault)) {
			let filled = false;
			for (const group of msg.vault) {
				if (!group.entries || !Array.isArray(group.entries)) continue;
				
				for (const entry of group.entries) {
					if (entry.domain === domain && !filled) {
						// Try to fill both username and password
						const userInput = detectUsernameInput();
						const pwdInputs = document.querySelectorAll('input[type=password]');
						
						if (userInput && entry.username) {
							userInput.value = entry.username;
							// Trigger input event for frameworks that listen to it
							userInput.dispatchEvent(new Event('input', { bubbles: true }));
						}
						
						if (pwdInputs.length && entry.password) {
							pwdInputs[0].value = entry.password;
							pwdInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
							filled = true;
						}
					}
				}
			}
		}
	}
});

// Capture login submissions and send to background to offer save
function detectUsernameInput() {
	// Try to find username/email input field with priority order
	const selectors = [
		"input[type=email]",
		"input[name*=email i]",
		"input[name*=user i]",
		"input[name*=login i]",
		"input[id*=email i]",
		"input[id*=user i]",
		"input[id*=login i]",
		"input[placeholder*=email i]",
		"input[placeholder*=user i]",
		"input[autocomplete=username]",
		"input[autocomplete=email]"
	];
	
	for (const sel of selectors) {
		const el = document.querySelector(sel);
		if (el && el.type !== 'password' && el.type !== 'hidden') {
			return el;
		}
	}
	
	// Fallback: find text input near password field
	const pwdField = document.querySelector('input[type=password]');
	if (pwdField) {
		const form = pwdField.closest('form');
		if (form) {
			const textInputs = form.querySelectorAll('input[type=text]');
			if (textInputs.length > 0) {
				return textInputs[0];
			}
		}
	}
	
	return null;
}

window.addEventListener('submit', (e) => {
	try {
		const pwd = document.querySelector('input[type=password]');
		if (!pwd || !pwd.value) return;
		
		const userEl = detectUsernameInput();
		const username = userEl ? userEl.value.trim() : '';
		const password = pwd.value;
		
		// Only save if password is not empty and username seems valid
		if (!password || password.length < 4) return;
		
		// Send and handle response properly
		chrome.runtime.sendMessage({ 
			type: 'login_detected', 
			credential: { 
				domain: location.hostname, 
				username, 
				password 
			} 
		}, (response) => {
			if (chrome.runtime.lastError) {
				console.log('Login detection (background not ready or popup closed)');
			}
		});
	} catch (err) {
		console.error('Login detection error:', err);
	}
}, true);

