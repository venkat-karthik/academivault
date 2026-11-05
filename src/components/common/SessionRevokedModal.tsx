import React from 'react';
import { AlertCircle, Smartphone, ShieldAlert, ArrowRight } from 'lucide-react';

interface SessionRevokedModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onReLogin: () => void;
}

export const SessionRevokedModal: React.FC<SessionRevokedModalProps> = ({
  isOpen,
  message,
  onClose,
  onReLogin
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1915]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fffdf6] rounded-3xl max-w-md w-full border border-[#ffe9a9] shadow-2xl p-6 sm:p-7 overflow-hidden relative">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe9a9] text-[#ea6510] flex items-center justify-center border border-[#ffcb56] shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1e1915] leading-tight">
              Active Session Terminated
            </h3>
            <p className="text-xs text-[#645548] mt-0.5 font-medium">Single-Device Security Policy Enforced</p>
          </div>
        </div>

        <div className="bg-[#fffdf6] border border-[#ffe9a9] rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#ea6510] mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-[#1e1915]">
              {message || 'Your account was signed in on another device. Please log in again.'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-[#645548] mb-6 bg-[#ffe9a9]/20 p-4 rounded-2xl border border-[#ffe9a9]">
          <div className="flex items-center justify-between">
            <span className="text-[#645548]">Security Rule:</span>
            <span className="font-bold text-[#1e1915]">1 Account = 1 Active Device Session</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#645548]">Status:</span>
            <span className="font-bold text-[#ea6510]">Old Token Revoked Atomically</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#645548]">Authorized Device:</span>
            <span className="font-medium text-[#1e1915]">New Device Session Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onReLogin();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#ea6510] hover:bg-[#d45707] rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95"
          >
            <span>Log In on This Device</span>
            <ArrowRight className="w-4 h-4 text-[#ffe9a9]" />
          </button>
        </div>
      </div>
    </div>
  );
};
