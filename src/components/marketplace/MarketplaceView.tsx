import React, { useState, useEffect } from 'react';
import { AcademicDocument, College } from '../../types';
import { api } from '../../services/api';
import { DocumentCard } from './DocumentCard';
import { Search, ShieldCheck, BookOpen } from 'lucide-react';

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
      {/* Classic Scholarly Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#fffdf6] border border-[#ffe9a9] shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 relative z-10">
          {/* Left Column: Scholarly Headline, Metadata, Search */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ffe9a9]/60 border border-[#ffcb56] text-[#ea6510] text-[11px] font-bold tracking-wider uppercase">
              <BookOpen className="w-3.5 h-3.5 text-[#ea6510]" />
              <span>National Higher Education Repository</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1e1915] text-balance leading-tight">
              Curated Academic Courseware & Verified Notes
            </h1>

            <p className="text-xs sm:text-sm text-[#645548] leading-relaxed max-w-xl">
              Syllabus-aligned lecture notes, handwritten derivations, and solved university examination archives. Fully authenticated by accredited faculty auditors and accessible via protected reader mode.
            </p>

            {/* Classic Professional Search Bar */}
            <div className="relative max-w-xl pt-1">
              <Search className="absolute left-4 top-4.5 w-4 h-4 text-[#645548]/70 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course code, subject name, university, or author..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-[#1e1915] placeholder:text-[#645548]/50 border border-[#ffe9a9] focus:border-[#ea6510] focus:outline-none focus:ring-2 focus:ring-[#ea6510]/20 text-xs sm:text-sm font-medium transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right Column: Prestigious University Reading Hall */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#ffe9a9] shadow-sm">
              <img
                src="/src/assets/images/library_aesthetic_reading_1793904179717.jpg"
                alt="University academic reading hall"
                className="w-full h-56 sm:h-64 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1915]/85 via-[#1e1915]/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#ffe9a9] font-medium">
                  Autonomous & State University Schemes
                </span>
                <span className="text-xs font-semibold leading-relaxed text-white/90">
                  Protected under the Indian Copyright Act 1957.
                </span>
              </div>
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

      {/* Catalogue Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ffe9a9]">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm sm:text-base font-bold text-[#1e1915]">
            Accredited Course Catalog
          </h2>
          {!loading && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ffe9a9] text-[#ea6510] font-mono font-semibold border border-[#ffcb56]">
              {documents.length} verified {documents.length === 1 ? 'pack' : 'packs'}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#645548] hidden sm:block font-medium">
          DRM-Protected &amp; Watermarked
        </p>
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
