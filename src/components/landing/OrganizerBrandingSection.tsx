'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function OrganizerBrandingSection() {
  return (
    <section id="organizers" className="py-16 sm:py-24 relative bg-cyber-bg-elevated/40 border-t border-cyber-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto cyber-glass-glow rounded-3xl p-8 sm:p-12 border-2 border-cyber-primary/40 flex flex-col md:flex-row items-center gap-8 font-mono shadow-cyber-card">
          {/* Official Logo Container - Circular Emblem */}
          <div className="relative shrink-0">
            <img
              src="/scrs-logo.png"
              alt="SCRS Official Logo"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-contain filter drop-shadow-[0_0_20px_rgba(0,229,255,0.6)] ring-2 ring-cyber-primary/60"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-4 border-cyber-bg animate-pulse" />
          </div>

          {/* Organizer Information */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>// 13. ORGANIZING SOCIETY // SCRS</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-cyber-text">
              SOFT COMPUTING RESEARCH SOCIETY (SCRS)
            </h3>

            <p className="text-xs text-cyber-text-muted font-sans leading-relaxed">
              SCRS (Soft Computing Research Society) is a student-led technical society dedicated to advancing practical knowledge in cybersecurity, SOC operations, ethical hacking, digital forensics, and emerging computing technologies across the university.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-[11px] text-cyber-text-dim">
              <span className="flex items-center gap-1.5 text-cyber-text">
                <Building2 className="w-3.5 h-3.5 text-cyber-primary" /> Dept. of Computer Science & Engineering
              </span>
              <span>•</span>
              <span className="text-cyber-secondary font-bold">Cybersecurity & SOC Training</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
