'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'navbar' | 'hero' | 'card' | 'footer' | 'icon-only';
  className?: string;
  withLink?: boolean;
}

export function BrandLogo({
  variant = 'navbar',
  className,
  withLink = true,
}: BrandLogoProps) {
  const sizeClasses = {
    navbar: { img: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-base sm:text-lg', subtext: 'text-[9px] sm:text-[10px]' },
    hero: { img: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-xl sm:text-2xl', subtext: 'text-[10px] sm:text-xs' },
    card: { img: 'w-10 h-10', text: 'text-base', subtext: 'text-[10px]' },
    footer: { img: 'w-11 h-11', text: 'text-lg', subtext: 'text-[10px]' },
    'icon-only': { img: 'w-10 h-10', text: '', subtext: '' },
  };

  const current = sizeClasses[variant] || sizeClasses.navbar;

  const content = (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      {/* Real Circular Logo with Natural Cyber Glow (No clunky square boxes) */}
      <div className="relative shrink-0">
        <img
          src="/scrs-logo.png"
          alt="SCRS Official Crest"
          className={cn(
            'rounded-full object-contain transition-all duration-300 group-hover:scale-105 filter drop-shadow-[0_0_10px_rgba(0,229,255,0.45)] ring-1 ring-cyber-primary/40 group-hover:ring-cyber-primary',
            current.img
          )}
        />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-cyber-bg animate-pulse" />
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={cn('font-mono font-extrabold tracking-wider text-cyber-text group-hover:text-cyber-primary transition-colors', current.text)}>
              NEXTGEN <span className="text-cyber-primary">SOC</span>
            </span>
          </div>
          <span className={cn('hidden sm:block font-mono font-semibold tracking-widest text-cyber-text-dim group-hover:text-cyber-secondary transition-colors uppercase', current.subtext)}>
            SCRS // SOFT COMPUTING RESEARCH SOCIETY
          </span>
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
