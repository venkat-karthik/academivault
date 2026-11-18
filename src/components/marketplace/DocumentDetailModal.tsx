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
  FileText
} from 'lucide-react';

interface DocumentDetailModalProps {
  document: AcademicDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReader: (doc: AcademicDocument) => void;
  onPurchaseSuccess: () => void;
  onOpenAuth?: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: initialDoc,
  isOpen,
  onClose,
  onOpenReader,
  onPurchaseSuccess,
  onOpenAuth
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
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        setPurchaseError('Please sign in to purchase access to this document.');
      }
      return;
    }
    setPurchaseError('');
    setPurchasing(true);

    try {
      const order = await api.createPaymentOrder(doc.id);

      if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: any }).Razorpay) {
        const RazorpayClass = (window as unknown as { Razorpay: any }).Razorpay;
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'AcademiaVault',
          description: `Access to: ${doc.title.slice(0, 40)}`,
          order_id: order.orderId,
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verification = await api.verifyPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                documentId: doc.id
              });

              if (verification.success) {
                setDoc((prev) => (prev ? { ...prev, hasPurchased: true } : null));
                onPurchaseSuccess();
              }
            } catch (err: unknown) {
              setPurchaseError(err instanceof Error ? err.message : 'Signature verification failed.');
            } finally {
              setPurchasing(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#ea6510'
          },
          modal: {
            ondismiss: () => {
              setPurchasing(false);
            }
          }
        };

        const rzp = new RazorpayClass(options);
        rzp.open();
      } else {
        throw new Error('Razorpay payment gateway SDK is initializing. Please try again in a few seconds.');
      }
    } catch (err: unknown) {
      setPurchaseError(err instanceof Error ? err.message : 'Payment process failed.');
      setPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#E8E2D9] shadow-2xl overflow-hidden relative animate-modal-enter">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D9] bg-[#FAF8F5]">
          <div className="flex items-center gap-1.5 text-xs text-[#78716C] font-semibold">
            <span className="text-[#1C1917] font-bold">{doc.collegeName}</span>
            <span aria-hidden="true" className="text-[#DDD5C7]">·</span>
            <span className="text-[#C06A28] font-bold">{doc.subjectName}</span>
            <span aria-hidden="true" className="text-[#DDD5C7]">·</span>
            <span className="capitalize">{doc.category.replace(/_/g, ' ')}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F0E8] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Title & Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] leading-snug mb-2 font-sans">
              {doc.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">{doc.description}</p>
          </div>

          {/* Academic Catalogue Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D9] text-xs shadow-xs">
            <div>
              <span className="text-[#78716C] block mb-0.5 font-medium text-[11px]">University</span>
              <span className="font-bold text-[#1C1917]">{doc.universityName}</span>
            </div>
            <div>
              <span className="text-[#78716C] block mb-0.5 font-medium text-[11px]">Department</span>
              <span className="font-bold text-[#1C1917]">{doc.branch}</span>
            </div>
            <div>
              <span className="text-[#78716C] block mb-0.5 font-medium text-[11px]">Semester & Module</span>
              <span className="font-bold text-[#1C1917]">Sem {doc.semester} · {doc.module || 'Full Unit'}</span>
            </div>
            <div>
              <span className="text-[#78716C] block mb-0.5 font-medium text-[11px]">Scheme</span>
              <span className="font-bold text-[#1C1917]">{doc.academicScheme}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E8E2D9] text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 mr-6 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-[#C06A28] border-b-2 border-[#C06A28]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Overview & Sample
            </button>
            <button
              onClick={() => setActiveTab('professor_audit')}
              className={`pb-2.5 mr-6 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'professor_audit'
                  ? 'text-[#C06A28] border-b-2 border-[#C06A28]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Faculty Audit ({professorReviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('student_reviews')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'student_reviews'
                  ? 'text-[#C06A28] border-b-2 border-[#C06A28]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-[#C06A28] text-[#C06A28]" />
              <span>Student Reviews ({reviews.length})</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E2D9] bg-white">
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917]">{doc.contributorName}</h4>
                  <p className="text-[11px] text-[#78716C]">{doc.contributorCollege}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-[#78716C] block text-[11px] font-medium">Verified Sales</span>
                  <span className="font-bold text-[#1C1917] tabular-nums font-mono">{doc.totalSales} students</span>
                </div>
              </div>

              {/* Free Sample Callout */}
              <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C06A28] mb-0.5">
                    <FileText className="w-3.5 h-3.5 text-[#C06A28]" />
                    <span>Free Sample Preview Available</span>
                  </div>
                  <p className="text-xs text-[#57534E]">
                    Pages 1 and 2 are unlocked for academic verification in our reader.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReader(doc);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-[#FAF8F5] text-[#C06A28] border border-[#DDD5C7] transition-all whitespace-nowrap shadow-xs cursor-pointer active:scale-95"
                >
                  Open Free Sample
                </button>
              </div>

              <div className="text-xs text-[#57534E] bg-[#FDF3D8] p-4 rounded-2xl border border-[#F6E2B2] flex items-start gap-2.5">
                <Lock className="w-3.5 h-3.5 text-[#C06A28] mt-0.5 shrink-0" />
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
                <div className="text-center py-8 text-[#78716C] text-xs">
                  Document in queue for academic verification.
                </div>
              ) : (
                professorReviews.map((prof) => (
                  <div key={prof.id} className="p-5 rounded-2xl border border-[#E8E2D9] bg-white space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#1C1917]">{prof.professorName}</h4>
                        <p className="text-[11px] text-[#78716C]">{prof.department} · {prof.institution}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                        <Award className="w-3 h-3 text-blue-600" />
                        <span>Verified Audit</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D9] text-[11px]">
                      <div>
                        <span className="text-[#78716C] block font-medium">Technical Correctness</span>
                        <span className="font-bold text-[#1C1917] font-mono">{prof.technicalCorrectnessScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] block font-medium">Academic Accuracy</span>
                        <span className="font-bold text-[#1C1917] font-mono">{prof.academicAccuracyScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] block font-medium">Conceptual Explanation</span>
                        <span className="font-bold text-[#1C1917] font-mono">{prof.conceptualExplanationScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] block font-medium">Syllabus Alignment</span>
                        <span className="font-bold text-[#1C1917] font-mono">{prof.syllabusAlignmentScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] block font-medium">Completeness</span>
                        <span className="font-bold text-[#1C1917] font-mono">{prof.completenessScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] block font-medium">Reference Quality</span>
                        <span className="font-bold text-[#1C1917] font-mono">{prof.referenceQualityScore}/10</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#1C1917] italic leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D9]">
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
                <div className="text-center py-8 text-[#78716C] text-xs">
                  No student reviews yet. Verified purchasers can write reviews after access.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-[#E8E2D9] bg-white space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1C1917]">{rev.userName}</span>
                        <span className="text-[#78716C] text-[11px]">({rev.userCollege})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#C06A28] font-bold">
                        <Star className="w-3 h-3 fill-[#C06A28] text-[#C06A28]" />
                        <span className="font-bold text-[#1C1917] font-mono">{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#57534E] leading-relaxed">{rev.reviewText}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Purchase Bar */}
        <div className="p-4 sm:p-5 border-t border-[#E8E2D9] bg-[#FAF8F5] flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#78716C] font-medium block">Lifetime Online Access</span>
            <span className="text-2xl font-black text-[#1C1917] font-mono tabular-nums">
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
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Full Reader</span>
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#1C1917] hover:bg-[#C06A28] text-white transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
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
