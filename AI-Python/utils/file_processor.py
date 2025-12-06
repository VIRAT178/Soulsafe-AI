import numpy as np
import logging
import os

# Import heavy libraries only when needed
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

logger = logging.getLogger(__name__)

class FileProcessor:
    def __init__(self):
        """Initialize file processing components"""
        try:
            logger.info("File processor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize file processor: {str(e)}")
            raise

    def analyze_visual_content(self, file_path):
        """
        Analyze visual content (images/videos) for emotion and context
        
        Args:
            file_path (str): Path to the visual file
            
        Returns:
            dict: Analysis results
        """
        try:
            if not os.path.exists(file_path):
                return {'error': 'File not found'}
            
            # Determine file type
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                return self._analyze_image(file_path)
            elif file_ext in ['.mp4', '.avi', '.mov', '.mkv']:
                return self._analyze_video(file_path)
            else:
                return {'error': 'Unsupported visual file format'}
                
        except Exception as e:
            logger.error(f"Visual content analysis failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_image(self, image_path):
        """Analyze image content"""
        try:
            if not CV2_AVAILABLE:
                return {'error': 'OpenCV not available'}
            
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return {'error': 'Could not load image'}
            
            # Convert to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Basic image analysis
            height, width, channels = image_rgb.shape
            total_pixels = height * width
            
            # Color analysis
            mean_color = np.mean(image_rgb, axis=(0, 1))
            dominant_color = self._get_dominant_color(image_rgb)
            
            # Brightness analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            
            # Contrast analysis
            contrast = np.std(gray)
            
            # Edge detection for complexity
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / total_pixels
            
            return {
                'type': 'image',
                'dimensions': {
                    'width': int(width),
                    'height': int(height),
                    'channels': int(channels)
                },
                'colors': {
                    'mean_rgb': mean_color.tolist(),
                    'dominant_color': dominant_color,
                    'brightness': float(brightness),
                    'contrast': float(contrast)
                },
                'complexity': {
                    'edge_density': float(edge_density),
                    'total_pixels': int(total_pixels)
                },
                'metadata': {
                    'file_size': os.path.getsize(image_path),
                    'format': os.path.splitext(image_path)[1]
                }
            }
            
        except Exception as e:
            logger.error(f"Image analysis failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_video(self, video_path):
        """Analyze video content"""
        try:
            if not CV2_AVAILABLE:
                return {'error': 'OpenCV not available'}
            
            # Open video
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {'error': 'Could not open video'}
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = frame_count / fps if fps > 0 else 0
            
            # Sample frames for analysis
            sample_frames = []
            frame_indices = np.linspace(0, frame_count-1, min(10, frame_count), dtype=int)
            
            for frame_idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if ret:
                    sample_frames.append(frame)
            
            cap.release()
            
            if not sample_frames:
                return {'error': 'Could not read video frames'}
            
            # Analyze sample frames
            frame_analysis = []
            for frame in sample_frames:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                brightness = np.mean(gray)
                contrast = np.std(gray)
                frame_analysis.append({
                    'brightness': float(brightness),
                    'contrast': float(contrast)
                })
            
            avg_brightness = np.mean([f['brightness'] for f in frame_analysis])
            avg_contrast = np.mean([f['contrast'] for f in frame_analysis])
            
            return {
                'type': 'video',
                'properties': {
                    'width': int(width),
                    'height': int(height),
                    'fps': float(fps),
                    'duration': float(duration),
                    'frame_count': int(frame_count)
                },
                'visual_analysis': {
                    'avg_brightness': float(avg_brightness),
                    'avg_contrast': float(avg_contrast),
                    'sample_frames': len(sample_frames)
                },
                'metadata': {
                    'file_size': os.path.getsize(video_path),
                    'format': os.path.splitext(video_path)[1]
                }
            }
            
        except Exception as e:
            logger.error(f"Video analysis failed: {str(e)}")
            return {'error': str(e)}

    def analyze_audio_content(self, file_path):
        """
        Analyze audio content for emotion and characteristics
        
        Args:
            file_path (str): Path to the audio file
            
        Returns:
            dict: Analysis results
        """
        try:
            if not os.path.exists(file_path):
                return {'error': 'File not found'}
            
            # Load audio file
            y, sr = librosa.load(file_path)
            
            # Basic audio properties
            duration = len(y) / sr
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            
            # Tempo and rhythm
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            
            # Energy analysis
            energy = librosa.feature.rms(y=y)[0]
            avg_energy = np.mean(energy)
            
            # Pitch analysis
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)
            
            avg_pitch = np.mean(pitch_values) if pitch_values else 0
            
            return {
                'type': 'audio',
                'properties': {
                    'duration': float(duration),
                    'sample_rate': int(sr),
                    'channels': 1,  # librosa loads as mono
                    'tempo': float(tempo)
                },
                'spectral_features': {
                    'avg_spectral_centroid': float(np.mean(spectral_centroids)),
                    'avg_spectral_rolloff': float(np.mean(spectral_rolloff)),
                    'avg_zero_crossing_rate': float(np.mean(zero_crossing_rate))
                },
                'energy_analysis': {
                    'avg_energy': float(avg_energy),
                    'energy_variance': float(np.var(energy))
                },
                'pitch_analysis': {
                    'avg_pitch': float(avg_pitch),
                    'pitch_range': float(np.max(pitch_values) - np.min(pitch_values)) if pitch_values else 0
                },
                'mfcc_features': {
                    'mfcc_mean': np.mean(mfccs, axis=1).tolist(),
                    'mfcc_std': np.std(mfccs, axis=1).tolist()
                },
                'metadata': {
                    'file_size': os.path.getsize(file_path),
                    'format': os.path.splitext(file_path)[1]
                }
            }
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
            return {'error': str(e)}

    def _get_dominant_color(self, image):
        """Get dominant color from image"""
        try:
            # Reshape image to be a list of pixels
            pixels = image.reshape(-1, 3)
            
            # Use K-means to find dominant colors
            from sklearn.cluster import KMeans
            
            kmeans = KMeans(n_clusters=1, random_state=42)
            kmeans.fit(pixels)
            
            dominant_color = kmeans.cluster_centers_[0]
            return [int(c) for c in dominant_color]
            
        except Exception as e:
            logger.error(f"Dominant color extraction failed: {str(e)}")
            return [128, 128, 128]  # Default gray color

    def get_file_info(self, file_path):
        """
        Get basic file information
        
        Args:
            file_path (str): Path to the file
            
        Returns:
            dict: File information
        """
        try:
            if not os.path.exists(file_path):
                return {'error': 'File not found'}
            
            stat = os.stat(file_path)
            
            return {
                'filename': os.path.basename(file_path),
                'file_size': stat.st_size,
                'created_time': stat.st_ctime,
                'modified_time': stat.st_mtime,
                'extension': os.path.splitext(file_path)[1]
            }
            
        except Exception as e:
            logger.error(f"File info extraction failed: {str(e)}")
            return {'error': str(e)}
