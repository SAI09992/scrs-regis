'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnnouncementData } from '@/types';
import { Bell, AlertTriangle, Info, ShieldAlert, ArrowLeft, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PortalUpdatesPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/announcements');
        const data = await res.json();
        if (data.success && data.announcements) {
          setAnnouncements(data.announcements.filter((a: AnnouncementData) => a.published));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-cyber-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-mono text-cyber-text flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyber-primary" />
                <span>COMMAND DIRECTIVES & BROADCASTS</span>
              </h1>
              <p className="text-xs font-mono text-cyber-text-muted">
                OFFICIAL WORKSHOP ANNOUNCEMENTS & LAB NOTICES
              </p>
            </div>
          </div>
        </div>

        {/* Announcements Stream */}
        {loading ? (
          <div className="text-center py-12 text-xs font-mono text-cyber-text-muted">
            SYNCING DIRECTIVES STREAM...
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-xs font-mono text-cyber-text-muted cyber-glass rounded-xl p-8">
            NO ACTIVE BROADCAST DIRECTIVES AT THIS TIME.
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann, idx) => {
              const isCritical = ann.priority === 'critical';
              const isImportant = ann.priority === 'important';

              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`p-6 rounded-2xl cyber-glass border font-mono text-xs space-y-3 ${
                    isCritical
                      ? 'border-red-500/50 bg-red-950/20 shadow-cyber-glow-danger'
                      : isImportant
                      ? 'border-amber-500/50 bg-amber-950/10'
                      : 'border-cyber-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCritical ? (
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      ) : isImportant ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Info className="w-4 h-4 text-cyber-primary" />
                      )}
                      <span
                        className={`font-bold tracking-wider uppercase text-sm ${
                          isCritical
                            ? 'text-red-400'
                            : isImportant
                            ? 'text-amber-400'
                            : 'text-cyber-primary'
                        }`}
                      >
                        {ann.title}
                      </span>
                    </div>

                    <span className="text-[10px] text-cyber-text-dim flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>

                  <p className="text-cyber-text leading-relaxed font-sans text-sm">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-2 pt-2 text-[10px] text-cyber-text-dim border-t border-cyber-border/40">
                    <span>AUDIENCE: {ann.audience.toUpperCase()}</span>
                    <span>•</span>
                    <span>PRIORITY: {ann.priority.toUpperCase()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
