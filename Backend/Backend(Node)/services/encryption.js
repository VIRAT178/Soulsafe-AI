const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    // For GCM mode, a 12-byte (96-bit) IV is recommended
    this.ivLength = 12; // 96 bits
    this.tagLength = 16; // 128 bits
  }

  // Generate a random encryption key
  generateKey() {
    return crypto.randomBytes(this.keyLength);
  }

  // Generate a random IV
  generateIV() {
    return crypto.randomBytes(this.ivLength);
  }

  // Encrypt text data
  encryptText(text, key) {
    try {
      const iv = this.generateIV();
      if (!Buffer.isBuffer(key)) key = Buffer.from(key, 'hex');
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      cipher.setAAD(Buffer.from('soulsafe-capsule', 'utf8'));

      const encryptedBuffer = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
      ]);

      const tag = cipher.getAuthTag();

      return {
        encrypted: encryptedBuffer.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Text encryption failed: ${error.message}`);
    }
  }

  // Decrypt text data
  decryptText(encryptedData, key) {
    try {
      if (!Buffer.isBuffer(key)) key = Buffer.from(key, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(Buffer.from('soulsafe-capsule', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

      const decryptedBuffer = Buffer.concat([
        decipher.update(Buffer.from(encryptedData.encrypted, 'hex')),
        decipher.final()
      ]);

      return decryptedBuffer.toString('utf8');
    } catch (error) {
      throw new Error(`Text decryption failed: ${error.message}`);
    }
  }

  // Encrypt file buffer
  async encryptFile(fileBuffer, key) {
    try {
      const iv = this.generateIV();
      if (!Buffer.isBuffer(key)) key = Buffer.from(key, 'hex');
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      cipher.setAAD(Buffer.from('soulsafe-file', 'utf8'));

      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final()
      ]);

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`File encryption failed: ${error.message}`);
    }
  }

  // Decrypt file buffer
  async decryptFile(encryptedData, key) {
    try {
      if (!Buffer.isBuffer(key)) key = Buffer.from(key, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(Buffer.from('soulsafe-file', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

      const decrypted = Buffer.concat([
        decipher.update(encryptedData.encrypted),
        decipher.final()
      ]);

      return decrypted;
    } catch (error) {
      throw new Error(`File decryption failed: ${error.message}`);
    }
  }

  // Encrypt file from disk
  async encryptFileFromDisk(filePath, key) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return await this.encryptFile(fileBuffer, key);
    } catch (error) {
      throw new Error(`File encryption from disk failed: ${error.message}`);
    }
  }

  // Decrypt file to disk
  async decryptFileToDisk(encryptedData, key, outputPath) {
    try {
      const decryptedBuffer = await this.decryptFile(encryptedData, key);
      await fs.writeFile(outputPath, decryptedBuffer);
      return outputPath;
    } catch (error) {
      throw new Error(`File decryption to disk failed: ${error.message}`);
    }
  }

  // Generate capsule-specific encryption key
  generateCapsuleKey(userId, capsuleId) {
    const baseKey = process.env.ENCRYPTION_MASTER_KEY || 'fallback-master-key';
    const salt = `${userId}-${capsuleId}`;
    return crypto.pbkdf2Sync(baseKey, salt, 100000, this.keyLength, 'sha512');
  }

  // Hash sensitive data for storage
  hashSensitiveData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Verify file integrity
  verifyFileIntegrity(fileBuffer, expectedHash) {
    const actualHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return actualHash === expectedHash;
  }

  // Encrypt metadata
  encryptMetadata(metadata, key) {
    try {
      const jsonString = JSON.stringify(metadata);
      return this.encryptText(jsonString, key);
    } catch (error) {
      throw new Error(`Metadata encryption failed: ${error.message}`);
    }
  }

  // Decrypt metadata
  decryptMetadata(encryptedMetadata, key) {
    try {
      const decryptedJson = this.decryptText(encryptedMetadata, key);
      return JSON.parse(decryptedJson);
    } catch (error) {
      throw new Error(`Metadata decryption failed: ${error.message}`);
    }
  }
}

module.exports = new EncryptionService();
