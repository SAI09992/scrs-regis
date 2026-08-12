'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'cyan' | 'emerald' | 'amber' | 'crimson';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'cyan',
  className,
}: MetricCardProps) {
  const variantStyles = {
    cyan: 'border-cyber-primary/30 text-cyber-primary bg-cyan-950/10 hover:border-cyber-primary/60',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10 hover:border-emerald-500/60',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-950/10 hover:border-amber-500/60',
    crimson: 'border-red-500/30 text-red-400 bg-red-950/10 hover:border-red-500/60',
  };

  const glowStyles = {
    cyan: 'shadow-[0_0_15px_-3px_rgba(0,229,255,0.15)]',
    emerald: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]',
    amber: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]',
    crimson: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'relative overflow-hidden p-5 rounded-xl border cyber-glass transition-all duration-300',
        variantStyles[variant],
        glowStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono font-medium tracking-wider text-cyber-text-muted uppercase">
            {title}
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-cyber-text">
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-cyber-text-dim font-mono">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/80">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-cyber-border/40 text-[11px] font-mono text-cyber-text-muted flex items-center justify-between">
          <span>TELEMETRY DELTA</span>
          <span className="font-semibold text-cyber-primary">{trend}</span>
        </div>
      )}
    </motion.div>
  );
}
