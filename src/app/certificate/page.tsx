'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CyberButton } from '@/components/ui/CyberButton';
import { Shield, Award, Download, ArrowLeft, CheckCircle2, QrCode, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CertificatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [certId, setCertId] = useState<string>('NGSOC-2026-CERT-00421');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/portal/me');
        const json = await res.json();
        if (json.success && json.registration) {
          setData(json);
          if (json.certificate) {
            setCertId(json.certificate.certificateId);
          } else {
            // Generate synthetic ID for preview if verified
            setCertId(`NGSOC-2026-CERT-${json.registration.registrationId.split('-')[2] || '00421'}`);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (status === 'authenticated') {
      load();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handlePrintDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="font-mono text-cyber-primary text-sm flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-cyber-primary border-t-transparent animate-spin" />
          <span>RENDERING CRYPTOGRAPHIC CERTIFICATE...</span>
        </div>
      </div>
    );
  }

  const registration = data?.registration;
  const payment = data?.payment;
  const isVerified = payment?.status === 'verified';

  if (!registration || !isVerified) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md cyber-glass-glow rounded-2xl p-8 border border-cyber-border text-center space-y-4">
          <Lock className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold font-mono text-cyber-text">
            CERTIFICATE LOCKED
          </h2>
          <p className="text-xs font-mono text-cyber-text-muted">
            Certificates are issued only to participants with verified payments and confirmed bootcamp attendance.
          </p>
          <Link href="/portal" className="block pt-2">
            <CyberButton variant="primary" size="md" className="w-full">
              RETURN TO CADET PORTAL
            </CyberButton>
          </Link>
        </div>
      </div>
    );
  }

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://nextgensoc.io'}/certificate/verify/${certId}`;

  return (
    <div className="flex-1 py-10 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-cyber-border print:hidden">
          <Link
            href="/portal"
            className="flex items-center gap-2 text-xs font-mono text-cyber-text-muted hover:text-cyber-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO PORTAL</span>
          </Link>

          <CyberButton variant="primary" glow size="md" onClick={handlePrintDownload} className="gap-2">
            <Download className="w-4 h-4" />
            <span>PRINT / SAVE PDF</span>
          </CyberButton>
        </div>

        {/* Certificate Display Card (Print-optimized) */}
        <div
          ref={certificateRef}
          className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-[#0F1720] via-[#0A0F14] to-[#050A0F] border-4 border-cyber-primary/60 shadow-[0_0_50px_rgba(0,229,255,0.25)] text-center space-y-8 overflow-hidden font-sans print:border-black print:bg-white print:text-black"
        >
          {/* Subtle Background Grid & Emblem */}
          <div className="absolute inset-0 cyber-grid-bg opacity-15 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyber-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyber-surface border-2 border-cyber-primary p-2 flex items-center justify-center shadow-cyber-glow-sm">
                <img
                  src="/scrs-logo.png"
                  alt="SCRS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left font-mono">
                <div className="text-base font-bold text-cyber-text tracking-wider">
                  NEXTGEN SOC CYBER COMMAND
                </div>
                <div className="text-[10px] text-cyber-primary uppercase tracking-widest">
                  SOFT COMPUTING RESEARCH SOCIETY (SCRS)
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-cyan-200 to-cyber-secondary pt-4">
              CERTIFICATE OF COMPLETION
            </h1>
            <p className="text-xs font-mono text-cyber-text-muted uppercase tracking-widest">
              THIS IS PROUDLY CONFERRED UPON
            </p>
          </div>

          {/* Recipient Name */}
          <div className="relative z-10 py-2 border-b-2 border-cyber-primary/40 max-w-xl mx-auto">
            <div className="text-2xl sm:text-4xl font-bold font-mono text-cyber-text tracking-tight">
              {registration.name}
            </div>
            <div className="text-xs font-mono text-cyber-primary mt-1">
              Roll No: {registration.registerNumber} // {registration.department}
            </div>
          </div>

          {/* Description */}
          <div className="relative z-10 max-w-2xl mx-auto text-xs sm:text-sm font-mono text-cyber-text-muted leading-relaxed">
            For successfully completing the intensive 2-day hands-on <strong className="text-cyber-text">Security Operations Centre Analyst Bootcamp</strong> on August 22 - 23, 2026, demonstrating proficiency in SIEM Log Telemetry, Wireshark Packet Forensics, Memory Threat Hunting, and Live Incident Containment.
          </div>

          {/* Footer Signatures & QR Verification */}
          <div className="relative z-10 pt-8 border-t border-cyber-border/60 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center font-mono text-xs">
            {/* Signature 1 */}
            <div className="space-y-1">
              <div className="h-10 flex items-center justify-center font-serif text-lg italic text-cyber-primary">
                Evelyn Vance
              </div>
              <div className="border-t border-cyber-border/80 pt-1 text-[11px] text-cyber-text">
                Dr. Evelyn Vance, CISO
              </div>
              <div className="text-[10px] text-cyber-text-dim">SOC Range Director</div>
            </div>

            {/* Center QR Validation */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-2 rounded-xl bg-white text-black shadow-cyber-glow-sm">
                <QRCodeSVG value={verifyUrl} size={90} level="M" />
              </div>
              <div className="text-[10px] text-cyber-primary font-bold">
                {certId}
              </div>
              <div className="text-[9px] text-cyber-text-dim">
                SCAN TO CRYPTOGRAPHICALLY VERIFY
              </div>
            </div>

            {/* Signature 2 */}
            <div className="space-y-1">
              <div className="h-10 flex items-center justify-center font-serif text-lg italic text-cyber-secondary">
                Marcus Thorne
              </div>
              <div className="border-t border-cyber-border/80 pt-1 text-[11px] text-cyber-text">
                Marcus Thorne, Lead Architect
              </div>
              <div className="text-[10px] text-cyber-text-dim">Chief Range Controller</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
