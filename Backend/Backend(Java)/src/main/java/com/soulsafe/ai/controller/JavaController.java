package com.soulsafe.ai.controller;

import com.soulsafe.ai.service.AIService;
import com.soulsafe.ai.service.EncryptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/java")
@CrossOrigin(origins = "*")
public class JavaController {

    @Autowired
    private AIService aiService;

    @Autowired
    private EncryptionService encryptionService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Java AI Services");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze/emotion")
    public Mono<ResponseEntity<Map<String, Object>>> analyzeEmotion(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Text is required");
            return Mono.just(ResponseEntity.badRequest().body(error));
        }
        
        return aiService.analyzeEmotion(text)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(500).body(Map.of("error", "Analysis failed")));
    }

    @PostMapping("/analyze/content")
    public Mono<ResponseEntity<Map<String, Object>>> analyzeContent(@RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        String contentType = (String) request.get("type");
        
        if (content == null || content.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Content is required");
            return Mono.just(ResponseEntity.badRequest().body(error));
        }
        
        return aiService.analyzeContent(content, contentType != null ? contentType : "text")
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(500).body(Map.of("error", "Content analysis failed")));
    }

    @GetMapping("/recommendations/{userId}")
    public Mono<ResponseEntity<Map<String, Object>>> getRecommendations(
            @PathVariable String userId,
            @RequestParam(required = false) String preferences) {
        
        return aiService.getRecommendations(userId, preferences != null ? preferences : "{}")
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(500).body(Map.of("error", "Recommendations failed")));
    }

    @PostMapping("/encrypt/text")
    public ResponseEntity<Map<String, Object>> encryptText(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            String key = request.get("key");
            
            if (text == null || key == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Text and key are required");
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, String> encrypted = encryptionService.encryptText(text, key);
            Map<String, Object> response = new HashMap<>(encrypted);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Encryption failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/decrypt/text")
    public ResponseEntity<Map<String, Object>> decryptText(@RequestBody Map<String, String> request) {
        try {
            String encryptedText = request.get("encrypted");
            String iv = request.get("iv");
            String key = request.get("key");
            
            if (encryptedText == null || iv == null || key == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Encrypted text, IV, and key are required");
                return ResponseEntity.badRequest().body(error);
            }
            
            String decrypted = encryptionService.decryptText(encryptedText, iv, key);
            Map<String, Object> response = new HashMap<>();
            response.put("decrypted", decrypted);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Decryption failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/generate/key")
    public ResponseEntity<Map<String, Object>> generateKey() {
        try {
            String key = encryptionService.generateKey();
            Map<String, Object> response = new HashMap<>();
            response.put("key", key);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Key generation failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
