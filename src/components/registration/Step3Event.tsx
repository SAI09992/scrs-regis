'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationInput } from '@/lib/validation';
import { ShieldCheck, Laptop, Target, MessageSquare } from 'lucide-react';

interface Props {
  form: UseFormReturn<FullRegistrationInput>;
}

const interestOptions = [
  'SIEM & Log Parsing',
  'Network Packet Analysis',
  'EDR & Threat Hunting',
  'Memory Forensics',
  'Adversary Simulation',
  'Incident Response & DFIR',
];

export default function Step3Event({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const currentInterests = watch('interests') || [];

  const toggleInterest = (interest: string) => {
    if (currentInterests.includes(interest)) {
      setValue(
        'interests',
        currentInterests.filter((i) => i !== interest)
      );
    } else {
      setValue('interests', [...currentInterests, interest]);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-cyber-border pb-3">
        <h3 className="text-base font-bold text-cyber-primary">
          STEP 3 : TECHNICAL PREFERENCES & WORKSHOP PROFILE
        </h3>
        <p className="text-xs text-cyber-text-muted">
          Helps us configure your dedicated SOC lab virtual range environment.
        </p>
      </div>

      {/* Prior Experience */}
      <div className="space-y-1.5">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyber-primary" />
          <span>Prior Cybersecurity Experience *</span>
        </label>
        <select
          {...register('priorExperience')}
          className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary transition-colors"
        >
          <option value="Beginner">Beginner (New to SOC & SIEM)</option>
          <option value="Intermediate">Intermediate (Familiar with Wireshark / Linux / Networking)</option>
          <option value="Advanced">Advanced (Participated in CTFs / Security Labs)</option>
        </select>
        {errors.priorExperience && (
          <p className="text-[11px] text-red-400">{errors.priorExperience.message}</p>
        )}
      </div>

      {/* Operating System */}
      <div className="space-y-1.5">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <Laptop className="w-3.5 h-3.5 text-cyber-secondary" />
          <span>Primary Laptop Operating System *</span>
        </label>
        <select
          {...register('preferredOperatingSystem')}
          className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary transition-colors"
        >
          <option value="Windows">Windows (10 / 11)</option>
          <option value="Linux">Linux (Ubuntu / Kali / Fedora / Arch)</option>
          <option value="macOS">macOS (Apple Silicon / Intel)</option>
        </select>
        {errors.preferredOperatingSystem && (
          <p className="text-[11px] text-red-400">{errors.preferredOperatingSystem.message}</p>
        )}
      </div>

      {/* Areas of Interest */}
      <div className="space-y-2">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Key SOC Areas of Interest (Select all that apply) *</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {interestOptions.map((opt) => {
            const isSelected = currentInterests.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggleInterest(opt)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary font-bold shadow-cyber-glow-sm'
                    : 'bg-cyber-surface/40 border-cyber-border text-cyber-text-muted hover:border-cyber-primary/40'
                }`}
              >
                {opt}
              </div>
            );
          })}
        </div>
        {errors.interests && (
          <p className="text-[11px] text-red-400">{errors.interests.message}</p>
        )}
      </div>

      {/* Dietary or Accessibility notes */}
      <div className="space-y-1.5">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Special Accessibility or Lab Requirements (Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Wheelchair access, dietary requests, etc."
          {...register('dietaryOrAccessibility')}
          className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary transition-colors"
        />
      </div>
    </div>
  );
}
