import React, { useState, useEffect } from 'react';
import { AcademicDocument, College } from '../../types';
import { api } from '../../services/api';
import { DocumentCard } from './DocumentCard';
import { Search, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';

interface MarketplaceViewProps {
  onSelectDocument: (doc: AcademicDocument) => void;
  onReadDocument: (doc: AcademicDocument) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onSelectDocument,
  onReadDocument
}) => {
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [professorVerifiedOnly, setProfessorVerifiedOnly] = useState(false);
  const [sort, setSort] = useState('popular');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments({
        search: search.trim() || undefined,
        collegeId: selectedCollege !== 'all' ? selectedCollege : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        branch: selectedBranch !== 'all' ? selectedBranch : undefined,
        semester: selectedSemester !== 'all' ? selectedSemester : undefined,
        professorVerifiedOnly: professorVerifiedOnly ? true : undefined,
        sort
      });
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getColleges().then(setColleges).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocs();
    }, 150);
    return () => clearTimeout(timer);
  }, [
    search,
    selectedCollege,
    selectedCategory,
    selectedBranch,
    selectedSemester,
    professorVerifiedOnly,
    sort
  ]);

  const categories = [
    { id: 'all', label: 'All Materials' },
    { id: 'handwritten_notes', label: 'Handwritten Notes' },
    { id: 'digital_notes', label: 'Digital Notes' },
    { id: 'question_banks', label: 'Question Banks' },
    { id: 'exam_preparation_packs', label: 'Exam Packs' },
    { id: 'laboratory_records', label: 'Lab Manuals' },
    { id: 'complete_subject_materials', label: 'Complete Subjects' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-slide-up">
      {/* Warm Aesthetic Student Hero with Cozy Desk Image */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ffe9a9]/50 via-[#fffdf6] to-[#ffcb56]/20 border border-[#ffe9a9] shadow-xs">
        {/* Soft background ambient gradient bubbles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-bl from-[#ff933e]/25 to-[#ffcb56]/25 blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#73a5ca]/15 blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 relative z-10">
          {/* Left Column: Headline, Copy, Search */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffe9a9] border border-[#ffcb56] text-[#ea6510] text-[11px] font-bold tracking-wide uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#ea6510]" />
              <span>Cozy Study Space & Verified Notes</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1e1915] text-balance leading-tight">
              Curated College Notes for Peaceful Learning.
            </h1>

            <p className="text-xs sm:text-sm text-[#645548] leading-relaxed max-w-xl">
              Syllabus-aligned study materials prepared by university toppers and evaluated by accredited professors. Read comfortably on our warm, eye-friendly protected viewer.
            </p>

            {/* Search Input with Warm Glow */}
            <div className="relative max-w-lg group pt-1">
              <Search className="absolute left-4 top-4.5 w-4 h-4 text-[#ea6510]/70 group-focus-within:text-[#ea6510] transition-colors pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by subject, title, university, or professor..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/95 text-[#1e1915] placeholder:text-[#645548]/50 border border-[#ffe9a9] focus:border-[#ff933e] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#ff933e]/30 text-xs sm:text-sm font-medium transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Right Column: Cozy Study Desk Atmosphere Picture */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-3xl overflow-hidden border border-[#ffe9a9] shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src="/src/assets/images/hero_cozy_study_desk_1793904180995.jpg"
                alt="Cozy student study desk with notes, warm lamp, and warm cup of coffee"
                className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-103 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1915]/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#ffe9a9] font-semibold">
                  Study Sanctuary
                </span>
                <span className="text-sm font-bold leading-snug">
                  Calm minds absorb deeper concepts.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Part Campus Vibe Showcase Strip */}
        <div className="border-t border-[#ffe9a9]/80 bg-white/60 backdrop-blur-xs p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white/80 transition-colors">
            <img
              src="/src/assets/images/library_aesthetic_reading_1793904179717.jpg"
              alt="Silent library reading hall"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#ffe9a9] shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs font-bold text-[#1e1915] block leading-tight">
                Quiet Library Halls
              </span>
              <span className="text-[11px] text-[#645548] line-clamp-1">
                Natural sunlight & silent focus
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white/80 transition-colors">
            <img
              src="/src/assets/images/study_essentials_flatlay_1793904181267.jpg"
              alt="Study stationery and color coded notes"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#ffe9a9] shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs font-bold text-[#1e1915] block leading-tight">
                Color-Coded Mastery
              </span>
              <span className="text-[11px] text-[#645548] line-clamp-1">
                Engineering formulas & diagrams
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white/80 transition-colors">
            <img
              src="/src/assets/images/academic_campus_quad_1793904181259.jpg"
              alt="Collegiate campus quad"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#ffe9a9] shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs font-bold text-[#1e1915] block leading-tight">
                Peer Review Network
              </span>
              <span className="text-[11px] text-[#645548] line-clamp-1">
                Verified by accredited professors
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="space-y-4">
        {/* Category Segmented Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-150 shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-[#ffcb56] text-[#1e1915] border border-[#ff933e] shadow-xs font-bold scale-102'
                  : 'bg-white/80 hover:bg-[#ffe9a9]/60 text-[#645548] border border-[#ffe9a9]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Hierarchy Dropdowns Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-2xl bg-white/90 border border-[#ffe9a9] shadow-xs text-xs backdrop-blur-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1">Institution</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ff933e]"
            >
              <option value="all">All Institutions</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ff933e]"
            >
              <option value="all">All Branches</option>
              <option value="Computer Science">Computer Science & Eng</option>
              <option value="Electronics">Electronics & Comm</option>
              <option value="Electrical">Electrical Engineering</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ff933e]"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1">Sort Order</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ff933e]"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={() => setProfessorVerifiedOnly((v) => !v)}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all text-xs ${
                professorVerifiedOnly
                  ? 'bg-[#73a5ca] text-white border-[#73a5ca] shadow-xs'
                  : 'bg-[#fffdf6] hover:bg-[#ffe9a9]/60 text-[#645548] border-[#ffe9a9]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2d6289] group-hover:text-white" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-68 rounded-2xl bg-white/70 border border-[#ffe9a9] p-5 animate-pulse space-y-3"
            >
              <div className="h-3 bg-[#ffe9a9]/60 rounded w-1/3" />
              <div className="h-5 bg-[#ffcb56]/50 rounded w-3/4" />
              <div className="h-16 bg-[#ffe9a9]/40 rounded-xl" />
              <div className="h-8 bg-[#ffcb56]/40 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-white/90 rounded-3xl border border-[#ffe9a9] p-8 shadow-xs">
          <BookOpen className="w-10 h-10 text-[#645548]/40 mx-auto mb-2.5" />
          <h3 className="text-base font-bold text-[#1e1915] mb-1">No Academic Documents Found</h3>
          <p className="text-xs text-[#645548] mb-4">
            Try adjusting your search query, university filter, or category.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCollege('all');
              setSelectedCategory('all');
              setSelectedBranch('all');
              setSelectedSemester('all');
              setProfessorVerifiedOnly(false);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#ea6510] text-white hover:bg-[#d45707] transition-all shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={onSelectDocument}
              onRead={onReadDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
};
