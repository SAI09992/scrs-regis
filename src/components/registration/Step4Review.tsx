'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationInput } from '@/lib/validation';
import { Edit3, User, BookOpen, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  form: UseFormReturn<FullRegistrationInput>;
  onEditStep: (stepNumber: number) => void;
}

export default function Step4Review({ form, onEditStep }: Props) {
  const values = form.getValues();

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-cyber-border pb-3">
        <h3 className="text-base font-bold text-cyber-primary flex items-center justify-between">
          <span>STEP 3 : APPLICATION PREVIEW & CONFIRMATION</span>
          <span className="text-xs px-2.5 py-1 rounded bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40 font-bold">
            FEE: ₹300
          </span>
        </h3>
        <p className="text-xs text-cyber-text-muted mt-0.5">
          Review your official registration dossier before proceeding to the UPI payment gateway.
        </p>
      </div>

      {/* Section 1: Personal Identification */}
      <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-3">
        <div className="flex items-center justify-between text-cyber-primary font-bold">
          <span className="flex items-center gap-1.5 text-xs">
            <User className="w-4 h-4 text-cyber-primary" /> PERSONAL IDENTIFICATION
          </span>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="px-2 py-1 rounded bg-cyber-bg border border-cyber-border text-cyber-text-muted hover:text-cyber-primary flex items-center gap-1 text-[11px] transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-cyber-text-muted pt-1">
          <div>
            <span className="text-cyber-text-dim block text-[10px]">FULL NAME:</span>
            <span className="text-cyber-text font-bold text-sm">{values.name}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block text-[10px]">AUTHENTICATED EMAIL:</span>
            <span className="text-cyber-text truncate block font-bold">{values.email}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block text-[10px]">WHATSAPP / PHONE:</span>
            <span className="text-cyber-text font-bold">{values.phone}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Academic Details */}
      <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-3">
        <div className="flex items-center justify-between text-cyber-secondary font-bold">
          <span className="flex items-center gap-1.5 text-xs">
            <BookOpen className="w-4 h-4 text-cyber-secondary" /> ACADEMIC & CREDIT TRACK
          </span>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="px-2 py-1 rounded bg-cyber-bg border border-cyber-border text-cyber-text-muted hover:text-cyber-secondary flex items-center gap-1 text-[11px] transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-cyber-text-muted pt-1">
          <div>
            <span className="text-cyber-text-dim block text-[10px]">CREDIT TRACK ELIGIBILITY:</span>
            <span className="text-emerald-400 font-bold text-xs">
              {values.creditType === 'UE_CSE' ? 'PE — CSE (₹300)' : 'UE — Other Departments (₹300)'}
            </span>
          </div>
          <div>
            <span className="text-cyber-text-dim block text-[10px]">REGISTER / ROLL NO:</span>
            <span className="text-cyber-text font-bold">{values.registerNumber}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block text-[10px]">DEPARTMENT:</span>
            <span className="text-cyber-text font-bold">{values.department}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block text-[10px]">YEAR OF STUDY:</span>
            <span className="text-cyber-text">{values.year}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block text-[10px]">SECTION:</span>
            <span className="text-cyber-text">{values.section}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block text-[10px]">INSTITUTION:</span>
            <span className="text-cyber-text truncate block">{values.college}</span>
          </div>
        </div>
      </div>

      {/* Section 3: Official Registration Fee Invoice Summary */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyber-primary/40 space-y-3">
        <div className="flex items-center justify-between text-cyber-primary font-bold">
          <span className="flex items-center gap-1.5 text-xs">
            <FileText className="w-4 h-4 text-cyber-primary" /> REGISTRATION FEE BREAKDOWN
          </span>
          <span className="text-[10px] text-cyber-text-dim">NEXTGEN SOC BOOTCAMP 2026</span>
        </div>

        <div className="space-y-2 pt-1 border-t border-cyber-primary/20 text-xs">
          <div className="flex justify-between text-cyber-text-muted">
            <span>2-Day Hands-on Workshop Fee</span>
            <span>₹300</span>
          </div>
          <div className="flex justify-between text-cyber-text-muted">
            <span>SOC Lab Materials & Certificate Access</span>
            <span className="text-emerald-400 font-bold">INCLUDED</span>
          </div>
          <div className="flex justify-between text-cyber-text font-extrabold text-sm pt-2 border-t border-cyber-primary/30">
            <span>TOTAL AMOUNT PAYABLE ON NEXT STEP</span>
            <span className="text-cyber-primary">₹300</span>
          </div>
        </div>
      </div>

      {/* Confirmation Badge */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-cyber-surface/80 border border-cyber-border text-emerald-400 text-[11px]">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>I confirm that all previewed details above match my official university records.</span>
      </div>
    </div>
  );
}
