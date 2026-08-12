'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationInput } from '@/lib/validation';
import { Edit3, User, BookOpen, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  form: UseFormReturn<FullRegistrationInput>;
  onEditStep: (stepNumber: number) => void;
  isConfirmed: boolean;
  setIsConfirmed: (val: boolean) => void;
}

export default function Step4Review({ form, onEditStep, isConfirmed, setIsConfirmed }: Props) {
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

      {/* Confirmation Checkbox */}
      <div className="pt-2">
        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isConfirmed ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-cyber-surface/40 border-cyber-border hover:bg-cyber-surface/60'}`}>
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-0.5 flex-shrink-0 appearance-none w-4 h-4 border border-cyber-primary rounded bg-cyber-bg checked:bg-emerald-500 checked:border-emerald-500 transition-all relative
              before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIj48L3BvbHlsaW5lPjwvc3ZnPg==')] 
              before:bg-center before:bg-no-repeat before:bg-[length:12px_12px] before:opacity-0 checked:before:opacity-100"
          />
          <span className={`text-[11px] leading-relaxed transition-colors ${isConfirmed ? 'text-emerald-400' : 'text-cyber-text-muted'}`}>
            I verify that all the information provided above is accurate. I understand that submitting this form will confirm my registration slot and require an immediate payment of ₹300.
          </span>
        </label>
      </div>
    </div>
  );
}
