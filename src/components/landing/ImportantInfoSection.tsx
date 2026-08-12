'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CreditCard,
  Calendar,
  GraduationCap,
  ShieldAlert,
  Award,
  Check,
  Info,
} from 'lucide-react';

const infoItems = [
  {
    icon: FileText,
    title: 'Registration Steps',
    desc: 'Sign in with your University Google account, accept event terms, complete academic details, and proceed to payment.',
  },
  {
    icon: CreditCard,
    title: 'Payment Submission',
    desc: 'Pay ₹300 via UPI (GPay, PhonePe, Paytm, etc.) and upload a clear screenshot with the 12-digit UTR number.',
  },
  {
    icon: Calendar,
    title: 'Registration Deadline',
    desc: 'Admissions close once 200 seats are filled or by August 27, 2026 at 11:59 PM IST — whichever comes first.',
  },
  {
    icon: GraduationCap,
    title: 'Eligibility & Prerequisites',
    desc: 'Open to all 3rd and 4th year engineering students across all departments. Basic computer knowledge is recommended.',
  },
  {
    icon: Award,
    title: 'Certificate Issuance',
    desc: 'Participation certificates will be issued to all attendees who complete both days of the workshop.',
  },
  {
    icon: ShieldAlert,
    title: 'Code of Conduct',
    desc: 'Cadets must adhere to responsible cyber disclosure and ethical range rules. Malicious activities outside lab scopes will lead to disqualification.',
  },
];

export default function ImportantInfoSection() {
  return (
    <section id="guidelines" className="py-16 sm:py-24 relative border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <Info className="w-3.5 h-3.5" />
            <span>// 10. IMPORTANT DIRECTIVES & GUIDELINES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            IMPORTANT INFORMATION
          </h2>
          <p className="text-sm sm:text-base text-cyber-text-muted font-mono">
            Essential directives, payment rules, and eligibility criteria for all applicants.
          </p>
        </div>

        {/* 6 Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {infoItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="p-5 rounded-2xl cyber-glass border border-cyber-border hover:border-cyber-primary/40 transition-all font-mono space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-cyber-text">{item.title}</h3>
                </div>
                <p className="text-xs text-cyber-text-muted font-sans leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
