'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import {
  Settings,
  Save,
  QrCode,
  Clock,
  Shield,
  Check,
  DollarSign,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

export interface LandingCoordinator {
  name: string;
  role: string;
  department: string;
  phone: string;
  whatsappUrl?: string;
  callUrl?: string;
}

const DEFAULT_LANDING_COORDINATORS: LandingCoordinator[] = [
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

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin Account Coordinators state (Role = 'admin')
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [newCoordEmail, setNewCoordEmail] = useState('');
  const [addingCoord, setAddingCoord] = useState(false);
  const [removingCoordEmail, setRemovingCoordEmail] = useState<string | null>(null);

  // Landing Page Display Coordinators with WhatsApp links
  const [landingCoordinators, setLandingCoordinators] = useState<LandingCoordinator[]>(
    DEFAULT_LANDING_COORDINATORS
  );

  const [settings, setSettings] = useState({
    eventName: 'NEXTGEN SOC',
    tagline: 'Detect. Defend. Respond.',
    dates: 'August 29 – 30, 2026',
    venue: 'TIFAC Core Seminar Hall',
    registrationFee: 300,
    totalCapacity: 200,
    registrationOpen: true,
    paymentUpiId: 'scrs@upi',
    paymentQrUrl: '',
    countdownTarget: '2026-08-29T09:00:00+05:30',
    contactPhone: '+91 98765 43210',
    contactEmail: 'scrs@university.edu',
    termsVersion: 'v1.0',
    whatsappGroupLink: '',
    whatsappGroupQrUrl: '',
    registrationCountBoost: 0,
  });

  const [realCount, setRealCount] = useState<number>(0);

  const fetchCoordinators = async () => {
    try {
      const res = await fetch('/api/admin/coordinators');
      const data = await res.json();
      if (data.success) {
        setCoordinators(data.coordinators);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, statsRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/event-stats'),
        ]);
        const data = await settingsRes.json();
        const statsData = await statsRes.json();

        if (statsData.success && statsData.stats) {
          setRealCount(statsData.stats.actualRegistered ?? statsData.stats.totalRegistered ?? 0);
        }

        if (data.success && data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            registrationFee: data.settings.registrationFee || data.settings.registrationFeeUe || 300,
            dates: data.settings.dates || 'August 29 – 30, 2026',
            venue: data.settings.venue || 'TIFAC Core Seminar Hall',
            totalCapacity: data.settings.totalCapacity || 200,
            whatsappGroupLink: data.settings.whatsappGroupLink || '',
            whatsappGroupQrUrl: data.settings.whatsappGroupQrUrl || '',
            registrationCountBoost: data.settings.registrationCountBoost || 0,
          }));

          if (
            data.settings.coordinators &&
            Array.isArray(data.settings.coordinators) &&
            data.settings.coordinators.length > 0
          ) {
            setLandingCoordinators(data.settings.coordinators);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    fetchCoordinators();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        coordinators: landingCoordinators,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('✓ Event settings & coordinators updated successfully');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (e) {
      toast.error('Network save error');
    } finally {
      setSaving(false);
    }
  };

  const [togglingReg, setTogglingReg] = useState(false);

  const handleToggleRegistration = async () => {
    const nextState = !settings.registrationOpen;
    setTogglingReg(true);
    // Optimistic UI update
    setSettings((prev) => ({ ...prev, registrationOpen: nextState }));

    try {
      const payload = {
        ...settings,
        registrationOpen: nextState,
        coordinators: landingCoordinators,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          nextState
            ? '🟢 Registrations are now OPEN in live database!'
            : '🔴 Registrations are now CLOSED in live database!'
        );
      } else {
        toast.error(data.error || 'Failed to update registration status');
        // Revert on error
        setSettings((prev) => ({ ...prev, registrationOpen: !nextState }));
      }
    } catch (e) {
      toast.error('Network error updating registration status');
      setSettings((prev) => ({ ...prev, registrationOpen: !nextState }));
    } finally {
      setTogglingReg(false);
    }
  };

  const handleAddCoordinator = async () => {
    if (!newCoordEmail.trim()) return;
    setAddingCoord(true);
    try {
      const res = await fetch('/api/admin/coordinators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newCoordEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setNewCoordEmail('');
        fetchCoordinators();
      } else {
        toast.error(data.error || 'Failed to add coordinator.');
      }
    } catch (err) {
      toast.error('Network error.');
    } finally {
      setAddingCoord(false);
    }
  };

  const handleRemoveCoordinator = async (email: string) => {
    setRemovingCoordEmail(email);
    try {
      const res = await fetch(`/api/admin/coordinators?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        fetchCoordinators();
      } else {
        toast.error(data.error || 'Failed to remove coordinator.');
      }
    } catch (err) {
      toast.error('Network error.');
    } finally {
      setRemovingCoordEmail(null);
    }
  };

  // Handlers for Landing Page Coordinators
  const updateLandingCoord = (index: number, field: keyof LandingCoordinator, value: string) => {
    setLandingCoordinators((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLandingCoord = () => {
    setLandingCoordinators((prev) => [
      ...prev,
      {
        name: 'COORDINATOR NAME',
        role: 'Student Coordinator',
        department: 'CSE / 3rd Year',
        phone: '+91 90000 00000',
        whatsappUrl: '',
        callUrl: '',
      },
    ]);
  };

  const removeLandingCoord = (index: number) => {
    setLandingCoordinators((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyber-primary" />
            <span>EVENT & RANGE CONFIGURATION</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            MANAGE FEES, CAPACITIES, VENUE, LANDING WHATSAPP LINKS & COORDINATORS
          </p>
        </div>
      </div>

      {/* Section 0: Admin Account Permissions (Role = 'admin') */}
      <div className="p-6 rounded-2xl cyber-glass-glow border-2 border-purple-500/50 space-y-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4" />
            <span>ADMIN ACCOUNT ROLES & ACCESS CONTROL</span>
          </div>
          <span className="text-[11px] text-cyber-text-dim">
            {coordinators.length} ACTIVE ADMIN{coordinators.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {/* Add new admin */}
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={newCoordEmail}
            onChange={(e) => setNewCoordEmail(e.target.value)}
            placeholder="Enter institutional email to grant admin role (e.g. user@klu.ac.in)"
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCoordinator()}
          />
          <button
            type="button"
            onClick={handleAddCoordinator}
            disabled={addingCoord || !newCoordEmail.trim()}
            className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {addingCoord ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>GRANT ADMIN</span>
          </button>
        </div>

        {/* List of current admins */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {coordinators.length === 0 ? (
            <div className="text-center py-4 text-cyber-text-dim text-xs">
              No admins configured yet.
            </div>
          ) : (
            coordinators.map((coord) => (
              <div
                key={coord.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-cyber-surface/60 border border-cyber-border/60 group hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xs font-bold">
                    {(coord.name || coord.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-cyber-text text-xs">{coord.name || 'Admin'}</div>
                    <div className="text-[10px] text-cyber-text-dim">{coord.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCoordinator(coord.email)}
                  disabled={removingCoordEmail === coord.email}
                  className="p-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                  title="Revoke Admin Access"
                >
                  {removingCoordEmail === coord.email ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 1: Landing Page Coordinators & WhatsApp Links Editor */}
      <div className="p-6 rounded-2xl cyber-glass-glow border-2 border-emerald-500/50 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-cyber-border/80">
          <div>
            <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>LANDING PAGE STUDENT COORDINATORS & WHATSAPP LINKS</span>
            </div>
            <p className="text-[11px] text-cyber-text-muted mt-1">
              Edit names, phone numbers, and WhatsApp direct contact links shown on the public landing page.
            </p>
          </div>

          <button
            type="button"
            onClick={addLandingCoord}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ADD COORDINATOR CARD</span>
          </button>
        </div>

        <div className="space-y-4">
          {landingCoordinators.map((coord, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-cyber-bg/90 border border-cyber-border/90 hover:border-emerald-500/40 space-y-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  COORDINATOR #{idx + 1}
                </span>

                {landingCoordinators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLandingCoord(idx)}
                    className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 transition-colors"
                    title="Remove Coordinator"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-cyber-text-dim block text-[11px] font-bold">FULL NAME</label>
                  <input
                    type="text"
                    value={coord.name}
                    onChange={(e) => updateLandingCoord(idx, 'name', e.target.value)}
                    placeholder="e.g. SAI DHANUSH"
                    className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-cyber-text-dim block text-[11px] font-bold">ROLE / DESIGNATION</label>
                  <input
                    type="text"
                    value={coord.role}
                    onChange={(e) => updateLandingCoord(idx, 'role', e.target.value)}
                    placeholder="e.g. Student Technical Lead"
                    className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-cyber-text-dim block text-[11px] font-bold">DEPT / YEAR</label>
                  <input
                    type="text"
                    value={coord.department}
                    onChange={(e) => updateLandingCoord(idx, 'department', e.target.value)}
                    placeholder="e.g. CSE / 3rd Year"
                    className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-cyber-text-dim block text-[11px] font-bold flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-cyber-primary" />
                    <span>PHONE / CALL NUMBER</span>
                  </label>
                  <input
                    type="text"
                    value={coord.phone}
                    onChange={(e) => updateLandingCoord(idx, 'phone', e.target.value)}
                    placeholder="e.g. +91 93812 76836"
                    className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-cyber-text-dim block text-[11px] font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-emerald-400" />
                    <span>CUSTOM WHATSAPP LINK (OPTIONAL)</span>
                  </label>
                  <input
                    type="text"
                    value={coord.whatsappUrl || ''}
                    onChange={(e) => updateLandingCoord(idx, 'whatsappUrl', e.target.value)}
                    placeholder="Leave empty for auto-generated https://wa.me/..."
                    className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 2: Registration Status Toggle */}
        <div className="p-6 rounded-2xl cyber-glass-glow border border-cyber-border flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-bold text-cyber-text">
              PUBLIC REGISTRATION GATEWAY STATUS
            </div>
            <p className="text-xs text-cyber-text-muted">
              {settings.registrationOpen
                ? '🟢 Registrations are currently OPEN to incoming applicants.'
                : '🔴 Registrations are currently CLOSED. Forms are locked.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleRegistration}
            disabled={togglingReg}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              settings.registrationOpen
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-cyber-glow-emerald'
                : 'bg-red-950/60 hover:bg-red-900/60 border border-red-500 text-red-400'
            } ${togglingReg ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {togglingReg && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{settings.registrationOpen ? 'REGISTRATION OPEN (CLICK TO CLOSE)' : 'REGISTRATION CLOSED (CLICK TO OPEN)'}</span>
          </button>
        </div>

        {/* Section 3: Seat Capacity & Pricing Manager */}
        <div className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-cyber-primary uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>SLOT CAPACITY & FEE CONTROLLER</span>
            </div>
            <span className="text-xs text-cyber-text-dim">
              CURRENT SLOTS: <strong className="text-cyber-primary text-sm">{settings.totalCapacity}</strong>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-cyber-bg/80 border border-cyber-border/80 space-y-4">
            <label className="text-cyber-text block font-bold text-xs">
              MANAGE TOTAL BOOTCAMP SLOTS
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-cyber-text-dim mr-1">QUICK ADJUST:</span>
              {[-50, -10, -1].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, totalCapacity: Math.max(1, prev.totalCapacity + v) }))}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 font-bold hover:bg-red-900/60 transition-colors"
                >
                  {v}
                </button>
              ))}
              <div className="h-6 w-px bg-cyber-border mx-1" />
              {[1, 10, 50].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, totalCapacity: prev.totalCapacity + v }))}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold hover:bg-emerald-900/60 transition-colors"
                >
                  +{v}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-cyber-text block font-bold text-[11px]">Exact Total Capacity (Seats)</label>
                <input
                  type="number"
                  min={1}
                  value={settings.totalCapacity}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, totalCapacity: Math.max(1, Number(e.target.value)) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm font-bold focus:outline-none focus:border-cyber-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-cyber-text block font-bold text-[11px]">Registration Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.registrationFee}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, registrationFee: Number(e.target.value) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm font-bold focus:outline-none focus:border-cyber-primary"
                />
              </div>
            </div>
          </div>

          {/* Registration Count Boost */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-amber-400 block font-bold text-xs flex items-center gap-1.5">
                  ⚡ DISPLAYED REGISTRATION COUNT BOOST (URGENCY / FOMO)
                </label>
                <p className="text-[10px] text-cyber-text-dim mt-0.5">
                  Adds an artificial offset to the publicly shown count to reduce displayed available slots.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  BOOST: +{settings.registrationCountBoost}
                </span>
                {settings.registrationCountBoost > 0 && (
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, registrationCountBoost: 0 }))}
                    className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 font-bold text-[10px] flex items-center gap-1 transition-colors"
                    title="Reset boost to 0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RESET TO 0</span>
                  </button>
                )}
              </div>
            </div>

            {/* Real vs Displayed Count Telemetry Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-cyber-bg/90 border border-cyber-border text-center text-xs">
              <div className="p-2 rounded bg-cyber-surface/60 border border-cyber-border">
                <span className="text-[10px] text-cyber-text-dim block font-bold">ORIGINAL REAL COUNT</span>
                <span className="text-sm font-bold text-emerald-400">{realCount} Cadets</span>
                <span className="text-[9px] text-cyber-text-muted block">Actual database records</span>
              </div>
              <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30">
                <span className="text-[10px] text-amber-300 block font-bold">ADDED BOOST OFFSET</span>
                <span className="text-sm font-bold text-amber-400">+{settings.registrationCountBoost}</span>
                <span className="text-[9px] text-amber-300/70 block">Fake extra count</span>
              </div>
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-[10px] text-cyan-300 block font-bold">PUBLIC DISPLAYED TOTAL</span>
                <span className="text-sm font-bold text-cyber-primary">
                  {realCount + settings.registrationCountBoost} / {settings.totalCapacity}
                </span>
                <span className="text-[9px] text-cyan-300/70 block">
                  {Math.max(0, settings.totalCapacity - (realCount + settings.registrationCountBoost))} slots left publicly
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-cyber-text-dim mr-1 font-bold">QUICK ADJUST BOOST:</span>
              {[-50, -10, -5].map((v) => (
                <button
                  key={`boost${v}`}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, registrationCountBoost: Math.max(0, prev.registrationCountBoost + v) }))}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 font-bold hover:bg-red-900/60 transition-colors"
                >
                  {v}
                </button>
              ))}
              <div className="h-6 w-px bg-cyber-border mx-1" />
              {[5, 10, 25, 50].map((v) => (
                <button
                  key={`boost+${v}`}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, registrationCountBoost: prev.registrationCountBoost + v }))}
                  className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-400 font-bold hover:bg-amber-900/60 transition-colors"
                >
                  +{v}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-cyber-text block font-bold text-[11px]">Exact Boost Offset (Set 0 to show real count only)</label>
              <input
                type="number"
                min={0}
                value={settings.registrationCountBoost}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, registrationCountBoost: Math.max(0, Number(e.target.value)) }))
                }
                className="w-full sm:w-48 px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-amber-500/40 text-cyber-text text-sm font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Section 4: UPI Gateway & QR Image Control */}
        <div className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
          <div className="text-sm font-bold text-cyber-secondary uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span>PAYMENT QR CODE & UPI SETTINGS</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-cyber-text block font-bold">Official UPI ID</label>
              <input
                type="text"
                value={settings.paymentUpiId}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, paymentUpiId: e.target.value }))
                }
                placeholder="e.g. scrs@upi"
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary"
              />
            </div>

            {/* Direct Image File Upload & URL Field */}
            <ImageUploadField
              label="Official Payment QR Code Image"
              value={settings.paymentQrUrl || ''}
              onChange={(url) => setSettings((prev) => ({ ...prev, paymentQrUrl: url }))}
              description="Directly upload any JPEG, JPG, PNG, WEBP, or SVG image file from your device, or switch to paste a URL. If left empty, a crisp vector QR code will be automatically generated from your UPI ID."
              placeholder="https://... or click 'Direct Upload' above"
            />
          </div>
        </div>

        {/* Section: WhatsApp Group Link & QR */}
        <div className="p-6 rounded-2xl cyber-glass border border-emerald-500/40 space-y-4">
          <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>WHATSAPP GROUP LINK & QR CODE</span>
          </div>
          <p className="text-[11px] text-cyber-text-muted">
            Configure the WhatsApp group invite link and optional QR code image. This link appears in the top navbar and on the Cadet Portal after payment.
          </p>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-cyber-text block font-bold text-xs">WhatsApp Group Invite Link</label>
              <input
                type="text"
                value={settings.whatsappGroupLink}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, whatsappGroupLink: e.target.value }))
                }
                placeholder="e.g. https://chat.whatsapp.com/ABCDefGHIjk123"
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <ImageUploadField
              label="WhatsApp Group QR Code Image (Optional)"
              value={settings.whatsappGroupQrUrl}
              onChange={(url) => setSettings((prev) => ({ ...prev, whatsappGroupQrUrl: url }))}
              description="Upload a QR code image for joining the WhatsApp group. Displayed on the Cadet Portal alongside the direct invite link."
              placeholder="https://... or click 'Direct Upload' above"
            />
          </div>
        </div>

        {/* Section 5: Launch Countdown Target */}
        <div className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
          <div className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>BOOTCAMP LAUNCH COUNTDOWN TARGET</span>
          </div>

          <div className="space-y-1">
            <label className="text-cyber-text block font-bold">Target ISO Date & Time</label>
            <input
              type="text"
              value={settings.countdownTarget}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, countdownTarget: e.target.value }))
              }
              placeholder="e.g. 2026-08-29T09:00:00+05:30"
              className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary"
            />
            <p className="text-[11px] text-cyber-text-dim">
              Set the ISO timestamp for the landing page countdown timer.
            </p>
          </div>
        </div>

        {/* Section 6: Event Logistics & Support */}
        <div className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
          <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            LOGISTICS & SUPPORT CHANNELS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-cyber-text block font-bold">Bootcamp Dates</label>
              <input
                type="text"
                value={settings.dates}
                onChange={(e) => setSettings((prev) => ({ ...prev, dates: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-cyber-text block font-bold">Venue / Room</label>
              <input
                type="text"
                value={settings.venue}
                onChange={(e) => setSettings((prev) => ({ ...prev, venue: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-cyber-text block font-bold">Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-cyber-text block font-bold">Support Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm focus:outline-none focus:border-cyber-primary"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <CyberButton
            type="submit"
            variant="primary"
            glow
            size="lg"
            loading={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CONFIGURATION</span>
          </CyberButton>
        </div>
      </form>
    </div>
  );
}
