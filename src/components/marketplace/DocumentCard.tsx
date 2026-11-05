import React from 'react';
import { AcademicDocument } from '../../types';
import { Star, ShieldCheck, CheckCircle, ArrowUpRight, BookOpen } from 'lucide-react';

interface DocumentCardProps {
  document: AcademicDocument;
  onSelect: (doc: AcademicDocument) => void;
  onRead: (doc: AcademicDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect, onRead }) => {
  const categoryLabels: Record<string, string> = {
    handwritten_notes: 'Handwritten Notes',
    digital_notes: 'Digital Notes',
    question_banks: 'Solved Question Bank',
    previous_question_papers: 'PYQ Papers',
    assignments: 'Assignments',
    laboratory_records: 'Lab Manual',
    practical_manuals: 'Practical Manual',
    projects_and_reports: 'Project Report',
    exam_preparation_packs: 'Exam Prep Pack',
    complete_subject_materials: 'Complete Subject'
  };

  return (
    <div
      onClick={() => onSelect(document)}
      className="group bg-white/95 rounded-2xl border border-[#ffe9a9] hover:border-[#ff933e] shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top subtle decorative color accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff933e] via-[#ffcb56] to-[#73a5ca] opacity-70 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Unboxed Metadata Header */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#645548] mb-2.5 font-semibold">
          <span>{document.collegeName}</span>
          <span aria-hidden="true" className="text-[#ffcb56]">·</span>
          <span>{categoryLabels[document.category] || 'Notes'}</span>
          <span aria-hidden="true" className="text-[#ffcb56]">·</span>
          <span className="tabular-nums font-mono">{document.pageCount} Pages</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#1e1915] group-hover:text-[#ea6510] transition-colors leading-snug line-clamp-2 mb-2">
          {document.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#645548] line-clamp-2 mb-3.5 leading-relaxed">
          {document.description}
        </p>

        {/* Subject & Semester Strip */}
        <div className="text-[11px] text-[#645548] mb-3.5 pb-2.5 border-b border-[#ffe9a9]/80 flex items-center justify-between">
          <span className="font-semibold text-[#1e1915]">{document.subjectName}</span>
          <span className="text-[#1e1915] font-medium bg-[#ffe9a9] px-2 py-0.5 rounded-md border border-[#ffcb56]/60">
            Sem {document.semester}
          </span>
        </div>

        {/* Professor Verification Tag */}
        {document.professorReviewStatus === 'verified_accurate' && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#2d6289] bg-[#73a5ca]/15 px-2.5 py-1 rounded-xl border border-[#73a5ca]/40 mb-3.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2d6289] shrink-0" />
            <span>Verified Academic Audit</span>
            <span className="text-[#73a5ca]">·</span>
            <span className="tabular-nums font-mono">{document.professorVerifiedScore}/100</span>
          </div>
        )}
      </div>

      <div>
        {/* Author & Rating */}
        <div className="flex items-center justify-between text-xs text-[#645548] mb-3 pt-1">
          <span className="truncate max-w-[170px] text-[11px] font-medium">
            By {document.contributorName}
          </span>

          <div className="flex items-center gap-1 shrink-0 font-bold text-[#1e1915] text-xs">
            <Star className="w-3.5 h-3.5 fill-[#ffcb56] text-[#ff933e]" />
            <span className="tabular-nums font-mono">{document.rating}</span>
            <span className="text-[#645548]/70 text-[10px]">({document.ratingCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-[#ffe9a9]/80">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#1e1915] tabular-nums font-mono">
              ₹{document.price}
            </span>
            {document.originalPrice && (
              <span className="text-xs text-[#645548]/50 line-through tabular-nums font-mono">
                ₹{document.originalPrice}
              </span>
            )}
          </div>

          {document.hasPurchased ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(document);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-2xs hover:shadow-xs active:scale-95"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white transition-all shadow-2xs hover:shadow-xs active:scale-95"
            >
              <span>Preview</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
