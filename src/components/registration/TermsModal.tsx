'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

interface Props {
  onAccept: () => void;
}

export default function TermsModal({ onAccept }: Props) {
  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    informationAccurate: false,
    paymentVerificationUnderstood: false,
    antiFraudAgreed: false,
    workshopRulesAgreed: false,
  });

  const allAccepted = Object.values(agreements).every(Boolean);

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-2xl mx-auto cyber-glass-glow rounded-2xl p-6 sm:p-8 border border-cyber-border shadow-cyber-card space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-cyber-border">
        <div className="p-2.5 rounded-lg bg-cyber-primary/10 border border-cyber-primary/40 text-cyber-primary">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-mono text-cyber-text">
            TERMS & PARTICIPATION AGREEMENT
          </h2>
          <p className="text-xs font-mono text-cyber-text-muted">
            VERSION 1.0 // CRYPTOGRAPHIC LEGAL RECORD
          </p>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3.5 font-mono text-xs text-cyber-text">
        {[
          {
            key: 'termsAccepted',
            label: 'I have read and agree to the NextGen SOC Bootcamp Terms & Conditions.',
          },
          {
            key: 'informationAccurate',
            label: 'I confirm all academic and personal details provided are authentic.',
          },
          {
            key: 'paymentVerificationUnderstood',
            label: 'I understand manual/OCR payment verification is mandatory for admission.',
          },
          {
            key: 'antiFraudAgreed',
            label: 'I understand duplicate, altered, or fraudulent UTR references will be rejected.',
          },
          {
            key: 'workshopRulesAgreed',
            label: 'I agree to comply with workshop conduct rules and cybersecurity range ethics.',
          },
        ].map((item) => {
          const isChecked = agreements[item.key as keyof typeof agreements];
          return (
            <label
              key={item.key}
              onClick={() => toggleAgreement(item.key as keyof typeof agreements)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                isChecked
                  ? 'bg-cyber-primary/10 border-cyber-primary text-cyber-text shadow-cyber-glow-sm'
                  : 'bg-cyber-surface/40 border-cyber-border text-cyber-text-muted hover:border-cyber-primary/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="mt-0.5 rounded border-cyber-border bg-cyber-bg text-cyber-primary focus:ring-0"
              />
              <span className="leading-relaxed">{item.label}</span>
            </label>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-4 flex items-center justify-between border-t border-cyber-border">
        <span className="text-[11px] font-mono text-cyber-text-dim flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-cyber-primary" />
          Mandatory compliance checks (5/5)
        </span>

        <CyberButton
          variant="primary"
          glow={allAccepted}
          size="md"
          disabled={!allAccepted}
          onClick={onAccept}
          className="gap-2"
        >
          <span>ACCEPT & PROCEED</span>
          <ArrowRight className="w-4 h-4" />
        </CyberButton>
      </div>
    </motion.div>
  );
}
