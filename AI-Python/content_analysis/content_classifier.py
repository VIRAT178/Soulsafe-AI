import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import re
import logging
from collections import Counter

logger = logging.getLogger(__name__)

class ContentClassifier:
    def __init__(self):
        """Initialize content classification models"""
        try:
            # Download required NLTK data
            try:
                nltk.data.find('tokenizers/punkt')
                nltk.data.find('corpora/stopwords')
                nltk.data.find('corpora/wordnet')
            except LookupError:
                nltk.download('punkt')
                nltk.download('stopwords')
                nltk.download('wordnet')
            
            # Initialize text processing components
            self.stop_words = set(stopwords.words('english'))
            self.lemmatizer = WordNetLemmatizer()
            
            # Initialize vectorizer
            self.vectorizer = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.95
            )
            
            # Initialize classifiers
            self.category_classifier = None
            self.topic_classifier = None
            self.priority_classifier = None
            
            # Define content categories
            self.categories = [
                'personal', 'family', 'work', 'creative', 'memories', 
                'travel', 'education', 'health', 'relationships', 'other'
            ]
            
            # Define topics
            self.topics = [
                'love', 'family', 'friendship', 'career', 'hobbies', 'travel',
                'education', 'health', 'food', 'music', 'sports', 'art',
                'technology', 'nature', 'pets', 'celebration', 'reflection'
            ]
            
            # Initialize with sample data for demonstration
            self._initialize_with_sample_data()
            
            logger.info("Content classifier initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize content classifier: {str(e)}")
            raise

    def _initialize_with_sample_data(self):
        """Initialize classifiers with sample training data"""
        try:
            # Sample training data (in production, this would come from a database)
            sample_data = [
                ("I love spending time with my family", "family", "love", "high"),
                ("Work presentation went great today", "work", "career", "medium"),
                ("Beautiful sunset at the beach", "personal", "nature", "low"),
                ("Graduation day was amazing", "memories", "celebration", "high"),
                ("Learning to play guitar", "creative", "music", "medium"),
                ("Doctor appointment tomorrow", "health", "health", "medium"),
                ("Delicious dinner with friends", "relationships", "food", "low"),
                ("Traveling to Paris next month", "travel", "travel", "high"),
                ("Finished reading a great book", "education", "education", "low"),
                ("Playing soccer with the team", "personal", "sports", "medium")
            ]
            
            texts = [item[0] for item in sample_data]
            categories = [item[1] for item in sample_data]
            topics = [item[2] for item in sample_data]
            priorities = [item[3] for item in sample_data]
            
            # Vectorize texts
            X = self.vectorizer.fit_transform(texts)
            
            # Train category classifier
            self.category_classifier = MultinomialNB()
            self.category_classifier.fit(X, categories)
            
            # Train topic classifier
            self.topic_classifier = LogisticRegression(random_state=42)
            self.topic_classifier.fit(X, topics)
            
            # Train priority classifier
            self.priority_classifier = RandomForestClassifier(random_state=42)
            self.priority_classifier.fit(X, priorities)
            
            logger.info("Sample data training completed")
            
        except Exception as e:
            logger.error(f"Sample data training failed: {str(e)}")
            # Initialize with dummy classifiers
            self.category_classifier = MultinomialNB()
            self.topic_classifier = LogisticRegression(random_state=42)
            self.priority_classifier = RandomForestClassifier(random_state=42)

    def classify(self, text):
        """
        Classify content into categories, topics, and priority
        
        Args:
            text (str): Input text to classify
            
        Returns:
            dict: Classification results
        """
        try:
            if not text or len(text.strip()) == 0:
                return {
                    'category': 'other',
                    'topic': 'other',
                    'priority': 'low',
                    'confidence': 0.0,
                    'keywords': [],
                    'tags': []
                }
            
            # Preprocess text
            processed_text = self._preprocess_text(text)
            
            # Vectorize text
            text_vector = self.vectorizer.transform([processed_text])
            
            # Get predictions
            category = self.category_classifier.predict(text_vector)[0]
            topic = self.topic_classifier.predict(text_vector)[0]
            priority = self.priority_classifier.predict(text_vector)[0]
            
            # Get confidence scores
            category_proba = self.category_classifier.predict_proba(text_vector)[0]
            topic_proba = self.topic_classifier.predict_proba(text_vector)[0]
            priority_proba = self.priority_classifier.predict_proba(text_vector)[0]
            
            category_confidence = max(category_proba)
            topic_confidence = max(topic_proba)
            priority_confidence = max(priority_proba)
            
            # Extract keywords and tags
            keywords = self._extract_keywords(processed_text)
            tags = self._generate_tags(text, category, topic)
            
            return {
                'category': category,
                'topic': topic,
                'priority': priority,
                'confidence': {
                    'category': float(category_confidence),
                    'topic': float(topic_confidence),
                    'priority': float(priority_confidence)
                },
                'keywords': keywords,
                'tags': tags,
                'processed_text': processed_text
            }
            
        except Exception as e:
            logger.error(f"Content classification failed: {str(e)}")
            return {
                'category': 'other',
                'topic': 'other',
                'priority': 'low',
                'confidence': {'category': 0.0, 'topic': 0.0, 'priority': 0.0},
                'keywords': [],
                'tags': [],
                'error': str(e)
            }

    def _preprocess_text(self, text):
        """Preprocess text for classification"""
        try:
            # Convert to lowercase
            text = text.lower()
            
            # Remove special characters and numbers
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            
            # Tokenize
            tokens = word_tokenize(text)
            
            # Remove stopwords and lemmatize
            processed_tokens = [
                self.lemmatizer.lemmatize(token) 
                for token in tokens 
                if token not in self.stop_words and len(token) > 2
            ]
            
            return ' '.join(processed_tokens)
            
        except Exception as e:
            logger.error(f"Text preprocessing failed: {str(e)}")
            return text.lower()

    def _extract_keywords(self, text, top_k=10):
        """Extract top keywords from text"""
        try:
            # Tokenize and count word frequencies
            tokens = word_tokenize(text)
            word_freq = Counter(tokens)
            
            # Get top keywords
            top_keywords = [word for word, freq in word_freq.most_common(top_k)]
            
            return top_keywords
            
        except Exception as e:
            logger.error(f"Keyword extraction failed: {str(e)}")
            return []

    def _generate_tags(self, text, category, topic):
        """Generate relevant tags based on classification"""
        try:
            tags = [category, topic]
            
            # Add emotion-based tags
            emotion_keywords = ['happy', 'sad', 'excited', 'worried', 'grateful', 'proud']
            text_lower = text.lower()
            for emotion in emotion_keywords:
                if emotion in text_lower:
                    tags.append(f"emotion_{emotion}")
            
            # Add temporal tags
            time_keywords = ['today', 'yesterday', 'tomorrow', 'week', 'month', 'year']
            for time_word in time_keywords:
                if time_word in text_lower:
                    tags.append(f"time_{time_word}")
            
            # Add action tags
            action_keywords = ['going', 'doing', 'making', 'creating', 'learning', 'sharing']
            for action in action_keywords:
                if action in text_lower:
                    tags.append(f"action_{action}")
            
            return list(set(tags))  # Remove duplicates
            
        except Exception as e:
            logger.error(f"Tag generation failed: {str(e)}")
            return [category, topic]

    def classify_batch(self, texts):
        """
        Classify multiple texts
        
        Args:
            texts (list): List of texts to classify
            
        Returns:
            list: List of classification results
        """
        results = []
        for text in texts:
            result = self.classify(text)
            results.append(result)
        return results

    def get_classification_stats(self, classification_data):
        """
        Get statistics about classification results
        
        Args:
            classification_data (list): List of classification results
            
        Returns:
            dict: Classification statistics
        """
        try:
            if not classification_data:
                return {'stats': {}, 'summary': 'No data available'}
            
            # Extract categories, topics, and priorities
            categories = [item.get('category', 'other') for item in classification_data]
            topics = [item.get('topic', 'other') for item in classification_data]
            priorities = [item.get('priority', 'low') for item in classification_data]
            
            # Calculate distributions
            category_dist = Counter(categories)
            topic_dist = Counter(topics)
            priority_dist = Counter(priorities)
            
            # Calculate average confidence
            avg_confidence = np.mean([
                item.get('confidence', {}).get('category', 0) 
                for item in classification_data
            ])
            
            return {
                'stats': {
                    'category_distribution': dict(category_dist),
                    'topic_distribution': dict(topic_dist),
                    'priority_distribution': dict(priority_dist),
                    'average_confidence': float(avg_confidence),
                    'total_classifications': len(classification_data)
                },
                'summary': f"Most common category: {category_dist.most_common(1)[0][0]}, Average confidence: {avg_confidence:.2f}"
            }
            
        except Exception as e:
            logger.error(f"Classification stats failed: {str(e)}")
            return {'stats': {}, 'summary': 'Analysis failed', 'error': str(e)}
