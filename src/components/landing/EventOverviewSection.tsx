'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Users, Zap, Terminal, CheckCircle2 } from 'lucide-react';

const overviewPoints = [
  {
    icon: Shield,
    title: 'WHAT IS NEXTGEN SOC?',
    desc: 'An intensive 2-day immersive cyber defense bootcamp structured around enterprise Security Operations Centre architectures, threat triage pipelines, and live adversary containment simulations.',
  },
  {
    icon: Zap,
    title: 'WHY THIS WORKSHOP?',
    desc: 'Traditional academics rarely expose students to live SOC telemetry. This bootcamp provides direct keyboard access to enterprise SIEM platforms, real PCAP packet captures, and live malware artifacts.',
  },
  {
    icon: Users,
    title: 'WHO IS IT FOR?',
    desc: 'All 2nd, 3rd, and 4th year engineering students across all departments — CSE, IT, ECE, EEE, Mech, Civil, and all allied branches.',
  },
  {
    icon: Terminal,
    title: 'WHAT YOU WILL EXPERIENCE',
    desc: 'Hands-on guided lab environments, simulated enterprise ransomware war rooms, red vs. blue tactical incident response drills, and cryptographic certificate issuance.',
  },
];

export default function EventOverviewSection() {
  return (
    <section id="about" className="py-16 sm:py-24 relative border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>// 02. EXECUTIVE BRIEFING & EVENT OVERVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            WHAT IS NEXTGEN SOC?
          </h2>
          <p className="text-sm sm:text-base text-cyber-text-muted font-mono">
            Core objectives, student target audience, and the operational bootcamp mission.
          </p>
        </div>

        {/* 4 Overview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {overviewPoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -3 }}
                className="p-6 rounded-2xl cyber-glass border border-cyber-border hover:border-cyber-primary/50 transition-all duration-300 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyber-surface border border-cyber-primary/30 text-cyber-primary shadow-cyber-glow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold font-mono text-cyber-text tracking-wide">
                    {point.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-cyber-text-muted font-mono leading-relaxed">
                  {point.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
