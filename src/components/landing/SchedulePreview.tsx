'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin, User, ChevronRight } from 'lucide-react';

const scheduleData = {
  day1: [
    {
      time: '09:00 AM – 10:30 AM',
      title: 'SOC Fundamentals & Cyber Threat Landscape',
      desc: 'Evolution of SOC operations, SIEM architectures, MITRE ATT&CK framework mapping.',
      speaker: 'Dr. Evelyn Vance (Chief InfoSec Officer)',
    },
    {
      time: '10:45 AM – 01:00 PM',
      title: 'Hands-on SIEM Telemetry & Log Ingestion Lab',
      desc: 'Configuring syslog forwarding, Windows Event Forwarding, parsing Sysmon telemetry, and alert rules.',
      speaker: 'Marcus Thorne (Lead Security Architect)',
    },
    {
      time: '02:00 PM – 05:00 PM',
      title: 'Live Network Anomaly Detection & Packet Analysis',
      desc: 'Wireshark deep packet inspection, Zeek telemetry, detecting C2 beacons & DNS exfiltration.',
      speaker: 'Sarah Jenkins (Senior DFIR Specialist)',
    },
  ],
  day2: [
    {
      time: '09:00 AM – 12:30 PM',
      title: 'EDR Forensics & Memory Threat Hunting',
      desc: 'Memory analysis with Volatility 3, live process triage, process injection detection & payload extraction.',
      speaker: 'Alex Rivera (Malware Analyst & Reverse Engineer)',
    },
    {
      time: '01:30 PM – 04:30 PM',
      title: 'Simulated SOC War Room: Live Cyber Attack Range',
      desc: 'Full-scale simulated enterprise ransomware incident. Teams investigate alerts and contain threats.',
      speaker: 'SOC Range Operations Team',
    },
    {
      time: '04:30 PM – 05:30 PM',
      title: 'Debrief, Certification & SOC Career Pathways',
      desc: 'Analysis of range telemetry, tier-1/tier-2 analyst job readiness, and certificate award ceremony.',
      speaker: 'Organizing Committee',
    },
  ],
};

export default function SchedulePreview() {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');

  return (
    <section id="schedule" className="py-16 sm:py-24 relative border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>// 07. 2-DAY CURRICULUM TIMELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            2-DAY BOOTCAMP SCHEDULE
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-cyber-text-muted pt-1">
            <span className="flex items-center gap-1 text-cyber-primary">
              <Calendar className="w-3.5 h-3.5" /> August 29 – 30, 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-cyber-text">
              <MapPin className="w-3.5 h-3.5 text-cyber-secondary" /> Cyber Range Lab 4 & Auditorium
            </span>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-cyber-surface border border-cyber-border font-mono text-xs">
            <button
              onClick={() => setActiveDay('day1')}
              className={`px-6 py-2.5 rounded-lg transition-all ${
                activeDay === 'day1'
                  ? 'bg-cyber-primary text-cyber-bg font-bold shadow-cyber-glow-sm'
                  : 'text-cyber-text-muted hover:text-cyber-text'
              }`}
            >
              DAY 1 : DETECTION & TELEMETRY
            </button>
            <button
              onClick={() => setActiveDay('day2')}
              className={`px-6 py-2.5 rounded-lg transition-all ${
                activeDay === 'day2'
                  ? 'bg-cyber-primary text-cyber-bg font-bold shadow-cyber-glow-sm'
                  : 'text-cyber-text-muted hover:text-cyber-text'
              }`}
            >
              DAY 2 : THREAT HUNTING & WAR ROOM
            </button>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {scheduleData[activeDay].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-5 rounded-xl cyber-glass border border-cyber-border hover:border-cyber-primary/40 transition-colors flex flex-col sm:flex-row items-start gap-4"
            >
              <div className="sm:w-44 shrink-0 font-mono text-xs text-cyber-primary flex items-center gap-1.5 bg-cyber-bg-elevated px-3 py-1.5 rounded-md border border-cyber-border">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{item.time}</span>
              </div>

              <div className="flex-1 space-y-1.5">
                <h4 className="text-base font-bold font-mono text-cyber-text">
                  {item.title}
                </h4>
                <p className="text-xs text-cyber-text-muted leading-relaxed">
                  {item.desc}
                </p>
                <div className="text-[11px] font-mono text-cyber-text-dim flex items-center gap-1 pt-1">
                  <User className="w-3 h-3 text-cyber-secondary" />
                  <span>{item.speaker}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
