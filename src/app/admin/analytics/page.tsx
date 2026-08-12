'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Activity, TrendingUp, Users, RefreshCw, Loader2 } from 'lucide-react';

const COLORS = ['#00E5FF', '#2293EE', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#EF4444', '#6366F1'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalRegistered: 0,
    totalCapacity: 200,
  });
  const [analytics, setAnalytics] = useState<any>({
    departmentBreakdown: [],
    trackBreakdown: [],
    yearBreakdown: [],
    paymentBreakdown: [],
    registrationVelocity: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/event-stats'),
        fetch('/api/admin/analytics'),
      ]);
      const statsData = await statsRes.json();
      const analyticsData = await analyticsRes.json();

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
      if (analyticsData.success && analyticsData.analytics) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const capacityData = [
    { name: 'Registered', value: stats.totalRegistered || 0 },
    { name: 'Available', value: Math.max(0, (stats.totalCapacity || 200) - (stats.totalRegistered || 0)) },
  ];

  const hasData = (stats.totalRegistered || 0) > 0;

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyber-primary" />
            <span>SOC REGISTRATION & TELEMETRY ANALYTICS</span>
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1">
            ALL DATA IS LIVE FROM DATABASE — NO MOCK DATA
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-cyber-primary"
          title="Refresh analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-cyber-primary animate-spin" />
          <span className="ml-3 text-cyber-text-muted">LOADING LIVE ANALYTICS...</span>
        </div>
      ) : !hasData ? (
        <div className="text-center py-20 text-cyber-text-muted space-y-2">
          <Users className="w-10 h-10 mx-auto text-cyber-text-dim" />
          <p className="text-sm">No registrations yet. Analytics will appear once cadets register.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Seat Capacity Donut */}
          <div className="lg:col-span-5 p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-cyber-primary" />
                <span>SEAT CAPACITY STATUS</span>
              </h3>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={capacityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {capacityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1720',
                      border: '1px solid #1E2D40',
                      borderRadius: '8px',
                      color: '#E2E8F0',
                      fontFamily: 'monospace',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[11px] pt-2 border-t border-cyber-border/40">
              <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/30 text-cyber-primary">
                <div className="font-bold">REGISTERED</div>
                <div className="text-xs font-bold mt-0.5">{stats.totalRegistered || 0} Students</div>
              </div>
              <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-400">
                <div className="font-bold">AVAILABLE</div>
                <div className="text-xs font-bold mt-0.5">{Math.max(0, (stats.totalCapacity || 200) - (stats.totalRegistered || 0))} Seats</div>
              </div>
            </div>
          </div>

          {/* Chart 2: Registration Velocity Timeline (REAL DATA) */}
          <div className="lg:col-span-7 p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>REGISTRATION VELOCITY (CUMULATIVE BY DATE)</span>
              </h3>
            </div>

            <div className="h-64 w-full">
              {analytics.registrationVelocity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.registrationVelocity}>
                    <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1720',
                        border: '1px solid #1E2D40',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        fontFamily: 'monospace',
                      }}
                      formatter={(value: any, name: string) =>
                        name === 'registrations'
                          ? [`${value} total`, 'Cumulative']
                          : [`${value} new`, 'Daily']
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#00E5FF"
                      strokeWidth={3}
                      dot={{ fill: '#00E5FF', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-cyber-text-dim">
                  No velocity data available yet.
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: Department Breakdown Bar Chart (REAL DATA) */}
          <div className="lg:col-span-7 p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>ENROLLMENT BY DEPARTMENT</span>
              </h3>
            </div>

            <div className="h-64 w-full">
              {analytics.departmentBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.departmentBreakdown}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} angle={-20} textAnchor="end" height={50} />
                    <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1720',
                        border: '1px solid #1E2D40',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Bar dataKey="count" fill="#2293EE" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-cyber-text-dim">
                  No department data yet.
                </div>
              )}
            </div>
          </div>

          {/* Chart 4: Payment Status & Year Breakdown */}
          <div className="lg:col-span-5 p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="text-sm font-bold text-cyber-text flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>PAYMENT STATUS DISTRIBUTION</span>
              </h3>
            </div>

            <div className="h-52 w-full">
              {analytics.paymentBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.paymentBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                    >
                      {analytics.paymentBreakdown.map((_: any, index: number) => (
                        <Cell key={`pay-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1720',
                        border: '1px solid #1E2D40',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        fontFamily: 'monospace',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-cyber-text-dim">
                  No payment data yet.
                </div>
              )}
            </div>

            {/* Year breakdown list */}
            {analytics.yearBreakdown.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-cyber-border/40">
                <div className="text-[11px] text-cyber-text-dim font-bold uppercase">By Year</div>
                {analytics.yearBreakdown.map((y: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-cyber-surface/40">
                    <span className="text-cyber-text">{y.name}</span>
                    <span className="font-bold text-cyber-primary">{y.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
