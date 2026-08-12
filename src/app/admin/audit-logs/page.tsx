'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogData } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, RefreshCw, Search, Lock, User, Terminal } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyber-primary" />
            <span>TAMPER-EVIDENT AUDIT TRAIL</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            CRYPTOGRAPHIC AUDIT LOG OF ADMINISTRATIVE ACTIONS & SETTLEMENTS
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text hover:text-cyber-primary"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-cyber-text-dim absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by Action, Admin, Entity..."
          className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="cyber-glass rounded-2xl border border-cyber-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cyber-bg-elevated border-b border-cyber-border text-cyber-text-dim text-[11px] uppercase">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Email</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Entity Ref</th>
                <th className="p-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-cyber-text-muted">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-cyber-surface/50 transition-colors">
                    <td className="p-4 text-cyber-text-dim whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-cyber-text">{log.adminEmail}</div>
                      <div className="text-[10px] text-cyber-text-dim">{log.adminId}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.action.includes('VERIFIED')
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : log.action.includes('REJECTED')
                            ? 'bg-red-950/60 text-red-400 border border-red-500/40'
                            : 'bg-cyan-950/60 text-cyber-primary border border-cyan-500/40'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-cyber-text uppercase">{log.entity}</td>
                    <td className="p-4 text-cyber-primary font-bold">{log.entityId}</td>
                    <td className="p-4 text-[11px] text-cyber-text-muted font-mono max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
