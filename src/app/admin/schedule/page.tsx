'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { ScheduleItem } from '@/types';
import { Calendar, Plus, Trash2, Clock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<1 | 2>(1);

  // Form State
  const [day, setDay] = useState<1 | 2>(1);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/schedules');
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setAdding(true);
    try {
      const res = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          startTime,
          endTime,
          title,
          description,
          speaker,
          orderIndex: schedules.filter((s) => s.day === day).length + 1,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('✓ Session added to curriculum timeline');
        setTitle('');
        setDescription('');
        setSpeaker('');
        fetchSchedules();
      } else {
        toast.error(data.error || 'Failed to add session');
      }
    } catch (e) {
      toast.error('Add failed');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/schedules?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Session removed');
        fetchSchedules();
      }
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const daySessions = schedules.filter((s) => s.day === activeDay);

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyber-primary" />
            <span>BOOTCAMP CURRICULUM & TIMETABLE</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            MANAGE 2-DAY LIVE LAB SESSIONS & WORKSHOPS
          </p>
        </div>

        {/* Day Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-cyber-surface border border-cyber-border">
          <button
            onClick={() => setActiveDay(1)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeDay === 1
                ? 'bg-cyber-primary text-cyber-bg shadow-cyber-glow-sm'
                : 'text-cyber-text-muted hover:text-cyber-text'
            }`}
          >
            DAY 1 TIMETABLE
          </button>
          <button
            onClick={() => setActiveDay(2)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeDay === 2
                ? 'bg-cyber-primary text-cyber-bg shadow-cyber-glow-sm'
                : 'text-cyber-text-muted hover:text-cyber-text'
            }`}
          >
            DAY 2 TIMETABLE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Session Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl cyber-glass-glow border border-cyber-border space-y-4">
          <div className="flex items-center gap-2 text-cyber-primary font-bold text-sm border-b border-cyber-border pb-3">
            <Plus className="w-4 h-4" />
            <span>ADD NEW TIMELINE SESSION</span>
          </div>

          <form onSubmit={handleAddSession} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-cyber-text block">Day</label>
                <select
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value) as 1 | 2)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
                >
                  <option value={1}>Day 1 (Aug 29)</option>
                  <option value={2}>Day 2 (Aug 30)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-cyber-text block">Lead Speaker</label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="e.g. Dr. Evelyn Vance"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-cyber-text block">Start Time</label>
                <input
                  type="text"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-cyber-text block">End Time</label>
                <input
                  type="text"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="10:30 AM"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-cyber-text block">Session Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hands-on SIEM Telemetry & Log Ingestion"
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-cyber-text block">Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Session topics, lab prerequisites, toolchains..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <CyberButton
              type="submit"
              variant="primary"
              glow
              size="md"
              loading={adding}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>APPEND TO DAY {day} SCHEDULE</span>
            </CyberButton>
          </form>
        </div>

        {/* Right: Timetable List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-sm font-bold text-cyber-text tracking-wider uppercase flex items-center justify-between">
            <span>DAY {activeDay} TIMELINE ({daySessions.length} SESSIONS)</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-cyber-text-muted">Loading schedule...</div>
          ) : daySessions.length === 0 ? (
            <div className="p-8 rounded-2xl cyber-glass border border-cyber-border text-center text-cyber-text-muted">
              No sessions added for Day {activeDay} yet.
            </div>
          ) : (
            <div className="space-y-3">
              {daySessions.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-xl cyber-glass border border-cyber-border flex items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-cyber-primary font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{s.startTime} – {s.endTime}</span>
                    </div>

                    <h4 className="text-sm font-bold text-cyber-text">{s.title}</h4>
                    <p className="text-cyber-text-muted font-sans text-xs">{s.description}</p>

                    {s.speaker && (
                      <div className="flex items-center gap-1.5 text-[11px] text-cyber-secondary pt-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{s.speaker}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-cyber-text-dim hover:text-red-400 p-1"
                    title="Remove session"
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
