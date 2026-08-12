'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Shield, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cyber-border/80 bg-cyber-bg-elevated/90 py-12 sm:py-16 text-xs font-mono text-cyber-text-muted">
      <div className="container mx-auto px-4 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Organization Info */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo variant="footer" />
            <p className="text-xs text-cyber-text-muted leading-relaxed max-w-sm font-sans">
              NextGen SOC Analyst Bootcamp — Detect. Defend. Respond.
              Organized by Soft Computing Research Society (SCRS).
            </p>
            <div className="text-[11px] text-cyber-text-dim">
              Venue: TIFAC Core Seminar Hall
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-bold text-cyber-text uppercase tracking-wider text-xs">
              EVENT NAVIGATION
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#about" className="hover:text-cyber-primary transition-colors">
                  Executive Briefing
                </Link>
              </li>
              <li>
                <Link href="#workshop" className="hover:text-cyber-primary transition-colors">
                  Curriculum & Modules
                </Link>
              </li>
              <li>
                <Link href="#schedule" className="hover:text-cyber-primary transition-colors">
                  2-Day Schedule
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-cyber-primary transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-cyber-primary transition-colors">
                  Student Coordinators
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Portals & Legal */}
          <div className="md:col-span-4 space-y-3">
            <div className="font-bold text-cyber-text uppercase tracking-wider text-xs">
              PORTALS & VERIFICATION
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-cyber-primary transition-colors">
                  Cadet Sign In / Access Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-cyber-primary transition-colors">
                  Admissions Application
                </Link>
              </li>
              <li>
                <Link href="/certificate" className="hover:text-cyber-primary transition-colors">
                  Cryptographic Certificate Verification
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-cyber-primary transition-colors">
                  SOC Admin Command Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cyber-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-cyber-text-dim">
          <div>
            © 2026 Soft Computing Research Society (SCRS). All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-cyber-primary">NEXTGEN SOC v1.0</span>
            <span className="text-cyber-text-dim">CYBER COMMAND PLATFORM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
