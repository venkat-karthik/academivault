import React, { useState } from 'react';
import { INITIAL_COLLEGES } from '../../data/mockData';
import { Search, ShieldCheck, CheckCircle2, TrendingUp, Users, ArrowRight } from 'lucide-react';

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

  const topContributors = [
    { name: 'Saroli Tain', role: 'Contributor', notes: 154, initials: 'ST' },
    { name: 'Samethan', role: 'Contributor', notes: 131, initials: 'SM' },
    { name: 'Naveen M', role: 'Contributor', notes: 101, initials: 'NM' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 animate-fade-slide-up">
      {/* Title & Description Header (Screen 2 Mockup) */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] font-editorial tracking-tight">
          Explore Institutions & Universities
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Access peer-reviewed syllabus guides and archive packs from accredited Tier-1 universities.
        </p>
      </div>

      {/* Institution Search Filter Bar */}
      <div className="max-w-xl">
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Institution Filter
        </label>
        <div className="relative flex items-center h-11 rounded-xl bg-white border border-gray-300 shadow-xs focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#D97706]/15">
          <Search className="w-4 h-4 text-gray-400 ml-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Institution Filters..."
            className="w-full h-full pl-2.5 pr-20 text-xs text-[#111827] placeholder:text-gray-400 bg-transparent focus:outline-none"
          />
          <button
            type="button"
            className="absolute right-1.5 px-3 py-1 bg-[#111827] hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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
              const initials = col.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={col.id}
                  onClick={() => onSelectCollege(col.id)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 p-4 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header: Crest & Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-mono font-bold text-xs text-[#111827] shrink-0 group-hover:bg-[#FEF3C7] group-hover:text-[#D97706] transition-colors">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#111827] truncate group-hover:text-[#D97706] transition-colors">
                          {col.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {col.city}, {col.state}
                        </p>
                      </div>
                    </div>

                    {/* Stats Metric (Mockup: 154+ Curated Packs • 9.8K Verified Notes) */}
                    <div className="flex items-center justify-around py-2 px-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-3 text-center">
                      <div>
                        <span className="block font-mono font-bold text-xs text-[#111827]">
                          154+
                        </span>
                        <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                          Curated Packs
                        </span>
                      </div>
                      <div className="w-px h-6 bg-gray-200" />
                      <div>
                        <span className="block font-mono font-bold text-xs text-[#111827]">
                          9.8K
                        </span>
                        <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                          Verified Notes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Faculty Audit Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Faculty Audit</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#D97706] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar (4 cols): Contributors & Activity (Screen 2 Mockup) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Top Resource Contributors Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Top Resource Contributors</span>
              </h3>
            </div>

            <div className="space-y-3">
              {topContributors.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-[10px] text-gray-700">
                      {c.initials}
                    </div>
                    <div>
                      <p className="font-bold text-[#111827]">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[11px] text-[#111827] block">
                      {c.notes}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-medium">Notes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Submissions Activity Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Submissions</span>
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-[#111827]">Direct Derivations</p>
                  <p className="text-[10px] text-gray-400">Autonomous Scheme 2026</p>
                </div>
                <span className="font-mono text-[10px] font-bold text-gray-600">63,054 Total</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div>
                  <p className="font-semibold text-[#111827]">Faculty Rigor Evals</p>
                  <p className="text-[10px] text-gray-400">Active Peer Reviews</p>
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-600">99.4% Accurate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
