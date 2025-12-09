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
		console.log('Native host already connected');
		return; // Already connected
	}
	
	try {
		console.log('Attempting to connect to native host...');
		port = chrome.runtime.connectNative("stegapass_usb_host");
		
		port.onMessage.addListener(async (msg) => {
			console.log('Received from native host:', msg);
			
			if (!msg || !msg.type) {
				console.warn('Invalid message from native host:', msg);
				return;
			}
			
			if (msg.type === 'carrier_data') {
				carriers = msg.carriers || [];
				console.log('Carriers updated:', carriers.length);
				
				try {
					await chrome.storage.session.set({ carriers: carriers });
					// Notify popup
					chrome.runtime.sendMessage({ type: 'carrier_ready', carriers: carriers }).catch(err => {
						console.log('No popup to notify (this is normal)');
					});
				} catch (err) {
					console.error('Failed to store carriers:', err);
				}
			}
			
			if (msg.type === 'usb_removed') {
				console.log('USB removed, clearing session');
				carriers = [];
				try {
					await chrome.storage.session.clear();
					chrome.runtime.sendMessage({ type: 'usb_removed' }).catch(err => {
						console.log('No popup to notify (this is normal)');
					});
				} catch (err) {
					console.error('Failed to clear session:', err);
				}
			}
		});
		
		port.onDisconnect.addListener(() => {
			const error = chrome.runtime.lastError;
			if (error) {
				console.log('Native host disconnected with error:', error.message);
			} else {
				console.log('Native host disconnected normally');
			}
			port = null;
			carriers = [];
		});
		
		console.log('Native host connection initiated');
	} catch (err) {
		console.error('Native host connection failed:', err.message);
		port = null;
	}
}

// Don't auto-connect on startup - let the popup trigger it

