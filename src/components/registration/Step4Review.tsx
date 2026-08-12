'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationInput } from '@/lib/validation';
import { Edit3, User, BookOpen } from 'lucide-react';

interface Props {
  form: UseFormReturn<FullRegistrationInput>;
  onEditStep: (stepNumber: number) => void;
}

export default function Step4Review({ form, onEditStep }: Props) {
  const values = form.getValues();

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="border-b border-cyber-border pb-3">
        <h3 className="text-base font-bold text-cyber-primary flex items-center justify-between">
          <span>STEP 3 : APPLICATION REVIEW & CONFIRMATION</span>
          <span className="text-xs px-2.5 py-1 rounded bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40">
            FEE: ₹300
          </span>
        </h3>
        <p className="text-xs text-cyber-text-muted mt-0.5">
          Please verify all details carefully before advancing to payment gateway.
        </p>
      </div>

      {/* Section 1: Personal Details */}
      <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-3">
        <div className="flex items-center justify-between text-cyber-primary font-bold">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> PERSONAL IDENTIFICATION
          </span>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-cyber-text-muted hover:text-cyber-primary flex items-center gap-1 text-[11px]"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-cyber-text-muted">
          <div>
            <span className="text-cyber-text-dim block">Full Name:</span>
            <span className="text-cyber-text font-bold">{values.name}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block">Google Email:</span>
            <span className="text-cyber-text">{values.email}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block">Contact Phone:</span>
            <span className="text-cyber-text">{values.phone}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Academic Details */}
      <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-3">
        <div className="flex items-center justify-between text-cyber-secondary font-bold">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> ACADEMIC & CREDIT TRACK
          </span>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-cyber-text-muted hover:text-cyber-secondary flex items-center gap-1 text-[11px]"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-cyber-text-muted">
          <div>
            <span className="text-cyber-text-dim block">Credit Track:</span>
            <span className="text-emerald-400 font-bold">
              {values.creditType === 'UE_CSE' ? 'PE — CSE (₹300)' : 'UE — Other Departments (₹300)'}
            </span>
          </div>
          <div>
            <span className="text-cyber-text-dim block">Register Number:</span>
            <span className="text-cyber-text font-bold">{values.registerNumber}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block">Department:</span>
            <span className="text-cyber-text">{values.department}</span>
          </div>
          <div>
            <span className="text-cyber-text-dim block">Year / Section:</span>
            <span className="text-cyber-text">{values.year} (Sec {values.section})</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-cyber-text-dim block">College:</span>
            <span className="text-cyber-text truncate block">{values.college}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
