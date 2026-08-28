'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, RefreshCw } from 'lucide-react';

export default function LiveSlotTracker() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalCapacity: 200,
    paymentsVerified: 0,
    paymentsPending: 0,
    registrationOpen: true,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/event-stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats({
          totalRegistered: data.stats.totalRegistered || 0,
          totalCapacity: data.stats.totalCapacity || 200,
          paymentsVerified: data.stats.paymentsVerified || 0,
          paymentsPending: data.stats.paymentsPending || 0,
          registrationOpen: data.stats.registrationOpen ?? true,
        });
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch event stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.event === 'registration:countUpdated') {
            fetchStats();
          }
        } catch (err) {
          // ignore heartbeat
        }
      };
    } catch (err) {
      console.warn('Realtime SSE unavailable');
    }

    const interval = setInterval(fetchStats, 30000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const totalPercent = Math.min(
    100,
    Math.round((stats.totalRegistered / (stats.totalCapacity || 200)) * 100)
  );

  const remaining = Math.max(0, stats.totalCapacity - stats.totalRegistered);

  return (
    <section id="seats" className="py-16 sm:py-24 relative bg-cyber-bg-elevated/40 border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-3xl mx-auto cyber-glass-glow rounded-3xl p-6 sm:p-10 border-2 border-cyber-primary/40 shadow-cyber-card">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-cyber-primary uppercase tracking-widest">
                  // 01. LIVE CAPACITY & SEAT TRACKER
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-lg sm:text-xl font-bold font-mono tracking-wide text-cyber-text">
                    LIVE REGISTRATION STATUS
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      !stats.registrationOpen || stats.totalRegistered >= stats.totalCapacity
                        ? 'bg-red-950/60 border border-red-500/40 text-red-400'
                        : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                    }`}
                  >
                    {!stats.registrationOpen || stats.totalRegistered >= stats.totalCapacity ? 'CLOSED' : 'OPEN'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={fetchStats}
              title="Refresh telemetry"
              className="flex items-center gap-1.5 text-xs font-mono text-cyber-primary/80 hover:text-cyber-primary bg-cyber-surface px-3 py-1.5 rounded-lg border border-cyber-border transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SYNC NOW</span>
            </button>
          </div>

          {/* Main Total Progress Gauge */}
          <div className="mt-8 space-y-3">
            <div className="flex items-end justify-between font-mono">
              <div className="flex items-center gap-2 text-sm text-cyber-text-muted">
                <Users className="w-4 h-4 text-cyber-primary" />
                <span>TOTAL SEATS</span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-cyber-primary">
                  {stats.totalRegistered}
                </span>
                <span className="text-sm text-cyber-text-dim"> / {stats.totalCapacity} Filled</span>
                <span className="ml-2 text-xs font-bold text-emerald-400">({totalPercent}%)</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full rounded-full bg-cyber-bg border border-cyber-border overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-cyber-secondary via-cyber-primary to-emerald-400 shadow-cyber-glow-sm"
              />
            </div>

            {/* Remaining Seats */}
            <div className="flex justify-between text-xs font-mono text-cyber-text-dim pt-1">
              <span>Fee: ₹300 per registration</span>
              <span className="text-cyber-primary font-bold">{remaining} seats remaining</span>
            </div>
          </div>

          {/* Last Updated */}
          <div
            suppressHydrationWarning
            className="mt-6 pt-4 border-t border-cyber-border/60 text-[11px] font-mono text-cyber-text-dim text-center"
          >
            {mounted ? `Last synced: ${lastUpdated.toLocaleTimeString()}` : 'Syncing live telemetry...'}
          </div>
        </div>
      </div>
    </section>
  );
}
