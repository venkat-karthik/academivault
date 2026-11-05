import React, { useState, useEffect } from 'react';
import { AcademicDocument, ProfessorReview, StudentReview } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle,
  Lock,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';

interface DocumentDetailModalProps {
  document: AcademicDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReader: (doc: AcademicDocument) => void;
  onPurchaseSuccess: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: initialDoc,
  isOpen,
  onClose,
  onOpenReader,
  onPurchaseSuccess
}) => {
  const { user } = useAuth();
  const [doc, setDoc] = useState<AcademicDocument | null>(initialDoc);
  const [reviews, setReviews] = useState<StudentReview[]>([]);
  const [professorReviews, setProfessorReviews] = useState<ProfessorReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'professor_audit' | 'student_reviews'>('overview');

  useEffect(() => {
    if (initialDoc && isOpen) {
      setDoc(initialDoc);
      setLoading(true);
      api
        .getDocumentDetails(initialDoc.id)
        .then((res) => {
          setDoc(res.document);
          setReviews(res.reviews);
          setProfessorReviews(res.professorReviews);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [initialDoc, isOpen]);

  if (!isOpen || !doc) return null;

  const handlePurchase = async () => {
    if (!user) {
      setPurchaseError('Please sign in to purchase access to this document.');
      return;
    }
    setPurchaseError('');
    setPurchasing(true);

    try {
      const order = await api.createPaymentOrder(doc.id);
      const mockPaymentId = 'pay_rzp_' + Math.random().toString(36).substring(2, 10);
      const mockSignature = 'sig_' + Math.random().toString(36).substring(2, 12);

      const verification = await api.verifyPayment({
        orderId: order.orderId,
        paymentId: mockPaymentId,
        signature: mockSignature,
        documentId: doc.id
      });

      if (verification.success) {
        setDoc((prev) => (prev ? { ...prev, hasPurchased: true } : null));
        onPurchaseSuccess();
      }
    } catch (err: unknown) {
      setPurchaseError(err instanceof Error ? err.message : 'Payment process failed.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#1e1915]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fffdf6] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#ffe9a9] shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffe9a9] bg-[#ffe9a9]/50">
          <div className="flex items-center gap-1.5 text-xs text-[#645548] font-semibold">
            <span>{doc.collegeName}</span>
            <span aria-hidden="true" className="text-[#ffcb56]">·</span>
            <span className="text-[#ea6510] font-bold">{doc.subjectName}</span>
            <span aria-hidden="true" className="text-[#ffcb56]">·</span>
            <span className="capitalize">{doc.category.replace(/_/g, ' ')}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#645548] hover:text-[#1e1915] hover:bg-[#ffe9a9] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Title & Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1e1915] leading-snug mb-2">
              {doc.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#645548] leading-relaxed">{doc.description}</p>
          </div>

          {/* Academic Catalogue Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/95 p-4 rounded-2xl border border-[#ffe9a9] text-xs shadow-2xs">
            <div>
              <span className="text-[#645548]/70 block mb-0.5 font-medium">University</span>
              <span className="font-bold text-[#1e1915]">{doc.universityName}</span>
            </div>
            <div>
              <span className="text-[#645548]/70 block mb-0.5 font-medium">Department</span>
              <span className="font-bold text-[#1e1915]">{doc.branch}</span>
            </div>
            <div>
              <span className="text-[#645548]/70 block mb-0.5 font-medium">Semester & Module</span>
              <span className="font-bold text-[#1e1915]">Sem {doc.semester} · {doc.module || 'Full Unit'}</span>
            </div>
            <div>
              <span className="text-[#645548]/70 block mb-0.5 font-medium">Scheme</span>
              <span className="font-bold text-[#1e1915]">{doc.academicScheme}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#ffe9a9] text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 mr-6 transition-colors ${
                activeTab === 'overview'
                  ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
                  : 'text-[#645548] hover:text-[#1e1915]'
              }`}
            >
              Overview & Sample
            </button>
            <button
              onClick={() => setActiveTab('professor_audit')}
              className={`pb-2.5 mr-6 flex items-center gap-1.5 transition-colors ${
                activeTab === 'professor_audit'
                  ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
                  : 'text-[#645548] hover:text-[#1e1915]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2d6289]" />
              <span>Faculty Audit ({professorReviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('student_reviews')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors ${
                activeTab === 'student_reviews'
                  ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
                  : 'text-[#645548] hover:text-[#1e1915]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-[#ffcb56] text-[#ff933e]" />
              <span>Student Reviews ({reviews.length})</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[#ffe9a9] bg-white">
                <div>
                  <h4 className="text-xs font-bold text-[#1e1915]">{doc.contributorName}</h4>
                  <p className="text-[11px] text-[#645548]">{doc.contributorCollege}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-[#645548]/70 block text-[11px] font-medium">Verified Sales</span>
                  <span className="font-bold text-[#1e1915] tabular-nums font-mono">{doc.totalSales} students</span>
                </div>
              </div>

              {/* Free Sample Callout */}
              <div className="bg-gradient-to-r from-[#ffe9a9] via-[#fffdf6] to-[#ffcb56]/20 border border-[#ffcb56] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ea6510] mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ea6510]" />
                    <span>Free Sample Preview Available</span>
                  </div>
                  <p className="text-xs text-[#645548]">
                    Pages 1 and 2 are unlocked for academic verification in our reader.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReader(doc);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-[#fffdf6] text-[#ea6510] border border-[#ffcb56] transition-all whitespace-nowrap shadow-2xs active:scale-95"
                >
                  Open Free Sample
                </button>
              </div>

              <div className="text-xs text-[#645548] bg-[#ffe9a9]/30 p-4 rounded-2xl border border-[#ffe9a9] flex items-start gap-2.5">
                <Lock className="w-3.5 h-3.5 text-[#ea6510] mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Digital Rights Protection:</strong> This material is licensed for online reading only. Pages include dynamic forensic watermarks with your email and student ID. Raw PDF downloads are restricted.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Professor Audit */}
          {activeTab === 'professor_audit' && (
            <div className="space-y-4">
              {professorReviews.length === 0 ? (
                <div className="text-center py-8 text-[#645548] text-xs">
                  Document in queue for academic verification.
                </div>
              ) : (
                professorReviews.map((prof) => (
                  <div key={prof.id} className="p-5 rounded-2xl border border-[#ffe9a9] bg-white space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#1e1915]">{prof.professorName}</h4>
                        <p className="text-[11px] text-[#645548]">{prof.department} · {prof.institution}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#2d6289] bg-[#73a5ca]/15 px-2.5 py-1 rounded-xl border border-[#73a5ca]/40">
                        <Award className="w-3 h-3 text-[#2d6289]" />
                        <span>Verified Audit</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#fffdf6] p-3 rounded-xl border border-[#ffe9a9] text-[11px]">
                      <div>
                        <span className="text-[#645548] block font-medium">Technical Correctness</span>
                        <span className="font-bold text-[#1e1915] font-mono">{prof.technicalCorrectnessScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#645548] block font-medium">Academic Accuracy</span>
                        <span className="font-bold text-[#1e1915] font-mono">{prof.academicAccuracyScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#645548] block font-medium">Conceptual Explanation</span>
                        <span className="font-bold text-[#1e1915] font-mono">{prof.conceptualExplanationScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#645548] block font-medium">Syllabus Alignment</span>
                        <span className="font-bold text-[#1e1915] font-mono">{prof.syllabusAlignmentScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#645548] block font-medium">Completeness</span>
                        <span className="font-bold text-[#1e1915] font-mono">{prof.completenessScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#645548] block font-medium">Reference Quality</span>
                        <span className="font-bold text-[#1e1915] font-mono">{prof.referenceQualityScore}/10</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#1e1915] italic leading-relaxed bg-[#fffdf6] p-3 rounded-xl border border-[#ffe9a9]">
                      &ldquo;{prof.detailedFeedback}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Student Reviews */}
          {activeTab === 'student_reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-[#645548] text-xs">
                  No student reviews yet. Verified purchasers can write reviews after access.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-[#ffe9a9] bg-white space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1e1915]">{rev.userName}</span>
                        <span className="text-[#645548] text-[11px]">({rev.userCollege})</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-[#ffcb56] text-[#ff933e]" />
                        <span className="font-bold text-[#1e1915] font-mono">{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#645548] leading-relaxed">{rev.reviewText}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Purchase Bar */}
        <div className="p-4 sm:p-5 border-t border-[#ffe9a9] bg-[#ffe9a9]/50 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#645548] font-medium block">Lifetime Online Access</span>
            <span className="text-2xl font-black text-[#1e1915] font-mono tabular-nums">
              ₹{doc.price}
            </span>
          </div>

          {purchaseError && (
            <div className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
              {purchaseError}
            </div>
          )}

          <div>
            {doc.hasPurchased ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenReader(doc);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-xs active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Full Reader</span>
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-white/80" />
                <span>{purchasing ? 'Verifying with Razorpay...' : `Purchase Access · ₹${doc.price}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
