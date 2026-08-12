'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MetricCard } from '@/components/ui/MetricCard';
import { LiveStats } from '@/types';
import {
  Users,
  CreditCard,
  Clock,
  XCircle,
  QrCode,
  Activity,
  Radio,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { CyberButton } from '@/components/ui/CyberButton';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  text: string;
  type: 'reg' | 'pay_sub' | 'pay_ver' | 'att';
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<LiveStats>({
    totalRegistered: 0,
    totalCapacity: 200,
    paymentsVerified: 0,
    paymentsPending: 0,
    day1Attendance: 0,
    day2Attendance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/event-stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to Realtime SSE
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.event === 'registration:countUpdated') {
            fetchStats();
            setActivities((prev) => [
              {
                id: String(Date.now()),
                text: 'New cadet registered',
                type: 'reg',
                timestamp: 'Just now',
              },
              ...prev.slice(0, 10),
            ]);
          } else if (payload.event === 'payment:statusUpdated') {
            fetchStats();
            setActivities((prev) => [
              {
                id: String(Date.now()),
                text: `Payment ${payload.data.status} — ${payload.data.participantName || payload.data.registrationId}`,
                type: payload.data.status === 'verified' ? 'pay_ver' : 'pay_sub',
                timestamp: 'Just now',
              },
              ...prev.slice(0, 10),
            ]);
          }
        } catch (err) {
          // ignore
        }
      };
    } catch (err) {
      console.warn(err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  return (
    <div className="space-y-8 font-mono text-xs max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            SOC COMMAND CENTER
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            OPERATIONAL OVERVIEW & REAL-TIME EVENT TELEMETRY
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-primary">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>RANGE ENGINE: ONLINE</span>
          </div>
          <button
            onClick={fetchStats}
            className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-cyber-primary"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="TOTAL REGISTRATIONS"
          value={`${stats.totalRegistered} / ${stats.totalCapacity}`}
          subtitle={`${stats.totalCapacity - stats.totalRegistered} seats remaining`}
          icon={Users}
          variant="cyan"

        />

        <MetricCard
          title="PAYMENTS VERIFIED"
          value={stats.paymentsVerified}
          subtitle="Bank settled transactions"
          icon={ShieldCheck}
          variant="emerald"

        />

        <MetricCard
          title="PAYMENTS PENDING"
          value={stats.paymentsPending}
          subtitle="Awaiting admin inspection"
          icon={Clock}
          variant="amber"

        />

        <MetricCard
          title="DAY 1 / DAY 2 ATTENDANCE"
          value={`${stats.day1Attendance} | ${stats.day2Attendance}`}
          subtitle="QR scanned cadets"
          icon={QrCode}
          variant="cyan"

        />
      </div>

      {/* Quick Action & Live Activity Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Action Panels */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
            <h3 className="text-sm font-bold text-cyber-primary uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>COMMAND ACTIONS & SHORTCUTS</span>
            </h3>

            {/* Live Quick Slot Controller Widget */}
            <div className="p-4 rounded-xl bg-cyber-bg/80 border border-cyber-border space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyber-text flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyber-primary" /> LIVE BOOTCAMP CAPACITY CONTROL
                </span>
                <span className="text-[11px] text-cyber-text-dim">
                  TOTAL: <strong className="text-cyber-primary text-sm font-bold">{stats.totalCapacity} SLOTS</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const newCap = Math.max(1, stats.totalCapacity - 10);
                      setStats((prev) => ({ ...prev, totalCapacity: newCap }));
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ totalCapacity: newCap }),
                      });
                      toast.success(`Capacity reduced to ${newCap} slots`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 font-bold hover:bg-red-900/60 transition-colors text-xs"
                  >
                    -10 Slots
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const newCap = Math.max(1, stats.totalCapacity - 1);
                      setStats((prev) => ({ ...prev, totalCapacity: newCap }));
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ totalCapacity: newCap }),
                      });
                      toast.success(`Capacity reduced to ${newCap} slots`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 font-bold hover:bg-red-900/60 transition-colors text-xs"
                  >
                    -1 Slot
                  </button>

                  <div className="h-5 w-px bg-cyber-border mx-1" />

                  <button
                    type="button"
                    onClick={async () => {
                      const newCap = stats.totalCapacity + 1;
                      setStats((prev) => ({ ...prev, totalCapacity: newCap }));
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ totalCapacity: newCap }),
                      });
                      toast.success(`Capacity increased to ${newCap} slots`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold hover:bg-emerald-900/60 transition-colors text-xs"
                  >
                    +1 Slot
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const newCap = stats.totalCapacity + 10;
                      setStats((prev) => ({ ...prev, totalCapacity: newCap }));
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ totalCapacity: newCap }),
                      });
                      toast.success(`Capacity increased to ${newCap} slots`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold hover:bg-emerald-900/60 transition-colors text-xs"
                  >
                    +10 Slots
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const newCap = stats.totalCapacity + 50;
                      setStats((prev) => ({ ...prev, totalCapacity: newCap }));
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ totalCapacity: newCap }),
                      });
                      toast.success(`Capacity increased to ${newCap} slots`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold hover:bg-emerald-900/60 transition-colors text-xs"
                  >
                    +50 Slots
                  </button>
                </div>

                <Link
                  href="/admin/settings"
                  className="text-[11px] text-cyber-primary hover:underline font-bold"
                >
                  Manage All Settings →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link href="/admin/payments" className="block">
                <div className="p-4 rounded-xl bg-cyber-surface hover:bg-cyber-surface-elevated border border-cyber-primary/40 hover:border-cyber-primary transition-all space-y-1">
                  <div className="flex items-center justify-between text-cyber-primary font-bold text-sm">
                    <span>INSPECT PAYMENTS</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 text-xs">
                      {stats.paymentsPending} PENDING
                    </span>
                  </div>
                  <p className="text-[11px] text-cyber-text-muted">
                    Review OCR analysis & match bank records
                  </p>
                </div>
              </Link>

              <Link href="/admin/attendance" className="block">
                <div className="p-4 rounded-xl bg-cyber-surface hover:bg-cyber-surface-elevated border border-cyber-secondary/40 hover:border-cyber-secondary transition-all space-y-1">
                  <div className="flex items-center justify-between text-cyber-secondary font-bold text-sm">
                    <span>SCAN ATTENDANCE</span>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-cyber-text-muted">
                    Launch QR scanner for Day 1 & Day 2
                  </p>
                </div>
              </Link>

              <Link href="/admin/registrations" className="block">
                <div className="p-4 rounded-xl bg-cyber-surface hover:bg-cyber-surface-elevated border border-cyber-border hover:border-cyber-primary transition-all space-y-1">
                  <div className="flex items-center justify-between text-cyber-text font-bold text-sm">
                    <span>CADET ROSTER</span>
                    <Users className="w-4 h-4 text-cyber-primary" />
                  </div>
                  <p className="text-[11px] text-cyber-text-muted">
                    Filter by dept & export CSV data
                  </p>
                </div>
              </Link>

              <Link href="/admin/announcements" className="block">
                <div className="p-4 rounded-xl bg-cyber-surface hover:bg-cyber-surface-elevated border border-cyber-border hover:border-cyber-primary transition-all space-y-1">
                  <div className="flex items-center justify-between text-cyber-text font-bold text-sm">
                    <span>BROADCAST DIRECTIVE</span>
                    <Radio className="w-4 h-4 text-cyber-primary" />
                  </div>
                  <p className="text-[11px] text-cyber-text-muted">
                    Send real-time alerts to participants
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <h3 className="text-sm font-bold text-cyber-text tracking-wider uppercase flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyber-primary animate-pulse" />
                  <span>LIVE ADMIN ACTIVITY</span>
                </h3>
                <span className="text-[10px] text-emerald-400">REALTIME FEED</span>
              </div>

              <div className="mt-4 space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          act.type === 'pay_ver'
                            ? 'bg-emerald-400'
                            : act.type === 'pay_sub'
                            ? 'bg-amber-400'
                            : 'bg-cyber-primary'
                        }`}
                      />
                      <span className="text-cyber-text truncate">{act.text}</span>
                    </div>
                    <span className="text-[10px] text-cyber-text-dim shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-cyber-border/40 text-[11px] text-cyber-text-dim text-center">
              AUTOMATED SECURE AUDITING ENABLED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
