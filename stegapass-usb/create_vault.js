// Create a sample vault with test data
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Sample vault data
const vaultData = {
  "name": "Test Vault",
  "entries": [
    {
      "domain": "example.com",
      "username": "testuser",
      "password": "TestPassword123!",
      "notes": "Test account"
    },
    {
      "domain": "github.com",
      "username": "github_user",
      "password": "GitHubPass456!",
      "notes": "GitHub account"
    }
  ]
};

async function createEncryptedVault(vaultData, masterPassword) {
  // Generate salt and IV
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  
  // Derive key using PBKDF2
  const key = crypto.pbkdf2Sync(masterPassword, salt, 120000, 32, 'sha256');
  
  // Encrypt data
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const dataString = JSON.stringify(vaultData);
  let encrypted = cipher.update(dataString, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  // Combine: salt + iv + authTag + encrypted data
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  
  // Convert to base64
  return combined.toString('base64');
}

// Master password
const MASTER_PASSWORD = "StegaPass2024!";

async function main() {
  console.log('Creating encrypted vault...');
  const encrypted = await createEncryptedVault(vaultData, MASTER_PASSWORD);
  
  // Save to files
  fs.writeFileSync('vault_encrypted.txt', encrypted);
  fs.writeFileSync('vault_info.txt', JSON.stringify({
    master_password: MASTER_PASSWORD,
    vault_name: vaultData.name,
    entry_count: vaultData.entries.length
  }, null, 2));
  
  console.log('✓ Vault created successfully!');
  console.log('✓ Master password: StegaPass2024!');
  console.log('\nFiles created:');
  console.log('- vault_encrypted.txt (encrypted vault data)');
  console.log('- vault_info.txt (vault information)');
}

main().catch(console.error);

