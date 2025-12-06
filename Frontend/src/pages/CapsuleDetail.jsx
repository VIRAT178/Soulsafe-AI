 import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { capsuleAPI } from '../services/api';
import { decryptText } from '../utils/crypto';
import { aiAPI } from '../services/api';
import {
  Heart,
  Lock,
  Unlock,
  Brain,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Upload,
  Download,
  X,
  Zap,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Trash2,
  Edit,
  ArrowLeft
} from 'lucide-react';

const CapsuleDetail = () => {
  const navigate = useNavigate();
  const [mediaFiles, setMediaFiles] = React.useState([]);
  const [mediaUploading, setMediaUploading] = React.useState(false);
  const [mediaError, setMediaError] = React.useState('');

  const handleMediaUpload = async () => {
    if (!mediaFiles.length) return;
    setMediaUploading(true);
    setMediaError('');
    try {
      const formData = new FormData();
      mediaFiles.forEach(file => formData.append('attachments', file));
      await capsuleAPI.updateMedia(id, formData);
      setMediaFiles([]);
      // Refetch capsule to show new media
      const { data } = await capsuleAPI.getById(id);
      setCapsule(data);
      setMediaError('');
    } catch (err) {
      setMediaError('Failed to upload media');
    } finally {
      setMediaUploading(false);
    }
  };
  const { id } = useParams();
  const [capsule, setCapsule] = React.useState(null);
  const [passphrase, setPassphrase] = React.useState('');
  const [decrypted, setDecrypted] = React.useState('');
  const [decryptedContent, setDecryptedContent] = React.useState(null);
  const [analysis, setAnalysis] = React.useState(null);
  const [emotions, setEmotions] = React.useState(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [contentLoading, setContentLoading] = React.useState(false);
  const [contentError, setContentError] = React.useState('');

  React.useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const { data } = await capsuleAPI.getById(id);
        const capsuleData = data.capsule || data;
        setCapsule(capsuleData);
        
        // If capsule is unlocked, fetch decrypted content
        if (capsuleData.unlockConditions?.isUnlocked) {
          try {
            setContentLoading(true);
            setContentError('');
            const contentRes = await api.get(`/capsules/${id}/content`);
              // Debug: log raw response to help diagnose missing content issues
              console.debug('[CapsuleDetail] /capsules/:id/content response:', contentRes?.data);
            setDecryptedContent(contentRes.data.content);
          } catch (err) {
            console.error('Failed to fetch decrypted content:', err);
            setContentError('Failed to load decrypted content');
          } finally {
            setContentLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching capsule:', error);
      }
    };

    fetchCapsule();
  }, [id]);

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-brand-400" />;
    if (mimeType?.startsWith('video/')) return <Video className="w-5 h-5 text-brand-400" />;
    if (mimeType?.startsWith('audio/')) return <Music className="w-5 h-5 text-brand-400" />;
    return <File className="w-5 h-5 text-surface-400" />;
  };

  const contentToDisplay = React.useMemo(() => {
    // Prefer decrypted content fetched from /content
    if (decryptedContent) {
      if (typeof decryptedContent === 'string') return decryptedContent;
      if (typeof decryptedContent === 'object' && decryptedContent.text) return decryptedContent.text;
      // If it's an object with other fields, stringify a readable preview
      try {
        return JSON.stringify(decryptedContent, null, 2);
      } catch (e) {
        return String(decryptedContent);
      }
    }

    // Fall back to in-place decrypted string from manual decrypt action
    if (decrypted) return decrypted;

    // Fall back to capsule.content which may be a string or an object
    if (capsule?.content) {
      if (typeof capsule.content === 'string') return capsule.content;
      if (typeof capsule.content === 'object' && capsule.content.text) return capsule.content.text;
      try {
        return JSON.stringify(capsule.content, null, 2);
      } catch (e) {
        return String(capsule.content);
      }
    }

    return 'No content available';
  }, [decryptedContent, decrypted, capsule?.content]);

  if (!capsule) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center animate-float">
          <Brain className="w-16 h-16 text-brand-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-xl">Loading capsule...</p>
        </div>
      </div>
    );
  }

  const handleDecrypt = async () => {
    try {
      // The stored content may be an object { text, files, ... } or a plain string.
      // Ensure we pass the actual encrypted string (or base64 payload) to decryptText.
      const payload = capsule.content && typeof capsule.content === 'object'
        ? (capsule.content.text || '')
        : capsule.content || '';

      const text = await decryptText(payload, passphrase);
      setDecrypted(text);
    } catch (e) {
      setDecrypted('Decryption failed. Check your passphrase.');
    }
  };

  const runAnalysis = async () => {
    try {
      setAiLoading(true);
      // Use decryptedContent if available, otherwise fall back to other sources
      const content = decryptedContent?.text || decrypted || capsule.content?.text || capsule.content;
      if (!content) {
        alert('No content available for analysis');
        return;
      }
      const [{ data: analyzeRes }, { data: emotionRes }] = await Promise.all([
        aiAPI.analyze(content),
        aiAPI.getEmotions(content),
      ]);
      
      // Map the API response to expected frontend structure
      const mappedAnalysis = {
        summary: `${analyzeRes.analysis?.classification?.category || 'General'} content with ${analyzeRes.analysis?.emotion?.primary_emotion || 'neutral'} emotion detected.`,
        tags: analyzeRes.analysis?.classification?.tags || analyzeRes.analysis?.keywords || [],
        sensitivity: analyzeRes.analysis?.classification?.priority || 'medium',
        ...analyzeRes.analysis
      };
      
      setAnalysis(mappedAnalysis);
      setEmotions(emotionRes.emotions);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze content');
    } finally {
      setAiLoading(false);
    }
  };

  const unlockDate = capsule.unlockConditions?.unlockDate 
    ? new Date(capsule.unlockConditions.unlockDate).toLocaleString()
    : 'Not set';
  const isLocked = !capsule.unlockConditions?.isUnlocked;
  const encryptionLevel = capsule.privacy?.encryptionLevel?.toUpperCase() || 'QUANTUM';

  // Choose the most appropriate content to display. Backend may return content as a
  // plain string or as an object { text, files, ... } so handle both shapes.

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-brand-600/30 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-tl from-brand-500/25 to-brand-700/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/40 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/capsules')}
                className="p-2 text-surface-400 hover:text-brand-400 transition-colors duration-300 rounded-xl2 hover:bg-surface-800/60"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SoulSafe.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-surface-400 text-sm">Capsule View</div>
              <button
                onClick={() => navigate('/capsules')}
                className="p-2 text-surface-400 hover:text-brand-400 transition-colors duration-300 rounded-xl2 hover:bg-surface-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {isLocked ? (
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                <Lock className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                <Unlock className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="section-heading">
                {capsule.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="pill">{capsule.status?.toUpperCase() || 'ACTIVE'}</span>
                <span className="text-surface-500 text-sm">ID: #{capsule._id?.slice(-6)}</span>
              </div>
            </div>
          </div>
          {capsule.description && (
            <p className="text-surface-300 text-base glass-card p-4">
              {capsule.description}
            </p>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-modern">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5">
                <Shield className="w-5 h-5 text-brand-300" />
              </div>
              <h3 className="text-surface-300 text-sm font-medium">Encryption</h3>
            </div>
            <p className="text-white text-xl font-semibold">{encryptionLevel}</p>
          </div>

          <div className="card-modern">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5">
                <Calendar className="w-5 h-5 text-brand-300" />
              </div>
              <h3 className="text-surface-300 text-sm font-medium">Unlock Date</h3>
            </div>
            <p className="text-white text-sm">{unlockDate}</p>
          </div>

          <div className="card-modern">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5">
                <FileText className="w-5 h-5 text-brand-300" />
              </div>
              <h3 className="text-surface-300 text-sm font-medium">Attachments</h3>
            </div>
            <p className="text-white text-xl font-semibold">{capsule.content?.files?.length || 0}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="card-modern mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Content</h2>
          
          {isLocked ? (
            <div className="glass-card p-8 text-center border-red-500/30">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-xl2 flex items-center justify-center mx-auto mb-4 shadow-glow-sm ring-1 ring-white/10">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <p className="text-red-400 text-lg font-bold mb-2">Content Locked</p>
              <p className="text-surface-400 text-sm">
                This capsule will unlock on: {unlockDate}
              </p>
            </div>
          ) : (
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                  <Unlock className="w-4 h-4 text-white" />
                </div>
                <span className="text-brand-400 text-sm font-semibold">Content Unlocked</span>
              </div>
              {contentLoading ? (
                <div className="text-surface-400 text-sm">Decrypting content...</div>
              ) : contentError ? (
                <div className="text-red-400 text-sm">{contentError}</div>
              ) : (
                <div className="text-surface-200 text-sm whitespace-pre-wrap break-words overflow-x-auto max-w-full bg-surface-900/60 p-4 rounded-xl2 border border-surface-700/40">
                  {contentToDisplay}
                </div>
              )}
            </div>
          )}
          
          {capsule.encrypted && !decrypted && isLocked && (
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  value={passphrase}
                  onChange={e => setPassphrase(e.target.value)}
                  placeholder="Enter decryption key..."
                  className="input-modern flex-1"
                />
                <button
                  onClick={handleDecrypt}
                  className="btn-primary px-6 py-3 whitespace-nowrap"
                >
                  <Lock className="w-4 h-4" />
                  Decrypt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Media Attachments */}
        <div className="card-modern mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-400" />
            Attachments
          </h2>
          
          {/* Upload Section */}
          <div className="mb-6">
            <input
              type="file"
              multiple
              onChange={e => setMediaFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-surface-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl2 file:border-0 file:text-sm file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500"
            />
            <button
              onClick={handleMediaUpload}
              disabled={mediaUploading || !mediaFiles.length}
              className="btn-primary mt-3 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {mediaUploading ? 'Uploading...' : 'Upload Media'}
            </button>
            {mediaError && (
              <div className="mt-2 text-red-400 text-sm">{mediaError}</div>
            )}
          </div>

          {/* Existing Files */}
          {capsule.content?.files?.length > 0 ? (
            <div className="space-y-3">
              {capsule.content.files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 glass-card hover:border-brand-500/40 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5 flex-shrink-0">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{file.originalName}</p>
                      <p className="text-surface-500 text-xs">
                        {file.mimeType} • {Math.round(file.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.path?.startsWith('http') ? file.path : `${api.defaults.baseURL.replace(/\/api$/, '')}${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">No attachments found</p>
            </div>
          )}
        </div>

        {/* AI Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
          {/* Content Analysis */}
          <div className="card-modern relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">AI Analysis</h2>
              <button
                onClick={runAnalysis}
                disabled={aiLoading}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
              >
                {aiLoading ? (
                  <>
                    <Brain className="w-4 h-4 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Run Scan
                  </>
                )}
              </button>
            </div>
            
            {analysis ? (
              <div className="space-y-4">
                <div>
                  <p className="text-surface-400 text-xs font-semibold mb-2">Summary</p>
                  <p className="text-white text-sm leading-relaxed break-words">{analysis.summary}</p>
                </div>
                <div>
                  <p className="text-surface-400 text-xs font-semibold mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="pill break-all text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-surface-400 text-xs font-semibold mb-2">Sensitivity</p>
                  <p className="text-brand-400 text-sm font-medium break-words">{analysis.sensitivity || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                <p className="text-surface-500 text-sm">No analysis run yet</p>
              </div>
            )}
          </div>

          {/* Emotions Detected */}
          <div className="card-modern relative z-10">
            <h2 className="text-lg font-bold text-white mb-6">Emotion Scan</h2>
            
            {emotions ? (
              <div className="space-y-3">
                {Object.entries(emotions.scores || {}).map(([emotion, score]) => (
                  <div key={emotion}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-surface-300 text-xs font-medium capitalize">{emotion}</span>
                      <span className="text-brand-400 text-xs font-bold">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-800 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-brand-600 to-brand-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                <p className="text-surface-500 text-sm">No emotion data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 relative z-10">
          <button
            onClick={() => navigate(`/capsules/edit/${id}`)}
            className="btn-primary flex items-center gap-2 relative z-20"
          >
            <Edit className="w-5 h-5" />
            Edit Capsule
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this capsule?')) {
                capsuleAPI.delete(id).then(() => navigate('/capsules'));
              }
            }}
            className="btn-secondary text-red-400 border-red-400/30 hover:bg-red-400/10 flex items-center gap-2 relative z-20"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapsuleDetail;