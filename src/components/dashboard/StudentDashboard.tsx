import React, { useState, useEffect } from 'react';
import { AcademicDocument, PurchaseRecord } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CLOUDINARY_ASSETS } from '../../data/assets';
import {
  BookOpen,
  Star,
  CheckCircle,
  Clock,
  Shield,
  Laptop,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenReader: (doc: AcademicDocument) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenReader }) => {
  const { user, session, logout } = useAuth();
  const [purchases, setPurchases] = useState<(AcademicDocument & { purchaseRecord: PurchaseRecord })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocForReview, setSelectedDocForReview] = useState<AcademicDocument | null>(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [contentAccuracy, setContentAccuracy] = useState(5);
  const [explanationQuality, setExplanationQuality] = useState(5);
  const [readability, setReadability] = useState(5);
  const [syllabusCoverage, setSyllabusCoverage] = useState(5);
  const [examUsefulness, setExamUsefulness] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    api
      .getStudentPurchases()
      .then(setPurchases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForReview) return;
    setReviewSubmitting(true);
    setReviewError('');

    try {
      await api.submitStudentReview({
        documentId: selectedDocForReview.id,
        rating,
        contentAccuracyRating: contentAccuracy,
        explanationQualityRating: explanationQuality,
        readabilityRating: readability,
        syllabusCoverageRating: syllabusCoverage,
        examUsefulnessRating: examUsefulness,
        reviewText
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setSelectedDocForReview(null);
        setReviewSuccess(false);
        setReviewText('');
      }, 2000);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 animate-fade-slide-up">
      {/* Student Profile Header with Study Vibe Visual */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E8E2D9] shadow-xs flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <img
            src={CLOUDINARY_ASSETS.studyFlatlay}
            alt="Student study notebook and coffee flatlay"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#E8E2D9] shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-[11px] font-mono font-bold text-[#C06A28] uppercase tracking-wider block mb-0.5">
              Student Personal Vault
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-editorial tracking-tight">{user?.name}</h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {user?.collegeName} · {user?.branch} · Semester {user?.semester}
            </p>
          </div>
        </div>

        <div className="bg-[#FDF3D8] border border-[#F6E2B2] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-[#B45309]">
          <Shield className="w-3.5 h-3.5 text-[#C06A28]" />
          <span>Active Device Protected</span>
        </div>
      </div>

      {/* Purchased Materials List */}
      <div>
        <h3 className="text-lg font-bold text-[#1C1917] mb-4 flex items-center gap-2 font-editorial">
          <BookOpen className="w-5 h-5 text-[#C06A28]" />
          <span>My Purchased Documents &amp; Licensed Access</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-[#A8A29E] text-xs font-mono">Loading purchased vault library...</div>
        ) : purchases.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-[#E8E2D9] shadow-xs">
            <p className="text-sm font-semibold text-[#1C1917] mb-1.5">You haven't purchased any notes yet.</p>
            <p className="text-xs text-[#78716C]">
              Browse the university catalogue to purchase verified study materials and unlock full DRM reader access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchases.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#D5CDC1] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#78716C] mb-2 font-semibold">
                    <span>{doc.collegeName}</span>
                    <span className="text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Licensed</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#1C1917] mb-1.5 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed">{doc.description}</p>
                </div>

                <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDocForReview(doc)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#C06A28] transition-colors cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-[#C06A28] fill-[#C06A28]" />
                    <span>Write Verified Review</span>
                  </button>

                  <button
                    onClick={() => onOpenReader(doc)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1C1917] hover:bg-[#C06A28] text-white transition-all shadow-xs cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#FEF3C7]" />
                    <span>Open Reader</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal Form */}
      {selectedDocForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-xl p-6 sm:p-8 relative">
            <h3 className="text-lg font-bold text-[#111827] mb-1 font-editorial">
              Submit Verified Student Review
            </h3>
            <p className="text-xs text-gray-500 mb-4 truncate font-medium">
              {selectedDocForReview.title}
            </p>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your verified purchase review has been published.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {reviewError && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{reviewError}</div>
                )}

                {/* Overall Stars */}
                <div>
                  <label className="block font-bold text-[#111827] mb-1.5">Overall Satisfaction (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          rating === s
                            ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                            : 'bg-white text-[#111827] border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        ★ {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Criteria Ratings */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[#111827] font-semibold mb-1">Content Accuracy</label>
                    <select
                      value={contentAccuracy}
                      onChange={(e) => setContentAccuracy(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-[#111827] focus:outline-none focus:border-[#D97706]"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#111827] font-semibold mb-1">Explanation Quality</label>
                    <select
                      value={explanationQuality}
                      onChange={(e) => setExplanationQuality(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-[#111827] focus:outline-none focus:border-[#D97706]"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#111827] font-semibold mb-1">Readability / Handwriting</label>
                    <select
                      value={readability}
                      onChange={(e) => setReadability(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-[#111827] focus:outline-none focus:border-[#D97706]"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#111827] font-semibold mb-1">Exam Usefulness</label>
                    <select
                      value={examUsefulness}
                      onChange={(e) => setExamUsefulness(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-[#111827] focus:outline-none focus:border-[#D97706]"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#111827] mb-1">Detailed Review</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How did this document help you prepare for university mid-term or final exams?"
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#D97706] text-[#111827] placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocForReview(null)}
                    className="px-4 py-2 text-gray-500 hover:text-[#111827] font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
