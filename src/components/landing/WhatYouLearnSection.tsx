'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Radar,
  FileText,
  Cpu,
  Search,
  AlertTriangle,
  Activity,
  Terminal,
  Layers,
} from 'lucide-react';

const learningModules = [
  {
    icon: Shield,
    title: 'SOC FUNDAMENTALS',
    desc: 'Tier-1 to Tier-3 analyst hierarchy, shift operations, SLA compliance, and enterprise SOC workflows.',
  },
  {
    icon: Radar,
    title: 'THREAT DETECTION',
    desc: 'Identifying multi-stage adversary TTPs mapped directly against the MITRE ATT&CK enterprise matrix.',
  },
  {
    icon: FileText,
    title: 'LOG ANALYSIS',
    desc: 'Deep inspection of Windows Event Logs, Sysmon telemetry, Linux auditd, and authentication streams.',
  },
  {
    icon: Cpu,
    title: 'SIEM ARCHITECTURE',
    desc: 'Forwarder configuration, indexer tuning, custom parsing regex, and real-time alert rule engineering.',
  },
  {
    icon: Search,
    title: 'THREAT INTELLIGENCE',
    desc: 'Extracting indicators of compromise (IOCs), hash triage, VirusTotal telemetry, and C2 IP reputation analysis.',
  },
  {
    icon: AlertTriangle,
    title: 'INCIDENT RESPONSE',
    desc: 'Adversary containment playbooks, host isolation, memory preservation, and triage report generation.',
  },
  {
    icon: Activity,
    title: 'SECURITY MONITORING',
    desc: 'Continuous telemetry aggregation, anomaly baselines, beacon detection, and exfiltration hunting.',
  },
  {
    icon: Terminal,
    title: 'HANDS-ON INVESTIGATION',
    desc: 'Direct terminal access to Wireshark PCAPs, Volatility memory dumps, and real ransomware lab ranges.',
  },
];

export default function WhatYouLearnSection() {
  return (
    <section id="workshop" className="py-16 sm:py-24 relative border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>// 05. 8-MODULE CYBER DEFENSE SYLLABUS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            WHAT YOU WILL LEARN
          </h2>
          <p className="text-sm sm:text-base text-cyber-text-muted font-mono">
            Eight core tactical domains engineered to transform students into job-ready SOC analysts.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {learningModules.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 15, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl cyber-glass border border-cyber-border hover:border-cyber-primary/60 transition-all duration-300 space-y-3 flex flex-col justify-between group font-mono"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-cyber-surface border border-cyber-border group-hover:border-cyber-primary text-cyber-primary flex items-center justify-center shadow-cyber-glow-sm transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-cyber-text tracking-wide group-hover:text-cyber-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-cyber-text-muted leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 text-[10px] text-cyber-primary flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <span>MODULE 0{idx + 1}</span>
                  <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
