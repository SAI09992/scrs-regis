'use client';

import React, { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import { BrandLogo } from '@/components/ui/BrandLogo';
import Link from 'next/link';

function LoginContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [loading, setLoading] = useState(false);

  // If already logged in, show existing identity
  if (session?.user) {
    const isAdmin = (session.user as any).role === 'admin';
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md cyber-glass-glow rounded-2xl p-8 border border-cyber-primary/40 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-cyber-primary/10 border border-cyber-primary/40 mx-auto flex items-center justify-center text-cyber-primary">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-cyber-text">
              AUTHENTICATED AS {session.user.name?.toUpperCase()}
            </h2>
            <p className="text-xs font-mono text-cyber-text-muted mt-1">
              {session.user.email}
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link href={isAdmin ? '/admin' : '/portal'} className="block">
              <CyberButton variant="primary" glow size="lg" className="w-full">
                {isAdmin ? 'ENTER ADMIN COMMAND CENTER' : 'PROCEED TO PARTICIPANT PORTAL'}
              </CyberButton>
            </Link>
            <Link href="/register" className="block">
              <CyberButton variant="secondary" size="md" className="w-full">
                BOOTCAMP REGISTRATION FORM
              </CyberButton>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const errorParam = searchParams.get('error');
  const errorMsg =
    errorParam === 'InvalidDomain'
      ? 'Access Restricted: Only official @klu.ac.in university Google accounts are permitted.'
      : errorParam
      ? 'Authentication failed. Please use your official @klu.ac.in account.'
      : null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (e) {
      console.error('Google sign-in error:', e);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] font-mono">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md cyber-glass-glow rounded-2xl p-6 sm:p-8 border border-cyber-border shadow-cyber-card space-y-6"
      >
        {/* Header with Official Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo variant="hero" withLink={false} />
          </div>
          <p className="text-xs text-cyber-text-muted">
            SIGN IN WITH UNIVERSITY GOOGLE ACCOUNT TO REGISTER
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="space-y-4 pt-1">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-cyber-surface-elevated hover:bg-cyber-surface-highlight border-2 border-cyber-border hover:border-cyber-primary text-cyber-text font-mono text-sm font-bold transition-all shadow-cyber-glow-sm disabled:opacity-50 hover:shadow-cyber-glow-cyan"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading ? (
              <span>CONNECTING TO GOOGLE...</span>
            ) : (
              <span>CONTINUE WITH GOOGLE (@klu.ac.in)</span>
            )}
          </button>
        </div>

        {/* Security Notices */}
        <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border/80 text-[11px] text-cyber-text-dim text-center leading-relaxed space-y-2">
          <div className="text-cyber-text font-bold flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyber-primary" />
            <span>INSTITUTIONAL ACCOUNT REQUIRED</span>
          </div>
          <p>
            Please select your <strong>@klu.ac.in</strong> email when prompted by Google.
          </p>
          <p className="text-amber-400/90 font-medium">
            ⚠️ Enter name in the registration wizard strictly matching your SIS login.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="font-mono text-cyber-primary text-xs">LOADING LOGIN GATEWAY...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
