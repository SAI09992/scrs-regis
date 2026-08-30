'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Trash2, Edit3, Shield, Users, ShieldAlert, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminExamPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'attempts'>('settings');
  
  // Settings State
  const [settings, setSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Questions State
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [editQuestion, setEditQuestion] = useState<any>(null);

  // Attempts State
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (activeTab === 'attempts') {
      fetchAttempts();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/exam-settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (e) {
      toast.error('Failed to load settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/exam-questions');
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (e) {
      toast.error('Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const res = await fetch('/api/admin/exam-attempts');
      const data = await res.json();
      if (data.success) {
        setAttempts(data.attempts);
      }
    } catch (e) {
      toast.error('Failed to load attempts');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleReset = async (attemptId: string) => {
    if (!confirm('Are you sure you want to completely reset this attempt? This will delete their score and allow them to retake the exam.')) return;
    setUnblocking(attemptId);
    try {
      const res = await fetch('/api/admin/exam-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, action: 'unblock' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Attempt successfully reset!');
        fetchAttempts(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to reset attempt');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setUnblocking(null);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/exam-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if ((await res.json()).success) {
        toast.success('Exam settings updated!');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveQuestion = async (q: any) => {
    try {
      const res = await fetch('/api/admin/exam-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q),
      });
      if ((await res.json()).success) {
        toast.success('Question saved!');
        setEditQuestion(null);
        fetchQuestions();
      } else {
        toast.error('Failed to save question');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/exam-questions?id=${id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        toast.success('Deleted');
        fetchQuestions();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black font-mono text-cyber-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          SECURE EXAM PORTAL
        </h1>
        <p className="text-xs text-cyber-text-dim mt-1 font-mono">Manage anti-cheat configurations, questions, and participant attempts.</p>
      </div>

      <div className="flex flex-wrap gap-2 pb-2 border-b border-cyber-border">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-mono font-bold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-cyber-primary text-cyber-bg' : 'text-cyber-text-muted hover:bg-cyber-surface'
          }`}
        >
          <Shield className="w-4 h-4" /> CONFIGURATION
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-lg font-mono font-bold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'questions' ? 'bg-cyber-primary text-cyber-bg' : 'text-cyber-text-muted hover:bg-cyber-surface'
          }`}
        >
          <Edit3 className="w-4 h-4" /> QUESTIONS ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('attempts')}
          className={`px-4 py-2 rounded-lg font-mono font-bold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'attempts' ? 'bg-cyber-primary text-cyber-bg' : 'text-cyber-text-muted hover:bg-cyber-surface'
          }`}
        >
          <Users className="w-4 h-4" /> ATTEMPTS & LOGS
        </button>
      </div>

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          {loadingSettings ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-cyber-primary" /></div>
          ) : (
            <div className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-6">
              <h3 className="text-sm font-bold font-mono text-cyber-primary flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> SECURITY CONFIGURATION
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-cyber-surface/40 border border-cyber-border/50">
                  <div>
                    <div className="font-bold font-mono text-cyber-text text-sm">Exam Activation</div>
                    <div className="text-xs text-cyber-text-dim">Allow participants to access the exam portal</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings?.examActive || false}
                      onChange={(e) => setSettings({ ...settings, examActive: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-cyber-surface border border-cyber-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cyber-text-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-primary peer-checked:after:bg-cyber-bg shadow-[0_0_10px_rgba(34,211,238,0.1)] peer-checked:shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-cyber-surface/40 border border-cyber-border/50">
                    <label className="text-[10px] text-cyber-text-muted block mb-1 font-bold">WARNING LIMIT (MAX VIOLATIONS)</label>
                    <input
                      type="number"
                      value={settings?.warningLimit || 3}
                      onChange={(e) => setSettings({ ...settings, warningLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-cyber-bg border border-cyber-border text-cyber-text text-sm font-mono"
                    />
                    <p className="text-[10px] text-cyber-text-dim mt-2">Exam auto-terminates when exceeded.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyber-surface/40 border border-cyber-border/50">
                    <label className="text-[10px] text-cyber-text-muted block mb-1 font-bold">DURATION (MINUTES)</label>
                    <input
                      type="number"
                      value={settings?.durationMinutes || 25}
                      onChange={(e) => setSettings({ ...settings, durationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-cyber-bg border border-cyber-border text-cyber-text text-sm font-mono"
                    />
                    <p className="text-[10px] text-cyber-text-dim mt-2">Auto-submits when time expires.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-6 py-2 rounded-xl bg-cyber-primary hover:bg-cyber-primary/90 text-cyber-bg font-black text-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  SAVE SETTINGS
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUESTIONS TAB */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold text-cyber-text">Manage MCQs</h2>
            <button
              onClick={() => setEditQuestion({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, orderIndex: questions.length + 1 })}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> ADD QUESTION
            </button>
          </div>

          {editQuestion && (
            <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/20 space-y-4 mb-6">
              <div>
                <label className="text-[10px] text-cyber-text-muted block mb-1">QUESTION TEXT</label>
                <textarea
                  value={editQuestion.questionText}
                  onChange={(e) => setEditQuestion({ ...editQuestion, questionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm font-mono min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {editQuestion.options.map((opt: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={editQuestion.correctOptionIndex === idx}
                      onChange={() => setEditQuestion({ ...editQuestion, correctOptionIndex: idx })}
                      className="w-4 h-4 text-emerald-500 bg-cyber-bg border-cyber-border"
                    />
                    <input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editQuestion.options];
                        newOpts[idx] = e.target.value;
                        setEditQuestion({ ...editQuestion, options: newOpts });
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className={`w-full px-3 py-1.5 rounded-lg bg-cyber-surface border text-sm font-mono ${editQuestion.correctOptionIndex === idx ? 'border-emerald-500/50 text-emerald-400' : 'border-cyber-border text-cyber-text'}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleSaveQuestion(editQuestion)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                >
                  SAVE QUESTION
                </button>
                <button
                  onClick={() => setEditQuestion(null)}
                  className="px-4 py-1.5 rounded-lg text-cyber-text-muted hover:text-cyber-text text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loadingQuestions ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-cyber-primary" /></div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-cyber-text-muted text-xs font-mono border border-cyber-border border-dashed rounded-2xl">
                No questions added yet. Add at least 25 for the exam.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl cyber-glass border border-cyber-border relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditQuestion(q)} className="p-1.5 text-cyber-text-muted hover:text-cyber-primary bg-cyber-surface rounded-lg border border-cyber-border">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/30 rounded-lg border border-red-500/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-mono text-sm text-cyber-text font-bold mb-3 pr-20">
                    <span className="text-cyber-primary mr-2">Q{idx + 1}.</span>
                    {q.questionText}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                    {q.options.map((opt: string, oIdx: number) => (
                      <div key={oIdx} className={`px-3 py-1.5 rounded border text-xs font-mono ${q.correctOptionIndex === oIdx ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-cyber-surface/30 border-cyber-border/30 text-cyber-text-dim'}`}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                        {q.correctOptionIndex === oIdx && <span className="float-right font-bold text-[10px]">✓ CORRECT</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ATTEMPTS TAB */}
      {activeTab === 'attempts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold text-cyber-text flex items-center gap-2">
              <Users className="w-4 h-4" /> EXAM ATTEMPTS
            </h2>
            <button disabled className="px-4 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted text-xs font-bold inline-flex items-center gap-2 opacity-50 cursor-not-allowed">
              <Download className="w-4 h-4" /> EXPORT LOGS & SCORES
            </button>
          </div>

          {loadingAttempts ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-cyber-primary" /></div>
          ) : attempts.length === 0 ? (
            <div className="p-8 text-center text-cyber-text-muted text-xs font-mono border border-cyber-border border-dashed rounded-2xl">
              No attempts recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-cyber-border">
              <table className="w-full text-left text-xs font-mono whitespace-nowrap">
                <thead className="bg-cyber-surface/50 border-b border-cyber-border text-cyber-text-dim">
                  <tr>
                    <th className="p-4 font-bold">CADET / REG ID</th>
                    <th className="p-4 font-bold">STATUS</th>
                    <th className="p-4 font-bold">SCORE</th>
                    <th className="p-4 font-bold">WARNINGS</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/50">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-cyber-surface/30">
                      <td className="p-4">
                        <div className="font-bold text-cyber-text">{attempt.name}</div>
                        <div className="text-[10px] text-cyber-text-muted">{attempt.registrationId}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          attempt.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          attempt.status === 'terminated' ? 'bg-red-500/20 text-red-400' :
                          attempt.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-cyber-surface text-cyber-text-muted'
                        }`}>
                          {attempt.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-cyan-400">
                        {attempt.score !== null ? `${attempt.score} / ${questions.length}` : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className={`w-3.5 h-3.5 ${attempt.warningsCount > 0 ? 'text-amber-400' : 'text-cyber-text-muted'}`} />
                          <span className={attempt.warningsCount > 0 ? 'text-amber-400' : 'text-cyber-text-muted'}>
                            {attempt.warningsCount}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {attempt.status === 'terminated' || attempt.status === 'completed' ? (
                          <button
                            onClick={() => handleReset(attempt.id)}
                            disabled={unblocking === attempt.id}
                            className={`px-3 py-1.5 rounded-lg border transition-colors font-bold text-[10px] flex items-center gap-2 ml-auto ${
                              attempt.status === 'terminated' 
                                ? 'bg-red-950/40 text-red-400 border-red-500/30 hover:bg-red-950 hover:text-red-300' 
                                : 'bg-amber-950/40 text-amber-400 border-amber-500/30 hover:bg-amber-950 hover:text-amber-300'
                            }`}
                          >
                            {unblocking === attempt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                            {attempt.status === 'terminated' ? 'UNBLOCK USER' : 'RESET RETAKE'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-cyber-text-muted">No Action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
