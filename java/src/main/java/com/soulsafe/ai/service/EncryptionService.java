package com.soulsafe.ai.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class EncryptionService {
    
    private static final Logger logger = LoggerFactory.getLogger(EncryptionService.class);
    
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    private static final int KEY_LENGTH = 256;
    
    @Value("${encryption.master.key:SoulSafeMasterKey2023!}")
    private String masterKey;
    
    /**
     * Generate a new encryption key
     */
    public String generateKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
            keyGenerator.init(KEY_LENGTH);
            SecretKey key = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            logger.error("Failed to generate encryption key: {}", e.getMessage());
            throw new RuntimeException("Key generation failed", e);
        }
    }
    
    /**
     * Generate capsule-specific encryption key
     */
    public String generateCapsuleKey(String userId, String capsuleId) {
        try {
            String salt = userId + "-" + capsuleId;
            return deriveKey(masterKey, salt);
        } catch (Exception e) {
            logger.error("Failed to generate capsule key: {}", e.getMessage());
            throw new RuntimeException("Capsule key generation failed", e);
        }
    }
    
    /**
     * Encrypt text data
     */
    public Map<String, String> encryptText(String plaintext, String keyBase64) {
        try {
            SecretKeySpec key = new SecretKeySpec(Base64.getDecoder().decode(keyBase64), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);
            
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            
            Map<String, String> result = new HashMap<>();
            result.put("encrypted", Base64.getEncoder().encodeToString(ciphertext));
            result.put("iv", Base64.getEncoder().encodeToString(iv));
            result.put("tag", Base64.getEncoder().encodeToString(cipher.getIV()));
            
            return result;
        } catch (Exception e) {
            logger.error("Text encryption failed: {}", e.getMessage());
            throw new RuntimeException("Text encryption failed", e);
        }
    }
    
    /**
     * Decrypt text data
     */
    public String decryptText(String encryptedText, String ivBase64, String keyBase64) {
        try {
            SecretKeySpec key = new SecretKeySpec(Base64.getDecoder().decode(keyBase64), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            byte[] iv = Base64.getDecoder().decode(ivBase64);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);
            
            byte[] ciphertext = Base64.getDecoder().decode(encryptedText);
            byte[] plaintext = cipher.doFinal(ciphertext);
            
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Text decryption failed: {}", e.getMessage());
            throw new RuntimeException("Text decryption failed", e);
        }
    }
    
    /**
     * Encrypt file data
     */
    public Map<String, String> encryptFile(byte[] fileData, String keyBase64) {
        try {
            SecretKeySpec key = new SecretKeySpec(Base64.getDecoder().decode(keyBase64), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);
            
            byte[] ciphertext = cipher.doFinal(fileData);
            
            Map<String, String> result = new HashMap<>();
            result.put("encrypted", Base64.getEncoder().encodeToString(ciphertext));
            result.put("iv", Base64.getEncoder().encodeToString(iv));
            result.put("tag", Base64.getEncoder().encodeToString(cipher.getIV()));
            
            return result;
        } catch (Exception e) {
            logger.error("File encryption failed: {}", e.getMessage());
            throw new RuntimeException("File encryption failed", e);
        }
    }
    
    /**
     * Decrypt file data
     */
    public byte[] decryptFile(String encryptedData, String ivBase64, String keyBase64) {
        try {
            SecretKeySpec key = new SecretKeySpec(Base64.getDecoder().decode(keyBase64), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            byte[] iv = Base64.getDecoder().decode(ivBase64);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);
            
            byte[] ciphertext = Base64.getDecoder().decode(encryptedData);
            return cipher.doFinal(ciphertext);
        } catch (Exception e) {
            logger.error("File decryption failed: {}", e.getMessage());
            throw new RuntimeException("File decryption failed", e);
        }
    }
    
    /**
     * Hash sensitive data for storage
     */
    public String hashSensitiveData(String data) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            logger.error("Hashing failed: {}", e.getMessage());
            throw new RuntimeException("Hashing failed", e);
        }
    }
    
    /**
     * Generate secure random string
     */
    public String generateSecureRandom(int length) {
        byte[] bytes = new byte[length];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
    
    /**
     * Verify file integrity
     */
    public boolean verifyFileIntegrity(byte[] fileData, String expectedHash) {
        try {
            String actualHash = hashSensitiveData(new String(fileData, StandardCharsets.UTF_8));
            return actualHash.equals(expectedHash);
        } catch (Exception e) {
            logger.error("File integrity verification failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Derive key from master key and salt
     */
    private String deriveKey(String masterKey, String salt) {
        try {
            javax.crypto.spec.PBEKeySpec spec = new javax.crypto.spec.PBEKeySpec(
                masterKey.toCharArray(), 
                salt.getBytes(StandardCharsets.UTF_8), 
                100000, 
                KEY_LENGTH
            );
            
            javax.crypto.SecretKeyFactory factory = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] key = factory.generateSecret(spec).getEncoded();
            
            return Base64.getEncoder().encodeToString(key);
        } catch (Exception e) {
            logger.error("Key derivation failed: {}", e.getMessage());
            throw new RuntimeException("Key derivation failed", e);
        }
    }
}
