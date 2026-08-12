'use client';

import React from 'react';
import Link from 'next/link';
import SchedulePreview from '@/components/landing/SchedulePreview';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function PortalSchedulePage() {
  return (
    <div className="flex-1 py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-cyber-border">
          <Link
            href="/portal"
            className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-cyber-primary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-mono text-cyber-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyber-primary" />
              <span>BOOTCAMP CURRICULUM TIMETABLE</span>
            </h1>
            <p className="text-xs font-mono text-cyber-text-muted">
              INTERACTIVE 2-DAY SOC RANGE SCHEDULE
            </p>
          </div>
        </div>

        <SchedulePreview />
      </div>
    </div>
  );
}
