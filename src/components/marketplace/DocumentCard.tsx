import React from 'react';
import { AcademicDocument } from '../../types';
import { Star, ShieldCheck, CheckCircle, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';

interface DocumentCardProps {
  document: AcademicDocument;
  onSelect: (doc: AcademicDocument) => void;
  onRead: (doc: AcademicDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect, onRead }) => {
  const categoryLabels: Record<string, string> = {
    handwritten_notes: 'Handwritten Derivations',
    digital_notes: 'Digital Courseware',
    question_banks: 'Solved PYQ Archive',
    previous_question_papers: 'PYQ Papers',
    assignments: 'Assignments',
    laboratory_records: 'Lab Manual',
    practical_manuals: 'Practical Manual',
    projects_and_reports: 'Project Report',
    exam_preparation_packs: 'Sprint Exam Pack',
    complete_subject_materials: 'Complete Subject'
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(document);
    }
  };

  const discountPercent = document.originalPrice
    ? Math.round(((document.originalPrice - document.price) / document.originalPrice) * 100)
    : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${document.title}`}
      onClick={() => onSelect(document)}
      onKeyDown={handleKeyDown}
      className="group bg-white rounded-3xl border border-[#ffe9a9] hover:border-[#ea6510]/50 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea6510]"
    >
      {/* Top Subtle Amber Corner Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#ffcb56]/15 to-transparent rounded-bl-full pointer-events-none group-hover:from-[#ea6510]/20 transition-all duration-300" />

      <div>
        {/* Category & College Pill Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ffe9a9]/70 text-[#ea6510] border border-[#ffcb56]/60">
            {categoryLabels[document.category] || 'Academic Notes'}
          </span>

          <span className="text-[11px] font-mono text-[#645548] tabular-nums font-semibold">
            {document.pageCount} Pages
          </span>
        </div>

        {/* Institution wordmark */}
        <div className="text-[11px] font-semibold text-[#645548] mb-1 truncate">
          {document.collegeName}
        </div>

        {/* Document Title */}
        <h3 className="text-base font-bold text-[#1e1915] group-hover:text-[#ea6510] transition-colors leading-snug line-clamp-2 mb-2 font-editorial">
          {document.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#645548] line-clamp-2 mb-4 leading-relaxed">
          {document.description}
        </p>

        {/* Subject & Semester Strip */}
        <div className="text-[11px] text-[#645548] mb-3.5 pb-3 border-b border-[#ffe9a9] flex items-center justify-between">
          <span className="font-semibold text-[#1e1915] truncate max-w-[170px]">
            {document.subjectName}
          </span>
          <span className="text-[#645548] font-mono text-[10px] uppercase tracking-wider bg-[#fffdf6] px-2 py-0.5 rounded border border-[#ffe9a9]">
            Sem {document.semester}
          </span>
        </div>

        {/* Professor Verification Tag */}
        {document.professorReviewStatus === 'verified_accurate' && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#2d6289] bg-[#73a5ca]/10 px-2.5 py-1.5 rounded-xl border border-[#73a5ca]/25 mb-4 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2d6289] shrink-0" />
            <span>Faculty Verified</span>
            <span className="text-[#73a5ca]">·</span>
            <span className="tabular-nums font-mono">{document.professorVerifiedScore}/100 Rigor</span>
          </div>
        )}
      </div>

      <div>
        {/* Author & Rating */}
        <div className="flex items-center justify-between text-xs text-[#645548] mb-3.5 pt-1">
          <span className="truncate max-w-[160px] text-[11px] font-medium">
            By {document.contributorName}
          </span>

          <div className="flex items-center gap-1 shrink-0 font-bold text-[#1e1915] text-xs">
            <Star className="w-3.5 h-3.5 fill-[#ffcb56] text-[#ff933e]" />
            <span className="tabular-nums font-mono">{document.rating}</span>
            <span className="text-[#645548]/70 text-[10px]">({document.ratingCount})</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-3.5 border-t border-[#ffe9a9]">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#1e1915] tabular-nums font-mono">
              ₹{document.price}
            </span>
            {document.originalPrice && (
              <span className="text-xs text-[#645548]/50 line-through tabular-nums font-mono">
                ₹{document.originalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {document.hasPurchased ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(document);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-xs active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Read (Owned)</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(document);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white transition-all shadow-xs hover:shadow-md active:scale-95 group-hover:bg-[#d45707]"
            >
              <span>License</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
