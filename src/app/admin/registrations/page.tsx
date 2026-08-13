'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CyberButton } from '@/components/ui/CyberButton';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  Download,
  Filter,
  RefreshCw,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creditFilter, setCreditFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Deletion modal state
  const [deletingRecord, setDeletingRecord] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Inspect modal state
  const [inspectingRecord, setInspectingRecord] = useState<any | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/registrations-list');
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleExportCsv = () => {
    window.location.href = '/api/admin/export?type=registrations';
    toast.success('Downloading registration CSV export...');
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations-list?id=${deletingRecord.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Registration deleted successfully.');
        setRegistrations((prev) => prev.filter((r) => r.id !== deletingRecord.id));
        setDeletingRecord(null);
      } else {
        toast.error(data.error || 'Failed to delete registration.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = registrations.filter((r) => {
    if (creditFilter !== 'ALL' && r.creditType !== creditFilter) return false;
    if (paymentFilter !== 'ALL') {
      const status = r.paymentStatus || 'unpaid';
      if (status !== paymentFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.registrationId.toLowerCase().includes(q) ||
        r.registerNumber.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-mono text-xs max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-cyber-primary" />
            <span>CADET ROSTER & REGISTRATIONS</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            TOTAL ENROLLED: {registrations.length} CADETS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CyberButton variant="primary" glow size="sm" onClick={handleExportCsv} className="gap-1.5">
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </CyberButton>
          <button
            onClick={fetchRegistrations}
            className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text hover:text-cyber-primary"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyber-text-dim absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name, Reg ID, Roll No..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
          />
        </div>

        {/* Credit Filter */}
        <select
          value={creditFilter}
          onChange={(e) => setCreditFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
        >
          <option value="ALL">All Tracks</option>
          <option value="UE_CSE">PE — CSE</option>
          <option value="PEOPLE_OTHER">PEOPLE — Other (₹450)</option>
        </select>

        {/* Payment Status Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Under Verification</option>
          <option value="rejected">Rejected</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Table */}
      <div className="cyber-glass rounded-2xl border border-cyber-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cyber-bg-elevated border-b border-cyber-border text-cyber-text-dim text-[11px] uppercase">
              <tr>
                <th className="p-4">Reg ID</th>
                <th className="p-4">Cadet Name</th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Dept / Year</th>
                <th className="p-4">Track</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Registered At</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-cyber-text-muted">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-cyber-surface/50 transition-colors">
                    <td className="p-4 font-bold text-cyber-primary">{r.registrationId}</td>
                    <td className="p-4">
                      <div className="font-bold text-cyber-text">{r.name}</div>
                      <div className="text-[10px] text-cyber-text-dim">{r.email}</div>
                    </td>
                    <td className="p-4 text-cyber-text">{r.registerNumber}</td>
                    <td className="p-4">
                      <div>{r.department}</div>
                      <div className="text-[10px] text-cyber-text-dim">{r.year} (Sec {r.section})</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-400">
                        {r.creditType === 'UE_CSE' ? 'PE — CSE' : 'UE — OTHER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.paymentStatus || 'unpaid'} />
                    </td>
                    <td className="p-4 text-cyber-text-dim">{formatDate(r.createdAt)}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => setInspectingRecord(r)}
                        className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-300 transition-colors shadow-sm"
                        title="Inspect Application & Payment"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingRecord(r)}
                        className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 transition-colors shadow-sm"
                        title="Delete Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md cyber-glass-glow rounded-2xl p-6 border border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.25)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>CONFIRM PERMANENT DELETION</span>
              </div>
              <button
                onClick={() => setDeletingRecord(null)}
                className="p-1 text-cyber-text-dim hover:text-cyber-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-cyber-text-muted">
              <p>
                Are you sure you want to permanently delete registration{' '}
                <strong className="text-cyber-primary">{deletingRecord.registrationId}</strong> for{' '}
                <strong className="text-cyber-text">{deletingRecord.name}</strong> ({deletingRecord.registerNumber})?
              </p>
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-[11px]">
                ⚠️ This will immediately free up 1 seat in the live capacity monitor and permanently purge all associated payment records and attendance data.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyber-border">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-text hover:bg-cyber-surface-elevated text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteLoading ? 'DELETING...' : 'YES, DELETE REGISTRATION'}</span>
              </button>
            </div>
          </div>
        </div>
      {/* Inspect Record Modal */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto cyber-glass-glow rounded-2xl p-6 border border-cyber-border shadow-[0_0_40px_rgba(0,229,255,0.15)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
              <div className="flex items-center gap-2 text-cyber-text font-bold">
                <Eye className="w-5 h-5 text-cyber-primary" />
                <span className="text-sm">CADET DOSSIER: {inspectingRecord.registrationId}</span>
              </div>
              <button
                onClick={() => setInspectingRecord(null)}
                className="p-1 rounded-md text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-surface/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-cyber-primary uppercase border-b border-cyber-border/40 pb-2">
                  Academic Profile
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">Full Name</span>
                    <span className="font-bold text-cyber-text">{inspectingRecord.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">Email</span>
                    <span className="font-bold text-cyber-text">{inspectingRecord.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">Phone</span>
                    <span className="font-bold text-cyber-text">{inspectingRecord.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">College</span>
                    <span className="font-bold text-cyber-text text-right max-w-[200px] truncate" title={inspectingRecord.college}>{inspectingRecord.college}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">Roll Number</span>
                    <span className="font-bold text-cyber-text">{inspectingRecord.registerNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">Dept / Year / Sec</span>
                    <span className="font-bold text-cyber-text">
                      {inspectingRecord.department} / {inspectingRecord.year} / {inspectingRecord.section}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">Track Registered</span>
                    <span className="font-bold text-emerald-400">
                      {inspectingRecord.creditType === 'UE_CSE' ? 'PE — CSE' : 'UE — OTHER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-cyber-primary uppercase border-b border-cyber-border/40 pb-2">
                  Payment Profile
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-cyber-text-dim">Status</span>
                    <StatusBadge status={inspectingRecord.paymentStatus || 'unpaid'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">Amount Paid</span>
                    <span className="font-bold text-cyber-text">₹{inspectingRecord.amount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-text-dim">UTR Number</span>
                    <span className="font-bold text-cyber-text font-mono bg-cyber-surface px-1.5 py-0.5 rounded border border-cyber-border">
                      {inspectingRecord.utr || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-cyber-text-dim block mb-2">Payment Screenshot</span>
                  {inspectingRecord.screenshotUrl ? (
                    <a
                      href={inspectingRecord.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group relative rounded-lg overflow-hidden border border-cyber-border hover:border-cyber-primary transition-colors bg-cyber-surface/30 p-2"
                    >
                      <div className="aspect-[4/3] relative flex items-center justify-center overflow-hidden rounded">
                        {inspectingRecord.screenshotUrl.length > 32000 ? (
                          <div className="text-center p-4">
                            <Eye className="w-8 h-8 text-cyber-primary mx-auto mb-2 opacity-50" />
                            <p className="text-[10px] text-cyber-text-muted">Base64 Image Data.<br/>Cannot preview reliably.</p>
                          </div>
                        ) : (
                          <img
                            src={inspectingRecord.screenshotUrl}
                            alt="Payment Proof"
                            className="w-full h-full object-contain"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex items-center gap-2 text-white font-bold bg-cyber-bg-elevated/90 px-3 py-1.5 rounded-lg border border-cyber-border">
                            <Eye className="w-4 h-4" /> View Full Image
                          </div>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="p-4 rounded-lg bg-cyber-surface border border-cyber-border border-dashed text-center text-cyber-text-muted">
                      No screenshot provided.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
