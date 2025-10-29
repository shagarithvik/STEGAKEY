const statusEl = document.getElementById('status');
const statusText = document.getElementById('status-text');
const masterEl = document.getElementById('master');
const masterSection = document.getElementById('masterSection');
const genOut = document.getElementById('genout');
const copyBtn = document.getElementById('copyBtn');
const vaultSection = document.getElementById('vaultSection');
const vaultList = document.getElementById('vaultList');
const addDomain = document.getElementById('addDomain');
const addUser = document.getElementById('addUser');
const addPass = document.getElementById('addPass');
const addEntryBtn = document.getElementById('addEntry');
const addForm = document.getElementById('addForm');
const saveEntryBtn = document.getElementById('saveEntry');
const cancelEntryBtn = document.getElementById('cancelEntry');
const offerSave = document.getElementById('offerSave');
const offerUser = document.getElementById('offerUser');
const offerPass = document.getElementById('offerPass');
const offerSaveBtn = document.getElementById('offerSaveBtn');
const offerDismissBtn = document.getElementById('offerDismissBtn');
let currentVault = null; // array of groups
let carriers = [];

// Request connection to native host (try-catch to handle errors)
try {
    chrome.runtime.sendMessage({ type: 'connect_native' }, () => {
        if (chrome.runtime.lastError) {
            console.warn('Native host not available:', chrome.runtime.lastError.message);
            if (statusEl) statusEl.textContent = 'Scanning for USB...';
            return;
        }
        // Fetch any cached carriers after connecting
        try {
            chrome.runtime.sendMessage({ type: 'get_carriers' }, (res) => {
                if (chrome.runtime.lastError) {
                    console.warn('get_carriers failed:', chrome.runtime.lastError.message);
                    return;
                }
            if (res && Array.isArray(res.carriers) && res.carriers.length) {
                carriers = res.carriers;
                    statusEl.textContent = 'USB Vault Detected';
            }
            });
        } catch (e) {
            console.warn('get_carriers send failed:', e);
        }
    });

    // Load vault and pending save offer if any
    chrome.storage.session.get(['vault','pendingCredential'], (data) => {
        if (data && data.vault) {
            currentVault = data.vault;
            renderVault(currentVault);
            // Hide master section when already unlocked
            if (masterSection) masterSection.style.display = 'none';
            updateStatus('✓ Vault Unlocked!', 'unlocked');
        }
        if (data && data.pendingCredential) {
            const { username, password } = data.pendingCredential;
            offerUser.value = username || '';
            offerPass.value = password || '';
            offerSave.style.display = 'block';
        }
    });
} catch (e) {
    console.warn('Message send failed:', e);
}

function updateStatus(text, type = 'default') {
	statusText.textContent = text;
	statusEl.className = 'status-card';
	if (type === 'unlocked') {
		statusEl.classList.add('unlocked');
	} else if (type === 'error') {
		statusEl.classList.add('locked');
	}
}

chrome.runtime.onMessage.addListener((msg) => {
	if (msg.type === 'carrier_ready') {
		updateStatus('✓ USB Vault Detected', 'unlocked');
		carriers = msg.carriers;
	}
	if (msg.type === 'usb_removed') {
		updateStatus('✗ USB Removed — Vault Locked', 'error');
		carriers = [];
	}
});

function renderVault(vault) {
    if (!Array.isArray(vault)) return;
    vaultSection.style.display = 'block';
    vaultList.innerHTML = '';
    for (const group of vault) {
        const groupTitle = document.createElement('div');
        groupTitle.textContent = group.name || 'Group';
        groupTitle.style.cssText = 'font-weight:600; margin:6px 0; color:#495057;';
        vaultList.appendChild(groupTitle);
        if (Array.isArray(group.entries)) {
            for (const entry of group.entries) {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; gap:8px; align-items:center; padding:6px; border-bottom:1px solid #f1f3f5;';
                const d = document.createElement('div');
                d.style.cssText = 'flex:1; font-size:13px; color:#212529;';
                d.textContent = `${entry.domain} — ${entry.username}`;
                const p = document.createElement('input');
                p.type = 'text';
                p.readOnly = true;
                p.value = entry.password;
                p.style.cssText = 'flex:1; padding:6px; border:1px solid #dee2e6; border-radius:6px; font-family:monospace;';
                row.appendChild(d);
                row.appendChild(p);
                vaultList.appendChild(row);
            }
        }
    }
}

