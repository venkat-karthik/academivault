import React from 'react';
import { AcademicDocument } from '../../types';
import { ShieldCheck, CheckCircle, ArrowUpRight, MoreVertical, GraduationCap } from 'lucide-react';

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

  // Generate clean initials for college crest
  const collegeInitials = document.collegeName
    ? document.collegeName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 3)
        .join('')
        .toUpperCase()
    : 'IIT';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${document.title}`}
      onClick={() => onSelect(document)}
      onKeyDown={handleKeyDown}
      className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D97706]"
    >
      <div>
        {/* Top Header Row matching Mockup: Crest, College Name & Date */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-mono font-bold text-[11px] text-[#111827] shrink-0">
              {collegeInitials}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#111827] truncate">
                {document.collegeName}
              </h4>
              <p className="text-[10px] text-gray-400 font-medium">
                January 2026 • Sem {document.semester}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="More options"
            className="text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(document);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#111827] group-hover:text-[#D97706] transition-colors leading-snug line-clamp-2 mb-1.5">
          {document.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {document.description}
        </p>

        {/* Statistics Metric Badges (Mockup Style: 154+ Curated Packs • 9.8K Verified Notes) */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-gray-50/70 border border-gray-100 mb-3 text-center">
          <div>
            <span className="block font-mono font-bold text-xs text-[#111827]">
              {document.pageCount}+
            </span>
            <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider">
              Pages
            </span>
          </div>
          <div>
            <span className="block font-mono font-bold text-xs text-[#111827]">
              ★ {document.rating}
            </span>
            <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider">
              Rating
            </span>
          </div>
          <div>
            <span className="block font-mono font-bold text-xs text-[#D97706]">
              {document.totalSales ? `${document.totalSales}+` : '9.8K'}
            </span>
            <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider">
              Notes
            </span>
          </div>
        </div>

        {/* Verified Faculty Audit Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100 mb-4 w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified Faculty Audit</span>
        </div>
      </div>

      <div>
        {/* Footer: Price & Preview / Unlock Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-mono font-extrabold text-[#111827]">
              ₹{document.price}
            </span>
            {document.originalPrice && (
              <span className="text-[11px] text-gray-400 line-through font-mono">
                ₹{document.originalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#111827] hover:bg-gray-800 text-white transition-all shadow-xs cursor-pointer group-hover:bg-[#D97706]"
            >
              <span>Preview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
