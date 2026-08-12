'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AttendanceData } from '@/types';
import { CheckCircle2, Circle, QrCode, Calendar } from 'lucide-react';

interface Props {
  registrationId: string;
  attendance?: AttendanceData[];
  paymentVerified: boolean;
}

export default function AttendanceBadge({
  registrationId,
  attendance = [],
  paymentVerified,
}: Props) {
  const day1Present = attendance.some((a) => a.day === 1 && a.status === 'present');
  const day2Present = attendance.some((a) => a.day === 2 && a.status === 'present');

  return (
    <div className="p-6 rounded-2xl cyber-glass border border-cyber-border font-mono text-xs space-y-6">
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <h3 className="text-sm font-bold text-cyber-text tracking-wider uppercase flex items-center gap-2">
          <QrCode className="w-4 h-4 text-cyber-primary" />
          <span>ATTENDANCE PASS & QR CODE</span>
        </h3>
        <span className="text-[11px] text-cyber-primary">DAY 1 & 2</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Attendance QR Pass */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-white text-black shadow-cyber-glow-sm">
          {paymentVerified ? (
            <>
              <QRCodeSVG
                value={`NGSOC-ATTENDANCE:${registrationId}`}
                size={140}
                level="M"
                includeMargin
                className="w-36 h-36"
              />
              <span className="text-[10px] font-bold text-slate-800 mt-1 uppercase">
                SHOW TO SOC DESK
              </span>
            </>
          ) : (
            <div className="w-36 h-36 flex flex-col items-center justify-center text-center p-2 text-slate-500 text-xs">
              <span>QR UNLOCKED AFTER PAYMENT VERIFICATION</span>
            </div>
          )}
        </div>

        {/* Day 1 & Day 2 Status */}
        <div className="sm:col-span-7 space-y-3">
          {/* Day 1 */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
              day1Present
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                : 'bg-cyber-surface/60 border-cyber-border text-cyber-text-muted'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div>
                <div className="font-bold text-xs">DAY 1 ATTENDANCE</div>
                <div className="text-[10px] text-cyber-text-dim">Aug 29, 2026 // TIFAC Core Hall</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              {day1Present ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PRESENT</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-cyber-text-dim" />
                  <span>NOT MARKED</span>
                </>
              )}
            </div>
          </div>

          {/* Day 2 */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
              day2Present
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                : 'bg-cyber-surface/60 border-cyber-border text-cyber-text-muted'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div>
                <div className="font-bold text-xs">DAY 2 ATTENDANCE</div>
                <div className="text-[10px] text-cyber-text-dim">Aug 30, 2026 // TIFAC Core Hall</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              {day2Present ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PRESENT</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-cyber-text-dim" />
                  <span>NOT MARKED</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
