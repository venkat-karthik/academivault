import React, { useState, useEffect, useRef } from 'react';
import { AcademicDocument, PurchaseRecord, SecurityEventLog, SitePhoto, UserSession } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAIL } from '../auth/AdminGatewayModal';
import {
  ShieldAlert,
  DollarSign,
  Image as ImageIcon,
  UploadCloud,
  Check,
  X,
  Copy,
  ExternalLink,
  FileText,
  Users,
  Lock,
  Trash2,
  RefreshCw,
  Download,
  CheckCircle2,
  Sparkles,
  Layers,
  Laptop
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<{
    totalUsers: number;
    totalDocuments: number;
    pendingModerationCount: number;
    totalPurchases: number;
    grossRevenue: number;
    platformEarnings: number;
    activeSessionsCount: number;
    verifiedProfessorsCount: number;
    pendingProfessorVerifications: number;
  } | null>(null);

  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'financials' | 'photos' | 'moderation' | 'sessions' | 'security'>('financials');

  // Photo Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedPhotoId, setCopiedPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthorized = user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role === 'admin';

  const loadData = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [ov, docs, purch, pht, sess, logs] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminDocuments().catch(() => []),
        api.getAdminPurchases().catch(() => []),
        api.getAdminPhotos().catch(() => []),
        api.getAdminSessions().catch(() => []),
        api.getAdminSecurityLogs().catch(() => [])
      ]);
      setOverview(ov);
      setDocuments(docs);
      setPurchases(purch);
      setPhotos(pht);
      setSessions(sess);
      setSecurityLogs(logs);
    } catch (err) {
      console.error('[Admin] Error loading administrative data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Photo Upload to Cloudinary
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadingPhoto(true);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      if (photoName.trim()) {
        formData.append('name', photoName.trim());
      }

      const res = await api.uploadAdminPhoto(formData);
      if (res.success && res.photo) {
        setPhotos((prev) => [res.photo, ...prev]);
        setSelectedFile(null);
        setPhotoName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
      alert('Photo upload to Cloudinary failed. Please check network and file size.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Photo Delete
  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Delete this image from Cloudinary and site repository?')) return;
    try {
      await api.deleteAdminPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  // Copy Cloudinary URL to clipboard
  const handleCopyUrl = (photo: SitePhoto) => {
    navigator.clipboard.writeText(photo.url);
    setCopiedPhotoId(photo.id);
    setTimeout(() => setCopiedPhotoId(null), 2500);
  };

  // Export Financial Ledger to CSV
  const handleExportCSV = () => {
    if (!purchases.length) {
      alert('No transactions recorded yet to export.');
      return;
    }

    const headers = ['Order ID', 'Payment ID', 'User ID', 'Document ID', 'Amount (INR)', 'Purchased At'];
    const rows = purchases.map((p) => [
      p.orderId,
      p.paymentId || 'N/A',
      p.userId,
      p.documentId,
      p.amount,
      p.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AcademiaVault_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Moderation status update
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminDocumentStatus(id, status);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, status: status as AcademicDocument['status'] } : doc))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Force Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.revokeAdminSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch (err) {
      console.error(err);
    }
  };

  // If user is not karthikvenkat316@gmail.com, show access denied
  if (!isAuthorized) {
    return (
      <div className="py-20 max-w-xl mx-auto text-center animate-fade-slide-up">
        <div className="bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] shadow-md p-8 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-[#ea6510] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[#1e1915] font-editorial mb-2">
            Administrative Access Restricted
          </h2>
          <p className="text-xs text-[#645548] leading-relaxed mb-6">
            Governance, financial ledgers, and Cloudinary storage management are strictly restricted to the verified platform owner (<span className="font-mono font-bold text-[#1e1915]">{ADMIN_EMAIL}</span>).
          </p>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-[#ffcb56] text-[11px] text-[#645548] mb-6">
            Current session:{' '}
            <span className="font-mono font-semibold text-[#1e1915]">
              {user ? user.email : 'Unauthenticated Visitor'}
            </span>
          </div>
          <p className="text-[11px] text-[#645548]/70">
            Please use the Staff Terminal lock in the footer to authenticate with your administrator credentials.
          </p>
        </div>
      </div>
    );
  }

  const grossRevenue = overview?.grossRevenue || 0;
  const platformRevenue = overview?.platformEarnings || Math.round(grossRevenue * 0.3);
  const contributorPool = grossRevenue - platformRevenue;

  return (
    <div className="space-y-8 animate-fade-slide-up max-w-7xl mx-auto">
      {/* Executive Command Header */}
      <div className="p-6 sm:p-8 bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#ffcb56]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ffe9a9] border border-[#ffcb56] text-[#ea6510] text-[11px] font-bold uppercase tracking-wider mb-2 font-mono">
              <Lock className="w-3.5 h-3.5 text-[#ea6510]" />
              <span>Platform Owner Clearance · {ADMIN_EMAIL}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e1915] font-editorial tracking-tight">
              Executive Governance & Asset Terminal
            </h1>
            <p className="text-xs text-[#645548] mt-1 max-w-2xl leading-relaxed">
              Real-time Razorpay financial settlement, Cloudinary CDN production media studio, single-device session sentinel, and courseware audit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#ffe9a9]/50 border border-[#ffe9a9] text-[#1e1915] text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ea6510] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Financial & Infrastructure Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total GMV */}
        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#645548] font-semibold mb-1">
            <span>Gross Revenue (GMV)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-[#1e1915] font-mono tabular-nums">
            ₹{grossRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">
            {purchases.length} total student checkouts
          </span>
        </div>

        {/* Platform 30% */}
        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#645548] font-semibold mb-1">
            <span>Platform Net (30%)</span>
            <Sparkles className="w-3.5 h-3.5 text-[#ea6510]" />
          </div>
          <span className="text-2xl font-black text-[#ea6510] font-mono tabular-nums">
            ₹{platformRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">
            Infrastructure & DRM Margin
          </span>
        </div>

        {/* Contributor 70% */}
        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#645548] font-semibold mb-1">
            <span>Author Royalty (70%)</span>
            <Users className="w-3.5 h-3.5 text-[#2d6289]" />
          </div>
          <span className="text-2xl font-black text-[#2d6289] font-mono tabular-nums">
            ₹{contributorPool.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">
            Contributor escrow reserve
          </span>
        </div>

        {/* Cloudinary Photos */}
        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#645548] font-semibold mb-1">
            <span>Cloudinary Assets</span>
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-[#1e1915] font-mono tabular-nums">
            {photos.length}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1 font-semibold">
            mcjwmthb Cloud CDN
          </span>
        </div>

        {/* Active Sessions */}
        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#645548] font-semibold mb-1">
            <span>Active Sessions</span>
            <Laptop className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-[#1e1915] font-mono tabular-nums">
            {sessions.filter((s) => s.isValid).length}
          </span>
          <span className="text-[11px] text-blue-700 block mt-1 font-semibold">
            1 Device / Student Sentinel
          </span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex border-b border-[#ffe9a9] text-xs font-bold gap-6 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('financials')}
          className={`pb-3 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'financials'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Revenue & Transactions ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Cloudinary Media Studio ({photos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Document Moderation ({documents.filter((d) => d.status === 'pending_review').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Active Device Sentinel ({sessions.filter((s) => s.isValid).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'security'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security Audit Logs ({securityLogs.length})</span>
        </button>
      </div>

      {/* SECTION 1: FINANCIALS & RAZORPAY LEDGER */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
            <div className="p-4 bg-[#ffe9a9]/30 border-b border-[#ffe9a9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1e1915]">Razorpay Live Settlement Ledger</h3>
                <p className="text-[11px] text-[#645548]">
                  Automated 70/30 split between academic contributors and platform infrastructure.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#ea6510] bg-white px-2.5 py-1 rounded-lg border border-[#ffe9a9]">
                Live Mode Connected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ffe9a9]/20 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Order / Payment ID</th>
                    <th className="p-3.5">Document</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Gross Amount</th>
                    <th className="p-3.5">Platform Net (30%)</th>
                    <th className="p-3.5">Contributor (70%)</th>
                    <th className="p-3.5">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffe9a9]/50 text-[#1e1915]">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#645548] italic">
                        No transactions recorded in ledger yet. Purchases via Razorpay checkout will reflect in real-time here.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => {
                      const netPlatform = Math.round(p.amount * 0.3);
                      const netContributor = p.amount - netPlatform;
                      const matchedDoc = documents.find((d) => d.id === p.documentId);

                      return (
                        <tr key={p.id} className="hover:bg-[#ffe9a9]/15 transition-colors">
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-[11px] text-[#1e1915]">
                              {p.orderId}
                            </div>
                            <div className="font-mono text-[10px] text-[#645548]">
                              {p.paymentId || 'pay_verified'}
                            </div>
                          </td>
                          <td className="p-3.5 max-w-xs truncate font-medium">
                            {matchedDoc ? matchedDoc.title : p.documentId}
                          </td>
                          <td className="p-3.5 text-[#645548] font-mono text-[11px]">
                            {p.userId}
                          </td>
                          <td className="p-3.5 font-bold font-mono text-emerald-700">
                            ₹{p.amount}
                          </td>
                          <td className="p-3.5 font-bold font-mono text-[#ea6510]">
                            ₹{netPlatform}
                          </td>
                          <td className="p-3.5 font-bold font-mono text-[#2d6289]">
                            ₹{netContributor}
                          </td>
                          <td className="p-3.5 text-[#645548] text-[11px]">
                            {new Date(p.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CLOUDINARY MEDIA STUDIO */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="p-6 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <UploadCloud className="w-5 h-5 text-[#ea6510]" />
              <h3 className="text-base font-bold text-[#1e1915]">Upload Image to Cloudinary CDN</h3>
            </div>
            <p className="text-xs text-[#645548] mb-5">
              Directly upload high-resolution campus photography, study flatlays, or courseware previews to Cloudinary repository (<span className="font-mono font-semibold text-[#1e1915]">mcjwmthb</span> / folder: <span className="font-mono font-semibold text-[#1e1915]">academivault/site-assets</span>).
            </p>

            <form onSubmit={handleUploadPhoto} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1e1915] mb-1">
                    Image File (JPG, PNG, WebP)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#ffe9a9] file:text-[#1e1915] hover:file:bg-[#ffcb56]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e1915] mb-1">
                    Photo Name / Display Label
                  </label>
                  <input
                    type="text"
                    value={photoName}
                    onChange={(e) => setPhotoName(e.target.value)}
                    placeholder="e.g., Campus Library Reading Quad"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#ffe9a9] bg-white text-[#1e1915] focus:outline-none focus:border-[#ea6510]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {uploadSuccess && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Image successfully deployed to Cloudinary CDN!</span>
                  </div>
                )}
                {!uploadSuccess && <div />}

                <button
                  type="submit"
                  disabled={uploadingPhoto || !selectedFile}
                  className="px-6 py-2.5 rounded-xl bg-[#ea6510] hover:bg-[#d45707] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{uploadingPhoto ? 'Uploading to Cloudinary...' : 'Upload Asset to CDN'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Cloudinary Visual Asset Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1e1915]">Cloudinary CDN Asset Library</h3>
                <p className="text-xs text-[#645548]">
                  Production image assets served through global high-speed Cloudinary edge CDN.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#645548]">
                {photos.length} total hosted images
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {photos.map((photo) => {
                const isCopied = copiedPhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail Preview */}
                      <div className="relative h-44 w-full overflow-hidden bg-neutral-100 border-b border-[#ffe9a9]">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                          title="Open original CDN file in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Metadata */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-xs text-[#1e1915] truncate" title={photo.name}>
                          {photo.name}
                        </h4>
                        <div className="text-[10px] text-[#645548] font-mono space-y-0.5">
                          <p className="truncate" title={photo.publicId}>ID: {photo.publicId}</p>
                          <p>{photo.bytes ? `${(photo.bytes / 1024).toFixed(1)} KB` : 'Cloudinary Media'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 space-y-2">
                      <button
                        onClick={() => handleCopyUrl(photo)}
                        className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isCopied
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-[#ffe9a9] hover:bg-[#ffe9a9]/60 text-[#1e1915]'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#ea6510]" />}
                        <span>{isCopied ? 'Copied CDN URL!' : 'Copy CDN Link'}</span>
                      </button>

                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="w-full py-1.5 px-3 rounded-xl bg-transparent hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Asset</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: COURSEWARE MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#ffe9a9]/30 border-b border-[#ffe9a9]">
            <h3 className="text-sm font-bold text-[#1e1915]">Courseware Moderation & Copyright Audit</h3>
            <p className="text-[11px] text-[#645548]">
              Verify syllabus alignment and copyright compliance before making notes discoverable.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ffe9a9]/20 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Document Title</th>
                  <th className="p-3.5">Contributor</th>
                  <th className="p-3.5">Institution</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffe9a9]/50 text-[#1e1915]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#ffe9a9]/15 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#1e1915] max-w-xs truncate">{doc.title}</div>
                      <div className="text-[11px] text-[#645548] capitalize">
                        {doc.category.replace(/_/g, ' ')} · {doc.pageCount} pages
                      </div>
                    </td>
                    <td className="p-3.5 font-medium">{doc.contributorName}</td>
                    <td className="p-3.5 text-[#645548]">{doc.collegeName}</td>
                    <td className="p-3.5 font-mono font-bold tabular-nums">₹{doc.price}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          doc.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : doc.status === 'pending_review'
                            ? 'bg-amber-50 text-amber-800 border border-[#ffcb56]'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {doc.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(doc.id, 'approved')}
                          className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-all active:scale-95 shadow-2xs"
                        >
                          Approve
                        </button>
                      )}
                      {doc.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(doc.id, 'rejected')}
                          className="px-3 py-1 rounded-xl bg-[#ffe9a9]/60 text-[#ea6510] hover:bg-[#ffe9a9] border border-[#ffe9a9] font-bold text-xs transition-all active:scale-95"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: ACTIVE DEVICE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#ffe9a9]/30 border-b border-[#ffe9a9]">
            <h3 className="text-sm font-bold text-[#1e1915]">Single-Device Active Registry</h3>
            <p className="text-[11px] text-[#645548]">
              Enforces the rule that an account can only be active on one device at a time.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ffe9a9]/20 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Device & Browser</th>
                  <th className="p-3.5">Client IP Address</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Active</th>
                  <th className="p-3.5 text-right">Revocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffe9a9]/50 text-[#1e1915]">
                {sessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-[#ffe9a9]/15 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#1e1915]">{s.deviceLabel}</div>
                      <div className="text-[10px] text-[#645548] max-w-sm truncate">{s.userAgent}</div>
                    </td>
                    <td className="p-3.5 font-mono text-xs">{s.ipAddress}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.isValid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {s.isValid ? 'Active Session' : 'Terminated'}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#645548] text-[11px]">
                      {new Date(s.lastActivityAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      {s.isValid && (
                        <button
                          onClick={() => handleRevokeSession(s.sessionId)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-colors"
                        >
                          Force Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: SECURITY AUDIT LOGS */}
      {activeTab === 'security' && (
        <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#ffe9a9]/30 border-b border-[#ffe9a9]">
            <h3 className="text-sm font-bold text-[#1e1915]">DRM & Intellectual Property Sentinel Logs</h3>
            <p className="text-[11px] text-[#645548]">
              Automated deterrence against screen grabs, rapid pagination scraping, and concurrent logins.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ffe9a9]/20 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Incident Type</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffe9a9]/50 text-[#1e1915]">
                {securityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#645548] italic">
                      Zero DRM security infractions recorded. Single-device sentinel is healthy.
                    </td>
                  </tr>
                ) : (
                  securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#ffe9a9]/15 transition-colors">
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : log.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold font-mono text-[11px]">
                        {log.eventType}
                      </td>
                      <td className="p-3.5 text-[#645548] max-w-md">
                        {log.details}
                      </td>
                      <td className="p-3.5 font-mono text-xs">{log.ipAddress}</td>
                      <td className="p-3.5 text-[#645548] text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
