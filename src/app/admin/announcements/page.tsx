'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { AnnouncementData } from '@/types';
import { formatDate } from '@/lib/utils';
import { Bell, Plus, Trash2, Radio, AlertTriangle, Info, ShieldAlert, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'critical'>('normal');
  const [audience, setAudience] = useState<'all' | 'UE_CSE' | 'PEOPLE_OTHER'>('all');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          priority,
          audience,
          published: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('✓ Directive broadcasted in real time to cadets');
        setTitle('');
        setContent('');
        fetchAnnouncements();
      } else {
        toast.error(data.error || 'Failed to publish');
      }
    } catch (e) {
      toast.error('Publishing error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Directive deleted');
        fetchAnnouncements();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyber-primary" />
            <span>COMMAND DIRECTIVES & BROADCASTS</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            PUBLISH REAL-TIME ALERTS TO CADET PARTICIPANT PORTALS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Composer Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl cyber-glass-glow border border-cyber-border space-y-4">
          <div className="flex items-center gap-2 text-cyber-primary font-bold text-sm border-b border-cyber-border pb-3">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>COMPOSE NEW DIRECTIVE</span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-cyber-text block">Directive Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Day 1 Range Telemetry Setup"
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-cyber-text block">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
                >
                  <option value="normal">Normal (Info)</option>
                  <option value="important">Important (Amber)</option>
                  <option value="critical">Critical Alert (Red)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-cyber-text block">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
                >
                  <option value="all">All Cadets</option>
                  <option value="UE_CSE">PE — CSE Only</option>
                  <option value="PEOPLE_OTHER">PEOPLE Other Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-cyber-text block">Message Content *</label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type the announcement message here..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <CyberButton
              type="submit"
              variant="primary"
              glow
              size="md"
              loading={creating}
              className="w-full gap-2"
            >
              <Send className="w-4 h-4" />
              <span>BROADCAST TO CADET PORTALS</span>
            </CyberButton>
          </form>
        </div>

        {/* Right: Published Directives List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-sm font-bold text-cyber-text tracking-wider uppercase flex items-center justify-between">
            <span>ACTIVE BROADCASTS ({announcements.length})</span>
            <span className="text-[10px] text-cyber-primary">REAL-TIME SSE SYNC</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-cyber-text-muted">Loading directives...</div>
          ) : announcements.length === 0 ? (
            <div className="p-8 rounded-2xl cyber-glass border border-cyber-border text-center text-cyber-text-muted">
              No directives posted yet. Use the composer on the left to broadcast an announcement.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl cyber-glass border border-cyber-border flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ann.priority === 'critical'
                            ? 'bg-red-400'
                            : ann.priority === 'important'
                            ? 'bg-amber-400'
                            : 'bg-cyber-primary'
                        }`}
                      />
                      <span className="font-bold text-cyber-text text-sm">{ann.title}</span>
                      <span className="px-2 py-0.5 rounded bg-cyber-surface text-cyber-text-dim text-[10px]">
                        {ann.audience.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-cyber-text-muted font-sans text-xs pt-1">{ann.content}</p>
                    <div className="text-[10px] text-cyber-text-dim pt-1">
                      {formatDate(ann.createdAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="text-cyber-text-dim hover:text-red-400 p-1 transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
