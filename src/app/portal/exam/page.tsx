'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Loader2, AlertTriangle, Clock, CheckCircle2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CyberButton } from '@/components/ui/CyberButton';

export default function SecureExamPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [examState, setExamState] = useState<'initializing' | 'active' | 'terminated' | 'completed'>('initializing');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [warningsCount, setWarningsCount] = useState(0);
  const [warningLimit, setWarningLimit] = useState(3);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const [showWarningOverlay, setShowWarningOverlay] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const examActiveRef = useRef(false);

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      const res = await fetch('/api/portal/exam');
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to initialize exam');
        router.push('/portal');
        return;
      }

      setQuestions(data.questions);
      setWarningLimit(data.warningLimit);
      setWarningsCount(data.attempt.warningsCount);
      
      // Calculate remaining time
      const startedAt = new Date(data.attempt.startedAt).getTime();
      const durationMs = data.durationMinutes * 60 * 1000;
      const elapsed = Date.now() - startedAt;
      const remainingMs = durationMs - elapsed;
      
      if (remainingMs <= 0) {
        // Auto submit if time already expired
        submitExam('auto_submit');
      } else {
        setTimeLeft(Math.floor(remainingMs / 1000));
        setExamState('active');
        examActiveRef.current = true;
      }
    } catch (e) {
      toast.error('Network error');
      router.push('/portal');
    } finally {
      setLoading(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (examState !== 'active' || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          submitExam('auto_submit');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, timeLeft]);

  // Anti-Cheat Events
  useEffect(() => {
    const handleViolation = async (reason: string) => {
      if (!examActiveRef.current) return;
      
      // Pause exam temporarily
      examActiveRef.current = false;
      setShowWarningOverlay(reason);

      try {
        const res = await fetch('/api/portal/exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'log_violation', payload: { reason } })
        });
        const data = await res.json();
        
        if (data.success) {
          setWarningsCount(data.newWarningsCount);
          if (data.terminated) {
            setExamState('terminated');
            setShowWarningOverlay(null);
            examActiveRef.current = false;
          }
        }
      } catch (e) {
        console.error('Failed to log violation');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation('Tab Switching Detected');
    };

    const handleBlur = () => {
      handleViolation('Window Focus Lost (Alt-Tab/Minimize)');
    };

    const blockEvent = (e: Event) => {
      e.preventDefault();
      handleViolation(`Prohibited Action: ${e.type}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', blockEvent);
    document.addEventListener('copy', blockEvent);
    document.addEventListener('paste', blockEvent);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', blockEvent);
      document.removeEventListener('copy', blockEvent);
      document.removeEventListener('paste', blockEvent);
    };
  }, []);

  const resumeFromWarning = () => {
    if (examState === 'terminated') return;
    setShowWarningOverlay(null);
    examActiveRef.current = true;
  };

  const submitExam = async (action = 'submit_answers') => {
    setSubmitting(true);
    examActiveRef.current = false;
    try {
      const res = await fetch('/api/portal/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload: { answers } })
      });
      const data = await res.json();
      
      if (data.success) {
        setScore(data.score);
        setExamState('completed');
        toast.success('Exam submitted successfully!');
      } else {
        toast.error('Submission failed');
        examActiveRef.current = true;
      }
    } catch (e) {
      toast.error('Network error during submission');
      examActiveRef.current = true;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4 text-cyan-400 font-mono">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>INITIALIZING SECURE ENVIRONMENT...</p>
        </div>
      </div>
    );
  }

  if (examState === 'terminated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <div className="max-w-md w-full p-8 rounded-2xl cyber-glass border border-red-500/50 bg-red-950/20 text-center space-y-6">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          <div>
            <h1 className="text-2xl font-black font-mono text-red-500">EXAM TERMINATED</h1>
            <p className="text-sm text-red-400 mt-2 font-mono">
              Your exam has been blocked due to exceeding the maximum allowed violations ({warningLimit}).
            </p>
          </div>
          <CyberButton variant="primary" glow className="w-full bg-red-600 hover:bg-red-500 text-white" onClick={() => router.push('/portal')}>
            RETURN TO PORTAL
          </CyberButton>
        </div>
      </div>
    );
  }

  if (examState === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <div className="max-w-md w-full p-8 rounded-2xl cyber-glass border border-emerald-500/50 bg-emerald-950/20 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <div>
            <h1 className="text-2xl font-black font-mono text-emerald-500">EXAM SUBMITTED</h1>
            <p className="text-sm text-emerald-400 mt-2 font-mono">
              Your responses have been successfully recorded.
            </p>
            {score !== null && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400/70 font-bold mb-1">SCORE</div>
                <div className="text-3xl font-black">{score} / {questions.length}</div>
              </div>
            )}
          </div>
          <CyberButton variant="primary" glow className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => router.push('/portal')}>
            RETURN TO PORTAL
          </CyberButton>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-cyber-text font-sans pb-20 select-none">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-cyber-bg-elevated/95 backdrop-blur-md border-b border-cyber-border px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-cyan-400">
          <ShieldAlert className="w-6 h-6" />
          <h1 className="font-mono font-bold tracking-widest text-sm">NEXTGEN SECURE EXAM</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-amber-950/30 px-4 py-2 rounded-xl border border-amber-500/30 text-amber-400 font-mono text-sm font-bold">
            <AlertTriangle className="w-4 h-4" />
            WARNINGS: <span className={warningsCount > 0 ? 'text-red-400' : ''}>{warningsCount} / {warningLimit}</span>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${timeLeft && timeLeft < 300 ? 'bg-red-950/40 border-red-500 text-red-500 animate-pulse' : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400'}`}>
            <Clock className="w-5 h-5" />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
          
          <CyberButton 
            variant="primary" 
            glow 
            className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2"
            onClick={() => {
              if (confirm('Are you sure you want to submit your exam early?')) {
                submitExam('submit_answers');
              }
            }}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            SUBMIT EXAM
          </CyberButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto mt-8 px-4 space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-6 rounded-2xl cyber-glass border border-cyber-border space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-500 text-cyan-400 flex items-center justify-center font-bold font-mono text-sm">
                {idx + 1}
              </div>
              <p className="text-lg font-medium leading-relaxed mt-0.5">{q.questionText}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
              {q.options.map((opt: string, oIdx: number) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button
                    key={oIdx}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    className={`text-left px-4 py-3 rounded-xl border font-mono text-sm transition-all flex items-center gap-3 ${
                      isSelected 
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                        : 'bg-cyber-surface/50 border-cyber-border/50 text-cyber-text hover:border-cyan-500/50 hover:bg-cyber-surface'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan-500' : 'border-cyber-border'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Warning Overlay */}
      {showWarningOverlay && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-red-950/20 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-mono text-red-500 tracking-widest">VIOLATION DETECTED</h2>
              <p className="text-sm text-red-400 mt-2 font-mono">{showWarningOverlay}</p>
            </div>
            <div className="p-4 bg-red-950/40 rounded-xl border border-red-500/30 text-xs font-mono text-red-300">
              WARNING {warningsCount} OF {warningLimit}. 
              IF YOU EXCEED THIS LIMIT, YOUR EXAM WILL BE IMMEDIATELY TERMINATED.
            </div>
            <CyberButton variant="primary" glow className="w-full bg-red-600 hover:bg-red-500 text-white" onClick={resumeFromWarning}>
              ACKNOWLEDGE & RESUME
            </CyberButton>
          </div>
        </div>
      )}
    </div>
  );
}
