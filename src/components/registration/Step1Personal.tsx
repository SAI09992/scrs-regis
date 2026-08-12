'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationInput } from '@/lib/validation';
import { User, Mail, Phone, Lock } from 'lucide-react';

interface Props {
  form: UseFormReturn<FullRegistrationInput>;
  googleEmail: string;
}

export default function Step1Personal({ form, googleEmail }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-cyber-border pb-3">
        <h3 className="text-base font-bold text-cyber-primary">
          STEP 1 : PERSONAL IDENTIFICATION
        </h3>
        <p className="text-xs text-cyber-text-muted">
          Your Google authentication email is locked for security integrity.
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-cyber-primary" />
          <span>Full Name (as per SIS Login) *</span>
        </label>
        <input
          type="text"
          placeholder="Enter your full name as per SIS login"
          {...register('name')}
          className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary transition-colors"
        />
        <p className="text-[10px] text-amber-400 font-sans">
          ⚠️ Enter name strictly as per your SIS login. No changes will be allowed after submission.
        </p>
        {errors.name && (
          <p className="text-[11px] text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email (Locked) */}
      <div className="space-y-1.5">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-cyber-secondary" />
          <span>Verified Google Email (Read-Only)</span>
          <Lock className="w-3 h-3 text-cyber-text-dim ml-auto" />
        </label>
        <input
          type="email"
          value={googleEmail}
          readOnly
          disabled
          className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-bg-elevated border border-cyber-border text-cyber-text-dim text-sm cursor-not-allowed select-none"
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp / Contact Number (10 Digits) *</span>
        </label>
        <input
          type="tel"
          placeholder="Enter your 10-digit phone number"
          {...register('phone')}
          className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary transition-colors"
        />
        {errors.phone && (
          <p className="text-[11px] text-red-400">{errors.phone.message}</p>
        )}
      </div>
    </div>
  );
}
