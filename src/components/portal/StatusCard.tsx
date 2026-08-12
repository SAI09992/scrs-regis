'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CyberButton } from '@/components/ui/CyberButton';
import { maskUtr, formatDate } from '@/lib/utils';
import { PaymentData } from '@/types';
import { ShieldCheck, Clock, AlertTriangle, ArrowRight, RefreshCw, FileText } from 'lucide-react';

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
            <CyberButton variant="primary" glow size="md" className="gap-2">
              <span>SUBMIT PAYMENT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </CyberButton>
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

      {/* Rejected State Info */}
      {isRejected && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-400 text-xs space-y-1">
            <div className="font-bold">PAYMENT NOT VERIFIED</div>
            <p className="text-[11px] text-cyber-text-muted">
              Reason: {payment.rejectionReason || 'UTR or payment screenshot could not be matched with banking records.'}
            </p>
          </div>

          <div>
            <Link href={`/register/payment?regId=${registrationId}`}>
              <CyberButton variant="danger" size="md" className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RE-SUBMIT CORRECT PAYMENT DETAILS</span>
              </CyberButton>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}
