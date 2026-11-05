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
  Maximize2,
  Minimize2,
  Bookmark,
  Lock,
  RotateCw,
  AlertTriangle,
  EyeOff,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

interface ProtectedReaderModalProps {
  document: AcademicDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProtectedReaderModal: React.FC<ProtectedReaderModalProps> = ({
  document: doc,
  isOpen,
  onClose
}) => {
  const { user, session } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<(DocumentPageContent & { svgContent: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isCaptureDeterred, setIsCaptureDeterred] = useState(false);

  // Student Eye-Comfort Reading Tone: Warm Cream vs Night Slate
  const [readingTone, setReadingTone] = useState<'cream' | 'night'>('cream');

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

  // Focus-Loss Shield: When screenshot tools steal focus, blank the canvas
  useEffect(() => {
    if (!isOpen) return;

    const handleBlur = () => setIsWindowFocused(false);
    const handleFocus = () => setIsWindowFocused(true);
    const handleVisibility = () => setIsWindowFocused(!document.hidden);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isOpen]);

  // Intercept capture shortcuts & PrintScreen
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault();
        setIsCaptureDeterred(true);
        setTimeout(() => setIsCaptureDeterred(false), 3000);
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (doc && currentPage < doc.pageCount) loadPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPage > 1) loadPage(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, doc, loadPage]);

  if (!isOpen || !doc) return null;

  const toggleBookmark = (page: number) => {
    setBookmarks((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const progressPercent = Math.round((currentPage / doc.pageCount) * 100);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-50 flex flex-col select-none drm-protected-surface animate-in fade-in duration-200 transition-colors ${
        readingTone === 'cream'
          ? 'bg-[#fffdf6] text-[#1e1915]'
          : 'bg-[#181512] text-[#ffe9a9]'
      }`}
    >
      {/* Top Controls Bar */}
      <div
        className={`h-14 border-b px-5 flex items-center justify-between gap-4 shrink-0 transition-colors ${
          readingTone === 'cream'
            ? 'bg-[#fffdf6]/95 border-[#ffe9a9] text-[#1e1915]'
            : 'bg-[#211d19] border-[#362e27] text-[#ffe9a9]'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate max-w-sm">
          <div className="w-6 h-6 rounded-lg bg-[#ffe9a9] text-[#ea6510] flex items-center justify-center shrink-0 font-bold">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold truncate">{doc.title}</span>
        </div>

        {/* Center: Page Controls with Smooth Flip Feel */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="p-1.5 rounded-lg hover:bg-[#ffe9a9]/60 disabled:opacity-30 transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold tabular-nums px-2">
            {currentPage} / {doc.pageCount}
          </span>

          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage >= doc.pageCount || loading}
            className="p-1.5 rounded-lg hover:bg-[#ffe9a9]/60 disabled:opacity-30 transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Eye-Comfort Tone, Zoom, Tools */}
        <div className="flex items-center gap-2">
          {/* Eye-Comfort Warm Paper Toggle */}
          <button
            onClick={() => setReadingTone((t) => (t === 'cream' ? 'night' : 'cream'))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
              readingTone === 'cream'
                ? 'bg-[#ffe9a9] text-[#1e1915] border-[#ffcb56]'
                : 'bg-[#2d2621] text-[#ffe9a9] border-[#4a3e35]'
            }`}
            title="Toggle Warm Cream Study Mode"
          >
            {readingTone === 'cream' ? <Sun className="w-3.5 h-3.5 text-[#ea6510]" /> : <Moon className="w-3.5 h-3.5 text-[#ffcb56]" />}
            <span className="hidden sm:inline font-sans text-[11px]">
              {readingTone === 'cream' ? 'Warm Light' : 'Dark Mode'}
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 15))}
              className="p-1 hover:bg-[#ffe9a9]/50 rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-8 text-center tabular-nums">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(180, z + 15))}
              className="p-1 hover:bg-[#ffe9a9]/50 rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => toggleBookmark(currentPage)}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarks.includes(currentPage)
                ? 'text-[#ea6510] bg-[#ffe9a9]'
                : 'hover:bg-[#ffe9a9]/50'
            }`}
            title="Bookmark"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-[#ffe9a9]/50 rounded-lg transition-colors hidden sm:inline-flex"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#ffe9a9]/70 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warm Sunset to Cornflower Progress Line */}
      <div className="w-full bg-[#ffe9a9]/40 h-1">
        <div
          className="bg-gradient-to-r from-[#ff933e] via-[#ffcb56] to-[#73a5ca] h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Page Canvas Area */}
      <div
        className={`flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative transition-colors ${
          readingTone === 'cream'
            ? 'bg-[#fffdf6]'
            : 'bg-[#14110f]'
        }`}
      >
        {/* Focus Shield / Capture Blackout */}
        {(!isWindowFocused || isCaptureDeterred) && (
          <div className="absolute inset-0 bg-[#1e1915]/98 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#ffcb56]/20 text-[#ffcb56] flex items-center justify-center border border-[#ffcb56]/30 mb-3">
              <EyeOff className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Protected Document View</h4>
            <p className="text-xs text-[#ffe9a9] max-w-sm leading-relaxed mb-3">
              Document view paused while window focus is transferred. Return to browser tab to continue reading.
            </p>
            <div className="text-[10px] font-mono text-[#ffcb56]">
              License: {user?.email}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-3 text-[#ea6510]">
            <RotateCw className="w-7 h-7 animate-spin text-[#ea6510]" />
            <span className="text-xs font-mono font-medium">Rendering watermarked page...</span>
          </div>
        ) : error ? (
          <div className="max-w-sm bg-white border border-[#ffe9a9] p-6 rounded-2xl text-center shadow-lg">
            <AlertTriangle className="w-8 h-8 text-[#ea6510] mx-auto mb-2" />
            <p className="text-xs text-[#1e1915] mb-3">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white"
            >
              Close Reader
            </button>
          </div>
        ) : pageData?.svgContent ? (
          <div
            key={currentPage}
            className="rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-[#ffe9a9] animate-fade-slide-up"
            style={{
              width: `${Math.round(800 * (zoom / 100))}px`,
              maxWidth: '100%',
              aspectRatio: '800 / 1130',
              backgroundColor: readingTone === 'cream' ? '#fffdf6' : '#ffffff'
            }}
            dangerouslySetInnerHTML={{ __html: pageData.svgContent }}
          />
        ) : null}
      </div>

      {/* Bottom Quiet Footer */}
      <div
        className={`h-8 border-t px-6 flex items-center justify-between text-[11px] font-mono transition-colors ${
          readingTone === 'cream'
            ? 'bg-[#fffdf6] border-[#ffe9a9] text-[#645548]'
            : 'bg-[#211d19] border-[#362e27] text-[#ffe9a9]/70'
        }`}
      >
        <span className="truncate">Licensed to {user?.email || 'Authorized Student'}</span>
        <span className="hidden sm:inline">Protected under Indian Copyright Act 1957</span>
      </div>
    </div>
  );
};
