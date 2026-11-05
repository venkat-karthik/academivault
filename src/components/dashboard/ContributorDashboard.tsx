import React, { useState, useEffect } from 'react';
import { AcademicDocument, ContributorEarnings } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_COLLEGES } from '../../data/mockData';
import {
  Upload,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export const ContributorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [earnings, setEarnings] = useState<ContributorEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('handwritten_notes');
  const [collegeId, setCollegeId] = useState(INITIAL_COLLEGES[0].id);
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(3);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [module, setModule] = useState('Complete Modules 1-5');
  const [academicScheme, setAcademicScheme] = useState('2024 CBCS Scheme');
  const [pageCount, setPageCount] = useState(45);
  const [price, setPrice] = useState(49);
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState(500);
  const [bankDetails, setBankDetails] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, earn] = await Promise.all([
        api.getMyDocuments(),
        api.getContributorEarnings()
      ]);
      setDocuments(docs);
      setEarnings(earn);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyrightAgreed) {
      setUploadError('You must declare original copyright ownership.');
      return;
    }
    setUploading(true);
    setUploadError('');

    try {
      await api.uploadDocument({
        title,
        description,
        category: category as any,
        collegeId,
        branch,
        semester,
        subjectName,
        subjectCode,
        module,
        academicScheme,
        pageCount,
        price,
        copyrightAgreed
      });
      setIsUploadOpen(false);
      // Reset
      setTitle('');
      setDescription('');
      setSubjectName('');
      setSubjectCode('');
      setCopyrightAgreed(false);
      loadData();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSubmitting(true);
    try {
      await api.requestWithdrawal({
        amount: withdrawAmount,
        bankDetails
      });
      setWithdrawMessage('Withdrawal request submitted for administrative review.');
      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawMessage('');
        loadData();
      }, 1500);
    } catch (err: unknown) {
      setWithdrawMessage(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Contributor Header */}
      <div className="p-6 sm:p-8 bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#ea6510] uppercase tracking-wider mb-1">
            Academic Contributor Studio
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e1915]">{user?.name}</h2>
          <p className="text-xs text-[#645548] mt-0.5">
            {user?.collegeName} · Author Royalty: 70% per verified student purchase
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#ffe9a9]" />
          <span>Publish New Academic Document</span>
        </button>
      </div>

      {/* Financial Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <span className="text-xs text-[#645548] font-semibold block mb-1">Total Sales Count</span>
          <span className="text-2xl font-extrabold text-[#1e1915] tabular-nums font-mono">
            {earnings?.totalSalesCount || 0}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">Verified Purchases</span>
        </div>

        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <span className="text-xs text-[#645548] font-semibold block mb-1">Gross Sales Volume</span>
          <span className="text-2xl font-extrabold text-[#1e1915] tabular-nums font-mono">
            ₹{earnings?.totalRevenue || 0}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">100% Market Value</span>
        </div>

        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <span className="text-xs text-[#645548] font-semibold block mb-1">Your Royalties (70%)</span>
          <span className="text-2xl font-extrabold text-[#2d6289] tabular-nums font-mono">
            ₹{earnings?.contributorShare || 0}
          </span>
          <span className="text-[11px] text-[#2d6289] block mt-1 font-semibold">Author Earnings</span>
        </div>

        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#645548] font-semibold block mb-1">Available to Withdraw</span>
            <span className="text-2xl font-extrabold text-[#ea6510] tabular-nums font-mono">
              ₹{earnings?.availableBalance || 0}
            </span>
          </div>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            disabled={(earnings?.availableBalance || 0) < 500}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-40"
          >
            Request Payout
          </button>
        </div>
      </div>

      {/* Uploaded Documents Table */}
      <div>
        <h3 className="text-lg font-bold text-[#1e1915] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#ea6510]" />
          <span>My Uploaded Academic Documents</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-[#645548] text-xs">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-10 text-center bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] shadow-2xs">
            <p className="text-sm font-semibold text-[#1e1915] mb-1.5">No documents published yet.</p>
            <p className="text-xs text-[#645548]">
              Upload your original college notes, solved question banks, or lab manuals and earn 70% royalties.
            </p>
          </div>
        ) : (
          <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ffe9a9]/30 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Document Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Sales</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffe9a9]/60 text-[#1e1915]">
                  {documents.map((d) => (
                    <tr key={d.id} className="hover:bg-[#ffe9a9]/15 transition-colors">
                      <td className="p-4 font-bold text-[#1e1915] max-w-xs truncate">
                        {d.title}
                      </td>
                      <td className="p-4 capitalize text-[#645548] font-medium">{d.category.replace(/_/g, ' ')}</td>
                      <td className="p-4 font-mono font-bold tabular-nums">₹{d.price}</td>
                      <td className="p-4 tabular-nums font-mono text-[#645548]">{d.totalSales || 0} students</td>
                      <td className="p-4 font-mono font-medium">★ {d.rating} ({d.ratingCount})</td>
                      <td className="p-4">
                        {d.status === 'approved' ? (
                          <span className="text-[#2d6289] bg-[#73a5ca]/15 px-2.5 py-0.5 rounded-md font-semibold border border-[#73a5ca]/30">
                            Approved & Live
                          </span>
                        ) : d.status === 'pending_review' ? (
                          <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md font-semibold border border-[#ffcb56]">
                            Under Moderation
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md font-semibold border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1915]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fffdf6] rounded-3xl max-w-2xl w-full border border-[#ffe9a9] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#1e1915] mb-1">
              Publish Original Academic Document
            </h3>
            <p className="text-xs text-[#645548] mb-5">
              Upload study materials, lecture summaries, or solved question banks. All submissions pass anti-malware and copyright screening before publication.
            </p>

            {uploadError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl text-xs mb-4 border border-rose-200 font-medium">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1e1915] mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems: Kernel Architecture & Concurrency Master Notes"
                  className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus:border-[#ea6510]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1e1915] mb-1">Exhaustive Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize chapters covered, university scheme alignment, and exam usefulness..."
                  className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus:border-[#ea6510]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  >
                    <option value="handwritten_notes">Handwritten Notes</option>
                    <option value="digital_notes">Digital Notes</option>
                    <option value="question_banks">Question Banks</option>
                    <option value="exam_preparation_packs">Exam Prep Pack</option>
                    <option value="laboratory_records">Lab Manual</option>
                    <option value="complete_subject_materials">Complete Subject</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">College</label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  >
                    {INITIAL_COLLEGES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="CS302"
                    className="w-full p-2 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Operating Systems"
                    className="w-full p-2 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1e1915] mb-1">Page Count</label>
                  <input
                    type="number"
                    min={1}
                    value={pageCount}
                    onChange={(e) => setPageCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-[#ffe9a9] bg-white font-mono text-[#1e1915]"
                  />
                </div>
              </div>

              {/* Pricing & Split Calculator */}
              <div className="p-4 bg-[#ffe9a9]/25 rounded-2xl border border-[#ffe9a9] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#1e1915]">Document Price (INR)</label>
                  <div className="flex items-center gap-1 font-mono font-bold text-base text-[#1e1915]">
                    <span>₹</span>
                    <input
                      type="number"
                      min={29}
                      max={599}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-20 p-1.5 rounded-lg border border-[#ffe9a9] bg-white text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#645548] pt-2 border-t border-[#ffe9a9]">
                  <span>Your Cut (70%): <strong className="text-[#2d6289]">₹{Math.round(price * 0.7)}</strong></span>
                  <span>Platform DRM & Security (30%): <strong>₹{Math.round(price * 0.3)}</strong></span>
                </div>
              </div>

              {/* Copyright Declaration */}
              <div className="p-4 bg-[#ffe9a9]/30 border border-[#ffcb56] rounded-2xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={copyrightAgreed}
                    onChange={(e) => setCopyrightAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-[#ea6510] focus:ring-0"
                  />
                  <span className="text-xs text-[#1e1915] leading-relaxed font-medium">
                    I declare and certify under penalty of account termination that these notes are my original academic work. I hold the intellectual property rights and grant AcademiaVault the non-exclusive license to protect and distribute access.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 font-semibold text-[#645548] hover:text-[#1e1915] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50"
                >
                  {uploading ? 'Processing & Submitting...' : 'Submit for Moderation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1915]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fffdf6] rounded-3xl max-w-md w-full border border-[#ffe9a9] shadow-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#1e1915] mb-1">
              Request Contributor Payout
            </h3>
            <p className="text-xs text-[#645548] mb-4">
              Available Balance: <strong className="text-[#2d6289] font-mono">₹{earnings?.availableBalance}</strong> (Minimum ₹500).
            </p>

            {withdrawMessage && (
              <div className="p-3 bg-[#ffe9a9]/40 text-[#ea6510] rounded-2xl text-xs mb-4 border border-[#ffe9a9] font-semibold">
                {withdrawMessage}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1e1915] mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min={500}
                  max={earnings?.availableBalance || 500}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white font-mono text-sm text-[#1e1915]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1e1915] mb-1">
                  Bank Account / UPI ID
                </label>
                <input
                  type="text"
                  required
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="e.g. priya@okaxis or HDFC0001234 A/C 50100234123"
                  className="w-full p-2.5 rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 font-semibold text-[#645548] hover:text-[#1e1915] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50"
                >
                  {withdrawSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
