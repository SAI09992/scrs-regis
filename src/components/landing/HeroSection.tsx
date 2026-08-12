'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { CyberButton } from '@/components/ui/CyberButton';
import HeroVisual from '@/components/animations/HeroVisual';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ShieldCheck, Cpu, Terminal, Award, ArrowRight, Radio, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const metadataBadges = [
    { icon: ShieldCheck, text: '2 DAYS' },
    { icon: Cpu, text: 'HANDS-ON' },
    { icon: Terminal, text: 'SOC TRAINING' },
    { icon: Award, text: 'CERTIFICATE' },
  ];

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading, Tagline, CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Official Organization Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-cyan-950/40 border border-cyber-primary/40 text-cyber-primary font-mono text-[10px] sm:text-xs shadow-cyber-glow-sm max-w-full truncate">
              <span className="w-2 h-2 rounded-full bg-cyber-primary animate-ping shrink-0" />
              <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">PRESENTED BY SCRS // SOFT COMPUTING RESEARCH SOCIETY</span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-cyber-text leading-[1.08]">
                NEXTGEN{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-cyan-200 to-cyber-secondary drop-shadow-[0_0_25px_rgba(0,229,255,0.4)]">
                  SOC
                </span>
              </h1>
              <h2 className="text-base sm:text-2xl font-bold text-cyber-text-muted font-mono tracking-tight">
                Security Operations Centre Analyst Bootcamp
              </h2>
            </div>

            {/* Tagline */}
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs sm:text-base font-mono font-extrabold tracking-widest text-cyber-primary">
              <span className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">DETECT.</span>
              <span className="text-cyber-text-dim">•</span>
              <span className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">DEFEND.</span>
              <span className="text-cyber-text-dim">•</span>
              <span className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">RESPOND.</span>
            </div>

            {/* Concise Description */}
            <p className="text-xs sm:text-base text-cyber-text-muted max-w-2xl leading-relaxed">
              An intensive two-day hands-on cybersecurity and SOC workshop for all engineering students (2nd, 3rd & 4th year). Dive into SIEM log telemetry, live packet forensics, memory threat hunting, and ransomware incident response at TIFAC Core Seminar Hall.
            </p>

            {/* 4 Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
              {metadataBadges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-cyber-surface/70 border border-cyber-border/80 text-[11px] sm:text-xs font-mono font-bold text-cyber-text hover:border-cyber-primary/40 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-primary shrink-0" />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link href={session ? (isAdmin ? '/admin' : '/portal') : '/register'} className="w-full sm:w-auto">
                <CyberButton size="lg" variant="primary" glow className="w-full sm:w-auto gap-3">
                  <span>{session ? (isAdmin ? 'COMMAND CENTER' : 'CADET PORTAL') : 'REGISTER NOW'}</span>
                  <ArrowRight className="w-4 h-4" />
                </CyberButton>
              </Link>

              <Link href="#workshop" className="w-full sm:w-auto">
                <CyberButton size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                  <span>EXPLORE WORKSHOP</span>
                </CyberButton>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="hidden lg:flex lg:col-span-5 items-center justify-center"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
