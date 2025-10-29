// Listen for messages from background script
chrome.runtime.onMessage.addListener(async (msg) => {
	if (msg.type === 'auto_fill') {
		// autofill password
		const domain = location.hostname;
		if (msg.vault) {
			for (const group of msg.vault) {
				for (const entry of group.entries) {
					if (entry.domain === domain) {
						const inputs = document.querySelectorAll('input[type=password]');
						if (inputs.length) inputs[0].value = entry.password;
					}
				}
			}
		}
	}
});

// Capture login submissions and send to background to offer save
function detectUsernameInput() {
	const selectors = [
		"input[name*=user]",
		"input[name*=email]",
		"input[type=email]",
		"input[name*=login]",
		"input[type=text]"
	];
	for (const sel of selectors) {
		const el = document.querySelector(sel);
		if (el) return el;
	}
	return null;
}

window.addEventListener('submit', (e) => {
	try {
		const pwd = document.querySelector('input[type=password]');
		if (!pwd) return;
		const userEl = detectUsernameInput();
		const username = userEl ? userEl.value : '';
		const password = pwd.value || '';
		if (!password) return;
		// Send and handle response properly
		chrome.runtime.sendMessage({ type: 'login_detected', credential: { domain: location.hostname, username, password } }, (response) => {
			if (chrome.runtime.lastError) {
				console.warn('Could not send login_detected message:', chrome.runtime.lastError);
			}
		});
	} catch (_) {}
}, true);

