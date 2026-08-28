'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CameraQrScanner } from '@/components/admin/CameraQrScanner';
import {
  QrCode,
  Scan,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  UserCheck,
  RotateCcw,
  Coffee,
  Calendar,
  Users,
  Check,
  X,
  Clock,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface CadetAttendance {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  registerNumber: string;
  department: string;
  year: string;
  section: string;
  creditType: string;
  paymentStatus: string;
  day1Present: boolean;
  day2Present: boolean;
}

const SNACK_SLOTS = [
  { slot: 1, label: 'SLOT 1', name: 'Day 1 Morning Snacks (Aug 29)' },
  { slot: 2, label: 'SLOT 2', name: 'Day 1 Evening Snacks (Aug 29)' },
  { slot: 3, label: 'SLOT 3', name: 'Day 2 Morning Snacks (Aug 30)' },
  { slot: 4, label: 'SLOT 4', name: 'Day 2 Evening Snacks (Aug 30)' },
];

export default function AdminAttendanceAndSnacksPage() {
  const [activeTab, setActiveTab] = useState<'snacks' | 'attendance'>('snacks');

  // ================= SNACKS SCANNER STATE =================
  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [inputRegId, setInputRegId] = useState('');
  const [scanProcessing, setScanProcessing] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [snacksStats, setSnacksStats] = useState<{
    servedCount: number;
    totalVerified: number;
    slotSummary: Record<number, number>;
    recentScans: any[];
  }>({
    servedCount: 0,
    totalVerified: 0,
    slotSummary: { 1: 0, 2: 0, 3: 0, 4: 0 },
    recentScans: [],
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ================= MANUAL ATTENDANCE STATE =================
  const [cadets, setCadets] = useState<CadetAttendance[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [day1Filter, setDay1Filter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [day2Filter, setDay2Filter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [updatingCadetId, setUpdatingCadetId] = useState<string | null>(null);

  // Fetch snacks stats for active slot
  const fetchSnacksStats = async (slotNum = activeSlot) => {
    try {
      setStatsLoading(true);
      const res = await fetch(`/api/snacks/stats?slot=${slotNum}`);
      const data = await res.json();
      if (data.success) {
        setSnacksStats({
          servedCount: data.servedCount,
          totalVerified: data.totalVerified,
          slotSummary: data.slotSummary || { 1: 0, 2: 0, 3: 0, 4: 0 },
          recentScans: data.recentScans || [],
        });
      }
    } catch (e) {
      console.error('Failed to fetch snacks stats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch manual attendance roster
  const fetchAttendanceRoster = async () => {
    try {
      setAttendanceLoading(true);
      const res = await fetch('/api/attendance/list');
      const data = await res.json();
      if (data.success) {
        setCadets(data.cadets || []);
      }
    } catch (e) {
      console.error('Failed to fetch attendance list:', e);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'snacks') {
      fetchSnacksStats(activeSlot);
    } else {
      fetchAttendanceRoster();
    }
  }, [activeTab, activeSlot]);

  // Handle Snacks QR Scan
  const processSnacksScan = async (rawCode: string) => {
    let cleanId = rawCode.trim().toUpperCase();
    if (cleanId.startsWith('NGSOC-ATTENDANCE:')) {
      cleanId = cleanId.replace('NGSOC-ATTENDANCE:', '');
    }

    if (!cleanId) return;

    setScanProcessing(true);
    try {
      const currentSlotObj = SNACK_SLOTS.find((s) => s.slot === activeSlot);
      const res = await fetch('/api/snacks/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: cleanId,
          slot: activeSlot,
          slotName: currentSlotObj?.name || `Snack Round ${activeSlot}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLastScanResult(data);
        if (data.status === 'GIVE_SNACKS') {
          toast.success(`✓ GIVE SNACKS — ${data.participant.name}`);
        } else {
          toast.warning(`⚠️ RE-ENTRY — ${data.participant.name} already received snacks`);
        }
        setInputRegId('');
        fetchSnacksStats(activeSlot);
      } else {
        toast.error(data.error || 'QR Scan verification failed');
      }
    } catch (err: any) {
      toast.error('Network scan error');
    } finally {
      setScanProcessing(false);
    }
  };

  const handleManualSnackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRegId) {
      processSnacksScan(inputRegId);
    }
  };

  // Handle Reset Slot Data
  const handleResetSlotData = async (resetAll = false) => {
    setResetting(true);
    try {
      const res = await fetch('/api/snacks/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: activeSlot,
          resetAll,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setLastScanResult(null);
        setShowResetModal(false);
        fetchSnacksStats(activeSlot);
      } else {
        toast.error(data.error || 'Failed to reset snacks data');
      }
    } catch (err) {
      toast.error('Network error during reset');
    } finally {
      setResetting(false);
    }
  };

  // Toggle Manual Attendance for Cadet
  const toggleAttendance = async (cadet: CadetAttendance, day: 1 | 2, currentStatus: boolean) => {
    setUpdatingCadetId(`${cadet.id}-day${day}`);
    const nextStatus = currentStatus ? 'absent' : 'present';
    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: cadet.registrationId,
          day,
          session: 'morning',
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCadets((prev) =>
          prev.map((c) => {
            if (c.id === cadet.id) {
              return {
                ...c,
                ...(day === 1 ? { day1Present: !currentStatus } : { day2Present: !currentStatus }),
              };
            }
            return c;
          })
        );
        toast.success(`Day ${day} marked as ${nextStatus.toUpperCase()} for ${cadet.name}`);
      } else {
        toast.error(data.error || 'Attendance update failed');
      }
    } catch (err) {
      toast.error('Network error updating attendance');
    } finally {
      setUpdatingCadetId(null);
    }
  };

  // Filtered Cadets for Manual Roster
  const filteredCadets = cadets.filter((c) => {
    if (day1Filter === 'PRESENT' && !c.day1Present) return false;
    if (day1Filter === 'ABSENT' && c.day1Present) return false;
    if (day2Filter === 'PRESENT' && !c.day2Present) return false;
    if (day2Filter === 'ABSENT' && c.day2Present) return false;

    if (attendanceSearch) {
      const q = attendanceSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.registrationId.toLowerCase().includes(q) ||
        c.registerNumber.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentSlotObj = SNACK_SLOTS.find((s) => s.slot === activeSlot);

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            {activeTab === 'snacks' ? (
              <Coffee className="w-6 h-6 text-amber-400" />
            ) : (
              <Users className="w-6 h-6 text-cyber-primary" />
            )}
            <span>
              {activeTab === 'snacks'
                ? 'SNACKS DISTRIBUTION SCANNER'
                : 'MANUAL ATTENDANCE ROSTER'}
            </span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            {activeTab === 'snacks'
              ? '4-ROUND QR SCANNER // DISPENSE VALIDATION & RE-ENTRY DETECTION'
              : 'MANUAL DAY 1 & DAY 2 ATTENDANCE CONTROL & ROSTER'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-cyber-surface border border-cyber-border">
          <button
            onClick={() => setActiveTab('snacks')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'snacks'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-cyber-text-muted hover:text-cyber-text'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>SNACKS SCANNER (QR)</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'bg-cyber-primary text-cyber-bg shadow-cyber-glow-sm'
                : 'text-cyber-text-muted hover:text-cyber-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>MANUAL ATTENDANCE</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SNACKS DISTRIBUTION SCANNER */}
      {/* ========================================================================= */}
      {activeTab === 'snacks' && (
        <div className="space-y-6">
          {/* Slot Selector & Reset Controls Bar */}
          <div className="p-4 rounded-2xl cyber-glass border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Slot Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-cyber-text-muted text-[11px] font-bold mr-1 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>ACTIVE ROUND:</span>
              </span>
              {SNACK_SLOTS.map((s) => {
                const count = snacksStats.slotSummary[s.slot] || 0;
                const isSelected = activeSlot === s.slot;
                return (
                  <button
                    key={s.slot}
                    onClick={() => {
                      setActiveSlot(s.slot);
                      setLastScanResult(null);
                    }}
                    className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-xs ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                        : 'bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-cyber-text'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-black/20 text-black' : 'bg-cyber-bg text-amber-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Reset Button & Refresh */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => fetchSnacksStats(activeSlot)}
                className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-amber-400 transition-colors"
                title="Refresh stats"
              >
                <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowResetModal(true)}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/50 text-red-400 hover:bg-red-900/60 font-bold transition-all flex items-center gap-2 shadow-sm text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET ROUND {activeSlot} DATA</span>
              </button>
            </div>
          </div>

          {/* Active Round Info Header */}
          <div className="px-2 flex items-center justify-between text-xs text-cyber-text-dim">
            <div>
              CURRENTLY SCANNING FOR:{' '}
              <strong className="text-amber-400">{currentSlotObj?.name}</strong>
            </div>
            <div>
              SERVED: <strong className="text-cyber-primary">{snacksStats.servedCount}</strong> /{' '}
              {snacksStats.totalVerified} Confirmed Cadets
            </div>
          </div>

          {/* Main Scanner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Camera Scanner & Manual Input */}
            <div className="md:col-span-7 p-6 rounded-2xl cyber-glass-glow border border-amber-500/40 space-y-6">
              <CameraQrScanner
                activeDay={activeSlot}
                onScanSuccess={(scannedId) => processSnacksScan(scannedId)}
              />

              {/* Manual Input Fallback */}
              <div className="pt-4 border-t border-cyber-border/80 space-y-3">
                <div className="text-amber-400 font-bold text-xs flex items-center gap-2">
                  <Scan className="w-4 h-4" />
                  <span>OR ENTER REGISTRATION ID / ROLL NUMBER MANUALLY</span>
                </div>

                <form onSubmit={handleManualSnackSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={inputRegId}
                    onChange={(e) => setInputRegId(e.target.value.toUpperCase())}
                    placeholder="Type Reg ID (e.g. NGSOC-2026-XXXXX) or Roll Number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-surface border border-cyber-border text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  />

                  <CyberButton
                    type="submit"
                    variant="primary"
                    glow
                    size="md"
                    loading={scanProcessing}
                    className="w-full gap-2 bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>VALIDATE & DISPENSE SNACKS ({currentSlotObj?.label})</span>
                  </CyberButton>
                </form>
              </div>
            </div>

            {/* Right Column: Scan Result & Realtime Validation Box */}
            <div className="md:col-span-5 p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                  <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>SCAN DISPENSE RESULT</span>
                  </h3>
                  <span className="text-[10px] text-amber-400 font-bold animate-pulse">
                    LIVE DISPENSE
                  </span>
                </div>

                {/* Scan Result Card */}
                {lastScanResult ? (
                  <div
                    className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                      lastScanResult.status === 'GIVE_SNACKS'
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                        : 'bg-red-950/50 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]'
                    }`}
                  >
                    {/* Status Badge & Header */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-base font-black tracking-wider flex items-center gap-2 ${
                          lastScanResult.status === 'GIVE_SNACKS'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {lastScanResult.status === 'GIVE_SNACKS' ? (
                          <>
                            <CheckCircle2 className="w-6 h-6" />
                            <span>GIVE SNACKS ✓</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-6 h-6 animate-bounce" />
                            <span>RE-ENTRY // ALREADY SERVED!</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-black/40 text-cyber-text">
                        {currentSlotObj?.label}
                      </span>
                    </div>

                    {/* Alert text if Re-entry */}
                    {lastScanResult.status === 'RE_ENTRY' && (
                      <div className="p-2.5 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 text-[11px] leading-relaxed font-bold">
                        ⚠️ DO NOT GIVE SNACKS! This cadet has already collected snacks for{' '}
                        {currentSlotObj?.name} at{' '}
                        {new Date(lastScanResult.firstGivenAt).toLocaleTimeString()}.
                      </div>
                    )}

                    {/* Cadet Details */}
                    <div className="space-y-2 text-xs border-t border-cyber-border/40 pt-3">
                      <div className="text-base font-bold text-cyber-text">
                        {lastScanResult.participant.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-cyber-text-muted text-[11px]">
                        <div>
                          Reg ID:{' '}
                          <span className="text-cyber-primary font-bold">
                            {lastScanResult.participant.registrationId}
                          </span>
                        </div>
                        <div>
                          Roll No:{' '}
                          <span className="text-cyber-text font-bold">
                            {lastScanResult.participant.registerNumber}
                          </span>
                        </div>
                        <div>
                          Dept:{' '}
                          <span className="text-cyber-text">
                            {lastScanResult.participant.department} ({lastScanResult.participant.year}
                            {lastScanResult.participant.section
                              ? `-${lastScanResult.participant.section}`
                              : ''}
                            )
                          </span>
                        </div>
                        <div>
                          Track:{' '}
                          <span className="text-emerald-400 font-bold">
                            {lastScanResult.participant.creditType === 'UE_CSE'
                              ? 'PE — CSE'
                              : 'PEOPLE — OTHER'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-cyber-text-dim border border-cyber-border/60 rounded-2xl bg-cyber-surface/30 space-y-2">
                    <Coffee className="w-8 h-8 text-amber-400/40 mx-auto" />
                    <div className="text-cyber-text font-bold">Awaiting QR Scan</div>
                    <div className="text-[11px] text-cyber-text-muted">
                      Scan cadet QR code or type ID to check snacks eligibility for{' '}
                      <strong className="text-amber-400">{currentSlotObj?.name}</strong>.
                    </div>
                  </div>
                )}

                {/* Recent Scans Table in Right Column */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-cyber-text-muted uppercase">
                    Recent Scans in {currentSlotObj?.label} ({snacksStats.recentScans.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-cyber-border/60 divide-y divide-cyber-border/40 bg-cyber-surface/20">
                    {snacksStats.recentScans.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-cyber-text-dim">
                        No snacks distributed yet for this slot.
                      </div>
                    ) : (
                      snacksStats.recentScans.slice(0, 10).map((r) => (
                        <div
                          key={r.id}
                          className="p-2.5 flex items-center justify-between text-[11px] hover:bg-cyber-surface/50"
                        >
                          <div>
                            <span className="font-bold text-cyber-text">{r.name}</span>
                            <div className="text-[10px] text-cyber-text-dim">
                              {r.registrationId} • {r.registerNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-emerald-400 font-bold">
                              SERVED
                            </span>
                            <div className="text-[9px] text-cyber-text-dim">
                              {new Date(r.distributedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-cyber-border/40 text-[10px] text-cyber-text-dim text-center">
                AUTOMATED RE-ENTRY PREVENTION SYSTEM ACTIVE
              </div>
            </div>
          </div>

          {/* Reset Confirmation Modal */}
          {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md cyber-glass-glow rounded-2xl p-6 border border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.25)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>RESET SNACKS DATA</span>
                  </div>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="p-1 text-cyber-text-dim hover:text-cyber-text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-cyber-text-muted">
                  <p>
                    Are you sure you want to reset the snacks distribution data for{' '}
                    <strong className="text-amber-400">{currentSlotObj?.name}</strong>?
                  </p>
                  <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-[11px]">
                    ⚠️ This will clear all scan history for this round so that cadets can be
                    scanned again.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-cyber-border">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    disabled={resetting}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-text hover:bg-cyber-surface-elevated text-xs"
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetSlotData(false)}
                    disabled={resetting}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{resetting ? 'RESETTING...' : `RESET ONLY ${currentSlotObj?.label}`}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANUAL ATTENDANCE ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-cyber-text-dim absolute left-3 top-2.5" />
              <input
                type="text"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                placeholder="Search Name, Reg ID, Roll No, Section..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
              />
            </div>

            {/* Day 1 Filter */}
            <select
              value={day1Filter}
              onChange={(e) => setDay1Filter(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
            >
              <option value="ALL">Day 1: All Cadets</option>
              <option value="PRESENT">Day 1: Present Only</option>
              <option value="ABSENT">Day 1: Absent Only</option>
            </select>

            {/* Day 2 Filter */}
            <select
              value={day2Filter}
              onChange={(e) => setDay2Filter(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
            >
              <option value="ALL">Day 2: All Cadets</option>
              <option value="PRESENT">Day 2: Present Only</option>
              <option value="ABSENT">Day 2: Absent Only</option>
            </select>
          </div>

          {/* Roster Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl cyber-glass border border-cyber-border flex items-center justify-between">
              <div>
                <span className="text-cyber-text-muted text-[10px] block">TOTAL CADETS</span>
                <span className="text-xl font-bold text-cyber-text">{cadets.length}</span>
              </div>
              <Users className="w-6 h-6 text-cyber-primary" />
            </div>

            <div className="p-4 rounded-xl cyber-glass border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-cyber-text-muted text-[10px] block">DAY 1 PRESENT</span>
                <span className="text-xl font-bold text-emerald-400">
                  {cadets.filter((c) => c.day1Present).length} / {cadets.length}
                </span>
              </div>
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="p-4 rounded-xl cyber-glass border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-cyber-text-muted text-[10px] block">DAY 2 PRESENT</span>
                <span className="text-xl font-bold text-emerald-400">
                  {cadets.filter((c) => c.day2Present).length} / {cadets.length}
                </span>
              </div>
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {/* Cadets Table */}
          <div className="cyber-glass rounded-2xl border border-cyber-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cyber-bg-elevated border-b border-cyber-border text-cyber-text-dim text-[11px] uppercase">
                  <tr>
                    <th className="p-4">Reg ID</th>
                    <th className="p-4">Cadet Name</th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Dept / Sec</th>
                    <th className="p-4">Track</th>
                    <th className="p-4 text-center">Day 1 Attendance</th>
                    <th className="p-4 text-center">Day 2 Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/60">
                  {attendanceLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-cyber-text-muted">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyber-primary" />
                        Loading attendance roster...
                      </td>
                    </tr>
                  ) : filteredCadets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-cyber-text-muted">
                        No cadets found matching search/filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCadets.map((cadet) => {
                      const isUpdatingDay1 = updatingCadetId === `${cadet.id}-day1`;
                      const isUpdatingDay2 = updatingCadetId === `${cadet.id}-day2`;

                      return (
                        <tr key={cadet.id} className="hover:bg-cyber-surface/50 transition-colors">
                          <td className="p-4 font-bold text-cyber-primary">
                            {cadet.registrationId}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-cyber-text">{cadet.name}</div>
                            <div className="text-[10px] text-cyber-text-dim">{cadet.email}</div>
                          </td>
                          <td className="p-4 text-cyber-text font-bold">{cadet.registerNumber}</td>
                          <td className="p-4">
                            <div>{cadet.department}</div>
                            <div className="text-[10px] text-cyber-text-dim">
                              Year {cadet.year} (Sec {cadet.section})
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-emerald-400">
                              {cadet.creditType === 'UE_CSE' ? 'PE — CSE' : 'PEOPLE — OTHER'}
                            </span>
                          </td>

                          {/* Day 1 Toggle Button */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => toggleAttendance(cadet, 1, cadet.day1Present)}
                              disabled={isUpdatingDay1}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs inline-flex items-center gap-1.5 ${
                                cadet.day1Present
                                  ? 'bg-emerald-950/60 border border-emerald-500/60 text-emerald-400 shadow-cyber-glow-sm'
                                  : 'bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/50'
                              }`}
                            >
                              {isUpdatingDay1 ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : cadet.day1Present ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400" />
                              )}
                              <span>{cadet.day1Present ? 'PRESENT' : 'ABSENT'}</span>
                            </button>
                          </td>

                          {/* Day 2 Toggle Button */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => toggleAttendance(cadet, 2, cadet.day2Present)}
                              disabled={isUpdatingDay2}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs inline-flex items-center gap-1.5 ${
                                cadet.day2Present
                                  ? 'bg-emerald-950/60 border border-emerald-500/60 text-emerald-400 shadow-cyber-glow-sm'
                                  : 'bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/50'
                              }`}
                            >
                              {isUpdatingDay2 ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : cadet.day2Present ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400" />
                              )}
                              <span>{cadet.day2Present ? 'PRESENT' : 'ABSENT'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
