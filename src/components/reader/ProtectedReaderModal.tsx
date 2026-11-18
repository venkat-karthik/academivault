import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AcademicDocument, DocumentPageContent } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Lock,
  Search,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Bookmark,
  Send,
  MessageSquare,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface ProtectedReaderModalProps {
  document: AcademicDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const ProtectedReaderModal: React.FC<ProtectedReaderModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onOpenAuth
}) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<(DocumentPageContent & { svgContent: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);
  const [activeModule, setActiveModule] = useState<'modules' | 'derivations' | 'exam_keys'>('modules');
  const [comments, setComments] = useState<Array<{ author: string; text: string; date: string; isAuditor?: boolean }>>([
    {
      author: 'Dr. Ramesh Sharma',
      text: 'Verified step-by-step mathematical derivations. Aligned with 2026 syllabus requirements.',
      date: 'Auditor · 2 days ago',
      isAuditor: true
    },
    {
      author: 'Priya K.',
      text: 'Clear explanations of boundary conditions in section 3.',
      date: 'Student · Yesterday'
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(
    async (page: number) => {
      if (!doc) return;
      setLoading(true);
      setError('');
      try {
        const data = await api.getReaderPage(doc.id, page);
        setPageData(data);
        setCurrentPage(page);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load protected page.');
      } finally {
        setLoading(false);
      }
    },
    [doc]
  );

  useEffect(() => {
    if (isOpen && doc) {
      setCurrentPage(1);
      loadPage(1);
    }
  }, [isOpen, doc, loadPage]);

  // Anti-Scraping & DRM Key Trap Security
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Deter Print Shortcut (Ctrl+P / Meta+P)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setSecurityNotice('Printing is disabled under Digital Rights Management.');
        setTimeout(() => setSecurityNotice(null), 3000);
      }
      // Deter Screen Capture / Snipping shortcuts
      if (e.key === 'PrintScreen' || ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === 's'))) {
        setSecurityNotice('Screen capture flagged by Sentinel DRM.');
        setTimeout(() => setSecurityNotice(null), 3000);
      }
      // Arrow keys pagination
      if (e.key === 'ArrowRight' && doc && currentPage < doc.pageCount) {
        loadPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 1) {
        loadPage(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, doc, loadPage]);

  if (!isOpen || !doc) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        author: user?.name || 'Verified Scholar',
        text: newComment.trim(),
        date: 'Just now'
      }
    ]);
    setNewComment('');
  };

  const watermarkText = `Authorized for: ${user?.email || 'viewer@academivault'} • Device Linked`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111827]/80 backdrop-blur-sm animate-in fade-in duration-150">
      {/* 1. Top Bar (Exact Match to Mockup Screen 3: Logo, Zoom Controls, Review, Download) */}
      <div className="h-14 bg-white border-b border-[#E8E2D9] px-4 flex items-center justify-between shrink-0 shadow-xs">
        {/* Left Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#C06A28] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-[#1C1917] tracking-tight">AcademiaVault</span>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-medium text-[#78716C] truncate max-w-[200px] sm:max-w-xs">
            {doc.title}
          </span>
        </div>

        {/* Center: Zoom & Page Controls */}
        <div className="hidden sm:flex items-center gap-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg px-2.5 py-1">
          <span className="text-[11px] font-bold text-[#78716C] mr-0.5">Zoom</span>
          <button
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-medium text-[#1C1917] px-1">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(160, z + 10))}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[#E8E2D9] mx-1" />
          <button
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="p-1 text-[#78716C] hover:text-[#1C1917] disabled:opacity-30 rounded"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-bold text-[#1C1917]">
            {currentPage} / {doc.pageCount}
          </span>
          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage >= doc.pageCount || loading}
            className="p-1 text-[#78716C] hover:text-[#1C1917] disabled:opacity-30 rounded"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {securityNotice && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <AlertTriangle className="w-3 h-3" />
              <span>{securityNotice}</span>
            </span>
          )}

          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1C1917] bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#E8E2D9] rounded-lg transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Review Document</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!doc.hasPurchased && onOpenAuth) {
                onOpenAuth();
              }
            }}
            className="bg-[#1C1917] hover:bg-black text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            {doc.hasPurchased ? 'Download Note' : 'Sign In to Download'}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] rounded-lg transition-colors ml-1 cursor-pointer"
            aria-label="Close reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main 3-Column Reader Body (Exact Match to Mockup Screen 3) */}
      <div className="flex-1 flex overflow-hidden bg-[#FAF8F5]">
        {/* Left Sidebar (Modules, Derivations, Exam Keys & DRM Sentinel) */}
        <aside className="w-68 bg-white border-r border-[#E8E2D9] hidden lg:flex flex-col justify-between shrink-0">
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Accordion Categories */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveModule('modules')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeModule === 'modules' ? 'bg-[#FAF8F5] text-[#1C1917] border border-[#E8E2D9]' : 'text-[#78716C] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#C06A28]" />
                  <span>Modules & Units</span>
                </div>
                <span className="text-[10px] text-[#A8A29E]">▾</span>
              </button>

              <button
                onClick={() => setActiveModule('derivations')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeModule === 'derivations' ? 'bg-[#FAF8F5] text-[#1C1917] border border-[#E8E2D9]' : 'text-[#78716C] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Handwritten Derivations</span>
                </div>
                <span className="text-[10px] text-[#A8A29E]">▾</span>
              </button>

              <button
                onClick={() => setActiveModule('exam_keys')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeModule === 'exam_keys' ? 'bg-[#FAF8F5] text-[#1C1917] border border-[#E8E2D9]' : 'text-[#78716C] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>University Exam Keys</span>
                </div>
                <span className="text-[10px] text-[#A8A29E]">▾</span>
              </button>
            </div>

            {/* Document Index List (Screen 3 Mockup Layout) */}
            <div className="pt-2 border-t border-[#F0EBE3]">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
                Document Title (Sections)
              </span>
              <div className="space-y-1">
                {[
                  'Schema: Relational device info',
                  'University Exam Keys: Bartle...',
                  'Derivations: Unit 1-4 Analysis',
                  'Transient Response Dynamics',
                  'Solved PYQs: Mid-Term Revision',
                  'Laboratory Verified Manual'
                ].map((secTitle, i) => (
                  <button
                    key={i + 1}
                    onClick={() => loadPage(Math.min(i + 1, doc.pageCount))}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-[#FDF3D8] text-[#B45309] font-bold border border-[#F6E2B2]'
                        : 'text-[#57534E] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="truncate">{secTitle}</span>
                    <span className="font-mono text-[10px] text-[#A8A29E]">P.{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Pinned Badge (Exact Match to Mockup Screen 3: Single-Device DRM Sentinel Active) */}
          <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E2D9]">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#FDF3D8] border border-[#F6E2B2] text-[#92400E] shadow-xs">
              <Lock className="w-4 h-4 text-[#C06A28] shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] text-[#B45309] leading-tight">
                  Single-Device DRM Sentinel Active
                </p>
                <p className="text-[10px] text-[#78716C] truncate">Hardware fingerprint verified</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Viewer: High-Fidelity Paper Canvas with Forensic Watermark */}
        <main
          ref={containerRef}
          onContextMenu={(e) => e.preventDefault()}
          className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 relative no-drag bg-[#FAF8F5]"
        >
          {loading ? (
            <div className="bg-white rounded-xl shadow-md border border-[#E8E2D9] w-[640px] h-[840px] animate-pulse flex items-center justify-center">
              <span className="text-xs font-mono text-[#A8A29E]">Rendering DRM Watermark Buffer...</span>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-md border border-[#E8E2D9] p-8 text-center max-w-sm">
              <AlertTriangle className="w-8 h-8 text-[#C06A28] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#1C1917] mb-1">Access Notice</p>
              <p className="text-xs text-[#57534E]">{error}</p>
            </div>
          ) : (
            <div
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
              className="bg-white rounded-2xl shadow-md border border-[#DDD5C7] w-[660px] min-h-[880px] p-10 relative overflow-hidden transition-transform duration-100 flex flex-col justify-between"
            >
              {/* Continuous Diagonal Forensic Dynamic Watermark */}
              <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
                <div className="transform -rotate-35 text-[#78716C]/20 font-mono text-xs tracking-widest uppercase font-black text-center leading-loose">
                  {watermarkText}
                  <br />
                  ACADEMIAVAULT PROTECTED • DO NOT DISTRIBUTE
                  <br />
                  {watermarkText}
                </div>
              </div>

              {/* Document Header Metadata */}
              <div className="border-b border-[#F0EBE3] pb-4 mb-6 relative z-10 flex items-center justify-between text-xs text-[#78716C]">
                <span className="font-bold text-[#1C1917]">{doc.collegeName}</span>
                <span className="font-mono">{doc.subjectCode} • Page {currentPage}</span>
              </div>

              {/* Document Academic Content (Equations, Schema & Text matching Mockup) */}
              <div className="space-y-6 relative z-10 text-[#292524] text-xs sm:text-[13px] leading-relaxed font-serif">
                <h2 className="text-base font-bold font-sans text-[#1C1917]">
                  {doc.title} — Section {currentPage}
                </h2>

                <p>
                  Consider the general continuous-time transmission system where empirical parameters satisfy boundary conditions:
                </p>

                {/* Mathematical Formula / Equation Callout */}
                <div className="py-4 px-6 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] font-mono text-center text-xs sm:text-sm text-[#1C1917]">
                  f(s) = 2.5 · e^(-0.4s) + 3.1415 · cos(ωt + θ)
                  <div className="text-[10px] text-[#78716C] mt-1 font-sans">
                    [Eq. {currentPage}.1] — Generalized Transient Solution
                  </div>
                </div>

                {/* Circuit / System Diagram Schema Mock matching Screen 3 */}
                <div className="py-5 px-6 bg-white border border-dashed border-[#DDD5C7] rounded-xl flex flex-col items-center justify-center space-y-2">
                  <div className="w-40 h-14 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] flex items-center justify-center font-mono text-[11px] font-bold text-[#1C1917]">
                    V_in(t) ──[ Z_0 ]──&gt;
                  </div>
                  <span className="text-[10px] font-sans font-medium text-[#78716C]">
                    Figure {currentPage}: Lumped Impedance Characteristic Schematic
                  </span>
                </div>

                <p>
                  High-fidelity OCR transcription verified by faculty auditor. All rights reserved under the Indian Copyright Act 1957.
                </p>
              </div>

              {/* Document Footer */}
              <div className="border-t border-[#F0EBE3] pt-4 mt-8 relative z-10 flex items-center justify-between text-[11px] text-[#78716C] font-mono">
                <span>DRM Dynamic Watermark Verified</span>
                <span>Page {currentPage} of {doc.pageCount}</span>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Verified Faculty Audited & Feedback (Exact Match to Mockup Screen 3) */}
        <aside className="w-76 bg-white border-l border-[#E8E2D9] hidden xl:flex flex-col justify-between shrink-0">
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Header Badge */}
            <div className="p-3.5 rounded-xl bg-[#FDF3D8] border border-[#F6E2B2]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309] mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Faculty Audited</span>
              </div>
              <p className="text-[11px] text-[#78716C]">
                Feedback &amp; Rigor Score: <span className="font-bold text-[#1C1917]">★ 4.9/5.0</span>
              </p>
            </div>

            {/* Commentary Feed */}
            <div className="space-y-3">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A8A29E]">
                Auditor &amp; Student Notes
              </span>
              {comments.map((c, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    c.isAuditor ? 'bg-[#FAF8F5] border-[#E8E2D9]' : 'bg-white border-[#E8E2D9]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C1917] text-[11px]">{c.author}</span>
                    <span className="text-[9px] text-[#78716C]">{c.date}</span>
                  </div>
                  <p className="text-[#57534E] text-[11px] leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Comment Input Form */}
          <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E2D9]">
            <form onSubmit={handleAddComment} className="flex gap-1.5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add comment..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded-lg focus:outline-none focus:border-[#C06A28]"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#1C1917] hover:bg-black text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Post comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};
