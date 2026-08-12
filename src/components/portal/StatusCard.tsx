'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { maskUtr, formatDate } from '@/lib/utils';
import { PaymentData } from '@/types';
import { ShieldCheck, Clock, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

interface Props {
  payment?: PaymentData | null;
  registrationId: string;
}

export default function StatusCard({ payment, registrationId }: Props) {
  if (!payment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl cyber-glass border border-amber-500/40 font-mono text-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Clock className="w-5 h-5" />
            <span>PAYMENT PENDING SUBMISSION</span>
          </div>
          <StatusBadge status="pending" />
        </div>

        <p className="text-cyber-text-muted leading-relaxed">
          Your registration has been created. Please complete your fee payment and submit the transaction UTR reference with screenshot to secure your seat.
        </p>

        <div className="pt-2">
          <Link href={`/register/payment?regId=${registrationId}`}>
            <button className="px-4 py-2.5 rounded-xl bg-cyber-primary text-cyber-bg font-bold hover:bg-cyber-primary/90 transition-colors flex items-center gap-2 shadow-cyber-glow-sm">
              <span>SUBMIT PAYMENT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </motion.div>
    );
  }

  const isVerified = payment.status === 'verified';
  const isPending = payment.status === 'pending';
  const isRejected = payment.status === 'rejected';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl cyber-glass border font-mono text-xs space-y-4 transition-all duration-500 ${
        isVerified
          ? 'border-emerald-500/50 shadow-cyber-glow-emerald'
          : isRejected
          ? 'border-red-500/50 shadow-cyber-glow-danger'
          : 'border-amber-500/50 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cyber-border/80">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : isRejected ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          )}
          <span className="text-sm font-bold text-cyber-text">
            PAYMENT STATUS
          </span>
        </div>

        <StatusBadge status={payment.status} />
      </div>

      {/* Verified State Info */}
      {isVerified && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 leading-relaxed text-xs">
            ✓ Your payment has been verified by the SOC operations team. Your bootcamp seat is officially confirmed.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-cyber-text-muted">
            <div>
              <span className="text-cyber-text-dim block">Amount Verified:</span>
              <span className="text-cyber-text font-bold text-sm">₹{payment.amount}</span>
            </div>
            <div>
              <span className="text-cyber-text-dim block">Masked UTR:</span>
              <span className="text-cyber-text font-mono font-bold">{maskUtr(payment.utr)}</span>
            </div>
            <div>
              <span className="text-cyber-text-dim block">Verified At:</span>
              <span className="text-cyber-text">{formatDate(payment.verifiedAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pending State Info */}
      {isPending && (
        <div className="space-y-3">
          <p className="text-cyber-text-muted leading-relaxed">
            Your payment details have been submitted successfully and are awaiting verification by the organizers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border text-cyber-text-muted">
            <div>
              <span className="text-cyber-text-dim block">Submitted UTR:</span>
              <span className="text-cyber-text font-bold">{maskUtr(payment.utr)}</span>
            </div>
            <div>
              <span className="text-cyber-text-dim block">Submitted At:</span>
              <span className="text-cyber-text">{formatDate(payment.submittedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-cyber-primary">
            <span className="w-2 h-2 rounded-full bg-cyber-primary animate-ping" />
            <span>LIVE SYNC ACTIVE // Dashboard updates immediately upon verification</span>
          </div>
        </div>
      )}

      {/* Rejected State Info — No Resubmit Option */}
      {isRejected && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/60 text-red-400 text-xs space-y-2">
            <div className="font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>PAYMENT VERIFICATION REJECTED BY ADMIN</span>
            </div>
            <p className="text-xs text-cyber-text-muted leading-relaxed">
              Reason: <span className="text-red-300 font-bold">{payment.rejectionReason || 'UTR or payment screenshot could not be matched with banking records.'}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border text-cyber-text-dim text-xs leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyber-text block mb-0.5">Re-submission Disabled</span>
              Re-submission of payment details is locked. If you believe this rejection is a mistake or need assistance, please contact the student event coordinators directly via the contact links on the landing page.
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
