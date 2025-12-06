import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import {
  Save,
  X,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Heart,
  Brain,
  Shield,
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Zap
} from 'lucide-react';

const CreateCapsule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Get capsule ID for edit mode
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    encryptionLevel: 'quantum',
    unlockDate: '',
    unlockTime: '',
    tags: [],
    attachments: [],
    category: 'personal',
    status: 'draft',
    visibility: 'private'
  });
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const aiDebounce = useRef(null);

  const encryptionLevels = [
    { value: 'basic', label: 'BASIC_ENCRYPTION', color: 'blue' },
    { value: 'neural', label: 'NEURAL_ENCRYPTION', color: 'cyan' },
    { value: 'quantum', label: 'QUANTUM_ENCRYPTION', color: 'green' },
    { value: 'quantum_plus', label: 'QUANTUM_PLUS', color: 'purple' }
  ];

  // Fetch capsule data when in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setLoading(true);
      const fetchCapsule = async () => {
        try {
          const { capsuleAPI } = await import('../services/api.jsx');
          const response = await capsuleAPI.getById(id);
          const capsule = response.data;
          
          // Parse unlock date and time
          let unlockDate = '';
          let unlockTime = '';
          if (capsule.unlockConditions?.unlockDate) {
            const date = new Date(capsule.unlockConditions.unlockDate);
            unlockDate = date.toISOString().split('T')[0];
            unlockTime = date.toTimeString().slice(0, 5);
          }
          
          setFormData({
            title: capsule.title || '',
            description: capsule.description || '',
            content: capsule.content || '',
            encryptionLevel: capsule.privacy?.encryptionLevel || 'quantum',
            unlockDate: unlockDate,
            unlockTime: unlockTime,
            tags: capsule.tags || [],
            attachments: [],
            category: capsule.category || 'personal',
            status: capsule.status || 'draft',
            visibility: capsule.privacy?.visibility || 'private'
          });
          
          toast.success('Capsule data loaded for editing');
        } catch (error) {
          console.error('Error fetching capsule:', error);
          toast.error('Failed to load capsule data');
          navigate('/capsules');
        } finally {
          setLoading(false);
        }
      };
      fetchCapsule();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent submission if not on step 3
    if (currentStep !== 3) {
      console.log('[DEBUG] Not on step 3, preventing submission');
      return;
    }
    
    // Prevent double submission
    if (isProcessing) {
      console.log('[DEBUG] Already processing, preventing duplicate submission');
      return;
    }
    
    setIsProcessing(true);
    
    // Validate required fields
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      setIsProcessing(false);
      return;
    }
    
    if (!formData.unlockDate || !formData.unlockTime) {
      toast.error('Unlock date and time are required');
      setIsProcessing(false);
      return;
    }
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('content', formData.content);
      data.append('encryptionLevel', formData.encryptionLevel);
      data.append('unlockDate', formData.unlockDate);
      data.append('unlockTime', formData.unlockTime);
      data.append('category', formData.category);
      data.append('status', formData.status);
      
      // Add privacy settings
      data.append('privacy', JSON.stringify({
        visibility: formData.visibility,
        encryptionLevel: formData.encryptionLevel
      }));
      
      formData.tags.forEach(tag => data.append('tags[]', tag));
      formData.attachments.forEach(file => data.append('attachments', file));
      if (encryptionKey) data.append('encryptionKey', encryptionKey);
      
      // Always send a default unlockConditions object
      const unlockConditions = {
        type: 'date',
        unlockDate: formData.unlockDate || new Date().toISOString().slice(0,10),
        isUnlocked: false
      };
      data.append('unlockConditions', JSON.stringify(unlockConditions));
      
      // Add AI analysis if available
      if (aiAnalysis) {
        data.append('aiAnalysis', JSON.stringify({
          topics: aiAnalysis.classification?.topics || [],
          keywords: aiAnalysis.classification?.keywords || []
        }));
      }
      
      // Call create or update API based on edit mode
      const { capsuleAPI } = await import('../services/api.jsx');
      if (isEditMode && id) {
        await capsuleAPI.update(id, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Capsule successfully updated');
      } else {
        await capsuleAPI.create(data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Capsule created and encrypted');
      }
      navigate('/capsules');
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || `Capsule ${isEditMode ? 'update' : 'creation'} failed`;
      toast.error(errorMsg);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} capsule:`, error.response?.data || error);
    } finally {
      setIsProcessing(false);
    }
  };


  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  // AI content analysis effect
  React.useEffect(() => {
    if (formData.content.trim().length < 10) {
      setAiAnalysis(null);
      setAiError(null);
      setAiLoading(false);
      return;
    }
    setAiLoading(true);
    setAiError(null);
    if (aiDebounce.current) clearTimeout(aiDebounce.current);
    aiDebounce.current = setTimeout(async () => {
      try {
        const { aiAPI } = await import('../services/api.jsx');
        const response = await aiAPI.analyze(formData.content);
        console.log('[AI Analysis Response]:', response.data);
        
        const analysis = response.data.analysis || response.data;
        
        // Format the analysis for display
        const formattedAnalysis = {
          summary: analysis.emotion?.dominant_emotion || analysis.classification?.category || 'Analyzed',
          sensitivity: analysis.emotion?.confidence ? `${(analysis.emotion.confidence * 100).toFixed(0)}% confidence` : 'Medium',
          tags: [
            ...(analysis.keywords || []),
            ...(analysis.topics || []),
            ...(analysis.classification?.topics || [])
          ].slice(0, 5) // Limit to 5 tags
        };
        
        setAiAnalysis(formattedAnalysis);
        setAiError(null);
      } catch (err) {
        console.error('[AI Analysis Error]:', err.response?.data || err.message);
        setAiAnalysis(null);
        setAiError(err.response?.data?.error || 'AI analysis service unavailable');
      } finally {
        setAiLoading(false);
      }
    }, 600); // debounce for 600ms
    // eslint-disable-next-line
  }, [formData.content]);

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const nextStep = () => {
    // Validate current step before moving to next
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }
      if (!formData.unlockDate) {
        toast.error('Unlock date is required');
        return;
      }
      if (!formData.unlockTime) {
        toast.error('Unlock time is required');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.content.trim()) {
        toast.error('Capsule content is required');
        return;
      }
    }
    
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Show loading state while fetching capsule data in edit mode
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center animate-float">
          <Brain className="w-16 h-16 text-primary-400 animate-pulse mx-auto mb-4" />
          <div className="text-white text-xl">Loading Capsule Data...</div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mr-3 shadow-glow-sm ring-1 ring-white/10">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SoulSafe.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-brand-400 text-sm hidden sm:block">{isEditMode ? 'Edit Capsule' : 'Create Capsule'}</div>
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading">
            {isEditMode ? 'Edit Memory Capsule' : 'Create Memory Capsule'}
          </h1>
          <p className="text-surface-400 text-sm">
            {isEditMode ? 'Update your encrypted memory capsule' : 'Preserve your precious memories for the future'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-xl2 border-2 flex items-center justify-center font-bold transition-all ${
                  currentStep >= step
                    ? 'border-brand-500 bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-glow-sm'
                    : 'border-surface-600 text-surface-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 ml-4 rounded-full transition-all ${
                    currentStep > step ? 'bg-gradient-to-r from-brand-600 to-brand-500' : 'bg-surface-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-surface-400 text-sm">
              Step {currentStep} of 3 - {currentStep === 1 ? 'Basic Information' : currentStep === 2 ? 'Content & Attachments' : 'Encryption Settings'}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="card-modern p-6 sm:p-8 relative z-10">
          <form
            // Prevent any implicit submissions on steps 1 and 2
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              // Prevent Enter from triggering default button/submit behavior (allow newlines in textarea)
              if (e.key === 'Enter' && e.target.type !== 'textarea' && e.target.type !== 'submit') {
                e.preventDefault();
              }
            }}
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="relative z-20">
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    Capsule Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-modern w-full relative z-20"
                    placeholder="My Memory Capsule"
                    required
                  />
                </div>

                <div className="relative z-20">
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="input-modern w-full relative z-20"
                    placeholder="Describe your memory capsule..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-modern w-full relative z-20"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="family">Family</option>
                      <option value="memories">Memories</option>
                      <option value="milestone">Milestone</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Visibility
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="input-modern w-full relative z-20"
                    >
                      <option value="private">Private</option>
                      <option value="shared">Shared</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Unlock Date
                    </label>
                    <input
                      type="date"
                      value={formData.unlockDate}
                      onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
                      className="input-modern w-full relative z-20"
                      required
                    />
                  </div>
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Unlock Time
                    </label>
                    <input
                      type="time"
                      value={formData.unlockTime}
                      onChange={(e) => setFormData({ ...formData, unlockTime: e.target.value })}
                      className="input-modern w-full relative z-20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content Data */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="relative z-20">
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="input-modern w-full relative z-20"
                    placeholder="Enter your memories, thoughts, or data to be preserved..."
                    required
                  />
                  {/* AI Content Analysis */}
                  <div className="mt-4">
                    <div className="glass-card">
                      <h4 className="text-brand-400 font-semibold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> AI Analysis
                      </h4>
                      {aiLoading ? (
                        <p className="text-surface-400 text-sm">Analyzing content...</p>
                      ) : aiError ? (
                        <p className="text-red-400 text-sm">{aiError}</p>
                      ) : aiAnalysis ? (
                        <div className="space-y-2">
                          {aiAnalysis.summary && (
                            <div>
                              <span className="text-surface-400 text-xs">Summary</span>
                              <p className="text-brand-400 text-sm">{aiAnalysis.summary}</p>
                            </div>
                          )}
                          {aiAnalysis.sensitivity && (
                            <div>
                              <span className="text-surface-400 text-xs">Sensitivity</span>
                              <p className="text-brand-400 text-sm">{aiAnalysis.sensitivity}</p>
                            </div>
                          )}
                          {aiAnalysis.tags && aiAnalysis.tags.length > 0 && (
                            <div>
                              <span className="text-surface-400 text-xs">Suggested Tags</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {aiAnalysis.tags.map((tag, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => addTag(tag)}
                                    className="pill hover:bg-brand-400/20 transition-colors"
                                    disabled={formData.tags.includes(tag)}
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-surface-500 text-sm">No analysis yet. Start typing to analyze.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-20">
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="pill flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    className="input-modern w-full relative z-20 mb-4"
                    placeholder="Add tags (press Enter)"
                  />
                  
                  <label className="block text-sm font-medium text-surface-200 mb-2">Attachments</label>
                  <input
                    type="file"
                    multiple
                    onChange={e => {
                      setFormData({
                        ...formData,
                        attachments: Array.from(e.target.files)
                      });
                    }}
                    className="block w-full text-sm text-surface-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl2 file:border-0 file:text-sm file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 relative z-20 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Encryption Configuration */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="relative z-20">
                  <label className="block text-sm font-medium text-surface-200 mb-4">
                    Encryption Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {encryptionLevels.map((level) => (
                      <div
                        key={level.value}
                        className={`p-4 border rounded-xl2 cursor-pointer transition-all relative z-20 ${
                          formData.encryptionLevel === level.value
                            ? 'border-brand-400 bg-brand-400/10'
                            : 'border-surface-600 hover:border-surface-500'
                        }`}
                        onClick={() => setFormData({ ...formData, encryptionLevel: level.value })}
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-6 h-6 text-brand-400" />
                          <div>
                            <h4 className="font-semibold text-white">
                              {level.label.replace(/_/g, ' ')}
                            </h4>
                            <p className="text-surface-400 text-xs">
                              {level.value === 'basic' && 'Standard encryption protocol'}
                              {level.value === 'neural' && 'AI-enhanced security layer'}
                              {level.value === 'quantum' && 'Quantum-resistant encryption'}
                              {level.value === 'quantum_plus' && 'Maximum security protocol'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-20">
                  <label className="block text-sm font-medium text-surface-200 mb-2">
                    Encryption Key <span className="text-surface-500 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={encryptionKey}
                      onChange={(e) => setEncryptionKey(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          return false;
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          return false;
                        }
                      }}
                      className="input-modern w-full pr-12 relative z-20"
                      placeholder="Enter encryption key (optional)"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-400 hover:text-brand-300 z-30"
                    >
                      {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-surface-500">
                    Leave empty to use auto-generated encryption key
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-surface-700 relative z-20">
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary relative z-20"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/capsules')}
                  className="btn-secondary text-red-400 border-red-400/30 hover:bg-red-400/10 relative z-20"
                >
                  Cancel
                </button>
              </div>
              
              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary flex items-center gap-2 relative z-20"
                  >
                    Next Step
                    <Zap className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative z-20"
                  >
                    {isProcessing ? (
                      <>
                        <Brain className="w-5 h-5 animate-pulse" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEditMode ? 'Update Capsule' : 'Create Capsule'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCapsule;