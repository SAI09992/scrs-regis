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
  UsersRound,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const navItems = [
  { label: 'DASHBOARD', href: '/admin', icon: LayoutDashboard },
  { label: 'REGISTRATIONS', href: '/admin/registrations', icon: Users },
  { label: 'PAYMENT QUEUE', href: '/admin/payments', icon: CreditCard },
  { label: 'SNACKS & ATTENDANCE', href: '/admin/attendance', icon: QrCode },
  { label: 'TEAMS & PS', href: '/admin/teams', icon: UsersRound },
  { label: 'ANNOUNCEMENTS', href: '/admin/announcements', icon: Bell },
  { label: 'SCHEDULE', href: '/admin/schedule', icon: Calendar },
  { label: 'CERTIFICATES', href: '/admin/certificates', icon: Award },
  { label: 'ANALYTICS', href: '/admin/analytics', icon: BarChart3 },
  { label: 'SETTINGS', href: '/admin/settings', icon: Settings },
  { label: 'AUDIT LOGS', href: '/admin/audit-logs', icon: ShieldAlert },
];

export default function AdminSidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:flex transition-transform duration-300 ease-in-out shrink-0 border-r border-cyber-border bg-cyber-bg-elevated/95 backdrop-blur-md flex-col justify-between p-4 font-mono text-xs overflow-y-auto`}>
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="p-2 flex items-center justify-between">
            <BrandLogo variant="navbar" />
            <button 
              className="md:hidden p-2 text-cyber-text-muted hover:text-cyber-primary"
              onClick={() => setIsOpen?.(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
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
    </>
  );
}
