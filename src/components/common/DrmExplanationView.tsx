import React from 'react';
import { Shield, Lock, Laptop, FileX, Eye } from 'lucide-react';

export const DrmExplanationView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-slide-up">
      {/* Title with Study Atmosphere Image */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fffdf6] via-[#ffe9a9]/25 to-[#73a5ca]/10 text-[#1e1915] border border-[#ffe9a9] shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 sm:p-10 relative z-10">
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffe9a9] border border-[#ffcb56] text-[#ea6510] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Shield className="w-4 h-4 text-[#ea6510]" />
              <span>Intellectual Property Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance leading-tight">
              Digital Rights Management & Intellectual Property.
            </h1>
            <p className="text-xs sm:text-sm text-[#645548] leading-relaxed max-w-xl">
              AcademiaVault enforces a multi-tier intellectual property protection architecture. Students license high-value study materials online in a serene, distraction-free environment with forensic dynamic watermarks.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#ffe9a9] shadow-sm group">
              <img
                src="/src/assets/images/library_aesthetic_reading_1793904179717.jpg"
                alt="Students studying in sunlit university reading hall"
                className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1915]/80 via-transparent to-transparent flex items-end p-3.5 text-white">
                <span className="text-xs font-semibold">Honoring Student Authors & Faculty IP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] hover:border-[#ff933e] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffe9a9] text-[#ea6510] flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1e1915]">1. Dynamic Forensic Watermarking</h3>
          <p className="text-xs text-[#645548] leading-relaxed">
            Every page delivered by our backend is rendered with personalized, repeating forensic watermarks containing the student's masked email, student ID, purchase transaction hash, session ID, and UTC timestamp. In the event of unauthorized redistribution, forensic analysis immediately identifies the originating account.
          </p>
        </div>

        <div className="p-6 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] hover:border-[#ff933e] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#73a5ca]/20 text-[#2d6289] flex items-center justify-center font-bold">
            <Laptop className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1e1915]">2. Single-Device Session Enforcement</h3>
          <p className="text-xs text-[#645548] leading-relaxed">
            Strict 1 Account = 1 Active Device Session policy. When a student logs in on Device B, Device A's active session is atomically invalidated on the backend with an explicit revocation notice. Shared credential distribution between peer groups is rendered non-viable.
          </p>
        </div>

        <div className="p-6 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] hover:border-[#ff933e] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffe9a9] text-[#ea6510] flex items-center justify-center font-bold">
            <FileX className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1e1915]">3. Download & Export Restriction</h3>
          <p className="text-xs text-[#645548] leading-relaxed">
            Raw PDF files are stored in private, authenticated cloud storage and are never exposed publicly to client browsers. The custom viewer streams encrypted vector/SVG representations of individual pages on demand, preventing bulk scraping scripts.
          </p>
        </div>

        <div className="p-6 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] hover:border-[#ff933e] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#73a5ca]/20 text-[#2d6289] border border-[#73a5ca]/30 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1e1915]">4. Focus-Loss Blackout Shield</h3>
          <p className="text-xs text-[#645548] leading-relaxed">
            When desktop screen capture utilities (such as Snipping Tool or screenshot key combinations) steal desktop focus, the document reader immediately blanks out the view, ensuring external capture software records only the security shield.
          </p>
        </div>
      </div>
    </div>
  );
};
