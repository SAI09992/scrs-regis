'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ParticipantHeader from '@/components/portal/ParticipantHeader';
import StatusCard from '@/components/portal/StatusCard';
import RegistrationTimeline from '@/components/portal/RegistrationTimeline';
import AttendanceBadge from '@/components/portal/AttendanceBadge';
import { CyberButton } from '@/components/ui/CyberButton';
import { RegistrationData, PaymentData, AttendanceData, CertificateData } from '@/types';
import { Award, ArrowRight, RefreshCw, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ParticipantPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  const fetchPortalData = async () => {
    try {
      const res = await fetch('/api/portal/me');
      const data = await res.json();
      if (data.success) {
        setRegistration(data.registration);
        setPayment(data.payment);
        setAttendance(data.attendance || []);
        setCertificate(data.certificate);
      }
    } catch (err) {
      console.error('Failed to fetch portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPortalData();
    } else if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/portal');
    }
  }, [status, router]);

  // Real-time Event Listener for instant status change without refresh
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime');
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.event === 'payment:statusUpdated') {
            if (
              registration &&
              (payload.data.registrationId === registration.registrationId ||
                payload.data.userId === (session?.user as any)?.id)
            ) {
              setPayment((prev) =>
                prev
                  ? { ...prev, status: payload.data.status, verifiedAt: payload.data.verifiedAt }
                  : null
              );

              if (payload.data.status === 'verified') {
                if (typeof window !== 'undefined') {
                  import('canvas-confetti').then((m) =>
                    m.default({
                      particleCount: 80,
                      spread: 70,
                      origin: { y: 0.6 },
                      colors: ['#00E5FF', '#10B981', '#2293EE'],
                    })
                  );
                }
                toast.success('✓ Payment verification completed! Welcome to NextGen SOC.');
              } else if (payload.data.status === 'rejected') {
                toast.error('Payment rejected: ' + (payload.data.rejectionReason || 'Details mismatch'));
              }
            }
          }

          if (payload.event === 'attendance:updated') {
            if (registration && payload.data.registrationId === registration.registrationId) {
              fetchPortalData();
              toast.info(`Attendance marked for Day ${payload.data.day}`);
            }
          }
        } catch (err) {
          // ignore
        }
      };
    } catch (e) {
      console.warn('Realtime SSE disconnected');
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [registration, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 font-mono text-cyber-primary text-sm">
          <span className="w-5 h-5 rounded-full border-2 border-cyber-primary border-t-transparent animate-spin" />
          <span>LOADING CADET SECURITY DOSSIER...</span>
        </div>
      </div>
    );
  }

  // If no registration exists for this user yet
  if (!registration) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md cyber-glass-glow rounded-2xl p-8 border border-cyber-border text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-cyber-surface border border-cyber-primary/40 mx-auto flex items-center justify-center text-cyber-primary">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-cyber-text">
              NO ACTIVE REGISTRATION FOUND
            </h2>
            <p className="text-xs font-mono text-cyber-text-muted mt-1.5 leading-relaxed">
              You are signed in as {session?.user?.email}. You must complete the bootcamp registration form to obtain your Cadet Reference ID.
            </p>
          </div>

          <Link href="/register" className="block">
            <CyberButton variant="primary" glow size="lg" className="w-full gap-2">
              <span>REGISTER FOR BOOTCAMP</span>
              <ArrowRight className="w-4 h-4" />
            </CyberButton>
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = payment?.status === 'verified';
  const day1Present = attendance.some((a) => a.day === 1 && a.status === 'present');
  const day2Present = attendance.some((a) => a.day === 2 && a.status === 'present');
  const isEligibleForCert = isVerified && (day1Present || day2Present);

  return (
    <div className="flex-1 py-8 px-4">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Header Profile Dossier */}
        <ParticipantHeader registration={registration} />

        {/* Status Card & Attendance Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard payment={payment} registrationId={registration.registrationId} />
          <AttendanceBadge
            registrationId={registration.registrationId}
            attendance={attendance}
            paymentVerified={isVerified}
          />
        </div>

        {/* Certificate Unlock Banner */}
        {isEligibleForCert && (
          <div className="p-6 rounded-2xl cyber-glass border border-emerald-500/50 bg-emerald-950/10 shadow-cyber-glow-emerald flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-cyber-text">
                  BOOTCAMP CERTIFICATE UNLOCKED
                </h3>
                <p className="text-xs text-cyber-text-muted mt-0.5">
                  Your verified attendance qualifies you for cryptographic QR certification.
                </p>
              </div>
            </div>

            <Link href="/certificate">
              <CyberButton variant="primary" glow size="md" className="gap-2">
                <span>VIEW CERTIFICATE</span>
                <ExternalLink className="w-4 h-4" />
              </CyberButton>
            </Link>
          </div>
        )}

        {/* WhatsApp Group Join Card - visible after payment */}
        {payment && <WhatsAppJoinCard />}

        {/* Lifecycle Progression Timeline */}
        <RegistrationTimeline
          paymentStatus={payment?.status}
          attendance={attendance}
          hasCertificate={!!certificate || isEligibleForCert}
        />
      </div>
    </div>
  );
}

function WhatsAppJoinCard() {
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [whatsappQr, setWhatsappQr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/event-stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setWhatsappLink(data.stats.whatsappGroupLink || null);
          setWhatsappQr(data.stats.whatsappGroupQrUrl || null);
        }
      })
      .catch(() => {});
  }, []);

  if (!whatsappLink) return null;

  return (
    <div className="p-6 rounded-2xl cyber-glass border border-emerald-500/40 bg-emerald-950/10 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0">
          <ExternalLink className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold font-mono text-emerald-400">
            JOIN OFFICIAL WHATSAPP GROUP
          </h3>
          <p className="text-[11px] text-cyber-text-muted mt-0.5">
            Stay updated with announcements, schedule changes, and connect with fellow cadets.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {whatsappQr && (
          <div className="w-40 h-40 rounded-xl overflow-hidden border border-emerald-500/30 bg-white p-2 shrink-0">
            <img
              src={whatsappQr}
              alt="WhatsApp Group QR Code"
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <p className="text-xs text-cyber-text-muted font-mono">
            {whatsappQr ? 'Scan the QR code or click the button below to join instantly.' : 'Click the button below to join instantly.'}
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs transition-all shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            JOIN WHATSAPP GROUP
          </a>
        </div>
      </div>
    </div>
  );
}
