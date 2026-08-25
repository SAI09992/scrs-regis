'use client';

import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FullRegistrationInput } from '@/lib/validation';
import { Hash, Building2, BookOpen, Layers, Lock } from 'lucide-react';

interface Props {
  form: UseFormReturn<FullRegistrationInput>;
}

export default function Step2Academic({ form }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const currentDept = watch('department');
  const currentYear = watch('year');

  // Determine initial selection
  const isInitialCse = currentDept === 'CSE' || currentDept === 'Computer Science and Engineering';
  const [deptChoice, setDeptChoice] = useState<'CSE' | 'Other' | ''>(() => {
    if (!currentDept) return '';
    if (isInitialCse) return 'CSE';
    return 'Other';
  });

  const [customDept, setCustomDept] = useState(() => {
    if (currentDept && !isInitialCse) return currentDept;
    return '';
  });

  // 2nd Year → auto-lock to CSE department (PE credit only)
  const is2ndYear = currentYear === '2nd Year';

  useEffect(() => {
    if (is2ndYear) {
      setDeptChoice('CSE');
      setCustomDept('');
      setValue('department', 'CSE', { shouldValidate: true });
      setValue('creditType', 'UE_CSE', { shouldValidate: true });
    }
  }, [is2ndYear, setValue]);

  const handleDeptChoiceChange = (choice: 'CSE' | 'Other' | '') => {
    setDeptChoice(choice);
    if (choice === 'CSE') {
      setValue('department', 'CSE', { shouldValidate: true });
      setValue('creditType', 'UE_CSE', { shouldValidate: true });
    } else if (choice === 'Other') {
      setValue('department', customDept, { shouldValidate: true });
      setValue('creditType', 'PEOPLE_OTHER', { shouldValidate: true });
    } else {
      setValue('department', '', { shouldValidate: true });
    }
  };

  const handleCustomDeptChange = (val: string) => {
    setCustomDept(val);
    if (deptChoice === 'Other') {
      setValue('department', val, { shouldValidate: true });
      setValue('creditType', 'PEOPLE_OTHER', { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-cyber-border pb-3">
        <h3 className="text-base font-bold text-cyber-primary">
          STEP 2 : ACADEMIC DETAILS
        </h3>
        <p className="text-xs text-cyber-text-muted">
          Enter your academic information as per college records.
        </p>
      </div>

      {/* Register / Roll Number */}
      <div className="space-y-1.5">
        <label className="text-xs text-cyber-text flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-cyber-primary" />
          <span>Register / Roll Number *</span>
        </label>
        <input
          type="text"
          placeholder="Enter your register number"
          {...register('registerNumber')}
          className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm uppercase focus:outline-none focus:border-cyber-primary transition-colors"
        />
        {errors.registerNumber && (
          <p className="text-[11px] text-red-400">{errors.registerNumber.message}</p>
        )}
      </div>

      {/* Year & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Year of Study — moved first so department reacts to it */}
        <div className="space-y-1.5">
          <label className="text-xs text-cyber-text flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Year of Study *</span>
          </label>
          <select
            {...register('year')}
            className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary transition-colors"
          >
            <option value="">Select your year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
          {errors.year && (
            <p className="text-[11px] text-red-400">{errors.year.message}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-xs text-cyber-text flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyber-secondary" />
            <span>Department *</span>
            {is2ndYear && (
              <Lock className="w-3 h-3 text-cyber-text-dim ml-auto" />
            )}
          </label>

          {is2ndYear ? (
            /* 2nd Year: CSE locked — PE credit only */
            <>
              <input
                type="text"
                value="CSE — PE (Program Elective)"
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-bg-elevated border border-cyber-primary/40 text-cyber-primary text-sm font-bold cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-amber-400 font-sans">
                ⚠️ 2nd Year registrations are only open for CSE department (PE Credit).
              </p>
            </>
          ) : (
            /* 3rd / 4th Year: CSE or Other department selection */
            <>
              <select
                value={deptChoice}
                onChange={(e) => handleDeptChoiceChange(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary transition-colors font-mono"
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE - PE (Program Elective)</option>
                <option value="Other">Others - UE (University Elective)</option>
              </select>
              {errors.department && !deptChoice && (
                <p className="text-[11px] text-red-400">{errors.department.message}</p>
              )}

              {/* If 'Other' is selected, ask them to specify manually */}
              {deptChoice === 'Other' && (
                <div className="pt-2 space-y-1">
                  <label className="text-[11px] text-cyber-text-dim block">
                    Specify Your Department Name *
                  </label>
                  <input
                    type="text"
                    value={customDept}
                    onChange={(e) => handleCustomDeptChange(e.target.value)}
                    placeholder="e.g. IT, ECE, EEE, Mechanical, Biotech, Civil"
                    className="w-full px-3 py-2 rounded-lg bg-cyber-bg border border-cyber-secondary/50 text-cyber-text text-xs focus:outline-none focus:border-cyber-secondary transition-colors"
                    autoFocus
                  />
                  {errors.department && deptChoice === 'Other' && (
                    <p className="text-[11px] text-red-400">{errors.department.message}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Section & College */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-cyber-text">Section *</label>
          <input
            type="text"
            placeholder="Enter section like 23S10, 24S15"
            {...register('section')}
            className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm uppercase focus:outline-none focus:border-cyber-primary transition-colors"
          />
          {errors.section && (
            <p className="text-[11px] text-red-400">{errors.section.message}</p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs text-cyber-text flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Institution / University (Default)</span>
          </label>
          <input
            type="text"
            value="Kalasalingam Academy of Research and Education"
            readOnly
            disabled
            {...register('college')}
            className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-bg-elevated border border-cyber-border text-cyber-primary text-sm font-bold cursor-not-allowed select-none"
          />
        </div>
      </div>
    </div>
  );
}
