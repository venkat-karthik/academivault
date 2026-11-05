import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#fffdf6] border-t border-[#ffe9a9] mt-20 text-[#645548] text-xs">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8 pb-8 border-b border-[#ffe9a9]">
          <div className="max-w-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff933e] to-[#ffcb56] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold text-[#1e1915]">AcademiaVault</span>
            </div>
            <p className="text-xs text-[#645548] leading-relaxed">
              A serene digital academic marketplace connecting students, contributors, and accredited faculty across Indian higher education institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div>
              <h4 className="font-bold text-[#1e1915] mb-2">Marketplace</h4>
              <ul className="space-y-1.5 text-[#645548]">
                <li>Handwritten Notes</li>
                <li>Digital Lecture Notes</li>
                <li>University Question Banks</li>
                <li>Engineering Lab Manuals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#1e1915] mb-2">Security & DRM</h4>
              <ul className="space-y-1.5 text-[#645548]">
                <li>Single-Device Login</li>
                <li>Forensic Dynamic Watermark</li>
                <li>Razorpay Checkout</li>
                <li>Copyright Enforcement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#1e1915] mb-2">Academic Audit</h4>
              <ul className="space-y-1.5 text-[#645548]">
                <li>Professor Verification</li>
                <li>Syllabus Rigor Assessment</li>
                <li>Contributor Royalties</li>
                <li>Institutional Inquiries</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#645548]/70">
          <div>
            © 2026 AcademiaVault. All academic study materials protected under the Indian Copyright Act 1957.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#ea6510] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#ea6510] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#ea6510] cursor-pointer">Digital Rights Management</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
