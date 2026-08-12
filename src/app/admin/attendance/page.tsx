'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CameraQrScanner } from '@/components/admin/CameraQrScanner';
import {
  QrCode,
  Scan,
  CheckCircle2,
  Calendar,
  Search,
  UserCheck,
  RefreshCw,
  Clock,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAttendancePage() {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [inputRegId, setInputRegId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<any>(null);

  const processAttendanceCheckIn = async (rawRegId: string) => {
    let cleanId = rawRegId.trim().toUpperCase();
    if (cleanId.startsWith('NGSOC-ATTENDANCE:')) {
      cleanId = cleanId.replace('NGSOC-ATTENDANCE:', '');
    }

    if (!cleanId) return;

    setProcessing(true);
    try {
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
        setLastScanned({ ...data.participant, day: activeDay, time: new Date().toLocaleTimeString() });
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRegId) {
      processAttendanceCheckIn(inputRegId);
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
            WEBRTC CAMERA QR VALIDATION & MANUAL ENTRY TERMINAL
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

      {/* Grid: Camera Scanner vs Manual Input & Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Scanner */}
        <div className="md:col-span-7 p-6 rounded-2xl cyber-glass-glow border border-cyber-primary/40 space-y-6">
          <CameraQrScanner
            activeDay={activeDay}
            onScanSuccess={(scannedId) => processAttendanceCheckIn(scannedId)}
          />

          {/* Manual Input Fallback */}
          <div className="pt-4 border-t border-cyber-border/80 space-y-3">
            <div className="text-cyber-primary font-bold text-xs flex items-center gap-2">
              <Scan className="w-4 h-4" />
              <span>OR ENTER REGISTRATION ID MANUALLY</span>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={inputRegId}
                onChange={(e) => setInputRegId(e.target.value.toUpperCase())}
                placeholder="Type NGSOC-2026-XXXXX or scan via USB barcode scanner"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-primary font-bold text-xs focus:outline-none focus:border-cyber-primary"
              />

              <CyberButton
                type="submit"
                variant="primary"
                glow
                size="md"
                loading={processing}
                className="w-full gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM CHECK-IN (DAY {activeDay})</span>
              </CyberButton>
            </form>
          </div>
        </div>

        {/* Right Column: Last Scanned Cadet Dossier */}
        <div className="md:col-span-5 p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4 flex flex-col justify-between">
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
                  <div>Day Checked: <span className="text-cyber-text">Day {lastScanned.day} ({lastScanned.time})</span></div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-cyber-text-dim py-8">
                Awaiting first camera or manual scan for Day {activeDay}.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-cyber-border/40 text-[10px] text-cyber-text-dim text-center">
            EVERY ATTENDANCE SCAN CREATES A SIGNED AUDIT LOG
          </div>
        </div>
      </div>
    </div>
  );
}
