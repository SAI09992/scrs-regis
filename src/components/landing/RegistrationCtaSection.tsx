'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { CyberButton } from '@/components/ui/CyberButton';
import { Shield, ArrowRight, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

export default function RegistrationCtaSection() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <section id="register" className="py-16 sm:py-24 relative overflow-hidden bg-cyber-bg-elevated/40 border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 cyber-glass-glow border-2 border-cyber-primary/50 text-center max-w-4xl mx-auto space-y-6 overflow-hidden shadow-cyber-card font-mono"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyber-primary/10 via-transparent to-cyber-secondary/10 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>// 09. FINAL ADMISSIONS CALL</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-cyber-text tracking-tight leading-tight">
              READY TO ENTER THE <span className="text-cyber-primary">SOC?</span>
            </h2>

            <p className="text-xs sm:text-sm text-cyber-text-muted max-w-xl mx-auto leading-relaxed font-sans">
              Secure your seat in the NextGen SOC Analyst Bootcamp. Only 200 seats available — August 29–30, 2026 at TIFAC Core Seminar Hall. Registration fee: ₹300.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={session ? (isAdmin ? '/admin' : '/portal') : '/register'} className="w-full sm:w-auto">
              <CyberButton size="lg" variant="primary" glow className="w-full sm:w-auto gap-3 text-base px-10 py-4">
                <span>{session ? (isAdmin ? 'COMMAND CENTER' : 'CADET PORTAL') : 'REGISTER NOW'}</span>
                <ArrowRight className="w-5 h-5" />
              </CyberButton>
            </Link>
          </div>

          {/* Guarantee Pills */}
          <div className="relative z-10 pt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] text-cyber-text-dim border-t border-cyber-border/40">
            <span className="flex items-center gap-1.5 text-cyber-text">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyber-primary" /> Verified Google Auth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyber-text">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Seat Allocation
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyber-text">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyber-secondary" /> QR Certificate Included
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
