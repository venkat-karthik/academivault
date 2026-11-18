import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, Eye, EyeOff, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { INITIAL_COLLEGES } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'contributor'>('student');
  const [collegeId, setCollegeId] = useState(INITIAL_COLLEGES[0].id);
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(3);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setShowGoogleSelector(false);
  }, [initialMode, isOpen]);

  // Hook into Google Identity Services if present on window
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as { google?: { accounts?: { id?: { initialize: (cfg: unknown) => void; prompt: () => void } } } }).google?.accounts?.id) {
      try {
        const googleObj = (window as unknown as { google: { accounts: { id: { initialize: (cfg: unknown) => void; prompt: () => void } } } }).google;
        googleObj.accounts.id.initialize({
          client_id: '91608029769-unvibe.apps.googleusercontent.com',
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              try {
                setIsGoogleLoading(true);
                await loginWithGoogle({
                  credential: response.credential,
                  deviceLabel: 'Google Verified Device'
                });
                onClose();
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Google authentication failed');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          }
        });
      } catch {
        // GSI silent ignore
      }
    }
  }, [loginWithGoogle, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignInClick = () => {
    setError('');
    // Try invoking Google One-Tap in the background if initialized
    try {
      const googleObj = (window as unknown as { google?: { accounts?: { id?: { prompt: () => void } } } }).google;
      if (googleObj?.accounts?.id) {
        googleObj.accounts.id.prompt();
      }
    } catch {
      // ignore
    }
    // Switch to sleek in-modal Google account view (NO window.prompt!)
    setShowGoogleSelector(true);
  };

  const handleSelectGoogleAccount = async (targetEmail: string, targetName?: string) => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle({
        email: targetEmail.trim().toLowerCase(),
        name: targetName || targetEmail.split('@')[0],
        deviceLabel: 'Google Verified Device'
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication encountered an error.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    await handleSelectGoogleAccount(customGoogleEmail);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Please enter a valid password (minimum 6 characters).');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password, 'Web Device');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid academic credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        collegeId,
        branch,
        semester,
        deviceLabel: 'Web Device'
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1915]/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fffdf6] rounded-3xl max-w-md w-full border border-[#ffe9a9] shadow-2xl p-7 relative animate-modal-enter overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#ffcb56]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#645548] hover:text-[#1e1915] hover:bg-[#ffe9a9]/60 rounded-xl transition-colors z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#ea6510] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#ea6510]" />
            <span>AcademiaVault Identity</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1e1915] tracking-tight font-editorial">
            {showGoogleSelector
              ? 'Sign in with Google'
              : mode === 'login'
              ? 'Sign In to Your Vault'
              : 'Create Academic Profile'}
          </h2>
          <p className="text-xs text-[#645548] mt-1 leading-relaxed">
            {showGoogleSelector
              ? 'Choose a verified Google profile to access your academic courseware and DRM libraries.'
              : mode === 'login'
              ? 'Institutional access to syllabus-verified courseware and personal DRM libraries.'
              : 'Join university students and accredited faculty sharing authenticated study guides.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 text-[#ea6510] border border-[#ffcb56] text-xs font-medium relative z-10">
            {error}
          </div>
        )}

        {/* GOOGLE IN-MODAL SELECTOR VIEW (NO BROWSER PROMPTS) */}
        {showGoogleSelector ? (
          <div className="space-y-4 relative z-10 animate-fade-slide-up">
            <div className="text-[11px] font-bold text-[#645548] uppercase tracking-wider mb-2">
              Select Google Account
            </div>

            {/* Quick-Select Platform Owner Card */}
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={() => handleSelectGoogleAccount('karthikvenkat316@gmail.com', 'Karthik Venkat')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#ffe9a9] bg-white hover:bg-[#fff9e6] hover:border-[#ea6510]/50 transition-all text-left shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ea6510] to-[#ffcb56] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  KV
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1e1915] group-hover:text-[#ea6510] transition-colors">
                    Karthik Venkat
                  </div>
                  <div className="text-[11px] text-[#645548]">
                    karthikvenkat316@gmail.com
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#ea6510] bg-[#ffe9a9] px-2 py-0.5 rounded-md font-mono border border-[#ffcb56]">
                Owner
              </span>
            </button>

            {/* Inline Custom Google Account Form */}
            <div className="pt-2">
              <form onSubmit={handleCustomGoogleSubmit} className="space-y-2.5">
                <label className="block text-[11px] font-bold text-[#1e1915]">
                  Or enter another Google / Workspace email:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus:border-[#ea6510] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isGoogleLoading}
                    className="px-4 py-2 bg-[#ea6510] hover:bg-[#d45707] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isGoogleLoading ? 'Connecting...' : 'Continue'}
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-2 border-t border-[#ffe9a9]">
              <button
                type="button"
                onClick={() => setShowGoogleSelector(false)}
                className="flex items-center justify-center gap-1.5 w-full text-xs text-[#645548] hover:text-[#1e1915] font-semibold py-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to email & password sign in</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Google Primary One-Click Button */}
            <div className="mb-5 relative z-10">
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#ffe9a9] bg-white hover:bg-[#fff9e6] hover:border-[#ffcb56] text-[#1e1915] font-semibold text-xs transition-all shadow-2xs hover:shadow-sm active:scale-[0.98] group cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#ffe9a9]" />
                <span className="text-[10px] font-bold text-[#645548]/70 uppercase tracking-wider">or institutional email</span>
                <div className="flex-1 h-px bg-[#ffe9a9]" />
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-[#ffe9a9] mb-5 text-xs font-bold relative z-10">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`pb-2.5 mr-6 transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
                    : 'text-[#645548] hover:text-[#1e1915]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
                    : 'text-[#645548] hover:text-[#1e1915]'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-[#1e1915] mb-1.5">
                    University or College Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#73a5ca] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.ac.in"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus:border-[#ea6510] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1e1915]">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#73a5ca] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (min 6 characters)"
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 text-[#645548] hover:text-[#1e1915] p-0.5 rounded cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign In with Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-[#1e1915] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1e1915] mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'student' | 'contributor')}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#ffe9a9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510] bg-white text-[#1e1915]"
                    >
                      <option value="student">Student (Reader)</option>
                      <option value="contributor">Contributor (Author)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1e1915] mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#ffe9a9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510] bg-white text-[#1e1915]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e1915] mb-1">College Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@iitb.ac.in"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e1915] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 6 characters)"
                      className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2 text-[#645548] hover:text-[#1e1915] p-0.5 rounded cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e1915] mb-1">Institution</label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#ffe9a9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510] bg-white text-[#1e1915]"
                  >
                    {INITIAL_COLLEGES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isSubmitting ? 'Creating profile...' : 'Create Account'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
