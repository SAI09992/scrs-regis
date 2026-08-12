'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { PaymentStatus, AttendanceStatus } from '@/types';

interface StatusBadgeProps {
  status: PaymentStatus | AttendanceStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
      case 'present':
        return {
          label: status === 'present' ? 'PRESENT' : 'VERIFIED',
          bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
      case 'pending':
        return {
          label: 'UNDER VERIFICATION',
          bg: 'bg-amber-950/60 border-amber-500/50 text-amber-400',
          dot: 'bg-amber-400 animate-pulse',
          icon: Clock,
        };
      case 'rejected':
      case 'absent':
        return {
          label: status === 'absent' ? 'ABSENT' : 'REJECTED',
          bg: 'bg-red-950/60 border-red-500/50 text-red-400',
          dot: 'bg-red-400',
          icon: XCircle,
        };
      case 'requires_attention':
        return {
          label: 'ATTENTION NEEDED',
          bg: 'bg-orange-950/60 border-orange-500/50 text-orange-400',
          dot: 'bg-orange-400',
          icon: AlertTriangle,
        };
      default:
        return {
          label: String(status).toUpperCase(),
          bg: 'bg-cyber-surface border-cyber-border text-cyber-text-muted',
          dot: 'bg-cyber-text-dim',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border transition-all duration-300',
        config.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
