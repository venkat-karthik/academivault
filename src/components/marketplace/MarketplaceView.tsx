import React, { useState, useEffect, useRef } from 'react';
import { AcademicDocument, College } from '../../types';
import { api } from '../../services/api';
import { DocumentCard } from './DocumentCard';
import { CLOUDINARY_ASSETS } from '../../data/assets';
import {
  Search,
  ShieldCheck,
  BookOpen,
  Award,
  GraduationCap,
  Sparkles,
  Command
} from 'lucide-react';

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
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Global keyboard shortcut (⌘K or /) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = [
    { id: 'all', label: 'All Curated Packs' },
    { id: 'handwritten_notes', label: 'Handwritten Derivations' },
    { id: 'digital_notes', label: 'Digital Courseware' },
    { id: 'question_banks', label: 'Solved PYQ Archives' },
    { id: 'exam_preparation_packs', label: 'Sprint Exam Packs' },
    { id: 'complete_subject_materials', label: 'Full Semester Guides' },
    { id: 'laboratory_records', label: 'Lab Manuals' }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16 animate-fade-slide-up">
      {/* 4. Enclosed Rounded Ivory Hero Card (Exact Match to Mockup Screen 1) */}
      <section className="bg-[#F7F2E9] border border-[#EADBCC] rounded-3xl p-7 sm:p-11 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (7 cols): Editorial Typography, Description & Command Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FDF3D8] border border-[#F6E2B2] text-[#B45309] text-[11px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse" />
              <span>National Higher Education Repository</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#1C1917] font-editorial leading-[1.08]">
              Curated Knowledge,{' '}
              <span className="italic font-normal text-[#C06A28]">Artfully</span> Preserved.
            </h1>

            <p className="text-sm sm:text-[15px] text-[#57534E] leading-relaxed max-w-xl">
              Syllabus-aligned lecture archives, handwritten derivations, and university examination keys. Verified by accredited professors and licensed through single-device dynamic watermark reader mode.
            </p>

            {/* Command-Style Search Bar */}
            <div className="relative max-w-xl">
              <div className="relative flex items-center h-13 rounded-xl sm:rounded-2xl bg-white border border-[#DDD5C7] shadow-xs focus-within:border-[#C06A28] focus-within:ring-3 focus-within:ring-[#C06A28]/15 transition-all">
                <Search className="w-4.5 h-4.5 text-[#9C948A] ml-4 shrink-0 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject code, university, author, or topic (e.g. CS201, Thermodynamics)..."
                  className="w-full h-full pl-3 pr-28 text-sm text-[#1C1917] placeholder:text-[#9C948A] bg-transparent focus:outline-none"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-[#78716C] border border-[#E5DFD4] bg-[#FAF8F5]">
                    <Command className="w-2.5 h-2.5" /> K
                  </span>
                  <button
                    type="button"
                    onClick={fetchDocs}
                    className="px-3.5 py-1.5 bg-[#F5F0E8] hover:bg-[#ECE5D8] text-[#3E3831] border border-[#DDD5C7] text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Strip */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-[#57534E] font-medium">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#C06A28]" />
                <span>18+ Tier-1 Universities</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Single-Device DRM Sentinel</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Accredited Faculty Audited</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Library Photograph & Fixed Non-colliding Badge */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#DDD5C7] shadow-sm bg-gray-100 group">
              <img
                src={CLOUDINARY_ASSETS.libraryReading}
                alt="University academic reading hall"
                className="w-full h-64 sm:h-76 object-cover object-center group-hover:scale-103 transition-transform duration-500 no-drag"
                referrerPolicy="no-referrer"
              />

              {/* Clean Floating Badge (Bottom-Left corner of image with zero text collision) */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-[#E5DFD4] rounded-xl px-3.5 py-2 shadow-sm flex items-center gap-2.5 pointer-events-none">
                <span className="text-[#C06A28] text-xs font-black">★ 4.9</span>
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-[#1C1917]">Verified Rigor Score</p>
                  <p className="text-[#78716C] text-[10px]">1,400+ Faculty Reviews</p>
                </div>
              </div>
            </div>

            {/* Clean Caption Bar Below Image */}
            <div className="mt-2.5 text-center sm:text-left">
              <p className="text-[11px] text-[#78716C] font-medium">
                Autonomous & State Curricula • Honoring Student Authors under the Indian Copyright Act
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Streamlined Discovery & Filter Bar */}
      <section className="space-y-3 pt-2">
        {/* Top Row: Horizontal Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white hover:bg-[#FAF8F5] text-[#57534E] border border-[#E8E2D9]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Bottom Row: Compact Inline Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Institution Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5]/80">
              <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Institution:</span>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
              >
                <option value="all">All Institutions (National)</option>
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5]/80">
              <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Branch:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
              >
                <option value="all">All Engineering Branches</option>
                <option value="Computer Science">Computer Science & Eng</option>
                <option value="Electronics">Electronics & Comm</option>
                <option value="Electrical">Electrical Engineering</option>
                <option value="Mechanical">Mechanical Engineering</option>
              </select>
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5]/80">
              <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
              >
                <option value="all">All Semesters (1-8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {/* Sort Order Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5]/80">
              <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Verified Only Switch with Animated Pill Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={professorVerifiedOnly}
            onClick={() => setProfessorVerifiedOnly((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] transition-all cursor-pointer"
          >
            <ShieldCheck className={`w-4 h-4 ${professorVerifiedOnly ? 'text-emerald-600' : 'text-[#78716C]'}`} />
            <span className="text-xs font-semibold text-[#1C1917]">Verified Only</span>
            <div
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center ${
                professorVerifiedOnly ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                  professorVerifiedOnly ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>
      </section>

      {/* 6. Study Notes Grid (Below the Fold) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
              Accredited Notes Catalog
            </h2>
            {!loading && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono font-medium">
                {documents.length} {documents.length === 1 ? 'pack' : 'packs'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            DRM Protected • Dynamic Forensics
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-white border border-gray-200 p-5 animate-pulse space-y-3"
              >
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-16 bg-gray-50 rounded" />
                <div className="h-8 bg-gray-100 rounded mt-auto" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#111827] mb-1">
              No matching study packs found
            </h3>
            <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto">
              Try adjusting your search query, university filter, or semester selector.
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
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#111827] text-white hover:bg-gray-800 transition-all cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      </section>
    </div>
  );
};
