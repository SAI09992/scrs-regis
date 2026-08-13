'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { CyberButton } from '@/components/ui/CyberButton';
import { Menu, X, Terminal, LayoutDashboard, LogOut, ArrowRight, LogIn, User, MessageCircle } from 'lucide-react';

export default function CyberNavbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/event-stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats?.whatsappGroupLink) {
          setWhatsappLink(data.stats.whatsappGroupLink);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#about' },
    { label: 'Specs', href: '#specs' },
    { label: 'Tracks', href: '#tracks' },
    { label: 'Curriculum', href: '#workshop' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Live Seats', href: '#seats' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Coordinators', href: '#contact' },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-cyber-border/80 bg-cyber-bg/90 backdrop-blur-xl shadow-lg shadow-black/40"
    >
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Section 1 Branding: Official Club Logo */}
        <BrandLogo variant="navbar" />

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-mono tracking-wider text-cyber-text-muted">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-cyber-primary transition-colors py-1 relative group"
            >
              <span>{link.label.toUpperCase()}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Action Buttons: Desktop & Tablet */}
        <div className="flex items-center gap-2.5">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 hover:border-emerald-400 font-mono text-[11px] font-bold transition-all"
              title="Join WhatsApp Group"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JOIN WHATSAPP</span>
            </a>
          )}
          {session ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link href="/admin" prefetch={true}>
                  <CyberButton size="sm" variant="secondary" className="gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">COMMAND CENTER</span>
                    <span className="sm:hidden">ADMIN</span>
                  </CyberButton>
                </Link>
              ) : (
                <Link href="/portal" prefetch={true}>
                  <CyberButton size="sm" variant="secondary" className="gap-2">
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CADET PORTAL</span>
                    <span className="sm:hidden">PORTAL</span>
                  </CyberButton>
                </Link>
              )}

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Sign Out"
                className="p-2 sm:p-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-red-400 hover:border-red-500/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Distinct High-Visibility LOGIN Button */}
              <Link href="/login" prefetch={true}>
                <button className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-cyber-surface hover:bg-cyber-surface-elevated border border-cyber-border hover:border-cyber-primary/60 text-cyber-text hover:text-cyber-primary font-mono text-xs font-bold transition-all shadow-cyber-glow-sm">
                  <LogIn className="w-3.5 h-3.5 text-cyber-primary" />
                  <span>LOGIN</span>
                </button>
              </Link>

              {/* Primary REGISTER NOW Button */}
              <Link href="/register" prefetch={true}>
                <CyberButton size="sm" variant="primary" glow className="gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 text-xs">
                  <span>REGISTER</span>
                  <span className="hidden sm:inline">NOW</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </CyberButton>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-text hover:text-cyber-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="xl:hidden border-b border-cyber-border bg-cyber-bg-elevated/95 backdrop-blur-2xl px-5 py-6 space-y-5 font-mono text-xs"
          >
            <div className="text-[10px] text-cyber-primary uppercase tracking-widest font-bold border-b border-cyber-border pb-2">
              // JUMP TO SECTION
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg text-cyber-text hover:text-cyber-primary bg-cyber-surface/60 border border-cyber-border/40 hover:border-cyber-primary/40 transition-colors"
                >
                  {link.label.toUpperCase()}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-cyber-border/80 flex flex-col gap-2.5">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-bold text-center text-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  JOIN WHATSAPP GROUP
                </a>
              )}
              {session ? (
                <>
                  <Link
                    href={isAdmin ? '/admin' : '/portal'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <CyberButton size="md" variant="secondary" className="w-full">
                      {isAdmin ? 'ENTER SOC COMMAND CENTER' : 'ENTER CADET PORTAL'}
                    </CyberButton>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 font-bold text-center"
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-cyber-surface border border-cyber-primary/50 text-cyber-primary font-bold">
                      <LogIn className="w-4 h-4" />
                      <span>LOGIN</span>
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <CyberButton size="md" variant="primary" glow className="w-full">
                      REGISTER
                    </CyberButton>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
