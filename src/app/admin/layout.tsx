'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
        <div className="font-mono text-cyber-primary text-sm flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-cyber-primary border-t-transparent animate-spin" />
          <span>AUTHENTICATING SOC COMMAND CENTER ACCESS...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md cyber-glass-glow rounded-2xl p-8 border border-red-500/40 text-center space-y-6">
          <Lock className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h2 className="text-xl font-bold font-mono text-cyber-text">
              ADMINISTRATIVE ACCESS RESTRICTED
            </h2>
            <p className="text-xs font-mono text-cyber-text-muted mt-1.5 leading-relaxed">
              SOC Command Center requires authenticated administrative credentials.
            </p>
          </div>
          <Link href="/login?callbackUrl=/admin" className="block">
            <CyberButton variant="primary" glow size="lg" className="w-full">
              SIGN IN AS ADMINISTRATOR
            </CyberButton>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = (session.user as any)?.role === 'admin';
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md cyber-glass-glow rounded-2xl p-8 border border-red-500/40 text-center space-y-6">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h2 className="text-xl font-bold font-mono text-cyber-text">
              UNAUTHORIZED ROLE
            </h2>
            <p className="text-xs font-mono text-cyber-text-muted mt-1.5 leading-relaxed">
              Your account ({session?.user?.email || 'authenticated user'}) has role &quot;participant&quot;. Only authorized SOC Administrators can access this command layer.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/portal" className="block">
              <CyberButton variant="primary" size="md" className="w-full">
                GO TO PARTICIPANT PORTAL
              </CyberButton>
            </Link>
            <Link href="/login" className="block">
              <CyberButton variant="outline" size="sm" className="w-full">
                SWITCH TO ADMIN DEV ACCOUNT
              </CyberButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cyber-bg text-cyber-text font-sans">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full bg-cyber-bg/50">
        <div className="md:hidden p-4 border-b border-cyber-border flex justify-between items-center bg-cyber-bg-elevated/95 backdrop-blur-md sticky top-0 z-40">
          <Link href="/admin" className="font-bold text-cyber-primary font-mono tracking-widest text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>SOC_ADMIN</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 bg-cyber-primary/10 border border-cyber-primary/30 rounded-md text-cyber-primary hover:bg-cyber-primary/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
