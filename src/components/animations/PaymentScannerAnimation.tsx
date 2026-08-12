'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Cpu, Database, AlertCircle, Clock } from 'lucide-react';

interface Props {
  onComplete: () => void;
  ocrDetails?: {
    extractedUtr?: string | null;
    extractedAmount?: number | null;
    confidence?: number | null;
  };
}

const steps = [
  { id: 1, label: 'UPLOAD COMPLETE', desc: 'Secure payload received by SOC gateway', icon: CheckCircle2 },
  { id: 2, label: 'READING TRANSACTION DETAILS', desc: 'Running optical character stream analysis', icon: Cpu },
  { id: 3, label: 'EXTRACTING UTR & BANK REFERENCE', desc: 'Parsing 12-digit payment reference identifier', icon: Database },
  { id: 4, label: 'CHECKING AMOUNT & DUPLICATES', desc: 'Validating fee integrity & duplicate prevention locks', icon: ShieldCheck },
  { id: 5, label: 'SUBMITTING FOR ADMIN REVIEW', desc: 'Routing to SOC Command Center queue', icon: Clock },
];

export default function PaymentScannerAnimation({ onComplete, ocrDetails }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(finalTimer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="w-full max-w-xl mx-auto cyber-glass-glow rounded-2xl p-6 sm:p-8 border border-cyber-primary/40 text-center">
      {/* Scanner Radar Arc */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-cyber-primary/30 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyber-primary animate-radar-sweep" />
        <div className="relative z-10 w-12 h-12 rounded-full bg-cyber-surface flex items-center justify-center text-cyber-primary">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold tracking-wider text-cyber-primary font-mono mb-2">
        SOC PAYMENT INTELLIGENCE
      </h3>
      <p className="text-xs text-cyber-text-muted mb-8 font-mono">
        SYSTEM INTEGRITY CHECK // PIPELINE ACTIVE
      </p>

      {/* Step Stepper List */}
      <div className="space-y-4 text-left max-w-md mx-auto">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-start gap-4 p-3 rounded-lg border transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                  : isCurrent
                  ? 'bg-cyber-primary/10 border-cyber-primary text-cyber-primary shadow-cyber-glow-sm'
                  : 'bg-cyber-surface/40 border-cyber-border/40 text-cyber-text-dim'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-2 border-cyber-primary border-t-transparent animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 opacity-40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold font-mono tracking-wider">{step.label}</div>
                <div className="text-[11px] text-cyber-text-muted truncate">{step.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Extracted Details Preview */}
      {ocrDetails?.extractedUtr && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-3 rounded-lg bg-cyber-bg-elevated border border-cyber-border text-left font-mono text-xs text-cyber-text-muted"
        >
          <div className="text-cyber-primary font-bold mb-1 flex items-center justify-between">
            <span>TRANSACTION STREAM PARSED</span>
            <span className="text-emerald-400">{ocrDetails.confidence || 96}% CONFIDENCE</span>
          </div>
          <div>UTR: <span className="text-cyber-text">{ocrDetails.extractedUtr}</span></div>
          {ocrDetails.extractedAmount && (
            <div>Amount: <span className="text-cyber-text">₹{ocrDetails.extractedAmount}</span></div>
          )}
        </motion.div>
      )}
    </div>
  );
}
