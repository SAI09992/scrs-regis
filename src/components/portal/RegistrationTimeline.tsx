'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Award, ShieldAlert } from 'lucide-react';
import { PaymentStatus, AttendanceData } from '@/types';

interface Props {
  paymentStatus?: PaymentStatus | null;
  attendance?: AttendanceData[];
  hasCertificate?: boolean;
}

export default function RegistrationTimeline({
  paymentStatus,
  attendance = [],
  hasCertificate = false,
}: Props) {
  const isPaymentSubmitted = !!paymentStatus;
  const isPaymentVerified = paymentStatus === 'verified';
  const isPaymentRejected = paymentStatus === 'rejected';

  const day1Present = attendance.some((a) => a.day === 1 && a.status === 'present');
  const day2Present = attendance.some((a) => a.day === 2 && a.status === 'present');
  const isAttendanceCompleted = day1Present && day2Present;

  const timelineSteps = [
    {
      id: 1,
      title: 'Google Account Verified',
      status: 'completed',
      date: 'Identity Authenticated',
    },
    {
      id: 2,
      title: 'Registration Form Submitted',
      status: 'completed',
      date: 'Academic Profile Logged',
    },
    {
      id: 3,
      title: 'Payment Details Submitted',
      status: isPaymentSubmitted ? 'completed' : 'pending',
      date: isPaymentSubmitted ? 'UTR & Receipt Received' : 'Awaiting Submission',
    },
    {
      id: 4,
      title: isPaymentRejected ? 'Payment Rejected' : 'Payment Verification',
      status: isPaymentVerified
        ? 'completed'
        : isPaymentRejected
        ? 'rejected'
        : isPaymentSubmitted
        ? 'in_progress'
        : 'upcoming',
      date: isPaymentVerified
        ? 'Verified by SOC Admin'
        : isPaymentRejected
        ? 'Requires Re-submission'
        : isPaymentSubmitted
        ? 'Under Active Review'
        : 'Pending Step',
    },
    {
      id: 5,
      title: 'Workshop Attendance',
      status: isAttendanceCompleted
        ? 'completed'
        : day1Present
        ? 'in_progress'
        : 'upcoming',
      date: isAttendanceCompleted
        ? 'Day 1 & Day 2 Present'
        : day1Present
        ? 'Day 1 Present (Day 2 Pending)'
        : 'QR Scan at Range',
    },
    {
      id: 6,
      title: 'Certificate Generated',
      status: hasCertificate ? 'completed' : 'upcoming',
      date: hasCertificate ? 'Cryptographic QR Issued' : 'Requires Verified Attendance',
    },
  ];

  return (
    <div className="p-6 rounded-2xl cyber-glass border border-cyber-border font-mono text-xs space-y-6">
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <h3 className="text-sm font-bold text-cyber-text tracking-wider uppercase flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-primary" />
          <span>CADET LIFECYCLE PROGRESSION</span>
        </h3>
        <span className="text-[11px] text-cyber-primary">REAL-TIME TIMELINE</span>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Connecting Vertical Line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-cyber-border" />

        {timelineSteps.map((step, idx) => {
          const isDone = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isRejected = step.status === 'rejected';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative flex items-start gap-3"
            >
              {/* Icon Marker */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                  isDone
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                    : isInProgress
                    ? 'bg-amber-950 text-amber-400 border border-amber-500 animate-pulse'
                    : isRejected
                    ? 'bg-red-950 text-red-400 border border-red-500'
                    : 'bg-cyber-surface text-cyber-text-dim border border-cyber-border'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isRejected ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : isInProgress ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                ) : (
                  <Circle className="w-2 h-2" />
                )}
              </div>

              <div className="flex-1">
                <div
                  className={`font-bold ${
                    isDone
                      ? 'text-cyber-text'
                      : isInProgress
                      ? 'text-amber-400'
                      : isRejected
                      ? 'text-red-400'
                      : 'text-cyber-text-dim'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[11px] text-cyber-text-muted mt-0.5">
                  {step.date}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
