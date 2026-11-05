import React from 'react';
import { INITIAL_COLLEGES } from '../../data/mockData';
import { GraduationCap, MapPin, ArrowRight, Building } from 'lucide-react';

interface CollegesListingViewProps {
  onSelectCollege: (collegeId: string) => void;
}

export const CollegesListingView: React.FC<CollegesListingViewProps> = ({ onSelectCollege }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-slide-up">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fffdf6] via-[#ffe9a9]/25 to-[#73a5ca]/10 border border-[#ffe9a9] shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 sm:p-10 relative z-10">
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe9a9] border border-[#ffcb56] text-[#ea6510] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <GraduationCap className="w-4 h-4 text-[#ea6510]" />
              <span>Institutions Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1915] tracking-tight leading-tight">
              Universities & Engineering Colleges
            </h1>
            <p className="text-xs sm:text-sm text-[#645548] leading-relaxed max-w-xl">
              Browse syllabus-mapped notes, lab records, and solved question banks categorized by autonomous university schemes, IITs, NITs, and state technical universities.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#ffe9a9] shadow-sm group">
              <img
                src="/src/assets/images/academic_campus_quad_1793904181259.jpg"
                alt="University campus quad with students studying on benches"
                className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1915]/80 via-transparent to-transparent flex items-end p-3.5 text-white">
                <span className="text-xs font-semibold">Over 1,400+ Verified Campus Modules</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_COLLEGES.map((col) => (
          <div
            key={col.id}
            onClick={() => onSelectCollege(col.id)}
            className="p-6 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] hover:border-[#ff933e] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#645548] mb-2 font-medium">
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#ea6510]" />
                  <span>{col.city}, {col.state}</span>
                </span>
                <span className="font-bold text-[#2d6289] bg-[#73a5ca]/15 px-2.5 py-0.5 rounded-full border border-[#73a5ca]/30">
                  {col.type}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1e1915] mb-1.5 hover:text-[#ea6510] transition-colors">{col.name}</h3>
              <p className="text-xs text-[#645548] mb-4">{col.universityName}</p>

              <div className="text-xs space-y-1">
                <span className="text-[#645548]/80 font-bold block text-[11px]">Covered Engineering Branches:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {col.branches.map((b) => (
                    <span
                      key={b}
                      className="text-[11px] bg-[#ffe9a9]/30 text-[#1e1915] px-2.5 py-1 rounded-lg border border-[#ffe9a9] font-medium"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#ffe9a9] flex items-center justify-between text-xs">
              <span className="font-bold text-[#ea6510] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Browse Notes for {col.code}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-[#645548]/70 text-[11px]">Curriculum 2024–26</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
