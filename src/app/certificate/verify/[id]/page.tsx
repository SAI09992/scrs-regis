'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, XCircle, Award, Check, ExternalLink, ArrowLeft } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function CertificateVerifyPage() {
  const params = useParams();
  const certId = (params?.id as string) || '';

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/certificate/verify/${certId}`);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (certId) {
      verify();
    }
  }, [certId]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-lg cyber-glass-glow rounded-3xl p-6 sm:p-8 border border-cyber-border shadow-cyber-card space-y-6 font-mono text-xs">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyber-surface border-2 border-cyber-primary mx-auto flex items-center justify-center text-cyber-primary shadow-cyber-glow-sm">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-cyber-text">
            NEXTGEN SOC CERTIFICATE REGISTRY
          </h1>
          <p className="text-[11px] text-cyber-text-muted">
            CRYPTOGRAPHIC PUBLIC VERIFICATION PORTAL
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-cyber-primary flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-cyber-primary border-t-transparent animate-spin" />
            <span>QUERYING BLOCKCHAIN & SOC LEDGER...</span>
          </div>
        ) : result?.valid ? (
          <div className="space-y-6">
            {/* Status Pill */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <div className="font-bold text-sm">AUTHENTIC & VERIFIED</div>
                <div className="text-[11px] text-emerald-300">
                  This credential is confirmed in the NextGen SOC master database.
                </div>
              </div>
            </div>

            {/* Dossier Summary */}
            <div className="p-4 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-3">
              <div>
                <span className="text-cyber-text-dim block text-[10px]">CERTIFICATE ID:</span>
                <span className="text-cyber-primary font-bold text-sm">{certId}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cyber-border/40">
                <div>
                  <span className="text-cyber-text-dim block text-[10px]">CADET NAME:</span>
                  <span className="text-cyber-text font-bold">{result.certificate?.participantName}</span>
                </div>
                <div>
                  <span className="text-cyber-text-dim block text-[10px]">REGISTER NUMBER:</span>
                  <span className="text-cyber-text">{result.certificate?.registerNumber}</span>
                </div>
                <div>
                  <span className="text-cyber-text-dim block text-[10px]">DEPARTMENT:</span>
                  <span className="text-cyber-text">{result.certificate?.department}</span>
                </div>
                <div>
                  <span className="text-cyber-text-dim block text-[10px]">CREDIT TRACK:</span>
                  <span className="text-emerald-400 font-bold">{result.certificate?.creditType}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-red-950/30 border border-red-500/50 text-red-400 text-center space-y-2">
            <XCircle className="w-10 h-10 mx-auto" />
            <div className="font-bold text-sm">INVALID OR UNREGISTERED CREDENTIAL</div>
            <p className="text-[11px] text-cyber-text-muted">
              The certificate ID &quot;{certId}&quot; could not be verified in the SOC ledger.
            </p>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link href="/">
            <CyberButton variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO MAIN PORTAL</span>
            </CyberButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
