package com.soulsafe.ai.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;
import java.util.HashMap;

@Service
public class AIService {
    
    private static final Logger logger = LoggerFactory.getLogger(AIService.class);
    
    private final WebClient webClient;
    
    @Value("${ai.python.api.url:http://localhost:5001}")
    private String pythonApiUrl;
    
    public AIService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }
    
    /**
     * Analyze emotion from text content
     */
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> analyzeEmotion(String text) {
        logger.info("Analyzing emotion for text: {}", text.substring(0, Math.min(50, text.length())));
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("text", text);
        
        return webClient.post()
                .uri(pythonApiUrl + "/analyze/emotion")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Object>) map)
                .doOnSuccess(result -> logger.info("Emotion analysis completed successfully"))
                .doOnError(error -> logger.error("Emotion analysis failed: {}", error.getMessage()));
    }
    
    /**
     * Analyze content for classification and insights
     */
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> analyzeContent(String content, String contentType) {
        logger.info("Analyzing content of type: {}", contentType);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("content", content);
        requestBody.put("type", contentType);
        
        return webClient.post()
                .uri(pythonApiUrl + "/analyze/content")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Object>) map)
                .doOnSuccess(result -> logger.info("Content analysis completed successfully"))
                .doOnError(error -> logger.error("Content analysis failed: {}", error.getMessage()));
    }
    
    /**
     * Get personalized recommendations for user
     */
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getRecommendations(String userId, String preferences) {
        logger.info("Getting recommendations for user: {}", userId);
        
        return webClient.get()
                .uri(pythonApiUrl + "/recommendations/" + userId + "?preferences=" + preferences)
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Object>) map)
                .doOnSuccess(result -> logger.info("Recommendations retrieved successfully"))
                .doOnError(error -> logger.error("Recommendations retrieval failed: {}", error.getMessage()));
    }
    
    /**
     * Generate insights for a specific capsule
     */
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> generateInsights(String capsuleId, Map<String, Object> capsuleData) {
        logger.info("Generating insights for capsule: {}", capsuleId);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("capsule", capsuleData);
        
        return webClient.post()
                .uri(pythonApiUrl + "/insights/" + capsuleId)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Object>) map)
                .doOnSuccess(result -> logger.info("Insights generated successfully"))
                .doOnError(error -> logger.error("Insights generation failed: {}", error.getMessage()));
    }
    
    /**
     * Batch analyze multiple content items
     */
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> batchAnalyze(Map<String, Object> items) {
        logger.info("Starting batch analysis for {} items", items.size());
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("items", items);
        
        return webClient.post()
                .uri(pythonApiUrl + "/batch/analyze")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Object>) map)
                .doOnSuccess(result -> logger.info("Batch analysis completed successfully"))
                .doOnError(error -> logger.error("Batch analysis failed: {}", error.getMessage()));
    }
    
    /**
     * Check AI service health
     */
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> checkHealth() {
        return webClient.get()
                .uri(pythonApiUrl + "/health")
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Object>) map)
                .doOnError(error -> logger.error("AI service health check failed: {}", error.getMessage()));
    }
}
