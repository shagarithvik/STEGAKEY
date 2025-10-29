chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.session.clear();
});

let port = null;
let carriers = [];

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === 'get_carriers') {
		sendResponse({ carriers: carriers });
		return true; // Keep channel open for async response
	} else if (msg.type === 'connect_native') {
		initPort();
		sendResponse({ success: true });
		return true;
	} else if (msg.type === 'get_status') {
		sendResponse({ carriers: carriers.length, connected: (port !== null) });
		return true;
	} else if (msg.type === 'login_detected' && msg.credential) {
		// Store in session as pending save offer
		chrome.storage.session.set({ pendingCredential: msg.credential }).then(() => {
			sendResponse({ ok: true });
		});
		return true;
	}
});

function initPort() {
	if (port) {
		return; // Already connected
	}
	
	try {
		console.log('Attempting to connect to native host...');
		port = chrome.runtime.connectNative("stegapass_usb_host");
		
		port.onMessage.addListener(async (msg) => {
			console.log('Received from native host:', msg);
			if (msg.type === 'carrier_data') {
				carriers = msg.carriers || [];
				await chrome.storage.session.set({ carriers: carriers });
				chrome.runtime.sendMessage({ type: 'carrier_ready', carriers: carriers });
			}
			if (msg.type === 'usb_removed') {
				carriers = [];
				chrome.storage.session.clear();
				chrome.runtime.sendMessage({ type: 'usb_removed' });
			}
		});
		
		port.onDisconnect.addListener(() => {
			console.log('Native host disconnected');
			port = null;
			carriers = [];
		});
		
		console.log('Native host connected successfully');
	} catch (err) {
		console.error('Native host connection failed:', err.message);
		port = null;
	}
}

// Don't auto-connect on startup - let the popup trigger it

