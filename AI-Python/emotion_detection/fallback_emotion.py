class EmotionAnalyzer:
    def __init__(self):
        pass

    def analyze(self, text):
        # Return a deterministic mock analysis for demo
        text = (text or '').strip()
        if not text:
            return {
                'dominant_emotion': 'neutral',
                'primary_emotion': 'neutral',
                'secondary_emotion': 'neutral',
                'confidence': 0.0,
                'emotions': {'neutral': 1.0},
                'sentiment': {'compound': 0.0, 'positive': 0.0, 'negative': 0.0, 'neutral': 1.0},
                'recommendedUnlock': {'days': 14, 'rationale': 'Default recommendation'},
                'contextualTags': ['general-memory']
            }

        # Simple heuristics
        lower = text.lower()
        if any(w in lower for w in ['happy','joy','love','excited', 'smile', 'wonderful', 'amazing', 'great']):
            primary = 'joy'
            conf = 0.9
            category = 'positive'
            tags = ['positive-memory']
        elif any(w in lower for w in ['sad','sadness','cry','unhappy','miss', 'lonely', 'depressed']):
            primary = 'sadness'
            conf = 0.85
            category = 'negative'
            tags = ['reflective-memory']
        elif any(w in lower for w in ['angry','hate','frustrated','annoyed','mad']):
            primary = 'anger'
            conf = 0.8
            category = 'negative'
            tags = ['emotional-memory']
        elif any(w in lower for w in ['afraid','fear','scared','anxious','worried','nervous']):
            primary = 'fear'
            conf = 0.75
            category = 'negative'
            tags = ['reflective-memory']
        elif any(w in lower for w in ['surprise','amazed','shocked','astonished']):
            primary = 'surprise'
            conf = 0.7
            category = 'neutral'
            tags = ['milestone-memory']
        else:
            primary = 'neutral'
            conf = 0.6
            category = 'neutral'
            tags = ['general-memory']

        # Predict unlock recommendation
        if category == 'positive':
            unlock_rec = {'days': 7, 'rationale': 'Positive emotion - unlock soon to share joy'}
        elif category == 'negative':
            unlock_rec = {'days': 30, 'rationale': 'Reflective emotion - unlock when you need perspective'}
        else:
            unlock_rec = {'days': 14, 'rationale': 'Neutral emotion - unlock when ready'}

        return {
            'dominant_emotion': primary,
            'primary_emotion': primary,
            'secondary_emotion': 'neutral',
            'confidence': conf,
            'emotions': {primary: conf, 'neutral': 1.0 - conf},
            'sentiment': {'compound': 0.0, 'positive': 0.0, 'negative': 0.0, 'neutral': 1.0},
            'recommendedUnlock': unlock_rec,
            'contextualTags': tags
        }

    def _predict_unlock_date(self, primary_emotion, emotion_category, sentiment_scores):
        """Predict optimal unlock date based on emotion analysis"""
        if emotion_category == 'positive':
            return {'days': 7, 'rationale': 'Positive emotion - unlock soon to share joy'}
        elif emotion_category == 'negative':
            return {'days': 30, 'rationale': 'Reflective emotion - unlock when you need perspective'}
        else:
            return {'days': 14, 'rationale': 'Neutral emotion - unlock when ready'}

    def _extract_context_tags(self, text):
        """Extract contextual tags from text"""
        keywords = []
        lower = (text or '').lower()
        if any(word in lower for word in ['love', 'happy', 'joy', 'wonderful']):
            keywords.append('positive-memory')
        if any(word in lower for word in ['sad', 'miss', 'lost', 'grief']):
            keywords.append('reflective-memory')
        if any(word in lower for word in ['family', 'friend', 'together', 'group']):
            keywords.append('social-memory')
        if any(word in lower for word in ['achievement', 'success', 'goal', 'accomplish']):
            keywords.append('milestone-memory')
        if any(word in lower for word in ['thank', 'grateful', 'appreciate']):
            keywords.append('gratitude-memory')
        
        return keywords if keywords else ['general-memory']
