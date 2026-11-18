import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Award,
  ChevronDown,
  User,
  Building2,
  FileCheck2
} from 'lucide-react';
import { INITIAL_COLLEGES } from '../../data/mockData';
import { CLOUDINARY_ASSETS } from '../../data/assets';

interface AuthPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
  onOpenAdminGateway?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBack,
  onSuccess,
  initialMode = 'login',
  onOpenAdminGateway
}) => {
  const { login, loginWithGoogle, register, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'contributor' | 'professor'>('student');
  const [collegeId, setCollegeId] = useState(INITIAL_COLLEGES[0]?.id || 'iit-bombay');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(3);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setShowGoogleSelector(false);
    setError('');
  }, [initialMode]);

  // Hook into Google Identity Services if a valid client_id is present
  useEffect(() => {
    const customClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (
      customClientId &&
      !customClientId.includes('unvibe.apps') &&
      typeof window !== 'undefined' &&
      (window as unknown as { google?: { accounts?: { id?: { initialize: (cfg: unknown) => void } } } }).google?.accounts?.id
    ) {
      try {
        const googleObj = (window as unknown as { google: { accounts: { id: { initialize: (cfg: unknown) => void } } } }).google;
        googleObj.accounts.id.initialize({
          client_id: customClientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              try {
                setIsGoogleLoading(true);
                await loginWithGoogle({
                  credential: response.credential,
                  deviceLabel: 'Google Verified Device'
                });
                onSuccess?.();
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Google authentication failed');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          }
        });
      } catch {
        // Safe silent catch
      }
    }
  }, [loginWithGoogle, onSuccess]);

  const handleSelectGoogleAccount = async (targetEmail: string, targetName?: string) => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle({
        email: targetEmail.trim().toLowerCase(),
        name: targetName || targetEmail.split('@')[0],
        deviceLabel: 'Google Verified Device'
      });
      onSuccess?.();
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
      await login(email, password, rememberMe ? 'Trusted Web Device' : 'Single Session Device');
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid academic credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role === 'professor' ? 'contributor' : role,
        collegeId,
        branch,
        semester,
        deviceLabel: 'Web Device'
      });
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F5] text-[#1C1917]">
      {/* LEFT COLUMN: Editorial Showcase & Academic Brand Narrative (Hidden on mobile / small screens) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#0B0F17] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#D97706]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Top Brand Wordmark */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans block">
                AcademiaVault
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#D97706] uppercase block">
                National Academic Repository
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-gray-300 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DRM Sentinel 2.4</span>
          </div>
        </div>

        {/* Center Editorial Visual & Quotation */}
        <div className="relative z-10 my-auto py-8 space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D97706]">
              Peer-Reviewed Courseware
            </span>
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight font-editorial leading-[1.15] text-white">
              Curated Knowledge,{' '}
              <span className="italic font-normal text-[#F59E0B]">Artfully</span> Preserved.
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              Verified syllabus guides, handwritten derivations, and university examination keys from accredited Tier-1 universities. Protected under single-device dynamic watermark reader mode.
            </p>
          </div>

          {/* Photographic Library Canvas with Frosted Rigor Chip */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            <img
              src={CLOUDINARY_ASSETS.libraryReading}
              alt="University academic reading hall"
              className="w-full h-56 xl:h-64 object-cover object-center group-hover:scale-102 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/90 via-transparent to-transparent" />

            {/* Docked Glassmorphic Card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <span className="text-[#F59E0B] text-xs font-black">★ 4.9</span>
                <div className="text-[11px] leading-tight">
                  <p className="font-bold">Verified Rigor Score</p>
                  <p className="text-gray-300 text-[10px]">1,400+ Faculty Audits</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Verified Notes</span>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-2">
            <p className="italic leading-relaxed">
              &ldquo;AcademiaVault honors student authors under the Indian Copyright Act while ensuring authentic syllabus revisions for end-semester preparation.&rdquo;
            </p>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold text-white">Dr. Ramesh Sharma</span>
              <span>Senior Academic Auditor</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#D97706]" />
              18+ Tier-1 Universities
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Dynamic Watermark DRM
            </span>
          </div>
          <span>© 2026 AcademiaVault</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Redesigned Interactive Sign In / Register Card */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Header Actions: Back Link & Owner Lock Indicator */}
        <div className="flex items-center justify-between max-w-md w-full mx-auto mb-6">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#111827] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Marketplace</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#D97706] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-[#111827]">AcademiaVault</span>
            </div>
          )}

          {onOpenAdminGateway && (
            <button
              onClick={onOpenAdminGateway}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono text-gray-400 hover:text-[#D97706] hover:bg-amber-50 transition-colors cursor-pointer"
              title="Staff & Administrator Gateway"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Gateway</span>
            </button>
          )}
        </div>

        {/* Center Auth Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          {/* Headline & Subtitle */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider text-[#D97706] uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Academic Access Gateway</span>
            </div>
            <h2 className="text-3xl font-bold text-[#111827] tracking-tight font-editorial leading-tight">
              {showGoogleSelector
                ? 'Sign in with Google'
                : mode === 'login'
                ? 'Sign In to Your Vault'
                : 'Create Academic Profile'}
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {showGoogleSelector
                ? 'Select a verified Google profile to connect your institutional courseware and DRM licenses.'
                : mode === 'login'
                ? 'Access peer-reviewed syllabus guides, lecture notes, and DRM-protected student vaults.'
                : 'Join scholars and accredited faculty sharing authenticated study guides across universities.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200 text-xs font-medium flex items-center gap-2 animate-shake">
              <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* IN-PAGE GOOGLE ACCOUNT SELECTOR VIEW */}
          {showGoogleSelector ? (
            <div className="space-y-4 animate-fade-slide-up">
              <div className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                Select Authenticated Account
              </div>

              {/* 1-Click Platform Owner Card (karthikvenkat316@gmail.com) */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={() => handleSelectGoogleAccount('karthikvenkat316@gmail.com', 'Karthik Venkat')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 hover:border-[#D97706] transition-all text-left shadow-xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    KV
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111827] group-hover:text-[#D97706] transition-colors flex items-center gap-2">
                      <span>Karthik Venkat</span>
                      <span className="text-[9px] font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.2 rounded border border-[#FDE68A]">
                        Owner
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      karthikvenkat316@gmail.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#D97706] group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Inline Custom Google Account Entry */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                <label className="block text-xs font-bold text-[#111827]">
                  Or enter another Google / Workspace email:
                </label>
                <form onSubmit={handleCustomGoogleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isGoogleLoading}
                    className="px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleLoading ? 'Connecting...' : 'Continue'}
                  </button>
                </form>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowGoogleSelector(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#111827] font-semibold py-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to email &amp; password sign in</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Primary 1-Click Google Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowGoogleSelector(true)}
                  disabled={isGoogleLoading || isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-[#111827] font-semibold text-xs transition-all shadow-xs active:scale-[0.99] group cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    or institutional email
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>

              {/* Minimal Mode Tab Pills */}
              <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-gray-500 hover:text-[#111827]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-gray-500 hover:text-[#111827]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Mode: Sign In Form */}
              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1.5">
                      University or Personal Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.ac.in"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#111827]">Password</label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent to your institutional email.')}
                        className="text-[11px] font-medium text-[#D97706] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (min 6 characters)"
                        className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#D97706] focus:ring-[#D97706] border-gray-300"
                      />
                      <span>Trust this device (DRM Sentinel)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#111827] hover:bg-gray-800 text-white font-semibold text-xs transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Mode: Create Account Form */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Arjun Sharma"
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      University or Student Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@iitb.ac.in"
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-gray-400 hover:text-gray-700 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Academic Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Academic Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'student', label: 'Student' },
                        { id: 'contributor', label: 'Author' },
                        { id: 'professor', label: 'Faculty' }
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id as any)}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                            role === r.id
                              ? 'bg-[#111827] text-white border-[#111827]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* University & Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Institution
                      </label>
                      <select
                        value={collegeId}
                        onChange={(e) => setCollegeId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] cursor-pointer"
                      >
                        {INITIAL_COLLEGES.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Current Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-[#111827] focus:outline-none focus:border-[#D97706] cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white font-semibold text-xs transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    <span>{isSubmitting ? 'Creating Profile...' : 'Create Academic Profile'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Institutional Compliance Notice */}
          <div className="mt-6 pt-4 border-t border-gray-200/80 text-center">
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
              Protected under the <span className="font-semibold text-gray-600">Indian Copyright Act 1957</span>. Single-device DRM binding ensures legitimate access to student notes and faculty audit archives.
            </p>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="max-w-md w-full mx-auto text-center text-[11px] text-gray-400 pt-4">
          <span>Need assistance? </span>
          <span className="text-[#D97706] hover:underline cursor-pointer">Contact Academic Registrar</span>
        </div>
      </div>
    </div>
  );
};

