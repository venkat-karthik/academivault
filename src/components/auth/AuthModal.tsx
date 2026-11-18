import React from 'react';
import { AuthPage } from './AuthPage';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative min-h-screen w-full">
        {/* Floating Close Button for Modal Context */}
        <button
          onClick={onClose}
          className="fixed top-5 right-5 z-50 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md border border-gray-200 transition-transform active:scale-90 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <AuthPage
          onBack={onClose}
          onSuccess={onClose}
          initialMode={initialMode}
        />
      </div>
    </div>
  );
};
