import numpy as np
from transformers import pipeline
import nltk
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import logging

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    def __init__(self):
        """Initialize emotion analysis models"""
        try:
            # Load pre-trained emotion classification model
            self.emotion_classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True
            )
            
            # Initialize sentiment analyzer
            self.sentiment_analyzer = SentimentIntensityAnalyzer()
            
            # Download required NLTK data
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt')
            
            try:
                nltk.data.find('corpora/stopwords')
            except LookupError:
                nltk.download('stopwords')
            
            logger.info("Emotion analyzer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize emotion analyzer: {str(e)}")
            raise

    def analyze(self, text):
        """
        Analyze emotion from text with enhanced detection
        
        Args:
            text (str): Input text to analyze
            
        Returns:
            dict: Detailed emotion analysis results including:
                - Primary emotions
                - Sentiment scores
                - Context awareness
                - Unlock date recommendations
        """
        try:
            if not text or len(text.strip()) == 0:
                return {
                    'primary_emotion': 'neutral',
                    'secondary_emotion': 'neutral',
                    'confidence': 0.0,
                    'emotions': {},
                    'sentiment': {'compound': 0.0, 'positive': 0.0, 'negative': 0.0, 'neutral': 1.0}
                }
            
            # Get emotion predictions
            emotion_results = self.emotion_classifier(text)
            
            # Process emotion results
            emotions = {}
            for result in emotion_results[0]:
                emotions[result['label']] = result['score']
            
            # Find primary and secondary emotions
            sorted_emotions = sorted(emotion_results[0], key=lambda x: x['score'], reverse=True)
            primary_emotion = sorted_emotions[0]['label']
            primary_confidence = sorted_emotions[0]['score']
            
            secondary_emotion = sorted_emotions[1]['label'] if len(sorted_emotions) > 1 else primary_emotion
            
            # Get sentiment analysis
            sentiment_scores = self.sentiment_analyzer.polarity_scores(text)
            
            # Map emotions to broader categories
            emotion_category = self._categorize_emotion(primary_emotion)
            
            return {
                'primary_emotion': primary_emotion,
                'secondary_emotion': secondary_emotion,
                'confidence': float(primary_confidence),
                'emotions': emotions,
                'sentiment': sentiment_scores,
                'category': emotion_category,
                'intensity': self._calculate_intensity(sentiment_scores),
                'recommendedUnlock': self._predict_unlock_date(
                    primary_emotion,
                    emotion_category,
                    sentiment_scores
                ),
                'contextualTags': self._extract_context_tags(text)
            }
            
        except Exception as e:
            logger.error(f"Emotion analysis failed: {str(e)}")
            return {
                'primary_emotion': 'neutral',
                'secondary_emotion': 'neutral',
                'confidence': 0.0,
                'emotions': {},
                'sentiment': {'compound': 0.0, 'positive': 0.0, 'negative': 0.0, 'neutral': 1.0},
                'error': str(e)
            }

    def _categorize_emotion(self, emotion):
        """Categorize emotion into broader categories"""
        emotion_categories = {
            'joy': 'positive',
            'love': 'positive',
            'optimism': 'positive',
            'approval': 'positive',
            'gratitude': 'positive',
            'relief': 'positive',
            'pride': 'positive',
            'excitement': 'positive',
            'amusement': 'positive',
            'anger': 'negative',
            'annoyance': 'negative',
            'disapproval': 'negative',
            'disgust': 'negative',
            'fear': 'negative',
            'nervousness': 'negative',
            'embarrassment': 'negative',
            'sadness': 'negative',
            'grief': 'negative',
            'disappointment': 'negative',
            'neutral': 'neutral',
            'confusion': 'neutral',
            'curiosity': 'neutral',
            'realization': 'neutral',
            'surprise': 'neutral'
        }
        
        return emotion_categories.get(emotion, 'neutral')

    def _calculate_intensity(self, sentiment_scores):
        """Calculate emotional intensity"""
        compound = abs(sentiment_scores['compound'])
        
        if compound >= 0.7:
            return 'high'
        elif compound >= 0.4:
            return 'medium'
        else:
            return 'low'

    def _predict_unlock_date(self, primary_emotion, emotion_category, sentiment_scores):
        """Predict optimal unlock date based on emotion analysis"""
        try:
            # Simple logic: positive emotions unlock sooner, negative emotions unlock later
            if emotion_category == 'positive':
                return {'days': 7, 'rationale': 'Positive emotion - unlock soon to share joy'}
            elif emotion_category == 'negative':
                return {'days': 30, 'rationale': 'Reflective emotion - unlock when you need perspective'}
            else:
                return {'days': 14, 'rationale': 'Neutral emotion - unlock when ready'}
        except Exception as e:
            logger.error(f"Unlock date prediction failed: {str(e)}")
            return {'days': 14, 'rationale': 'Default recommendation'}

    def _extract_context_tags(self, text):
        """Extract contextual tags from text"""
        try:
            keywords = []
            # Simple keyword extraction based on common patterns
            if any(word in text.lower() for word in ['love', 'happy', 'joy', 'wonderful']):
                keywords.append('positive-memory')
            if any(word in text.lower() for word in ['sad', 'miss', 'lost', 'grief']):
                keywords.append('reflective-memory')
            if any(word in text.lower() for word in ['family', 'friend', 'together', 'group']):
                keywords.append('social-memory')
            if any(word in text.lower() for word in ['achievement', 'success', 'goal', 'accomplish']):
                keywords.append('milestone-memory')
            if any(word in text.lower() for word in ['thank', 'grateful', 'appreciate']):
                keywords.append('gratitude-memory')
            
            return keywords if keywords else ['general-memory']
        except Exception as e:
            logger.error(f"Context tag extraction failed: {str(e)}")
            return ['general-memory']

    def analyze_batch(self, texts):
        """
        Analyze emotions for multiple texts
        
        Args:
            texts (list): List of texts to analyze
            
        Returns:
            list: List of emotion analysis results
        """
        results = []
        for text in texts:
            result = self.analyze(text)
            results.append(result)
        return results

    def get_emotion_trends(self, emotion_data):
        """
        Analyze emotion trends over time
        
        Args:
            emotion_data (list): List of emotion analysis results with timestamps
            
        Returns:
            dict: Emotion trend analysis
        """
        try:
            if not emotion_data:
                return {'trends': {}, 'summary': 'No data available'}
            
            # Group emotions by time periods
            emotion_counts = {}
            sentiment_trends = []
            
            for data in emotion_data:
                emotion = data.get('primary_emotion', 'neutral')
                sentiment = data.get('sentiment', {}).get('compound', 0)
                
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                sentiment_trends.append(sentiment)
            
            # Calculate trend statistics
            avg_sentiment = np.mean(sentiment_trends) if sentiment_trends else 0
            sentiment_volatility = np.std(sentiment_trends) if sentiment_trends else 0
            
            # Find dominant emotions
            total_emotions = sum(emotion_counts.values())
            emotion_percentages = {
                emotion: (count / total_emotions) * 100 
                for emotion, count in emotion_counts.items()
            }
            
            dominant_emotion = max(emotion_counts, key=emotion_counts.get)
            
            return {
                'trends': {
                    'emotion_distribution': emotion_percentages,
                    'dominant_emotion': dominant_emotion,
                    'sentiment_average': float(avg_sentiment),
                    'sentiment_volatility': float(sentiment_volatility)
                },
                'summary': f"Dominant emotion: {dominant_emotion}, Average sentiment: {avg_sentiment:.2f}"
            }
            
        except Exception as e:
            logger.error(f"Emotion trend analysis failed: {str(e)}")
            return {'trends': {}, 'summary': 'Analysis failed', 'error': str(e)}
