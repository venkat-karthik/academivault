import React from 'react';
import { BookOpen, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-[#FAFAFA] border-t border-gray-200/80 mt-20 text-gray-500 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8 pb-8 border-b border-gray-200/80">
          <div className="max-w-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#D97706] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold text-[#111827]">AcademiaVault</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A serene digital academic marketplace connecting students, contributors, and accredited faculty across Indian higher education institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div>
              <h4 className="font-bold text-[#111827] mb-2">Marketplace</h4>
              <ul className="space-y-1.5 text-gray-500">
                <li>Handwritten Derivations</li>
                <li>Digital Courseware</li>
                <li>University Question Banks</li>
                <li>Engineering Lab Manuals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#111827] mb-2">Security & DRM</h4>
              <ul className="space-y-1.5 text-gray-500">
                <li>Single-Device Login Sentinel</li>
                <li>Forensic Dynamic Watermark</li>
                <li>Razorpay Checkout</li>
                <li>Copyright Enforcement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#111827] mb-2">Academic Audit</h4>
              <ul className="space-y-1.5 text-gray-500">
                <li>Professor Verification</li>
                <li>Syllabus Rigor Assessment</li>
                <li>Contributor Royalties</li>
                <li>Institutional Inquiries</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span>© 2026 AcademiaVault. All academic study materials protected under the Indian Copyright Act 1957.</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                title="Staff Console"
                aria-label="Staff Console"
                className="opacity-40 hover:opacity-100 hover:text-[#D97706] transition-opacity p-0.5 rounded cursor-pointer ml-1 inline-flex items-center"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#D97706] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#D97706] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#D97706] cursor-pointer">Digital Rights Management</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
