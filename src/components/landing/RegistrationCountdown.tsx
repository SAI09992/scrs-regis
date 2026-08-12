'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Timer, Sparkles } from 'lucide-react';

export default function RegistrationCountdown() {
  const [targetDate, setTargetDate] = useState(new Date('2026-08-29T09:00:00+05:30').getTime());

  useEffect(() => {
    async function loadTarget() {
      try {
        const res = await fetch('/api/event-stats');
        const data = await res.json();
        if (data.success && data.stats?.countdownTarget) {
          setTargetDate(new Date(data.stats.countdownTarget).getTime());
        }
      } catch (e) { /* use default */ }
    }
    loadTarget();
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="py-16 sm:py-24 relative border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-4xl mx-auto cyber-glass-glow rounded-3xl p-6 sm:p-10 border border-cyber-primary/40 shadow-cyber-card text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
              <Timer className="w-3.5 h-3.5 animate-pulse" />
              <span>// 08. LAUNCH COUNTDOWN</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-cyber-text">
              BOOTCAMP LAUNCH COUNTDOWN
            </h3>
            <p className="text-xs font-mono text-cyber-text-muted">
              COUNTDOWN TO BOOTCAMP // AUGUST 29, 2026 // TIFAC CORE SEMINAR HALL
            </p>
          </div>

          {/* 4 Digit Boxes */}
          <div suppressHydrationWarning className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-2">
            {timeUnits.map((u, idx) => (
              <motion.div
                key={u.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-4 sm:p-5 rounded-2xl bg-cyber-surface/90 border border-cyber-border hover:border-cyber-primary/60 transition-colors shadow-cyber-glow-sm flex flex-col items-center justify-center space-y-1 font-mono"
              >
                <span suppressHydrationWarning className="text-3xl sm:text-5xl font-extrabold text-cyber-primary font-mono-numbers drop-shadow-[0_0_12px_rgba(0,229,255,0.5)]">
                  {String(u.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-cyber-text-dim uppercase tracking-widest">
                  {u.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
