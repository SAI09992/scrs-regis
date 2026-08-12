'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function CyberButton({
  variant = 'primary',
  size = 'md',
  glow = false,
  loading = false,
  className,
  disabled,
  children,
  ...props
}: CyberButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-mono',
    md: 'px-5 py-2.5 text-sm font-mono',
    lg: 'px-8 py-3.5 text-base font-mono tracking-wide',
  };

  const variantClasses = {
    primary:
      'bg-cyber-primary text-cyber-bg font-bold border border-cyan-300 hover:bg-cyan-300 active:scale-[0.98]',
    secondary:
      'bg-cyber-surface-elevated text-cyber-primary border border-cyber-primary/40 hover:border-cyber-primary hover:bg-cyber-surface-highlight',
    danger:
      'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500',
    outline:
      'bg-transparent text-cyber-text border border-cyber-border hover:border-cyber-primary/60 hover:text-cyber-primary',
    ghost:
      'bg-transparent text-cyber-text-muted hover:text-cyber-primary hover:bg-cyber-surface/50',
  };

  const glowClasses = glow
    ? variant === 'danger'
      ? 'shadow-cyber-glow-danger'
      : 'shadow-cyber-glow hover:shadow-[0_0_35px_-5px_rgba(0,229,255,0.6)]'
    : '';

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-cyber-primary/50',
        sizeClasses[size],
        variantClasses[variant],
        glowClasses,
        className
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
