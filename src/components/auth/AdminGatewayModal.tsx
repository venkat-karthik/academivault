import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, ShieldAlert, Sparkles, CheckCircle2, KeyRound } from 'lucide-react';

interface AdminGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated: () => void;
}

export const ADMIN_EMAIL = 'karthikvenkat316@gmail.com';

export const AdminGatewayModal: React.FC<AdminGatewayModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated
}) => {
  const { user, loginWithGoogle, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isCurrentAdmin = user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleLaunchDashboard = () => {
    onClose();
    onAdminAuthenticated();
  };

  const handleGoogleAdminAuth = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle({
        email: ADMIN_EMAIL,
        name: 'Karthik Venkat (Platform Owner)',
        deviceLabel: 'Admin Master Terminal'
      });
      onClose();
      onAdminAuthenticated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Administrative authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(ADMIN_EMAIL, password || 'AcademicSecure2026!', 'Admin Master Terminal');
      onClose();
      onAdminAuthenticated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid master credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1915]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#fffdf6] rounded-3xl max-w-md w-full border border-[#ffe9a9] shadow-2xl p-7 relative animate-modal-enter overflow-hidden">
        {/* Amber Ambient Rim */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#ea6510]/15 to-transparent rounded-full blur-xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#645548] hover:text-[#1e1915] hover:bg-[#ffe9a9]/60 rounded-xl transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ffe9a9] border border-[#ffcb56] text-[#ea6510] text-[10px] font-bold uppercase tracking-widest mb-2 font-mono">
            <Lock className="w-3 h-3 text-[#ea6510]" />
            <span>Restricted Gateway</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1e1915] font-editorial tracking-tight">
            Administrator Console
          </h2>
          <p className="text-xs text-[#645548] mt-1 leading-relaxed">
            Administrative governance privileges are strictly bound to verified platform owner{' '}
            <span className="font-mono font-bold text-[#1e1915] bg-[#ffe9a9]/50 px-1 py-0.5 rounded">
              {ADMIN_EMAIL}
            </span>.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 text-[#ea6510] border border-[#ffcb56] text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isCurrentAdmin ? (
          <div className="space-y-4 relative z-10">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Verified Administrator Active</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Signed in as {user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLaunchDashboard}
              className="w-full py-3 px-4 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Launch Administrator Dashboard
            </button>
          </div>
        ) : user ? (
          <div className="space-y-4 relative z-10">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#1e1915] text-xs">
              <p className="font-bold text-[#ea6510] mb-1">Non-Admin Account Detected</p>
              <p className="text-[11px] text-[#645548] leading-relaxed">
                You are currently signed in as <span className="font-semibold text-[#1e1915]">{user.email}</span>. Administrative access is reserved exclusively for <span className="font-semibold">{ADMIN_EMAIL}</span>.
              </p>
            </div>

            <button
              onClick={handleGoogleAdminAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              Sign In as {ADMIN_EMAIL}
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            <button
              type="button"
              onClick={handleGoogleAdminAuth}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#ffe9a9] bg-white hover:bg-[#fff9e6] hover:border-[#ffcb56] text-[#1e1915] font-semibold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 group"
            >
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Authenticate with Google ({ADMIN_EMAIL})</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#ffe9a9]" />
              <span className="text-[10px] font-bold text-[#645548]/70 uppercase tracking-wider">or master password</span>
              <div className="flex-1 h-px bg-[#ffe9a9]" />
            </div>

            <form onSubmit={handlePasswordAdminAuth} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#1e1915] mb-1">
                  Master Security Passkey
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-[#73a5ca] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password (default: AcademicSecure2026!)"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus:border-[#ea6510]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Unlock Admin Portal'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

