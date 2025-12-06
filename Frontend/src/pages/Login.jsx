import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Heart,
  Sparkles,
  Brain,
  Loader,
  Shield,
  ChevronRight,
  Check
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });

  const steps = [
    { number: 1, title: 'Email', icon: Mail },
    { number: 2, title: 'Password', icon: Lock }
  ];

  const nextStep = () => {
    if (currentStep === 1 && !formData.email) {
      toast.error('Please enter your email');
      return;
    }
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    // Pre-fill demo credentials and auto-login
    setFormData({
      email: 'demo@soulsafe.ai',
      password: 'demo123'
    });
    setCurrentStep(2);
    
    // Wait a bit for state to update, then auto-submit
    setTimeout(async () => {
      setLoading(true);
      try {
        await login('demo@soulsafe.ai', 'demo123');
        toast.success('Welcome to the demo! 🚀');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Demo login failed. Please check if demo account exists or try manual login.');
        console.error('Demo login error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-brand-600/30 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-tl from-brand-500/25 to-brand-700/10 rounded-full blur-3xl"></div>
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

      <div className="relative z-10 mt-5 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-glow animate-pulse-slow">
              <Heart className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text mb-2">Welcome Back</h1>
            <p className="text-sm sm:text-base text-surface-400">Sign in to continue your journey</p>
          </div>

          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-center max-w-sm mx-auto">
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
                    <span className={`mt-2 text-xs font-medium transition-colors ${
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

          {/* Login Form */}
          <div className="card-modern p-6 sm:p-8 overflow-hidden relative">
            {/* Animated border accent */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-brand-500/20">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_60%)]"></div>
            </div>
            <form onSubmit={handleSubmit} className="relative z-10">
              {/* Step 1: Email */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Enter your email</h2>
                    <p className="text-surface-400 text-sm">We'll check if you have an account</p>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="input-modern pl-12 w-full"
                        placeholder="you@example.com"
                        autoFocus
                      />
                    </div>
                  </div>
                  {formData.email && (
                    <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl animate-fadeIn">
                      <p className="text-brand-300 text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Email looks good!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Password */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Enter your password</h2>
                    <p className="text-surface-400 text-sm">Sign in to {formData.email}</p>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-surface-200 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-brand-400 w-5 h-5 transition-colors" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="input-modern pl-12 pr-12 w-full"
                        placeholder="••••••••"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-brand-400 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-brand-400 hover:text-brand-300 transition-colors duration-300"
                    >
                      Forgot password?
                    </Link>
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
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                {currentStep < 2 ? (
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
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Divider */}
            <div className="relative z-10 my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface-800 text-surface-400">or</span>
                </div>
              </div>
            </div>

            {/* Demo Login Button */}
            <div className="relative z-10">
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="btn-secondary w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Try Demo Account
              </button>
            </div>

            {/* Sign up link */}
            <div className="relative z-10 mt-6 text-center">
              <p className="text-surface-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-brand-400 hover:text-brand-300 transition-colors duration-300"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Features */}
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
      </div>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes pulse-slow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Login;
