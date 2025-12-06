import React, { useState, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  ArrowLeft, 
  Heart,
  Sparkles,
  Brain,
  Loader,
  Shield,
  Zap,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: ''
  });

  // Password strength evaluation (0-5)
  const passwordScore = useMemo(() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    // cap to 5 for display (combine length tiers)
    return Math.min(score, 5);
  }, [formData.password]);

  const passwordLabel = useMemo(() => {
    switch (passwordScore) {
      case 0: return 'Enter a password';
      case 1: return 'Too weak';
      case 2: return 'Weak';
      case 3: return 'Medium';
      case 4: return 'Strong';
      case 5: return 'Very strong';
      default: return '';
    }
  }, [passwordScore]);

  const passwordSuggestions = useMemo(() => {
    const suggestions = [];
    const p = formData.password;
    if (!/[A-Z]/.test(p)) suggestions.push('Add an uppercase letter');
    if (!/[a-z]/.test(p)) suggestions.push('Add a lowercase letter');
    if (!/\d/.test(p)) suggestions.push('Add a number');
    if (!/[^A-Za-z0-9]/.test(p)) suggestions.push('Add a special character');
    if (p.length < 12) suggestions.push('Use 12+ characters');
    return suggestions.slice(0,3);
  }, [formData.password]);

  const strengthGradient = useMemo(() => {
    switch (passwordScore) {
      case 0: return 'from-red-500 to-red-700';
      case 1: return 'from-red-500 to-orange-600';
      case 2: return 'from-orange-500 to-yellow-500';
      case 3: return 'from-yellow-500 to-green-500';
      case 4: return 'from-green-500 to-emerald-500';
      case 5: return 'from-emerald-500 to-indigo-500';
      default: return 'from-gray-600 to-gray-700';
    }
  }, [passwordScore]);

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Account Setup', icon: Mail },
    { number: 3, title: 'Security', icon: Shield }
  ];

  const nextStep = () => {
    if (currentStep === 1 && (!formData.firstName || !formData.lastName)) {
      toast.error('Please fill in your name');
      return;
    }
    if (currentStep === 2 && (!formData.username || !formData.email)) {
      toast.error('Please fill in username and email');
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast.success('Welcome to SoulSafe AI! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-brand-600/20 to-brand-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-purple-600/20 to-brand-700/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      </div>

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
          {/* Heading / Brand Accent */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-glow animate-pulse-slow">
              <Heart className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text mb-2">Join SoulSafe AI</h1>
            <p className="text-sm sm:text-base text-surface-400">Create your account in 3 simple steps</p>
          </div>

          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      currentStep > step.number 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50' 
                        : currentStep === step.number 
                          ? 'bg-gradient-to-br from-brand-600 to-brand-500 shadow-lg shadow-brand-500/50 scale-110' 
                          : 'bg-surface-700 border-2 border-surface-600'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <step.icon className="w-6 h-6 text-white" />
                      )}
                      {currentStep === step.number && (
                        <span className="absolute -inset-1 rounded-full bg-brand-500/30 animate-ping"></span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium transition-colors hidden sm:block ${
                      currentStep >= step.number ? 'text-brand-400' : 'text-surface-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 mb-6 relative">
                      <div className="absolute inset-0 bg-surface-700"></div>
                      <div 
                        className={`absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500 ${
                          currentStep > step.number ? 'w-full' : 'w-0'
                        }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Register Form */}
          <div className="card-modern p-6 sm:p-8 overflow-hidden relative">
            {/* Animated border accent */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-brand-500/20">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_60%)]"></div>
            </div>
            <form onSubmit={handleSubmit} className="relative z-10">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome! Let's get to know you</h2>
                    <p className="text-surface-400 text-sm">Tell us your name to personalize your experience</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-surface-200 mb-2">First Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                        <input
                          id="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          autoComplete="given-name"
                          placeholder="Jane"
                          className="input-modern pl-12"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-surface-200 mb-2">Last Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                        <input
                          id="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          autoComplete="family-name"
                          placeholder="Doe"
                          className="input-modern pl-12"
                        />
                      </div>
                    </div>
                  </div>
                  {formData.firstName && formData.lastName && (
                    <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl animate-fadeIn">
                      <p className="text-brand-300 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Great! Nice to meet you, {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Account Setup */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Choose your identity</h2>
                    <p className="text-surface-400 text-sm">Pick a unique username and enter your email</p>
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-surface-200 mb-2">Username</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                      <input
                        id="username"
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        autoComplete="username"
                        placeholder="janedoe"
                        className="input-modern pl-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-200 mb-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="input-modern pl-12"
                      />
                    </div>
                  </div>
                  {formData.username && formData.email && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fadeIn">
                      <p className="text-emerald-300 text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Your account details look good!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Security */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Secure your account</h2>
                    <p className="text-surface-400 text-sm">Create a strong password to protect your memories</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-surface-200 mb-2">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          aria-describedby="password-strength"
                          className="input-modern pl-12 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-brand-400 transition"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {/* Strength Meter */}
                    <div id="password-strength" className="space-y-1">
                      <div className="h-2 w-full bg-dark-800/60 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full bg-gradient-to-r ${strengthGradient} rounded-full transition-all duration-500 password-bar`}
                          style={{ width: `${(passwordScore/5)*100}%` }}
                        ></div>
                        <div className="absolute inset-0 opacity-0 mix-blend-overlay animate-pulse-slow"></div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${passwordScore >= 4 ? 'text-emerald-400' : passwordScore >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{passwordLabel}</span>
                        {passwordScore < 4 && formData.password && (
                          <span className="text-surface-500">Improve security</span>
                        )}
                      </div>
                      {passwordScore < 4 && formData.password && passwordSuggestions.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {passwordSuggestions.map((s,i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-surface-400 animate-fadeIn">
                              <span className="text-brand-400">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-200 mb-2">Confirm Password</label>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        aria-invalid={formData.confirmPassword && formData.confirmPassword !== formData.password}
                        className={`input-modern pl-12 pr-16 ${formData.confirmPassword ? (formData.confirmPassword === formData.password ? 'ring-emerald-500/30 focus:ring-emerald-500 focus:border-emerald-500' : 'ring-red-500/30 focus:ring-red-500 focus:border-red-500') : ''}`}
                      />
                      {formData.confirmPassword && formData.confirmPassword === formData.password && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-semibold flex items-center gap-1 animate-fadeIn">
                          <Check className="w-4 h-4" /> Match
                        </span>
                      )}
                      {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 text-xs font-semibold animate-fadeIn">
                          Mismatch
                        </span>
                      )}
                    </div>
                    {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                      <p className="text-[11px] text-red-400 font-medium animate-fadeIn">Passwords do not match.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-surface-700/40">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Sign in link */}
            <div className="relative z-10 mt-6 text-center">
              <p className="text-surface-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-brand-400 hover:text-brand-300 transition-colors duration-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Brain, label: 'AI Powered', gradient: 'from-blue-500 to-cyan-500' },
              { icon: Shield, label: 'Secure', gradient: 'from-green-500 to-emerald-500' },
              { icon: Sparkles, label: 'Smart', gradient: 'from-purple-500 to-pink-500' }
            ].map((feature, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}> 
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-surface-400 font-medium group-hover:text-white transition-colors">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          @keyframes pulse-slow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
          .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
          .password-bar { box-shadow: 0 0 12px rgba(255,255,255,0.15), 0 0 4px rgba(255,255,255,0.3) inset; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        `}</style>
      </div>
  );
};

export default Register;
