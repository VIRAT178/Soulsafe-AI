from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import AI modules - Production mode, all modules required
try:
    from emotion_detection.fallback_emotion import EmotionAnalyzer  # Use fallback for stability
    from content_analysis.content_classifier import ContentClassifier
    from recommendations.recommendation_engine import RecommendationEngine
    from utils.text_processor import TextProcessor
    from utils.file_processor import FileProcessor
    logger.info('✓ All AI modules loaded successfully - Production Mode Active')
except ImportError as e:
    logger.error(f'✗ CRITICAL: Failed to load required AI modules in production: {e}')
    logger.error('Ensure all required packages are installed: pip install -r requirements.txt')
    raise

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize AI components
emotion_analyzer = EmotionAnalyzer()
content_classifier = ContentClassifier()
recommendation_engine = RecommendationEngine()
text_processor = TextProcessor()
file_processor = FileProcessor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/analyze/emotion', methods=['POST'])
def analyze_emotion():
    """Analyze emotion from text content"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Process text
        processed_text = text_processor.preprocess(text)
        
        # Analyze emotion
        emotion_result = emotion_analyzer.analyze(processed_text)
        
        return jsonify({
            'success': True,
            'emotion': emotion_result,
            'processed_text': processed_text
        })
        
    except Exception as e:
        logger.error(f"Emotion analysis error: {str(e)}")
        return jsonify({'error': 'Emotion analysis failed'}), 500

@app.route('/analyze/content', methods=['POST'])
def analyze_content():
    """Analyze and classify content"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        content_type = data.get('type', 'text')
        
        if not content:
            return jsonify({'error': 'No content provided'}), 400
        
        result = {
            'content_type': content_type,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if content_type == 'text':
            # Text analysis
            processed_text = text_processor.preprocess(content)
            
            # Emotion analysis
            emotion_result = emotion_analyzer.analyze(processed_text)
            
            # Content classification
            classification_result = content_classifier.classify(processed_text)
            
            # Sentiment analysis
            sentiment_result = text_processor.analyze_sentiment(processed_text)
            
            result.update({
                'emotion': emotion_result,
                'classification': classification_result,
                'sentiment': sentiment_result,
                'keywords': text_processor.extract_keywords(processed_text),
                'topics': text_processor.extract_topics(processed_text)
            })
            
        elif content_type in ['image', 'video']:
            # Visual content analysis
            visual_result = file_processor.analyze_visual_content(content)
            result.update(visual_result)
            
        elif content_type == 'audio':
            # Audio content analysis
            audio_result = file_processor.analyze_audio_content(content)
            result.update(audio_result)
        
        return jsonify({
            'success': True,
            'analysis': result
        })
        
    except Exception as e:
        logger.error(f"Content analysis error: {str(e)}")
        return jsonify({'error': 'Content analysis failed'}), 500

@app.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """Get personalized recommendations for user"""
    try:
        # Get user preferences and history
        preferences = request.args.get('preferences', '{}')
        
        # Generate recommendations
        recommendations = recommendation_engine.generate_recommendations(
            user_id, 
            preferences
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
        
    except Exception as e:
        logger.error(f"Recommendations error: {str(e)}")
        return jsonify({'error': 'Failed to generate recommendations'}), 500

@app.route('/insights/<capsule_id>', methods=['POST'])
def generate_insights(capsule_id):
    """Generate AI insights for a specific capsule"""
    try:
        data = request.get_json()
        capsule_data = data.get('capsule', {})
        
        insights = {
            'capsule_id': capsule_id,
            'timestamp': datetime.utcnow().isoformat(),
            'insights': []
        }
        
        # Analyze capsule content
        if 'content' in capsule_data:
            content_analysis = analyze_content_internal(capsule_data['content'])
            insights['content_analysis'] = content_analysis
        
        # Generate unlocking recommendations
        if 'unlock_conditions' in capsule_data:
            unlock_recommendations = recommendation_engine.suggest_unlock_timing(
                capsule_data['unlock_conditions'],
                content_analysis
            )
            insights['unlock_recommendations'] = unlock_recommendations
        
        # Generate sharing suggestions
        sharing_suggestions = recommendation_engine.suggest_sharing(
            capsule_data,
            content_analysis
        )
        insights['sharing_suggestions'] = sharing_suggestions
        
        return jsonify({
            'success': True,
            'insights': insights
        })
        
    except Exception as e:
        logger.error(f"Insights generation error: {str(e)}")
        return jsonify({'error': 'Failed to generate insights'}), 500

@app.route('/batch/analyze', methods=['POST'])
def batch_analyze():
    """Batch analyze multiple content items"""
    try:
        data = request.get_json()
        items = data.get('items', [])
        
        if not items:
            return jsonify({'error': 'No items provided'}), 400
        
        results = []
        for item in items:
            try:
                analysis = analyze_content_internal(item)
                results.append({
                    'id': item.get('id'),
                    'success': True,
                    'analysis': analysis
                })
            except Exception as e:
                results.append({
                    'id': item.get('id'),
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        return jsonify({'error': 'Batch analysis failed'}), 500

def analyze_content_internal(content):
    """Internal function to analyze content"""
    content_type = content.get('type', 'text')
    content_data = content.get('data', '')
    
    if content_type == 'text':
        processed_text = text_processor.preprocess(content_data)
        
        return {
            'emotion': emotion_analyzer.analyze(processed_text),
            'classification': content_classifier.classify(processed_text),
            'sentiment': text_processor.analyze_sentiment(processed_text),
            'keywords': text_processor.extract_keywords(processed_text),
            'topics': text_processor.extract_topics(processed_text)
        }
    
    elif content_type in ['image', 'video']:
        return file_processor.analyze_visual_content(content_data)
    
    elif content_type == 'audio':
        return file_processor.analyze_audio_content(content_data)
    
    return {'error': 'Unsupported content type'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'

    logger.info(f"Starting SoulSafe AI API on port {port}")
    # Use localhost for Windows compatibility
    app.run(host='127.0.0.1', port=port, debug=debug, use_reloader=False, threaded=True)
