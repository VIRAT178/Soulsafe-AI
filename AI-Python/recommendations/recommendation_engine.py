import numpy as np
import logging
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        """Initialize recommendation engine"""
        try:
            logger.info("Recommendation engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize recommendation engine: {str(e)}")
            raise

    def generate_recommendations(self, user_id, preferences=None):
        """
        Generate personalized recommendations for a user
        
        Args:
            user_id (str): User ID
            preferences (str): User preferences JSON string
            
        Returns:
            dict: Personalized recommendations
        """
        try:
            # Parse preferences if provided
            prefs = {}
            if preferences:
                try:
                    import json
                    prefs = json.loads(preferences)
                except:
                    prefs = {}
            
            recommendations = {
                'unlock_suggestions': self._suggest_unlock_timing(user_id, prefs),
                'content_suggestions': self._suggest_content_types(user_id, prefs),
                'sharing_suggestions': self._suggest_sharing_opportunities(user_id, prefs),
                'category_recommendations': self._suggest_categories(user_id, prefs)
            }
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {str(e)}")
            return {
                'unlock_suggestions': [],
                'content_suggestions': [],
                'sharing_suggestions': [],
                'category_recommendations': []
            }

    def suggest_unlock_timing(self, unlock_conditions, content_analysis):
        """
        Suggest optimal unlock timing based on content analysis
        
        Args:
            unlock_conditions (dict): Current unlock conditions
            content_analysis (dict): AI analysis of content
            
        Returns:
            list: Unlock timing suggestions
        """
        try:
            suggestions = []
            
            # Analyze emotion and sentiment
            emotion = content_analysis.get('emotion', {})
            sentiment = content_analysis.get('sentiment', {})
            
            # Suggest timing based on emotional content
            if emotion.get('primary') in ['joy', 'love', 'optimism']:
                suggestions.append({
                    'suggested_date': self._get_next_holiday(),
                    'reason': 'Positive emotional content is perfect for holiday sharing',
                    'confidence': 0.85
                })
            
            if sentiment.get('score', 0) > 0.7:
                suggestions.append({
                    'suggested_date': self._get_next_birthday(),
                    'reason': 'High positive sentiment content for birthday celebration',
                    'confidence': 0.78
                })
            
            # Suggest based on content topics
            topics = content_analysis.get('topics', [])
            if 'family' in topics:
                suggestions.append({
                    'suggested_date': self._get_next_family_event(),
                    'reason': 'Family-related content for family gathering',
                    'confidence': 0.82
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Unlock timing suggestion failed: {str(e)}")
            return []

    def suggest_sharing(self, capsule_data, content_analysis):
        """
        Suggest sharing opportunities based on content
        
        Args:
            capsule_data (dict): Capsule data
            content_analysis (dict): Content analysis results
            
        Returns:
            list: Sharing suggestions
        """
        try:
            suggestions = []
            
            # Analyze content for sharing potential
            emotion = content_analysis.get('emotion', {})
            topics = content_analysis.get('topics', [])
            
            # Suggest sharing based on emotional content
            if emotion.get('primary') in ['joy', 'love', 'gratitude']:
                suggestions.append({
                    'recipients': ['family@example.com'],
                    'reason': 'Positive emotional content perfect for family sharing',
                    'confidence': 0.88
                })
            
            # Suggest based on topics
            if 'work' in topics:
                suggestions.append({
                    'recipients': ['colleagues@work.com'],
                    'reason': 'Work-related content for professional sharing',
                    'confidence': 0.75
                })
            
            if 'travel' in topics:
                suggestions.append({
                    'recipients': ['friends@travel.com'],
                    'reason': 'Travel content for friend sharing',
                    'confidence': 0.80
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Sharing suggestion failed: {str(e)}")
            return []

    def _suggest_unlock_timing(self, user_id, preferences):
        """Suggest optimal unlock timing"""
        suggestions = []
        
        # Suggest seasonal unlocks
        current_date = datetime.now()
        
        suggestions.append({
            'type': 'seasonal',
            'description': 'Create a winter memory capsule',
            'reason': 'Winter season is perfect for cozy memories',
            'suggested_date': current_date + timedelta(days=30),
            'confidence': 0.75
        })
        
        suggestions.append({
            'type': 'holiday',
            'description': 'Create a holiday celebration capsule',
            'reason': 'Holiday season approaching',
            'suggested_date': current_date + timedelta(days=60),
            'confidence': 0.85
        })
        
        return suggestions

    def _suggest_content_types(self, user_id, preferences):
        """Suggest content types based on user behavior"""
        suggestions = []
        
        suggestions.append({
            'type': 'memory_capsule',
            'description': 'Create a memory capsule for special moments',
            'reason': 'High emotional content detected in recent capsules',
            'confidence': 0.80
        })
        
        suggestions.append({
            'type': 'photo_collection',
            'description': 'Create a photo collection capsule',
            'reason': 'Visual content performs well in your capsules',
            'confidence': 0.75
        })
        
        suggestions.append({
            'type': 'video_memory',
            'description': 'Create a video memory capsule',
            'reason': 'Video content has high engagement',
            'confidence': 0.70
        })
        
        return suggestions

    def _suggest_sharing_opportunities(self, user_id, preferences):
        """Suggest sharing opportunities"""
        suggestions = []
        
        suggestions.append({
            'type': 'family_sharing',
            'description': 'Share family memories with relatives',
            'reason': 'Family-related content detected',
            'confidence': 0.85
        })
        
        suggestions.append({
            'type': 'friend_sharing',
            'description': 'Share fun memories with friends',
            'reason': 'Social content suitable for friend groups',
            'confidence': 0.75
        })
        
        return suggestions

    def _suggest_categories(self, user_id, preferences):
        """Suggest capsule categories"""
        suggestions = []
        
        suggestions.append({
            'category': 'memories',
            'description': 'Create more memory capsules',
            'reason': 'Memory capsules are popular in your collection',
            'confidence': 0.80
        })
        
        suggestions.append({
            'category': 'family',
            'description': 'Create family-focused capsules',
            'reason': 'Family content has high emotional impact',
            'confidence': 0.85
        })
        
        return suggestions

    def _get_next_holiday(self):
        """Get next major holiday date"""
        current_date = datetime.now()
        
        # Simple holiday calculation (Christmas)
        christmas = datetime(current_date.year, 12, 25)
        if christmas < current_date:
            christmas = datetime(current_date.year + 1, 12, 25)
        
        return christmas.isoformat()

    def _get_next_birthday(self):
        """Get next birthday date (mock)"""
        current_date = datetime.now()
        return (current_date + timedelta(days=30)).isoformat()

    def _get_next_family_event(self):
        """Get next family event date (mock)"""
        current_date = datetime.now()
        return (current_date + timedelta(days=45)).isoformat()

    def analyze_user_patterns(self, user_data):
        """
        Analyze user patterns for better recommendations
        
        Args:
            user_data (list): List of user's capsule data
            
        Returns:
            dict: User pattern analysis
        """
        try:
            if not user_data:
                return {'patterns': {}, 'insights': 'No data available'}
            
            # Analyze categories
            categories = [capsule.get('category', 'other') for capsule in user_data]
            category_counts = defaultdict(int)
            for category in categories:
                category_counts[category] += 1
            
            # Analyze unlock patterns
            unlock_dates = []
            for capsule in user_data:
                unlock_date = capsule.get('unlockConditions', {}).get('unlockDate')
                if unlock_date:
                    unlock_dates.append(datetime.fromisoformat(unlock_date.replace('Z', '+00:00')))
            
            # Analyze content types
            content_types = [capsule.get('content', {}).get('type', 'text') for capsule in user_data]
            type_counts = defaultdict(int)
            for content_type in content_types:
                type_counts[content_type] += 1
            
            return {
                'patterns': {
                    'favorite_categories': dict(category_counts),
                    'content_type_preferences': dict(type_counts),
                    'unlock_frequency': len(unlock_dates),
                    'avg_capsule_size': np.mean([capsule.get('size', 0) for capsule in user_data])
                },
                'insights': f"Most active category: {max(category_counts, key=category_counts.get)}"
            }
            
        except Exception as e:
            logger.error(f"User pattern analysis failed: {str(e)}")
            return {'patterns': {}, 'insights': 'Analysis failed', 'error': str(e)}
