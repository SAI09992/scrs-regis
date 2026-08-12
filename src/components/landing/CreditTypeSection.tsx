'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, ArrowRight, Sparkles } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

export default function CreditTypeSection() {
  return (
    <section id="tracks" className="py-16 sm:py-24 relative bg-cyber-bg-elevated/30 border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>// 03. CREDIT & REGISTRATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            CREDIT & DEPARTMENT INFO
          </h2>
          <p className="text-sm sm:text-base text-cyber-text-muted font-mono">
            Course credit details and registration information. Content will be updated as finalized.
          </p>
        </div>

        {/* Single Unified Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto rounded-2xl p-6 sm:p-8 cyber-glass-glow border-2 border-cyber-primary/50 shadow-cyber-card"
        >
          {/* Top Tag */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-primary/20 border border-cyber-primary text-cyber-primary font-mono text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>CYBER SECURITY WORKSHOP</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                200 TOTAL SLOTS
              </span>
              <span className="text-xs font-mono text-cyber-primary bg-cyan-950/40 px-2.5 py-1 rounded border border-cyber-primary/30">
                ALL DEPARTMENTS
              </span>
            </div>
          </div>

          {/* Title & Fee */}
          <div className="space-y-3 mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono text-cyber-text">
              NEXTGEN SOC BOOTCAMP
            </h3>
            <p className="text-xs sm:text-sm font-mono text-cyber-text-muted">
              Open to all 2nd, 3rd & 4th year students across all departments.
            </p>

            <div className="flex items-baseline gap-2 pt-2 pb-4 border-b border-cyber-border/60">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-cyber-primary">₹300</span>
              <span className="text-xs font-mono text-cyber-text-dim">/ registration fee</span>
            </div>
          </div>

          {/* Credit Details */}
          <div className="mb-6 p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border/60">
            <div className="text-[10px] font-mono font-bold text-cyber-primary uppercase tracking-widest mb-2">
              CREDIT INFORMATION
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-mono text-cyber-text-muted">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyber-primary shrink-0 mt-0.5" />
                <span><strong className="text-cyber-text">CSE Students:</strong> Program Elective (PE) Credit</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyber-primary shrink-0 mt-0.5" />
                <span><strong className="text-cyber-text">All Others:</strong> University Elective (UE) Credit</span>
              </div>
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <Check className="w-4 h-4 text-cyber-primary shrink-0 mt-0.5" />
                <span><strong className="text-cyber-text">Subject:</strong> Cyber Security</span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <ul className="space-y-3 text-xs sm:text-sm font-mono text-cyber-text-muted mb-8">
            {[
              'Full 2-Day SOC Operations & Hands-on Lab Access',
              'SIEM Telemetry & Log Analysis Training',
              'Live Ransomware Incident Response Simulation',
              'Participation Certificate on Completion',
              'Course Credit Eligibility (PE for CSE / UE for Others)',
            ].map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyber-primary shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {/* Single Register Button */}
          <Link href="/register" className="block">
            <CyberButton variant="primary" glow size="lg" className="w-full gap-2">
              <span>REGISTER NOW — ₹300</span>
              <ArrowRight className="w-4 h-4" />
            </CyberButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
