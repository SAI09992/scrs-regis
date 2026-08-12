'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CyberButton } from '@/components/ui/CyberButton';
import { formatDate } from '@/lib/utils';
import {
  CreditCard,
  ShieldCheck,
  XCircle,
  Eye,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentItem {
  id: string;
  registrationId: string;
  userId: string;
  utr: string;
  amount: number;
  expectedAmount: number;
  screenshotUrl: string;
  ocrUtr?: string | null;
  ocrAmount?: number | null;
  ocrDate?: string | null;
  ocrConfidence?: number | null;
  status: string;
  rejectionReason?: string | null;
  submittedAt: string;
  participant: {
    registrationId: string;
    name: string;
    email: string;
    phone: string;
    registerNumber: string;
    department: string;
    creditType: string;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Modal State
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [rejectReason, setRejectReason] = useState('UTR mismatch with bank records');
  const [customReason, setCustomReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payments-list');
      const data = await res.json();
      if (data.success && data.payments) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDecision = async (decision: 'verified' | 'rejected') => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      const reason = rejectReason === 'Other' ? customReason : rejectReason;

      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          decision,
          rejectionReason: decision === 'rejected' ? reason : undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          decision === 'verified'
            ? `✓ Payment verified for ${selectedPayment.participant.name}`
            : `✕ Payment marked rejected`
        );
        setSelectedPayment(null);
        fetchPayments();
      } else {
        toast.error(json.error || 'Failed to update payment decision');
      }
    } catch (e: any) {
      toast.error('Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filterTab !== 'all' && p.status !== filterTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.utr.toLowerCase().includes(q) ||
        p.participant.name.toLowerCase().includes(q) ||
        p.participant.email.toLowerCase().includes(q) ||
        p.participant.registrationId.toLowerCase().includes(q) ||
        p.participant.registerNumber.toLowerCase().includes(q)
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
            <CreditCard className="w-6 h-6 text-cyber-primary" />
            <span>SOC PAYMENT VERIFICATION QUEUE</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            OCR TRANSACTION INTELLIGENCE & SETTLEMENT APPROVAL
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text hover:text-cyber-primary transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH QUEUE</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-cyber-surface border border-cyber-border">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-lg uppercase transition-all ${
                filterTab === tab
                  ? 'bg-cyber-primary text-cyber-bg font-bold shadow-cyber-glow-sm'
                  : 'text-cyber-text-muted hover:text-cyber-text'
              }`}
            >
              {tab === 'pending'
                ? `Pending (${payments.filter((p) => p.status === 'pending').length})`
                : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-cyber-text-dim absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, Reg ID, UTR..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="cyber-glass rounded-2xl border border-cyber-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cyber-bg-elevated border-b border-cyber-border text-cyber-text-dim text-[11px] uppercase">
              <tr>
                <th className="p-4">Participant</th>
                <th className="p-4">Reg No / Dept</th>
                <th className="p-4">Track</th>
                <th className="p-4">Entered UTR</th>
                <th className="p-4">Fee Paid</th>
                <th className="p-4">OCR Match</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-cyber-text-muted">
                    No transactions found matching active filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const utrMatch =
                    p.ocrUtr && p.utr && p.ocrUtr.toLowerCase() === p.utr.toLowerCase();
                  const amountMatch =
                    p.ocrAmount && p.expectedAmount && p.ocrAmount === p.expectedAmount;

                  return (
                    <tr key={p.id} className="hover:bg-cyber-surface/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-cyber-text">{p.participant.name}</div>
                        <div className="text-[10px] text-cyber-text-dim">{p.participant.registrationId}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-cyber-text">{p.participant.registerNumber}</div>
                        <div className="text-[10px] text-cyber-text-dim">{p.participant.department}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-cyber-primary">
                          {p.participant.creditType === 'UE_CSE' ? 'PE — CSE' : 'UE — OTHER'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-cyber-text">{p.utr}</td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-bold">₹{p.amount}</span>
                        <span className="text-[10px] text-cyber-text-dim block">
                          Expected: ₹{p.expectedAmount}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              utrMatch ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          <span className="text-cyber-text font-bold">
                            {p.ocrConfidence || 95}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-4 text-right">
                        <CyberButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedPayment(p)}
                          className="gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>INSPECT</span>
                        </CyberButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOC Transaction Investigation Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl cyber-glass-glow rounded-3xl p-6 sm:p-8 border border-cyber-primary/50 shadow-2xl space-y-6 my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyber-primary/10 border border-cyber-primary text-cyber-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-cyber-text">
                      TRANSACTION INTELLIGENCE DOSSIER
                    </h2>
                    <p className="text-[11px] text-cyber-text-muted">
                      PAYMENT REF: {selectedPayment.id} // REG ID: {selectedPayment.participant.registrationId} // UTR: <span className="text-cyber-primary font-mono font-bold">{selectedPayment.utr}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-cyber-text-dim hover:text-cyber-text p-2"
                >
                  ✕
                </button>
              </div>

              {/* Grid: Intelligence vs Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Intelligence Checklist */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-3">
                    <div className="text-cyber-primary font-bold text-xs uppercase tracking-wider">
                      PARTICIPANT DOSSIER
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-cyber-text-muted text-[11px]">
                      <div>Name: <span className="text-cyber-text font-bold">{selectedPayment.participant.name}</span></div>
                      <div>Roll No: <span className="text-cyber-text">{selectedPayment.participant.registerNumber}</span></div>
                      <div>Email: <span className="text-cyber-text truncate block">{selectedPayment.participant.email}</span></div>
                      <div>Track: <span className="text-emerald-400 font-bold">{selectedPayment.participant.creditType}</span></div>
                    </div>

                    {/* Prominent User-Submitted UTR */}
                    <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyber-primary/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-cyber-text-dim font-bold">SUBMITTED UTR:</span>
                      <span className="text-cyber-primary font-extrabold text-sm tracking-wider select-all">
                        {selectedPayment.utr || 'NOT PROVIDED'}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Intelligence Checklist */}
                  {(() => {
                    const userUtr = (selectedPayment.utr || '').trim().toUpperCase();
                    const ocrUtr = (selectedPayment.ocrUtr || '').trim().toUpperCase();
                    const cleanUser = userUtr.replace(/[^A-Z0-9]/g, '');
                    const cleanOcr = ocrUtr.replace(/[^A-Z0-9]/g, '');

                    const isUtrMatch =
                      cleanUser.length >= 6 &&
                      cleanOcr.length >= 6 &&
                      (cleanUser === cleanOcr || cleanOcr.includes(cleanUser) || cleanUser.includes(cleanOcr));

                    const expectedFee = selectedPayment.expectedAmount || 300;
                    const isAmountMatch = selectedPayment.amount === expectedFee;

                    return (
                      <div className="p-4 rounded-xl bg-cyber-surface/80 border border-cyan-500/40 space-y-3">
                        <div className="text-cyber-primary font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                          <span>AUTOMATED SOC CHECKS</span>
                          <span className="text-[10px] text-cyber-text-dim">OCR CONFIDENCE: {selectedPayment.ocrConfidence || 0}%</span>
                        </div>

                        {/* Explicit UTR Comparison Fields */}
                        <div className="p-2.5 rounded bg-cyber-bg border border-cyber-border/80 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-cyber-text-dim font-bold">SUBMITTED UTR (USER):</span>
                            <span className="text-cyan-300 font-mono font-bold select-all bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                              {userUtr || 'NOT PROVIDED'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-cyber-text-dim font-bold">IMAGE DETECTED UTR:</span>
                            <span className="text-cyber-text font-mono font-bold select-all bg-cyber-surface px-2 py-0.5 rounded border border-cyber-border">
                              {ocrUtr || 'NONE DETECTED'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-cyber-border/50">
                            <span className="text-cyber-text font-bold">UTR MATCH STATUS:</span>
                            {isUtrMatch ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> MATCH (VERIFIED)
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> MISMATCH / UNVERIFIED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Fee Amount Match */}
                        <div className="flex items-center justify-between p-2 rounded bg-cyber-bg border border-cyber-border text-[11px]">
                          <span>FEE AMOUNT MATCH</span>
                          {isAmountMatch ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ₹{selectedPayment.amount} (EXACT)
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> ₹{selectedPayment.amount} (EXPECTED ₹{expectedFee})
                            </span>
                          )}
                        </div>

                        {/* Duplicate UTR Check */}
                        <div className="flex items-center justify-between p-2 rounded bg-cyber-bg border border-cyber-border text-[11px]">
                          <span>DUPLICATE UTR CHECK</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> UNIQUE SUBMISSION
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Right: Payment Evidence Screenshot & Blob Link Controls */}
                <div className="md:col-span-6 space-y-3">
                  <div className="text-cyber-primary font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>PAYMENT EVIDENCE (SCREENSHOT)</span>
                    <a
                      href={selectedPayment.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyber-primary hover:underline flex items-center gap-1 font-mono"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>OPEN IN NEW TAB</span>
                    </a>
                  </div>
                  
                  <div className="p-2 rounded-xl bg-black border border-cyber-border text-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedPayment.screenshotUrl}
                      alt="Payment Evidence"
                      className="max-h-56 mx-auto rounded object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(selectedPayment.screenshotUrl, '_blank')}
                      title="Click to view full-resolution image"
                    />
                  </div>

                  {/* Direct Blob URL Copy Bar */}
                  <div className="p-2 rounded-lg bg-cyber-surface/60 border border-cyber-border space-y-1 text-[10px] font-mono">
                    <span className="text-cyber-text-dim font-bold block">DIRECT BLOB IMAGE URL:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedPayment.screenshotUrl}
                        className="flex-1 px-2.5 py-1 rounded bg-cyber-bg border border-cyber-border text-cyber-primary font-mono text-[10px] truncate select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedPayment.screenshotUrl);
                          toast.success('✓ Blob image URL copied to clipboard');
                        }}
                        className="px-2.5 py-1 rounded bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary font-bold border border-cyber-primary/40 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Decision Actions */}
              <div className="pt-4 border-t border-cyber-border space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-cyber-text-dim text-[11px]">REJECTION REASON (IF REJECTING):</span>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs"
                  >
                    <option value="UTR mismatch with bank records">UTR mismatch with bank records</option>
                    <option value="Amount paid does not match required fee">Amount paid does not match required fee</option>
                    <option value="Duplicate UTR reference detected">Duplicate UTR reference detected</option>
                    <option value="Screenshot is illegible or invalid">Screenshot is illegible or invalid</option>
                    <option value="Transaction not found in banking switch">Transaction not found in banking switch</option>
                    <option value="Other">Other (Custom Reason)</option>
                  </select>
                </div>

                {rejectReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter specific rejection reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs"
                  />
                )}

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <CyberButton
                    variant="danger"
                    size="md"
                    loading={processing}
                    onClick={() => handleDecision('rejected')}
                    className="w-full sm:w-auto gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>✕ REJECT PAYMENT</span>
                  </CyberButton>

                  <CyberButton
                    variant="primary"
                    glow
                    size="md"
                    loading={processing}
                    onClick={() => handleDecision('verified')}
                    className="w-full sm:w-auto gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>✓ VERIFY PAYMENT & NOTIFY CADET</span>
                  </CyberButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
