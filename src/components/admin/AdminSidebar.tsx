'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  Bell,
  Calendar,
  Award,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  Shield,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const navItems = [
  { label: 'DASHBOARD', href: '/admin', icon: LayoutDashboard },
  { label: 'REGISTRATIONS', href: '/admin/registrations', icon: Users },
  { label: 'PAYMENT QUEUE', href: '/admin/payments', icon: CreditCard },
  { label: 'ATTENDANCE', href: '/admin/attendance', icon: QrCode },
  { label: 'ANNOUNCEMENTS', href: '/admin/announcements', icon: Bell },
  { label: 'SCHEDULE', href: '/admin/schedule', icon: Calendar },
  { label: 'CERTIFICATES', href: '/admin/certificates', icon: Award },
  { label: 'ANALYTICS', href: '/admin/analytics', icon: BarChart3 },
  { label: 'SETTINGS', href: '/admin/settings', icon: Settings },
  { label: 'AUDIT LOGS', href: '/admin/audit-logs', icon: ShieldAlert },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-cyber-border bg-cyber-bg-elevated/90 backdrop-blur-md flex flex-col justify-between p-4 font-mono text-xs">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="p-2">
          <BrandLogo variant="navbar" />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-cyber-primary/15 text-cyber-primary font-bold border border-cyber-primary/40 shadow-cyber-glow-sm'
                    : 'text-cyber-text-muted hover:text-cyber-text hover:bg-cyber-surface/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-cyber-border/80 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-cyber-text-dim hover:text-cyber-primary text-[11px] transition-colors"
        >
          <span>› Public Landing Page</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/20 text-red-400 border border-red-500/30 hover:bg-red-950/40 hover:border-red-500 transition-all font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>TERMINATE SESSION</span>
        </button>
      </div>
    </aside>
  );
}