// Toggle add form visibility
addEntryBtn.onclick = () => {
    if (addForm.style.display === 'none') {
        addForm.style.display = 'block';
        addEntryBtn.style.display = 'none';
    } else {
        addForm.style.display = 'none';
        addEntryBtn.style.display = 'block';
    }
};

saveEntryBtn.onclick = async () => {
    if (!currentVault) {
        updateStatus('✗ Unlock the vault first', 'error');
        return;
    }
    const domain = (addDomain.value || '').trim();
    const username = (addUser.value || '').trim();
    const password = (addPass.value || '').trim();
    if (!domain || !password) {
        updateStatus('✗ Domain and password required', 'error');
        return;
    }
    // Put into first group; create if missing
    if (!currentVault.length) currentVault.push({ name: 'Vault', entries: [] });
    currentVault[0].entries = currentVault[0].entries || [];
    currentVault[0].entries.push({ domain, username, password });
    await chrome.storage.session.set({ vault: currentVault });
    renderVault(currentVault);
    addDomain.value = '';
    addUser.value = '';
    addPass.value = '';
    addForm.style.display = 'none';
    addEntryBtn.style.display = 'block';
    updateStatus('✓ Entry added', 'unlocked');
};

cancelEntryBtn.onclick = () => {
    addForm.style.display = 'none';
    addEntryBtn.style.display = 'block';
    addDomain.value = '';
    addUser.value = '';
    addPass.value = '';
};

offerSaveBtn.onclick = async () => {
    if (!currentVault) {
        updateStatus('✗ Unlock the vault first', 'error');
        return;
    }
    const username = offerUser.value;
    const password = offerPass.value;
    const domain = location.hostname;
    if (!currentVault.length) currentVault.push({ name: 'Vault', entries: [] });
    currentVault[0].entries.push({ domain, username, password });
    await chrome.storage.session.set({ vault: currentVault });
    offerSave.style.display = 'none';
    await chrome.storage.session.remove('pendingCredential');
    renderVault(currentVault);
    updateStatus('✓ Credentials saved', 'unlocked');
};

offerDismissBtn.onclick = async () => {
    offerSave.style.display = 'none';
    await chrome.storage.session.remove('pendingCredential');
};

document.getElementById('unlock').onclick = async () => {
	const pw = masterEl.value;
	if (!pw || carriers.length === 0) {
		updateStatus('✗ No USB detected or master password', 'error');
		return;
	}
	
	updateStatus('🔓 Unlocking vault...', 'default');
	const vault = [];
	try {
		for (const c of carriers) {
			let payloadB64 = c.data;
			// If c.data is a PNG file, try to extract the sPas chunk first
			try {
				const pngBytes = Uint8Array.from(atob(c.data), ch => ch.charCodeAt(0)).buffer;
				const chunk = await extractStegoChunk(pngBytes);
				if (chunk && chunk.length) {
					payloadB64 = btoa(String.fromCharCode(...chunk));
				}
			} catch (_) {}

			const decrypted = await decryptStegoBlob(payloadB64, pw);
			vault.push(JSON.parse(decrypted));
		}
	} catch (err) {
		console.error('Decrypt failed:', err);
		updateStatus('✗ Decryption failed. Check USB/password.', 'error');
		return;
	}
    try {
        await chrome.storage.session.set({ vault });
        currentVault = vault;
        renderVault(currentVault);
        updateStatus('✓ Vault Unlocked!', 'unlocked');
        // Hide master controls to prevent re-prompt loop
        if (masterSection) masterSection.style.display = 'none';
        masterEl.value = '';
    } catch (err) {
		console.error('Storage error:', err);
		updateStatus('✗ Error saving vault', 'error');
	}
};

document.getElementById('genpass').onclick = () => {
	const password = generatePassword();
	genOut.value = password;
	copyBtn.classList.add('show');
};

copyBtn.onclick = () => {
	genOut.select();
	document.execCommand('copy');
	copyBtn.textContent = '✓ Copied!';
	setTimeout(() => {
		copyBtn.textContent = '📋 Copy to Clipboard';
	}, 2000);
};

