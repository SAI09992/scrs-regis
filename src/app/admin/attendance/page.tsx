'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  QrCode,
  Scan,
  CheckCircle2,
  Calendar,
  Search,
  UserCheck,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAttendancePage() {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [inputRegId, setInputRegId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRegId.trim()) return;

    setProcessing(true);
    try {
      let cleanId = inputRegId.trim().toUpperCase();
      if (cleanId.startsWith('NGSOC-ATTENDANCE:')) {
        cleanId = cleanId.replace('NGSOC-ATTENDANCE:', '');
      }

      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: cleanId,
          day: activeDay,
          session: 'morning',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setLastScanned({ ...data.participant, day: activeDay, time: 'Just now' });
        setInputRegId('');
      } else {
        toast.error(data.error || 'Attendance check failed');
      }
    } catch (err: any) {
      toast.error('Network scan error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <QrCode className="w-6 h-6 text-cyber-primary" />
            <span>SOC ATTENDANCE SCANNER</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            CRYPTOGRAPHIC QR VALIDATION & RANGE CHECK-IN
          </p>
        </div>

        {/* Day Selector */}
        <div className="inline-flex p-1 rounded-xl bg-cyber-surface border border-cyber-border">
          <button
            onClick={() => setActiveDay(1)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeDay === 1
                ? 'bg-cyber-primary text-cyber-bg shadow-cyber-glow-sm'
                : 'text-cyber-text-muted hover:text-cyber-text'
            }`}
          >
            DAY 1 (AUG 29)
          </button>
          <button
            onClick={() => setActiveDay(2)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeDay === 2
                ? 'bg-cyber-primary text-cyber-bg shadow-cyber-glow-sm'
                : 'text-cyber-text-muted hover:text-cyber-text'
            }`}
          >
            DAY 2 (AUG 30)
          </button>
        </div>
      </div>

      {/* Scanner & Manual Lookup Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Scanner Terminal */}
        <div className="md:col-span-6 p-6 rounded-2xl cyber-glass-glow border border-cyber-primary/40 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyber-primary font-bold text-sm">
              <Scan className="w-5 h-5 animate-pulse" />
              <span>RANGE ENTRY TERMINAL</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-cyber-surface border border-cyber-border text-emerald-400 font-bold text-[10px]">
              DAY {activeDay} ACTIVE
            </span>
          </div>

          <form onSubmit={handleScanSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-cyber-text block">
                Scan QR Code or Enter Registration ID *
              </label>
              <input
                type="text"
                autoFocus
                value={inputRegId}
                onChange={(e) => setInputRegId(e.target.value.toUpperCase())}
                placeholder="Scan QR or type NGSOC-2026-XXXXX"
                className="w-full px-4 py-3 rounded-xl bg-cyber-surface border-2 border-cyber-border text-cyber-primary font-bold text-sm focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <CyberButton
              type="submit"
              variant="primary"
              glow
              size="lg"
              loading={processing}
              className="w-full gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRM CHECK-IN (DAY {activeDay})</span>
            </CyberButton>
          </form>

          <p className="text-[11px] text-cyber-text-dim text-center leading-relaxed">
            Barcode/QR scanners automatically fill the Registration ID and trigger check-in.
          </p>
        </div>

        {/* Last Check-in Dossier */}
        <div className="md:col-span-6 p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>LAST SCANNED CADET</span>
              </h3>
              <span className="text-[10px] text-cyber-primary">REALTIME VALIDATION</span>
            </div>

            {lastScanned ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-cyber-text">{lastScanned.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    CHECKED IN
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-cyber-text-muted text-[11px]">
                  <div>Reg ID: <span className="text-cyber-primary font-bold">{lastScanned.registrationId}</span></div>
                  <div>Department: <span className="text-cyber-text">{lastScanned.department}</span></div>
                  <div>Track: <span className="text-emerald-400 font-bold">{lastScanned.creditType}</span></div>
                  <div>Day: <span className="text-cyber-text">Day {lastScanned.day}</span></div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-cyber-text-dim py-8">
                Awaiting first scanner check-in for this session.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-cyber-border/40 text-[11px] text-cyber-text-dim text-center">
            EVERY ATTENDANCE SCAN CREATES A SIGNED AUDIT LOG
          </div>
        </div>
      </div>
    </div>
  );
}
