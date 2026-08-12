'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

interface Props {
  onContinue: () => void;
}

export default function GuidelinesModal({ onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-2xl mx-auto cyber-glass-glow rounded-2xl p-6 sm:p-8 border border-cyber-border shadow-cyber-card space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-cyber-border">
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-mono text-cyber-text">
            REGISTRATION DIRECTIVES & GUIDELINES
          </h2>
          <p className="text-xs font-mono text-cyber-text-muted">
            PLEASE REVIEW OPERATIONAL RULES BEFORE PROCEEDING
          </p>
        </div>
      </div>

      {/* Grid: DOs vs DON'Ts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        {/* DOs */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>MANDATORY DOs</span>
          </div>
          <ul className="space-y-2.5 text-cyber-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Enter name strictly as per SIS login (No changes will be allowed after submission)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Use your own authentic Google account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Provide accurate University Register / Roll Number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Verify your credit type (PE for CSE / UE for Others)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Enter authentic 12-digit UPI UTR transaction reference</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Upload clear, legible payment screenshot receipt</span>
            </li>
          </ul>
        </div>

        {/* DON'Ts */}
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <XCircle className="w-4 h-4" />
            <span>PROHIBITED DON'Ts</span>
          </div>
          <ul className="space-y-2.5 text-cyber-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-red-400">✕</span>
              <span>Do not submit multiple or duplicate registrations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✕</span>
              <span>Do not reuse someone else's UTR reference</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✕</span>
              <span>Do not upload fabricated, cropped or fake payment slips</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✕</span>
              <span>Do not enter incorrect or proxy student roll numbers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✕</span>
              <span>Fraudulent submissions result in immediate permanent ban</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-4 flex justify-end">
        <CyberButton variant="primary" glow size="md" onClick={onContinue} className="gap-2">
          <span>I UNDERSTAND & CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </CyberButton>
      </div>
    </motion.div>
  );
}
