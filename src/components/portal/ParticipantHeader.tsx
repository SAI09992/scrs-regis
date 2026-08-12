'use client';

import React from 'react';
import Link from 'next/link';
import { RegistrationData } from '@/types';
import { User, Shield, Terminal, BookOpen, Building2, Bell, Calendar } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

interface Props {
  registration: RegistrationData;
}

export default function ParticipantHeader({ registration }: Props) {
  return (
    <div className="p-6 rounded-2xl cyber-glass-glow border border-cyber-border shadow-cyber-card space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-cyber-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyber-surface border-2 border-cyber-primary/60 flex items-center justify-center text-cyber-primary text-xl font-bold font-mono shadow-cyber-glow-sm">
            {registration.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-cyber-text">
                {registration.name}
              </h1>
              <span className="px-2 py-0.5 rounded bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40 font-mono text-[10px] font-bold">
                CADET
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyber-text-muted mt-1">
              <span>{registration.email}</span>
              <span>•</span>
              <span className="text-cyber-primary font-bold">{registration.registrationId}</span>
            </div>
          </div>
        </div>

        {/* Quick Nav Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Link href="/portal/updates" className="flex-1 sm:flex-initial">
            <CyberButton variant="outline" size="sm" className="w-full gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cyber-primary" />
              <span>DIRECTIVES</span>
            </CyberButton>
          </Link>
          <Link href="/portal/schedule" className="flex-1 sm:flex-initial">
            <CyberButton variant="outline" size="sm" className="w-full gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyber-secondary" />
              <span>SCHEDULE</span>
            </CyberButton>
          </Link>
        </div>
      </div>

      {/* Read-only Cadet Academic Dossier */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border">
          <span className="text-cyber-text-dim block text-[11px]">REGISTER NO:</span>
          <span className="text-cyber-text font-bold mt-0.5 block truncate">
            {registration.registerNumber}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border">
          <span className="text-cyber-text-dim block text-[11px]">CREDIT TRACK:</span>
          <span className="text-emerald-400 font-bold mt-0.5 block truncate">
            {registration.creditType === 'UE_CSE' ? 'PE — CSE' : 'UE — OTHER'}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border">
          <span className="text-cyber-text-dim block text-[11px]">DEPARTMENT:</span>
          <span className="text-cyber-text mt-0.5 block truncate">
            {registration.department} ({registration.section})
          </span>
        </div>
        <div className="p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border">
          <span className="text-cyber-text-dim block text-[11px]">INSTITUTION:</span>
          <span className="text-cyber-text mt-0.5 block truncate">
            {registration.college}
          </span>
        </div>
      </div>
    </div>
  );
}
