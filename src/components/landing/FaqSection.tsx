'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is NextGen SOC?',
    a: 'NextGen SOC is a 2-day intensive hands-on cybersecurity workshop organized by SCRS (Soft Computing Research Society). It covers SOC operations, SIEM telemetry, packet forensics, memory threat hunting, and live ransomware incident response simulations.',
  },
  {
    q: 'When and where is the event?',
    a: 'The bootcamp is scheduled for August 29–30, 2026 at TIFAC Core Seminar Hall. Sessions run from 09:00 AM to 05:30 PM IST on both days.',
  },
  {
    q: 'Who can register?',
    a: 'All 3rd and 4th year engineering students from any department (CSE, IT, ECE, EEE, Mech, Civil, and all other branches) can register.',
  },
  {
    q: 'How much is the registration fee?',
    a: 'The registration fee is ₹300 per student. This is a flat fee for all departments — there is no separate pricing.',
  },
  {
    q: 'How many seats are available?',
    a: 'There are a total of 200 seats available on a first-come, first-served basis. Once slots are filled, registrations will close automatically.',
  },
  {
    q: 'What credit do I receive?',
    a: 'CSE students receive Program Elective (PE) credit, and students from all other departments receive University Elective (UE) credit. The subject is Cyber Security.',
  },
  {
    q: 'Will I get a certificate?',
    a: 'Yes, all participants who attend both days will receive a Participation Certificate upon completion of the workshop.',
  },
  {
    q: 'How do I register?',
    a: 'Click the REGISTER NOW button on this page. You will need to sign in with your Google account, fill out the registration form, and complete the payment of ₹300.',
  },
  {
    q: 'How do I pay?',
    a: 'After registering, you will be shown UPI payment details. Pay ₹300 via any UPI app (GPay, PhonePe, Paytm, etc.) and upload a screenshot of the payment confirmation.',
  },
  {
    q: 'Who do I contact for queries?',
    a: 'Reach out to the student coordinators listed on this page. You can call or WhatsApp them directly for any registration or event-related queries.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24 relative bg-cyber-bg-elevated/40 border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>// 11. FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-cyber-primary/50 bg-cyber-surface/80 shadow-cyber-glow-sm'
                    : 'border-cyber-border/60 bg-cyber-surface/40 hover:border-cyber-primary/30'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-mono"
                >
                  <span className={`text-sm sm:text-base font-bold pr-4 ${isOpen ? 'text-cyber-primary' : 'text-cyber-text'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-cyber-primary transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm font-mono text-cyber-text-muted leading-relaxed border-t border-cyber-border/40 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
