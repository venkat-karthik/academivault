import React, { useState, useEffect } from 'react';
import { AcademicDocument } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const ProfessorPortal: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Verification Application Form
  const [institution, setInstitution] = useState(user?.collegeName || 'Indian Institute of Technology Bombay');
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
  const [academicDesignation, setAcademicDesignation] = useState('Associate Professor');
  const [officialEmail, setOfficialEmail] = useState(user?.email || 'professor@iitb.ac.in');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [appError, setAppError] = useState('');

  // Academic Audit Review Form
  const [technicalCorrectness, setTechnicalCorrectness] = useState(10);
  const [academicAccuracy, setAcademicAccuracy] = useState(10);
  const [conceptualExplanation, setConceptualExplanation] = useState(9);
  const [syllabusAlignment, setSyllabusAlignment] = useState(10);
  const [completeness, setCompleteness] = useState(9);
  const [referenceQuality, setReferenceQuality] = useState(9);
  const [overallRating, setOverallRating] = useState(5);
  const [detailedFeedback, setDetailedFeedback] = useState(
    'The derivations are mathematically sound, asymptotic boundaries follow Cormen (CLRS) conventions, and the practice questions align directly with current university examination standards.'
  );
  const [recommendation, setRecommendation] = useState('highly_recommended');
  const [conflictDisclosure, setConflictDisclosure] = useState(
    'I have no financial or personal relationship with the document author. Conducted as an independent academic audit.'
  );
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    api
      .getDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0) setSelectedDocId(docs[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppError('');
    try {
      await api.applyProfessorVerification({
        institution,
        department,
        academicDesignation,
        officialEmail,
        credentialsDocName: 'faculty_appointment_letter.pdf'
      });
      setApplicationSubmitted(true);
    } catch (err: unknown) {
      setAppError(err instanceof Error ? err.message : 'Application submission failed.');
    }
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) return;
    setReviewSubmitting(true);
    setReviewSuccessMsg('');

    try {
      await api.submitProfessorReview({
        documentId: selectedDocId,
        technicalCorrectnessScore: technicalCorrectness,
        academicAccuracyScore: academicAccuracy,
        conceptualExplanationScore: conceptualExplanation,
        syllabusAlignmentScore: syllabusAlignment,
        completenessScore: completeness,
        referenceQualityScore: referenceQuality,
        overallQualityRating: overallRating,
        detailedFeedback,
        recommendation,
        conflictOfInterestDisclosure: conflictDisclosure
      });
      setReviewSuccessMsg('Academic Quality Audit published successfully. Professor Verified badge awarded!');
      // Refresh documents
      api.getDocuments().then(setDocuments);
    } catch (err: unknown) {
      setReviewSuccessMsg(err instanceof Error ? err.message : 'Audit submission failed.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isVerifiedProfessor = user?.role === 'professor' || user?.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#ea6510] uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-[#ea6510]" />
            <span>Academic Rigor & Peer Review System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e1915]">
            Professor Verification & Academic Audits
          </h2>
          <p className="text-xs text-[#645548] mt-0.5">
            Peer review of student notes ensures theoretical accuracy, syllabus alignment, and pedagogical value.
          </p>
        </div>

        {isVerifiedProfessor ? (
          <div className="flex items-center gap-2 bg-[#73a5ca]/15 text-[#2d6289] px-4 py-2 rounded-xl border border-[#73a5ca]/30 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#2d6289]" />
            <span>Verified Academic Reviewer Status Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#ffe9a9]/40 text-[#ea6510] px-4 py-2 rounded-xl border border-[#ffe9a9] text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-[#ea6510]" />
            <span>Standard Account (Verification Application Required)</span>
          </div>
        )}
      </div>

      {/* Main Grid: Verification Application vs Audit Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Verification Application */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] p-6 sm:p-7 shadow-2xs">
            <h3 className="text-base font-bold text-[#1e1915] mb-1 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#ea6510]" />
              <span>Apply for Professor Verification</span>
            </h3>
            <p className="text-xs text-[#645548] mb-4 leading-relaxed">
              Faculty members from accredited colleges and universities can apply to become verified academic auditors. Administrators verify institutional email credentials.
            </p>

            {applicationSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl text-xs space-y-2 border border-emerald-200">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Application Submitted for Administrative Audit</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Our academic verification desk will verify your institutional credentials at <strong>{officialEmail}</strong>. You will receive an official notification once approved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3.5 text-xs">
                {appError && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{appError}</div>
                )}

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Affiliated Institution</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Academic Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={academicDesignation}
                    onChange={(e) => setAcademicDesignation(e.target.value)}
                    placeholder="Professor / Department Head / Senior Lecturer"
                    className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Official Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="name@dept.university.edu"
                    className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold transition-all shadow-xs hover:shadow-md active:scale-95 mt-2"
                >
                  Submit Institutional Credentials
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Academic Audit Workbench */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] p-6 sm:p-7 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#1e1915] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ea6510]" />
                <span>Academic Audit Workbench</span>
              </h3>
              <span className="text-[11px] text-[#645548] font-medium">Peer Review Protocol v2</span>
            </div>

            <p className="text-xs text-[#645548] mb-4">
              Conduct a formal academic evaluation of study materials. Evaluated documents receive the verified academic audit badge and score breakdown on their product page.
            </p>

            {reviewSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl text-xs mb-4 font-bold flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAudit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1e1915] mb-1">Target Document</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] font-medium"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.collegeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* 6 Formal Academic Evaluation Criteria */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#ffe9a9]/20 p-3.5 rounded-2xl border border-[#ffe9a9]">
                <div>
                  <label className="block font-semibold text-[#1e1915] mb-1">Technical Correctness</label>
                  <select
                    value={technicalCorrectness}
                    onChange={(e) => setTechnicalCorrectness(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-[#ffe9a9] bg-white text-[#1e1915] font-medium"
                  >
                    {[10, 9, 8, 7, 6, 5].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1e1915] mb-1">Academic Accuracy</label>
                  <select
                    value={academicAccuracy}
                    onChange={(e) => setAcademicAccuracy(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-[#ffe9a9] bg-white text-[#1e1915] font-medium"
                  >
                    {[10, 9, 8, 7, 6, 5].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1e1915] mb-1">Conceptual Clarity</label>
                  <select
                    value={conceptualExplanation}
                    onChange={(e) => setConceptualExplanation(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-[#ffe9a9] bg-white text-[#1e1915] font-medium"
                  >
                    {[10, 9, 8, 7, 6, 5].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1e1915] mb-1">Syllabus Alignment</label>
                  <select
                    value={syllabusAlignment}
                    onChange={(e) => setSyllabusAlignment(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-[#ffe9a9] bg-white text-[#1e1915] font-medium"
                  >
                    {[10, 9, 8, 7, 6, 5].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1e1915] mb-1">Completeness</label>
                  <select
                    value={completeness}
                    onChange={(e) => setCompleteness(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-[#ffe9a9] bg-white text-[#1e1915] font-medium"
                  >
                    {[10, 9, 8, 7, 6, 5].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1e1915] mb-1">Reference Quality</label>
                  <select
                    value={referenceQuality}
                    onChange={(e) => setReferenceQuality(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg border border-[#ffe9a9] bg-white text-[#1e1915] font-medium"
                  >
                    {[10, 9, 8, 7, 6, 5].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1e1915] mb-1">Detailed Academic Commentary</label>
                <textarea
                  required
                  rows={3}
                  value={detailedFeedback}
                  onChange={(e) => setDetailedFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1e1915] mb-1">Conflict of Interest Disclosure</label>
                <input
                  type="text"
                  required
                  value={conflictDisclosure}
                  onChange={(e) => setConflictDisclosure(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting || !isVerifiedProfessor}
                className="w-full py-2.5 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-40"
              >
                {reviewSubmitting ? 'Publishing Academic Audit...' : 'Publish Official Professor Audit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
