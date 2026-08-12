'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Award,
  GraduationCap,
  Layers,
  Users,
  Sparkles,
} from 'lucide-react';

export default function EventSpecsSection() {
  const specs = {
    eventType: '2-Day Practical Workshop',
    dates: 'August 29 – 30, 2026',
    time: '09:00 AM – 05:30 PM (IST)',
    venue: 'TIFAC Core Seminar Hall',
    fee: 300,
    certificate: 'Participation Certificate',
    eligibility: 'All Departments — 3rd & 4th Year',
    totalSlots: 200,
  };

  const specCards = [
    {
      icon: Layers,
      label: 'EVENT TYPE',
      value: specs.eventType,
      highlight: 'Hands-on Bootcamp',
    },
    {
      icon: Calendar,
      label: 'BOOTCAMP DATES',
      value: specs.dates,
      highlight: 'Friday & Saturday',
    },
    {
      icon: Clock,
      label: 'SESSION TIMINGS',
      value: specs.time,
      highlight: 'Full Day Immersion',
    },
    {
      icon: MapPin,
      label: 'VENUE',
      value: specs.venue,
      highlight: 'On Campus',
    },
    {
      icon: CreditCard,
      label: 'REGISTRATION FEE',
      value: `₹${specs.fee}`,
      highlight: 'One-time Inclusive Fee',
    },
    {
      icon: Users,
      label: 'TOTAL SLOTS',
      value: `${specs.totalSlots} Seats`,
      highlight: 'First Come First Serve',
    },
    {
      icon: Award,
      label: 'CERTIFICATE',
      value: specs.certificate,
      highlight: 'On Completion',
    },
    {
      icon: GraduationCap,
      label: 'ELIGIBILITY',
      value: specs.eligibility,
      highlight: 'All Departments Open',
    },
  ];

  return (
    <section id="specs" className="py-16 sm:py-24 relative bg-cyber-bg-elevated/40 border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>// 03. OPERATIONAL SPECIFICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            EVENT SPECIFICATIONS
          </h2>
          <p className="text-sm sm:text-base text-cyber-text-muted font-mono">
            Key logistical parameters and venue details for bootcamp participants.
          </p>
        </div>

        {/* Spec Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {specCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl cyber-glass border border-cyber-border hover:border-cyber-primary/40 transition-all duration-300 flex items-start gap-4 font-mono"
              >
                <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-primary shrink-0 shadow-cyber-glow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-[10px] text-cyber-text-dim uppercase tracking-wider font-bold">
                    {item.label}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-cyber-text">
                    {item.value}
                  </div>
                  <div className="text-[11px] text-cyber-primary">
                    {item.highlight}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
