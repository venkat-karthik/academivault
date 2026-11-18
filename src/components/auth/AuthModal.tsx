import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { INITIAL_COLLEGES } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1915]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdf6] rounded-3xl max-w-md w-full border border-[#ffe9a9] shadow-2xl p-7 relative animate-modal-enter">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#645548] hover:text-[#1e1915] hover:bg-[#ffe9a9]/60 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-wider text-[#ea6510] uppercase block mb-1">
            AcademiaVault Access
          </span>
          <h2 className="text-xl font-bold text-[#1e1915] tracking-tight">
            {mode === 'login' ? 'Sign in to your account' : 'Create an academic account'}
          </h2>
          <p className="text-xs text-[#645548] mt-1 leading-relaxed">
            {mode === 'login'
              ? 'Enter your institutional email to access your purchased study library.'
              : 'Join university students and professors sharing verified study materials.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#ffe9a9] mb-6 text-xs font-bold">
          <button
            onClick={() => setMode('login')}
            className={`pb-2.5 mr-6 transition-colors ${
              mode === 'login'
                ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
                : 'text-[#645548] hover:text-[#1e1915]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`pb-2.5 transition-colors ${
              mode === 'register'
                ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
                : 'text-[#645548] hover:text-[#1e1915]'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 text-[#ea6510] border border-[#ffcb56] text-xs font-medium">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="name@university.ac.in"
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
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510] focus-visible:ring-offset-1 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#645548] hover:text-[#1e1915] p-0.5 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 mt-2 focus-visible:ring-2 focus-visible:ring-[#ea6510] focus-visible:ring-offset-2"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
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
                <label className="block text-xs font-bold text-[#1e1915] mb-1">Account Type</label>
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
                placeholder="rahul@iitb.ac.in"
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
                  className="absolute right-3 top-2 text-[#645548] hover:text-[#1e1915] p-0.5 rounded"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e1915] mb-1">College / University</label>
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
              className="w-full py-2.5 px-4 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 mt-2 focus-visible:ring-2 focus-visible:ring-[#ea6510] focus-visible:ring-offset-2"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
