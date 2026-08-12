'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, User, Users, Shield, ArrowUpRight } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';

export interface LandingCoordinator {
  name: string;
  role: string;
  department: string;
  phone: string;
  whatsappUrl?: string;
  callUrl?: string;
}

const DEFAULT_COORDINATORS: LandingCoordinator[] = [
  {
    name: 'SAI DHANUSH',
    role: 'Student Technical Lead',
    department: 'CSE / 3rd Year',
    phone: '+91 93812 76836',
    whatsappUrl: 'https://wa.me/919381276836?text=Hi%20Sai%20Dhanush,%20I%20have%20a%20query%20about%20NextGen%20SOC%20Bootcamp.',
    callUrl: 'tel:+919381276836',
  },
  {
    name: 'RAHUL',
    role: 'Student Operations Lead',
    department: 'CSE / 3rd Year',
    phone: '+91 95153 92839',
    whatsappUrl: 'https://wa.me/919515392839?text=Hi%20Rahul,%20I%20have%20a%20query%20about%20NextGen%20SOC%20Bootcamp.',
    callUrl: 'tel:+919515392839',
  },
];

export default function CoordinatorsSection() {
  const [coordinators, setCoordinators] = useState<LandingCoordinator[]>(DEFAULT_COORDINATORS);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/event-stats');
        const data = await res.json();
        if (data.success && data.stats?.coordinators && Array.isArray(data.stats.coordinators) && data.stats.coordinators.length > 0) {
          setCoordinators(data.stats.coordinators);
        }
      } catch (e) {
        // use default fallback
      }
    }
    load();
  }, []);
  return (
    <section id="contact" className="py-16 sm:py-24 relative border-t border-cyber-border/60">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyber-primary/40 text-cyber-primary text-xs font-mono">
            <Users className="w-3.5 h-3.5" />
            <span>// 12. STUDENT EVENT COORDINATORS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-cyber-text">
            STUDENT EVENT COORDINATORS
          </h2>
          <p className="text-sm sm:text-base text-cyber-text-muted font-mono">
            Contact the event team for event queries, registration doubts, or payment assistance.
          </p>
        </div>

        {/* Coordinators Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {coordinators.map((c, idx) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="p-6 sm:p-8 rounded-3xl cyber-glass-glow border border-cyber-border hover:border-cyber-primary/50 transition-all duration-300 space-y-6 text-center font-mono flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Avatar Icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyber-surface border border-cyber-primary/40 text-cyber-primary flex items-center justify-center shadow-cyber-glow-sm">
                  <User className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-cyber-text tracking-wide">{c.name}</h3>
                  <p className="text-xs font-bold text-cyber-primary uppercase">{c.role}</p>
                  <p className="text-[11px] text-cyber-text-dim">{c.department}</p>
                </div>

                <div className="text-xs font-bold text-cyber-text pt-1">
                  {c.phone}
                </div>
              </div>

              {/* Action Buttons */}
              {(() => {
                const cleanDigits = (c.phone || '').replace(/\D/g, '');
                const waLink =
                  c.whatsappUrl ||
                  `https://wa.me/${cleanDigits.length === 10 ? '91' + cleanDigits : cleanDigits}?text=Hi%20${encodeURIComponent(c.name || 'Coordinator')},%20I%20have%20a%20query%20about%20NextGen%20SOC%20Bootcamp.`;
                const telLink = c.callUrl || `tel:${(c.phone || '').replace(/\s+/g, '')}`;

                return (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <CyberButton variant="primary" glow size="sm" className="w-full gap-1.5 text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WHATSAPP</span>
                      </CyberButton>
                    </a>

                    <a href={telLink} className="inline-block">
                      <CyberButton variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5" />
                        <span>CALL</span>
                      </CyberButton>
                    </a>
                  </div>
                );
              })()}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
