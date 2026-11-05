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
      className="group bg-white rounded-2xl border border-[#ffe9a9] hover:border-[#ea6510]/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer relative"
    >
      <div>
        {/* Unboxed Metadata Header */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#645548] mb-2 font-medium">
          <span className="font-semibold text-[#1e1915]">{document.collegeName}</span>
          <span aria-hidden="true" className="text-[#645548]/40">·</span>
          <span>{categoryLabels[document.category] || 'Notes'}</span>
          <span aria-hidden="true" className="text-[#645548]/40">·</span>
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
        <div className="text-[11px] text-[#645548] mb-3 pb-2.5 border-b border-[#ffe9a9] flex items-center justify-between">
          <span className="font-semibold text-[#1e1915]">{document.subjectName}</span>
          <span className="text-[#645548] font-mono text-[11px]">
            Semester {document.semester}
          </span>
        </div>

        {/* Professor Verification Tag */}
        {document.professorReviewStatus === 'verified_accurate' && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#2d6289] bg-[#73a5ca]/10 px-2.5 py-1 rounded-lg border border-[#73a5ca]/25 mb-3 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2d6289] shrink-0" />
            <span>Faculty Verified</span>
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
