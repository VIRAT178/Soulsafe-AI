import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  Mail, 
  ArrowLeft, 
  Loader,
  KeyRound,
  ShieldCheck,
  Timer,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    resetToken: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: formData.email
      });

      toast.success(response.data.message);
      setStep(2);
      setCountdown(60); // 60 seconds cooldown for resend
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(message);
      
      if (error.response?.data?.remainingSeconds) {
        setCountdown(error.response.data.remainingSeconds);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });

      toast.success(response.data.message);
      setFormData({ ...formData, resetToken: response.data.resetToken });
      setStep(3);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        resetToken: formData.resetToken,
        newPassword: formData.newPassword
      });

      toast.success(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: formData.email
      });
      
      toast.success('OTP resent successfully!');
      setCountdown(60);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
      
      if (error.response?.data?.remainingSeconds) {
        setCountdown(error.response.data.remainingSeconds);
      }
    } finally {
      setLoading(false);
    }
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
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </button>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-glow">
              <KeyRound className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text mb-2">
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'New Password'}
            </h1>
            <p className="text-sm text-surface-400">
              {step === 1 && "Enter your email to receive a verification code"}
              {step === 2 && "Enter the 6-digit code sent to your email"}
              {step === 3 && "Create a new secure password"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    step >= s ? 'bg-brand-500 w-16' : 'bg-surface-700 w-8'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Card */}
          <div className="card-modern p-6 sm:p-8 relative overflow-hidden">
            {/* Border accent */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-brand-500/20">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_60%)]"></div>
            </div>

            <div className="relative z-10">
              {/* Step 1: Email Input */}
              {step === 1 && (
                <form onSubmit={handleRequestOTP} className="space-y-6 animate-fadeIn">
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
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-modern pl-12 w-full"
                        placeholder="you@example.com"
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-brand-300">
                        <p className="font-medium mb-1">Secure Verification</p>
                        <p className="text-xs text-surface-400">
                          We'll send a 6-digit code to verify your identity. The code expires in 10 minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !formData.email}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Verification Code
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-4">
                    <p className="text-sm text-surface-400">
                      Code sent to <span className="text-brand-400 font-medium">{formData.email}</span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-surface-200 mb-2">
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, otp: value });
                      }}
                      className="input-modern text-center text-2xl tracking-widest font-mono w-full"
                      placeholder="000000"
                      autoFocus
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-700/30 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="w-4 h-4 text-brand-400" />
                      <span className="text-surface-400">
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Code expired?'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || loading}
                      className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend Code
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                      disabled={loading}
                    >
                      Change Email
                    </button>
                    <button
                      type="submit"
                      disabled={loading || formData.otp.length !== 6}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Verify Code
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6 animate-fadeIn">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Identity verified successfully!</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-surface-200 mb-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="input-modern pr-12 w-full"
                        placeholder="Enter new password"
                        autoFocus
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-brand-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.newPassword && formData.newPassword.length < 6 && (
                      <p className="mt-1 text-xs text-red-400">Password must be at least 6 characters</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-200 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="input-modern pr-12 w-full"
                        placeholder="Confirm new password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-brand-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                      <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || formData.newPassword.length < 6 || formData.newPassword !== formData.confirmPassword}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Back to login link */}
          <div className="mt-6 text-center">
            <p className="text-surface-400 text-sm">
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-brand-400 hover:text-brand-300 transition-colors duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeIn { 
          animation: fadeIn 0.4s ease-out forwards; 
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
