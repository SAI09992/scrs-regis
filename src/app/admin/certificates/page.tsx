'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { formatDate } from '@/lib/utils';
import { Award, QrCode, Search, RefreshCw, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueRegId, setIssueRegId] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/certificates');
      const data = await res.json();
      if (data.success) {
        setCertificates(data.certificates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueRegId.trim()) return;

    setIssuing(true);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: issueRegId.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setIssueRegId('');
        fetchCertificates();
      } else {
        toast.error(data.error || 'Failed to issue certificate');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setIssuing(false);
    }
  };

  const filtered = certificates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.certificate.certificateId.toLowerCase().includes(q) ||
      c.registration.name.toLowerCase().includes(q) ||
      c.registration.registrationId.toLowerCase().includes(q) ||
      c.registration.registerNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <Award className="w-6 h-6 text-cyber-primary" />
            <span>CRYPTOGRAPHIC CERTIFICATE REGISTRY</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            VERIFIED CREDENTIAL ENGINE & PUBLIC LEDGER
          </p>
        </div>

        <button
          onClick={fetchCertificates}
          className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text hover:text-cyber-primary"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Issue Box */}
      <div className="p-6 rounded-2xl cyber-glass-glow border border-cyber-primary/40 space-y-4">
        <div className="text-sm font-bold text-cyber-primary uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>ISSUE VERIFIED DIGITAL CERTIFICATE</span>
        </div>

        <form onSubmit={handleIssueCertificate} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            value={issueRegId}
            onChange={(e) => setIssueRegId(e.target.value.toUpperCase())}
            placeholder="Enter Registration ID (e.g. NGSOC-2026-XXXXX)"
            className="flex-1 px-4 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-primary font-bold text-xs focus:outline-none focus:border-cyber-primary uppercase"
          />

          <CyberButton
            type="submit"
            variant="primary"
            glow
            size="md"
            loading={issuing}
            className="w-full sm:w-auto gap-2"
          >
            <Check className="w-4 h-4" />
            <span>GENERATE CERTIFICATE</span>
          </CyberButton>
        </form>
      </div>

      {/* Search & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-cyber-text tracking-wider uppercase">
            ISSUED CERTIFICATES ({certificates.length})
          </span>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-cyber-text-dim absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Cert ID or Cadet..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary"
            />
          </div>
        </div>

        <div className="cyber-glass rounded-2xl border border-cyber-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-cyber-bg-elevated border-b border-cyber-border text-cyber-text-dim text-[11px] uppercase">
                <tr>
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4">Cadet Name</th>
                  <th className="p-4">Reg ID</th>
                  <th className="p-4">Track</th>
                  <th className="p-4">Issued At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Verification Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-cyber-text-muted">
                      No issued certificates found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.certificate.id} className="hover:bg-cyber-surface/50 transition-colors">
                      <td className="p-4 font-bold text-cyber-primary">
                        {c.certificate.certificateId}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-cyber-text">{c.registration.name}</div>
                        <div className="text-[10px] text-cyber-text-dim">{c.registration.registerNumber}</div>
                      </td>
                      <td className="p-4 text-cyber-text">{c.registration.registrationId}</td>
                      <td className="p-4 text-emerald-400 font-bold">{c.registration.creditType}</td>
                      <td className="p-4 text-cyber-text-dim">{formatDate(c.certificate.issuedAt)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                          VALID
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/certificate/verify/${c.certificate.certificateId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-cyber-primary hover:underline text-[11px]"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
