import React, { useState, useEffect } from 'react';
import { AcademicDocument, SecurityEventLog, UserSession } from '../../types';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Users,
  FileText,
  DollarSign,
  Activity,
  Check,
  X,
  Trash2,
  AlertTriangle,
  Laptop
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'moderation' | 'sessions' | 'security'>('moderation');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, docs, sess, logs] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminDocuments(),
        api.getAdminSessions(),
        api.getAdminSecurityLogs()
      ]);
      setOverview(ov);
      setDocuments(docs);
      setSessions(sess);
      setSecurityLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminDocumentStatus(id, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.revokeAdminSession(sessionId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#ea6510] uppercase tracking-wider mb-1">
            Platform Administration & Security Center
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e1915]">Administrative Governance</h2>
          <p className="text-xs text-[#645548] mt-0.5">
            Single-device session enforcement, copyright moderation, and financial settlement logs.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <span className="text-xs text-[#645548] font-semibold block mb-1">Total Sales</span>
          <span className="text-2xl font-extrabold text-[#1e1915] tabular-nums font-mono">
            ₹{overview?.grossRevenue || 0}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">{overview?.totalPurchases || 0} Transactions</span>
        </div>

        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <span className="text-xs text-[#645548] font-semibold block mb-1">Platform Revenue (30%)</span>
          <span className="text-2xl font-extrabold text-[#ea6510] tabular-nums font-mono">
            ₹{overview?.platformEarnings || 0}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">DRM & Infra share</span>
        </div>

        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <span className="text-xs text-[#645548] font-semibold block mb-1">Active Sessions</span>
          <span className="text-2xl font-extrabold text-[#1e1915] tabular-nums font-mono">
            {overview?.activeSessionsCount || 0}
          </span>
          <span className="text-[11px] text-[#2d6289] block mt-1 font-semibold">1 session / user verified</span>
        </div>

        <div className="p-5 bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] shadow-2xs">
          <span className="text-xs text-[#645548] font-semibold block mb-1">Pending Moderation</span>
          <span className="text-2xl font-extrabold text-amber-700 tabular-nums font-mono">
            {overview?.pendingModerationCount || 0}
          </span>
          <span className="text-[11px] text-[#645548]/70 block mt-1 font-medium">Queued submissions</span>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex border-b border-[#ffe9a9] text-xs font-bold">
        <button
          onClick={() => setActiveSection('moderation')}
          className={`pb-3 mr-6 transition-colors ${
            activeSection === 'moderation'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          Document Moderation Queue ({documents.filter((d) => d.status === 'pending_review').length})
        </button>
        <button
          onClick={() => setActiveSection('sessions')}
          className={`pb-3 mr-6 transition-colors ${
            activeSection === 'sessions'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          Active Device Sessions Registry ({sessions.filter((s) => s.isValid).length})
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`pb-3 transition-colors ${
            activeSection === 'security'
              ? 'text-[#ea6510] border-b-2 border-[#ea6510]'
              : 'text-[#645548] hover:text-[#1e1915]'
          }`}
        >
          DRM & Security Audit Logs ({securityLogs.length})
        </button>
      </div>

      {/* Section 1: Moderation Queue */}
      {activeSection === 'moderation' && (
        <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ffe9a9]/30 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Document</th>
                <th className="p-4">Contributor</th>
                <th className="p-4">College</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffe9a9]/60 text-[#1e1915]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#ffe9a9]/15 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#1e1915] max-w-xs truncate">{doc.title}</div>
                    <div className="text-[11px] text-[#645548] capitalize">{doc.category.replace(/_/g, ' ')} · {doc.pageCount} pages</div>
                  </td>
                  <td className="p-4 font-medium">{doc.contributorName}</td>
                  <td className="p-4 text-[#645548]">{doc.collegeName}</td>
                  <td className="p-4 font-mono font-bold tabular-nums">₹{doc.price}</td>
                  <td className="p-4">
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
                  <td className="p-4 text-right space-x-2">
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
      )}

      {/* Section 2: Session Registry */}
      {activeSection === 'sessions' && (
        <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#ffe9a9]/20 border-b border-[#ffe9a9] text-xs text-[#1e1915]">
            <strong>Single-Device Session Registry:</strong> Strict 1-account-to-1-active-session authorization. Clicking "Force Terminate" revokes that device token immediately.
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ffe9a9]/30 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">Device Label</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Created</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffe9a9]/60 text-[#1e1915]">
              {sessions.map((s) => (
                <tr key={s.sessionId} className="hover:bg-[#ffe9a9]/15 transition-colors">
                  <td className="p-4 font-mono font-medium text-[#645548]">{s.userId}</td>
                  <td className="p-4 font-bold text-[#1e1915] flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-[#ea6510]" />
                    <span>{s.deviceLabel}</span>
                  </td>
                  <td className="p-4 font-mono text-[#645548]">{s.ipAddress}</td>
                  <td className="p-4 text-[#645548] font-mono">{new Date(s.createdAt).toLocaleTimeString()}</td>
                  <td className="p-4">
                    {s.isValid ? (
                      <span className="text-[#2d6289] font-bold bg-[#73a5ca]/15 px-2.5 py-0.5 rounded-md border border-[#73a5ca]/30">
                        Active Authorized
                      </span>
                    ) : (
                      <span className="text-[#645548] font-medium bg-[#ffe9a9]/40 px-2 py-0.5 rounded">
                        Terminated
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {s.isValid && (
                      <button
                        onClick={() => handleRevokeSession(s.sessionId)}
                        className="px-3 py-1 rounded-xl bg-[#ffe9a9]/60 text-[#ea6510] hover:bg-[#ffe9a9] border border-[#ffe9a9] text-xs font-bold transition-all active:scale-95"
                      >
                        Force Terminate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 3: Security & DRM Logs */}
      {activeSection === 'security' && (
        <div className="bg-[#fffdf6] rounded-2xl border border-[#ffe9a9] overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ffe9a9]/30 border-b border-[#ffe9a9] text-[#645548] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event Type</th>
                <th className="p-4">User / IP</th>
                <th className="p-4">Audit Details</th>
                <th className="p-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffe9a9]/60 text-[#1e1915]">
              {securityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#ffe9a9]/15 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-[#645548] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-4 font-bold text-[#1e1915] font-mono text-[11px]">
                    {log.eventType}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-[#1e1915]">{log.userEmail || 'Anonymous'}</div>
                    <div className="font-mono text-[10px] text-[#645548]">{log.ipAddress}</div>
                  </td>
                  <td className="p-4 max-w-md text-[#645548] leading-relaxed">{log.details}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        log.severity === 'critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : log.severity === 'warning'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-[#ffe9a9]/40 text-[#ea6510] border border-[#ffe9a9]'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
