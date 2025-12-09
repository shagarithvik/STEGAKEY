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
const passLengthEl = document.getElementById('passLength');
const includeSymbolsEl = document.getElementById('includeSymbols');
const strengthBar = document.getElementById('strengthBar');
const strengthBarFill = document.getElementById('strengthBarFill');
let currentVault = null; // array of groups
let carriers = [];

// Enable Enter key for master password input
if (masterEl) {
	masterEl.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			document.getElementById('unlock').click();
		}
	});
}

// Request connection to native host (try-catch to handle errors)
try {
    chrome.runtime.sendMessage({ type: 'connect_native' }, () => {
        if (chrome.runtime.lastError) {
            console.warn('Native host not available:', chrome.runtime.lastError.message);
            updateStatus('Scanning for USB...', 'default');
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
                    updateStatus('✓ USB Vault Detected', 'unlocked');
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
    
    if (vault.length === 0 || vault.every(g => !g.entries || g.entries.length === 0)) {
        vaultList.innerHTML = '<div style="text-align:center; padding:20px; color:#6c757d;">No passwords stored yet. Add your first credential!</div>';
        return;
    }
    
    for (const group of vault) {
        if (!group.entries || group.entries.length === 0) continue;
        
        const groupTitle = document.createElement('div');
        groupTitle.textContent = group.name || 'Vault';
        groupTitle.style.cssText = 'font-weight:600; margin:12px 0 8px 0; color:#495057; font-size:14px;';
        vaultList.appendChild(groupTitle);
        
        for (const entry of group.entries) {
            const row = document.createElement('div');
            row.className = 'vault-entry';
            
            const info = document.createElement('div');
            info.className = 'vault-entry-info';
            
            const domain = document.createElement('div');
            domain.className = 'vault-entry-domain';
            domain.textContent = entry.domain || 'No domain';
            
            const username = document.createElement('div');
            username.className = 'vault-entry-username';
            username.textContent = entry.username || 'No username';
            
            info.appendChild(domain);
            info.appendChild(username);
            
            const passwordInput = document.createElement('input');
            passwordInput.type = 'password';
            passwordInput.readOnly = true;
            passwordInput.value = entry.password;
            passwordInput.className = 'vault-entry-password';
            
            const actions = document.createElement('div');
            actions.className = 'vault-entry-actions';
            
            const showBtn = document.createElement('button');
            showBtn.textContent = '👁️';
            showBtn.className = 'vault-entry-btn';
            showBtn.title = 'Toggle visibility';
            showBtn.onclick = () => {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    showBtn.textContent = '🙈';
                } else {
                    passwordInput.type = 'password';
                    showBtn.textContent = '👁️';
                }
            };
            
            const copyPasswordBtn = document.createElement('button');
            copyPasswordBtn.textContent = '📋';
            copyPasswordBtn.className = 'vault-entry-btn';
            copyPasswordBtn.title = 'Copy password';
            copyPasswordBtn.onclick = () => {
                navigator.clipboard.writeText(entry.password).then(() => {
                    const original = copyPasswordBtn.textContent;
                    copyPasswordBtn.textContent = '✓';
                    setTimeout(() => {
                        copyPasswordBtn.textContent = original;
                    }, 1500);
                }).catch(err => {
                    console.error('Copy failed:', err);
                    // Fallback method
                    passwordInput.select();
                    document.execCommand('copy');
                    const original = copyPasswordBtn.textContent;
                    copyPasswordBtn.textContent = '✓';
                    setTimeout(() => {
                        copyPasswordBtn.textContent = original;
                    }, 1500);
                });
            };
            
            actions.appendChild(showBtn);
            actions.appendChild(copyPasswordBtn);
            
            row.appendChild(info);
            row.appendChild(passwordInput);
            row.appendChild(actions);
            vaultList.appendChild(row);
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
    
    if (!domain) {
        updateStatus('✗ Domain is required', 'error');
        addDomain.focus();
        return;
    }
    
    if (!password) {
        updateStatus('✗ Password is required', 'error');
        addPass.focus();
        return;
    }
    
    // Basic domain validation
    if (domain.includes(' ') || domain.includes('/')) {
        updateStatus('✗ Invalid domain format (use example.com)', 'error');
        addDomain.focus();
        return;
    }
    
    // Put into first group; create if missing
    if (!currentVault.length) currentVault.push({ name: 'Vault', entries: [] });
    currentVault[0].entries = currentVault[0].entries || [];
    
    // Check for duplicate
    const exists = currentVault[0].entries.some(e => 
        e.domain === domain && e.username === username
    );
    
    if (exists) {
        updateStatus('✗ Entry already exists for this domain/username', 'error');
        return;
    }
    
    currentVault[0].entries.push({ domain, username, password });
    
    try {
        await chrome.storage.session.set({ vault: currentVault });
        renderVault(currentVault);
        addDomain.value = '';
        addUser.value = '';
        addPass.value = '';
        addForm.style.display = 'none';
        addEntryBtn.style.display = 'block';
        updateStatus('✓ Credential added successfully', 'unlocked');
    } catch (err) {
        console.error('Save failed:', err);
        updateStatus('✗ Failed to save credential', 'error');
    }
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
	
	// Validate inputs
	if (!pw) {
		updateStatus('✗ Please enter master password', 'error');
		masterEl.focus();
		return;
	}
	
	if (carriers.length === 0) {
		updateStatus('✗ No USB vault detected. Please plug in your USB drive.', 'error');
		return;
	}
	
	// Disable button and show loading state
	const unlockBtn = document.getElementById('unlock');
	const originalText = unlockBtn.innerHTML;
	unlockBtn.disabled = true;
	unlockBtn.innerHTML = '<span class="loading"></span> Unlocking...';
	updateStatus('🔓 Decrypting vault...', 'default');
	
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
			} catch (extractErr) {
				console.warn('Stego extraction failed, trying direct decrypt:', extractErr);
			}

			const decrypted = await decryptStegoBlob(payloadB64, pw);
			const parsed = JSON.parse(decrypted);
			vault.push(parsed);
		}
	} catch (err) {
		console.error('Decrypt failed:', err);
		updateStatus('✗ Decryption failed. Please check your master password.', 'error');
		unlockBtn.disabled = false;
		unlockBtn.innerHTML = originalText;
		// Clear password field for retry
		masterEl.value = '';
		masterEl.focus();
		return;
	}
	
    try {
        await chrome.storage.session.set({ vault });
        currentVault = vault;
        renderVault(currentVault);
        updateStatus('✓ Vault Unlocked Successfully!', 'unlocked');
        // Hide master controls to prevent re-prompt loop
        if (masterSection) masterSection.style.display = 'none';
        masterEl.value = '';
        unlockBtn.disabled = false;
        unlockBtn.innerHTML = originalText;
    } catch (err) {
		console.error('Storage error:', err);
		updateStatus('✗ Error saving vault to session', 'error');
		unlockBtn.disabled = false;
		unlockBtn.innerHTML = originalText;
	}
};

function calculatePasswordStrength(password) {
	let strength = 0;
	if (password.length >= 8) strength += 20;
	if (password.length >= 12) strength += 20;
	if (password.length >= 16) strength += 10;
	if (/[a-z]/.test(password)) strength += 10;
	if (/[A-Z]/.test(password)) strength += 10;
	if (/[0-9]/.test(password)) strength += 10;
	if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
	
	return Math.min(strength, 100);
}

function updateStrengthBar(password) {
	const strength = calculatePasswordStrength(password);
	strengthBar.style.display = 'block';
	strengthBarFill.style.width = strength + '%';
	
	strengthBarFill.className = 'password-strength-bar';
	if (strength < 50) {
		strengthBarFill.classList.add('weak');
	} else if (strength < 80) {
		strengthBarFill.classList.add('medium');
	} else {
		strengthBarFill.classList.add('strong');
	}
}

document.getElementById('genpass').onclick = () => {
	const length = parseInt(passLengthEl.value) || 16;
	const includeSymbols = includeSymbolsEl.checked;
	const password = generatePassword(length, includeSymbols);
	genOut.value = password;
	copyBtn.classList.add('show');
	updateStrengthBar(password);
};

copyBtn.onclick = () => {
	const password = genOut.value;
	navigator.clipboard.writeText(password).then(() => {
		copyBtn.textContent = '✓ Copied!';
		copyBtn.classList.add('copied');
		setTimeout(() => {
			copyBtn.textContent = '📋 Copy to Clipboard';
			copyBtn.classList.remove('copied');
		}, 2000);
	}).catch(() => {
		// Fallback for older browsers
		genOut.select();
		document.execCommand('copy');
		copyBtn.textContent = '✓ Copied!';
		copyBtn.classList.add('copied');
		setTimeout(() => {
			copyBtn.textContent = '📋 Copy to Clipboard';
			copyBtn.classList.remove('copied');
		}, 2000);
	});
};

