import React, { useState, useEffect } from 'react';
import { AcademicDocument, College } from '../../types';
import { api } from '../../services/api';
import { DocumentCard } from './DocumentCard';
import { CLOUDINARY_ASSETS } from '../../data/assets';
import {
  Search,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Award,
  GraduationCap,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Flame
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
    { id: 'all', label: 'All Curated Packs' },
    { id: 'handwritten_notes', label: 'Handwritten Derivations' },
    { id: 'digital_notes', label: 'Digital Courseware' },
    { id: 'question_banks', label: 'Solved PYQ Archives' },
    { id: 'exam_preparation_packs', label: 'Sprint Exam Packs' },
    { id: 'laboratory_records', label: 'Lab Manuals' },
    { id: 'complete_subject_materials', label: 'Full Semester Guides' }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fade-slide-up">
      {/* Avant-Garde Scholarly Hero Showcase */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fffdf6] via-[#fffbf0] to-[#fff3d6] border border-[#ffe9a9] shadow-sm">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-b from-[#ffcb56]/25 to-transparent rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-[#ea6510]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-12 relative z-10">
          {/* Left Column: Editorial Headline & Search */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffe9a9]/80 border border-[#ffcb56] text-[#ea6510] text-[11px] font-bold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#ea6510]" />
              <span>National Higher Education Repository</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1e1915] font-editorial leading-[1.08]">
              Curated Knowledge,{' '}
              <span className="italic font-normal text-[#ea6510]">Artfully</span> Preserved.
            </h1>

            <p className="text-xs sm:text-sm text-[#645548] leading-relaxed max-w-xl">
              Syllabus-aligned lecture archives, handwritten derivations, and university examination keys. Verified by accredited professors and licensed through single-device dynamic watermark reader mode.
            </p>

            {/* Interactive Search Bar */}
            <div className="relative max-w-xl pt-2">
              <Search className="absolute left-4.5 top-5.5 w-4 h-4 text-[#645548]/70 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject code, university, author, or topic (e.g. CS201, Thermodynamics)..."
                className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white text-[#1e1915] placeholder:text-[#645548]/60 border border-[#ffe9a9] focus:border-[#ea6510] focus:outline-none focus:ring-4 focus:ring-[#ea6510]/15 text-xs sm:text-sm font-medium transition-all shadow-xs"
              />
              <div className="absolute right-3.5 top-4 px-2.5 py-1 rounded-lg bg-[#ffe9a9]/70 text-[#645548] text-[10px] font-mono font-semibold pointer-events-none">
                Search
              </div>
            </div>

            {/* Trust Pill Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#645548] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>18+ Tier-1 Universities</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2d6289]" />
                <span>Single-Device DRM Sentinel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#ea6510]" />
                <span>Accredited Faculty Audited</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cloudinary High-Def Visual Showcase with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#ffe9a9] shadow-lg group">
              <img
                src={CLOUDINARY_ASSETS.libraryReading}
                alt="University academic library hall"
                className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1915]/85 via-[#1e1915]/30 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffe9a9] font-bold">
                  Autonomous & State Curricula
                </span>
                <span className="text-sm font-semibold leading-relaxed text-white/95 mt-1">
                  Honoring Student Authors under the Indian Copyright Act 1957.
                </span>
              </div>
            </div>

            {/* Floating Glassmorphism Badge */}
            <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md border border-[#ffe9a9] rounded-2xl p-3.5 shadow-xl flex items-center gap-3 animate-float-slow">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ea6510] to-[#ffcb56] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                ★ 4.9
              </div>
              <div>
                <p className="text-xs font-bold text-[#1e1915]">Verified Rigor Score</p>
                <p className="text-[10px] text-[#645548]">1,400+ Faculty Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all duration-200 shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-[#ea6510] text-white shadow-sm font-bold scale-[1.02]'
                  : 'bg-white hover:bg-[#ffe9a9]/60 text-[#645548] border border-[#ffe9a9]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Hierarchy Dropdowns Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-white/90 border border-[#ffe9a9] shadow-xs text-xs backdrop-blur-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-[#ea6510]" />
              <span>Institution</span>
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ea6510]"
            >
              <option value="all">All Institutions (National)</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#73a5ca]" />
              <span>Branch</span>
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ea6510]"
            >
              <option value="all">All Engineering Branches</option>
              <option value="Computer Science">Computer Science & Eng</option>
              <option value="Electronics">Electronics & Comm</option>
              <option value="Electrical">Electrical Engineering</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-600" />
              <span>Semester</span>
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ea6510]"
            >
              <option value="all">All Semesters (1 - 8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#645548] mb-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-purple-600" />
              <span>Sort Order</span>
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-[#ffe9a9] bg-[#fffdf6] text-[#1e1915] font-medium focus:outline-none focus:border-[#ea6510]"
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
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-bold transition-all text-xs ${
                professorVerifiedOnly
                  ? 'bg-[#2d6289] text-white border-[#2d6289] shadow-xs'
                  : 'bg-[#fffdf6] hover:bg-[#ffe9a9]/60 text-[#645548] border-[#ffe9a9]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalogue Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ffe9a9]">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-[#1e1915] font-editorial">
            Accredited Course Catalog
          </h2>
          {!loading && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ffe9a9] text-[#ea6510] font-mono font-bold border border-[#ffcb56]">
              {documents.length} verified {documents.length === 1 ? 'pack' : 'packs'}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#645548] hidden sm:block font-medium">
          Protected with Dynamic Watermark Reader
        </p>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-3xl bg-white/70 border border-[#ffe9a9] p-6 animate-pulse space-y-4"
            >
              <div className="h-3.5 bg-[#ffe9a9]/60 rounded w-1/3" />
              <div className="h-5 bg-[#ffcb56]/50 rounded w-3/4" />
              <div className="h-20 bg-[#ffe9a9]/40 rounded-2xl" />
              <div className="h-10 bg-[#ffcb56]/40 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 bg-white/90 rounded-3xl border border-[#ffe9a9] p-8 shadow-xs">
          <BookOpen className="w-12 h-12 text-[#645548]/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1e1915] font-editorial mb-1">
            No Academic Courseware Matched
          </h3>
          <p className="text-xs text-[#645548] mb-5 max-w-sm mx-auto">
            Try resetting your search query, university filter, or semester selector to view the complete catalog.
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
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#ea6510] text-white hover:bg-[#d45707] transition-all shadow-xs active:scale-95"
          >
            Reset All Filters
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
