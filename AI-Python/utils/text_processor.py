import re
from collections import Counter
import logging

logger = logging.getLogger(__name__)

# Fallback stopwords if NLTK is not available
FALLBACK_STOPWORDS = set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'])

class TextProcessor:
    def __init__(self):
        """Initialize text processing components"""
        try:
            # Try to use NLTK if available
            try:
                import nltk
                nltk.data.find('tokenizers/punkt')
                nltk.data.find('corpora/stopwords')
                self.stop_words = set(nltk.corpus.stopwords.words('english'))
                self.use_nltk = True
            except (ImportError, LookupError):
                logger.warning("NLTK not available, using fallback stopwords")
                self.stop_words = FALLBACK_STOPWORDS
                self.use_nltk = False
                
            # Try to import TextBlob
            try:
                from textblob import TextBlob
                self.TextBlob = TextBlob
                self.use_textblob = True
            except ImportError:
                logger.warning("TextBlob not available, using basic sentiment")
                self.TextBlob = None
                self.use_textblob = False
            
            logger.info("Text processor initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize text processor: {str(e)}")
            # Don't raise, continue with fallback mode
            self.stop_words = FALLBACK_STOPWORDS
            self.use_nltk = False
            self.use_textblob = False

    def preprocess(self, text):
        """
        Preprocess text for analysis
        
        Args:
            text (str): Input text to preprocess
            
        Returns:
            str: Preprocessed text
        """
        try:
            if not text:
                return ""
            
            # Convert to lowercase
            text = text.lower()
            
            # Remove special characters and numbers
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            return text
            
        except Exception as e:
            logger.error(f"Text preprocessing failed: {str(e)}")
            return text

    def analyze_sentiment(self, text):
        """
        Analyze sentiment of text using TextBlob or fallback
        
        Args:
            text (str): Input text to analyze
            
        Returns:
            dict: Sentiment analysis results
        """
        try:
            if not text:
                return {
                    'polarity': 0.0,
                    'subjectivity': 0.0,
                    'sentiment': 'neutral'
                }
            
            if self.use_textblob and self.TextBlob:
                blob = self.TextBlob(text)
                polarity = blob.sentiment.polarity
                subjectivity = blob.sentiment.subjectivity
            else:
                # Simple fallback sentiment analysis
                positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'love', 'best', 'perfect', 'fantastic']
                negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'sad', 'angry', 'disappointed', 'poor']
                
                text_lower = text.lower()
                pos_count = sum(1 for word in positive_words if word in text_lower)
                neg_count = sum(1 for word in negative_words if word in text_lower)
                
                total = pos_count + neg_count
                if total > 0:
                    polarity = (pos_count - neg_count) / total
                else:
                    polarity = 0.0
                subjectivity = min(total / 10.0, 1.0)  # Rough estimate
            
            # Determine sentiment category
            if polarity > 0.1:
                sentiment = 'positive'
            elif polarity < -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                'polarity': float(polarity),
                'subjectivity': float(subjectivity),
                'sentiment': sentiment
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {str(e)}")
            return {
                'polarity': 0.0,
                'subjectivity': 0.0,
                'sentiment': 'neutral'
            }

    def extract_keywords(self, text, top_k=10):
        """
        Extract keywords from text
        
        Args:
            text (str): Input text
            top_k (int): Number of top keywords to return
            
        Returns:
            list: List of keywords
        """
        try:
            if not text:
                return []
            
            # Simple tokenization fallback
            text_lower = text.lower()
            words = re.findall(r'\b[a-z]+\b', text_lower)
            words = [word for word in words if word.isalpha() and word not in self.stop_words and len(word) > 2]
            
            # Count word frequencies
            word_freq = Counter(words)
            
            # Get top keywords
            keywords = [word for word, freq in word_freq.most_common(top_k)]
            
            return keywords
            
        except Exception as e:
            logger.error(f"Keyword extraction failed: {str(e)}")
            return []

    def extract_topics(self, text):
        """
        Extract topics from text using simple keyword matching
        
        Args:
            text (str): Input text
            
        Returns:
            list: List of topics
        """
        try:
            if not text:
                return []
            
            # Define topic keywords
            topic_keywords = {
                'family': ['family', 'mother', 'father', 'parent', 'child', 'sister', 'brother', 'grandmother', 'grandfather'],
                'work': ['work', 'job', 'career', 'office', 'meeting', 'project', 'boss', 'colleague', 'business'],
                'travel': ['travel', 'trip', 'vacation', 'holiday', 'journey', 'flight', 'hotel', 'destination'],
                'education': ['school', 'university', 'college', 'study', 'learn', 'teacher', 'student', 'exam', 'course'],
                'health': ['health', 'doctor', 'hospital', 'medicine', 'exercise', 'fitness', 'wellness', 'medical'],
                'food': ['food', 'eat', 'restaurant', 'cooking', 'recipe', 'meal', 'dinner', 'lunch', 'breakfast'],
                'music': ['music', 'song', 'concert', 'band', 'artist', 'album', 'guitar', 'piano', 'singing'],
                'sports': ['sport', 'game', 'football', 'basketball', 'tennis', 'running', 'swimming', 'team'],
                'nature': ['nature', 'outdoor', 'park', 'forest', 'mountain', 'beach', 'garden', 'tree', 'flower'],
                'technology': ['technology', 'computer', 'phone', 'internet', 'software', 'app', 'digital', 'tech']
            }
            
            text_lower = text.lower()
            detected_topics = []
            
            for topic, keywords in topic_keywords.items():
                if any(keyword in text_lower for keyword in keywords):
                    detected_topics.append(topic)
            
            return detected_topics
            
        except Exception as e:
            logger.error(f"Topic extraction failed: {str(e)}")
            return []

    def clean_text(self, text):
        """
        Clean text by removing unwanted characters and formatting
        
        Args:
            text (str): Input text
            
        Returns:
            str: Cleaned text
        """
        try:
            if not text:
                return ""
            
            # Remove HTML tags
            text = re.sub(r'<[^>]+>', '', text)
            
            # Remove URLs
            text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
            
            # Remove email addresses
            text = re.sub(r'\S+@\S+', '', text)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            return text
            
        except Exception as e:
            logger.error(f"Text cleaning failed: {str(e)}")
            return text

    def get_word_count(self, text):
        """
        Get word count of text
        
        Args:
            text (str): Input text
            
        Returns:
            int: Word count
        """
        try:
            if not text:
                return 0
            
            # Simple word counting
            words = re.findall(r'\b[a-z]+\b', text.lower())
            return len([word for word in words if word.isalpha()])
            
        except Exception as e:
            logger.error(f"Word count failed: {str(e)}")
            return 0

    def get_reading_time(self, text, words_per_minute=200):
        """
        Calculate estimated reading time
        
        Args:
            text (str): Input text
            words_per_minute (int): Average reading speed
            
        Returns:
            float: Reading time in minutes
        """
        try:
            word_count = self.get_word_count(text)
            return word_count / words_per_minute
            
        except Exception as e:
            logger.error(f"Reading time calculation failed: {str(e)}")
            return 0.0
