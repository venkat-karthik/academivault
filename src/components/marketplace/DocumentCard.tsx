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

  // Map colleges to distinct branded crest accents matching Mockup Screen 1
  const getCrestStyle = (collegeName: string) => {
    const lower = (collegeName || '').toLowerCase();
    if (lower.includes('bombay') || lower.includes('iit')) {
      return { bg: 'bg-[#1E3A8A]', text: 'text-white', border: 'border-[#1E3A8A]/30', initials: 'IITB' };
    }
    if (lower.includes('bits') || lower.includes('pilani')) {
      return { bg: 'bg-[#831843]', text: 'text-white', border: 'border-[#831843]/30', initials: 'BITS' };
    }
    if (lower.includes('delhi')) {
      return { bg: 'bg-[#581C87]', text: 'text-white', border: 'border-[#581C87]/30', initials: 'DU' };
    }
    if (lower.includes('anna')) {
      return { bg: 'bg-[#065F46]', text: 'text-white', border: 'border-[#065F46]/30', initials: 'AU' };
    }
    if (lower.includes('vtu')) {
      return { bg: 'bg-[#C2410C]', text: 'text-white', border: 'border-[#C2410C]/30', initials: 'VTU' };
    }
    if (lower.includes('trichy') || lower.includes('nit')) {
      return { bg: 'bg-[#0F766E]', text: 'text-white', border: 'border-[#0F766E]/30', initials: 'NITT' };
    }
    return { bg: 'bg-[#1C1917]', text: 'text-white', border: 'border-[#1C1917]/30', initials: 'UNIV' };
  };

  const crest = getCrestStyle(document.collegeName);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${document.title}`}
      onClick={() => onSelect(document)}
      onKeyDown={handleKeyDown}
      className="group bg-white rounded-2xl border border-[#E8E2D9] shadow-xs hover:shadow-md hover:border-[#D5CDC1] transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C06A28]"
    >
      <div>
        {/* Top Header Row matching Mockup: Crest, College Name & Date */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg ${crest.bg} ${crest.text} border ${crest.border} flex items-center justify-center font-mono font-bold text-[10px] tracking-wider shrink-0 shadow-xs`}>
              {crest.initials}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#1C1917] truncate">
                {document.collegeName}
              </h4>
              <p className="text-[10px] text-[#78716C] font-medium">
                January 2026 • Sem {document.semester}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="More options"
            className="text-[#A8A29E] hover:text-[#1C1917] p-1 -mr-1 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(document);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#1C1917] group-hover:text-[#C06A28] transition-colors leading-snug line-clamp-2 mb-1.5 font-sans">
          {document.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#57534E] line-clamp-2 mb-4 leading-relaxed">
          {document.description}
        </p>

        {/* Statistics Metric Badges (Mockup Style: 154+ Curated Packs • 9.8K Verified Notes) */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#EFECE6] mb-3 text-center">
          <div>
            <span className="block font-mono font-bold text-xs text-[#1C1917]">
              {document.pageCount}+
            </span>
            <span className="block text-[9px] text-[#78716C] font-medium uppercase tracking-wider">
              Pages
            </span>
          </div>
          <div>
            <span className="block font-mono font-bold text-xs text-[#1C1917]">
              ★ {document.rating}
            </span>
            <span className="block text-[9px] text-[#78716C] font-medium uppercase tracking-wider">
              Rigor
            </span>
          </div>
          <div>
            <span className="block font-mono font-bold text-xs text-[#C06A28]">
              {document.totalSales ? `${document.totalSales}+` : '9.8K'}
            </span>
            <span className="block text-[9px] text-[#78716C] font-medium uppercase tracking-wider">
              Verified
            </span>
          </div>
        </div>

        {/* Verified Faculty Audit Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200/80 mb-4 w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified Faculty Audit</span>
        </div>
      </div>

      <div>
        {/* Footer: Price & Preview / Unlock Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE3]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-mono font-extrabold text-[#1C1917]">
              ₹{document.price}
            </span>
            {document.originalPrice && (
              <span className="text-[11px] text-[#A8A29E] line-through font-mono">
                ₹{document.originalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs cursor-pointer"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1C1917] hover:bg-[#C06A28] text-white transition-all shadow-xs cursor-pointer"
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
