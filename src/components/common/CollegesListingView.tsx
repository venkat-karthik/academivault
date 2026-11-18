import React, { useState } from 'react';
import { INITIAL_COLLEGES } from '../../data/mockData';
import { Search, ShieldCheck, TrendingUp, Users, ArrowRight } from 'lucide-react';

interface CollegesListingViewProps {
  onSelectCollege: (collegeId: string) => void;
}

export const CollegesListingView: React.FC<CollegesListingViewProps> = ({ onSelectCollege }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredColleges = INITIAL_COLLEGES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const topContributors = [
    { name: 'Saroli Tain', role: 'Contributor', notes: 154, initials: 'ST', color: 'bg-emerald-600' },
    { name: 'Samantha', role: 'Contributor', notes: 131, initials: 'SM', color: 'bg-amber-600' },
    { name: 'Naveen M', role: 'Contributor', notes: 101, initials: 'NM', color: 'bg-indigo-600' }
  ];

  const activeSubmissions = [
    { name: 'Decel Sadlier', role: 'Active Submissions', count: '63,054 Total', initials: 'DS', color: 'bg-teal-600' },
    { name: 'Vinay Paramar', role: 'Active Submissions', count: '48,190 Total', initials: 'VP', color: 'bg-purple-600' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 animate-fade-slide-up">
      {/* Title & Description Header (Exact Match to Mockup Screen 2) */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] font-editorial tracking-tight">
          Explore Institutions & Universities
        </h1>
        <p className="text-sm text-[#57534E] max-w-2xl">
          Access peer-reviewed syllabus guides and archive packs from accredited Tier-1 universities.
        </p>
      </div>

      {/* Institution Search Filter Bar */}
      <div className="max-w-xl">
        <label className="block text-[11px] font-mono font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
          Institution Filter
        </label>
        <div className="relative flex items-center h-11 rounded-xl bg-white border border-[#DDD5C7] shadow-xs focus-within:border-[#C06A28] focus-within:ring-2 focus-within:ring-[#C06A28]/15">
          <Search className="w-4 h-4 text-[#9C948A] ml-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Institution Filters..."
            className="w-full h-full pl-2.5 pr-20 text-xs text-[#1C1917] placeholder:text-[#9C948A] bg-transparent focus:outline-none"
          />
          <button
            type="button"
            className="absolute right-1.5 px-3 py-1 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Grid: Left Institutions + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Institutions Cards Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredColleges.map((col) => {
              const crest = getCrestStyle(col.name);

              return (
                <div
                  key={col.id}
                  onClick={() => onSelectCollege(col.id)}
                  className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs hover:shadow-md hover:border-[#D5CDC1] transition-all duration-200 p-4.5 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header: Crest & Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${crest.bg} ${crest.text} border ${crest.border} flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs`}>
                        {crest.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#1C1917] truncate group-hover:text-[#C06A28] transition-colors">
                          {col.name}
                        </h3>
                        <p className="text-[10px] text-[#78716C] font-medium">
                          {col.city}, {col.state}
                        </p>
                      </div>
                    </div>

                    {/* Stats Metric (Mockup: 154+ Curated Packs • 9.8K Verified Notes) */}
                    <div className="flex items-center justify-around py-2 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFECE6] mb-3 text-center">
                      <div>
                        <span className="block font-mono font-bold text-xs text-[#1C1917]">
                          154+
                        </span>
                        <span className="block text-[9px] text-[#78716C] font-medium uppercase tracking-wider">
                          Curated Packs
                        </span>
                      </div>
                      <div className="w-px h-6 bg-[#E8E2D9]" />
                      <div>
                        <span className="block font-mono font-bold text-xs text-[#1C1917]">
                          9.8K
                        </span>
                        <span className="block text-[9px] text-[#78716C] font-medium uppercase tracking-wider">
                          Verified Notes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Faculty Audit Badge */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#F0EBE3]">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Faculty Audit</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#A8A29E] group-hover:text-[#C06A28] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar (4 cols): Contributors & Activity (Exact Match to Mockup Screen 2) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Top Resource Contributors Card */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C06A28]" />
                <span>Top Resource Contributors</span>
              </h3>
            </div>

            <div className="space-y-3.5">
              {topContributors.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${c.color} text-white flex items-center justify-center font-bold text-[11px] shadow-xs`}>
                      {c.initials}
                    </div>
                    <div>
                      <p className="font-bold text-[#1C1917]">{c.name}</p>
                      <p className="text-[10px] text-[#78716C]">{c.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {/* Mini SVG green sparkline graph matching mockup */}
                    <svg className="w-10 h-4 text-emerald-500 shrink-0" viewBox="0 0 40 16" fill="none">
                      <path d="M2 14L12 8L20 11L30 3L38 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[11px] text-[#1C1917] block">
                        {c.notes}
                      </span>
                      <span className="text-[9px] text-[#78716C] font-medium">Notes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Submissions Activity Card */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Submissions</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {activeSubmissions.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-[#F0EBE3] last:border-b-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full ${s.color} text-white flex items-center justify-center font-bold text-[10px]`}>
                      {s.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1C1917]">{s.name}</p>
                      <p className="text-[10px] text-[#78716C]">{s.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-8 h-3 text-emerald-500" viewBox="0 0 32 12" fill="none">
                      <path d="M2 10L10 6L18 8L30 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono text-[10px] font-bold text-[#1C1917]">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
