'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { fullRegistrationSchema, FullRegistrationInput } from '@/lib/validation';
import GuidelinesModal from '@/components/registration/GuidelinesModal';
import TermsModal from '@/components/registration/TermsModal';
import Step1Personal from '@/components/registration/Step1Personal';
import Step2Academic from '@/components/registration/Step2Academic';
import Step4Review from '@/components/registration/Step4Review';
import { CyberButton } from '@/components/ui/CyberButton';
import { Shield, ArrowRight, ArrowLeft, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const TOTAL_STEPS = 3;

function RegisterContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Flow State
  const [flowStage, setFlowStage] = useState<'guidelines' | 'terms' | 'form'>('guidelines');
  const [formStep, setFormStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [successRegId, setSuccessRegId] = useState<string | null>(null);
  const [existingRegId, setExistingRegId] = useState<string | null>(null);
  const [existingPaymentStatus, setExistingPaymentStatus] = useState<string | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const form = useForm<FullRegistrationInput>({
    resolver: zodResolver(fullRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      registerNumber: '',
      department: '',
      year: undefined as any,
      section: '',
      college: 'Kalasalingam Academy of Research and Education',
      creditType: 'UE_CSE',
      priorExperience: 'Beginner',
      preferredOperatingSystem: 'Windows',
      interests: [],
      dietaryOrAccessibility: '',
    },
    mode: 'onChange',
  });

  // Only sync email from Google session — name stays as placeholder
  useEffect(() => {
    if (session?.user?.email) {
      form.setValue('email', session.user.email);
    }
  }, [session, form]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setCheckingRegistration(false);
      return;
    }

    if (session?.user?.email) {
      // Check if user already has an active registration
      fetch('/api/portal/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.registration) {
            setExistingRegId(data.registration.registrationId);
            setExistingPaymentStatus(data.payment ? data.payment.status : 'unpaid');
          }
        })
        .catch(console.error)
        .finally(() => {
          setCheckingRegistration(false);
        });
    }
  }, [session, status]);

  // Handlers for progression
  const handleNextStep = async () => {
    const fieldsToValidate =
      formStep === 1
        ? (['name', 'email', 'phone', 'college'] as const)
        : (['registerNumber', 'department', 'year', 'section', 'creditType'] as const);

    const isStepValid = await form.trigger(fieldsToValidate);
    if (isStepValid) {
      setFormStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
    } else {
      toast.error('Please complete all mandatory fields.');
    }
  };

  // Submit full registration to backend
  const onSubmit = async (data: FullRegistrationInput) => {
    // Prevent accidental submission via "Enter" key on earlier steps
    if (formStep < TOTAL_STEPS) {
      handleNextStep();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(`✓ Registration confirmed! Redirecting to payment...`);
        router.push(`/register/payment?regId=${result.registrationId}`);
      } else if (res.status === 409 && result.registrationId) {
        setExistingRegId(result.registrationId);
        toast.info(result.error);
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state with spinner
  if (status === 'loading' || checkingRegistration) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 font-mono text-cyber-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">VERIFYING IDENTITY & CADET STATUS...</span>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md cyber-glass-glow rounded-2xl p-8 border border-cyber-border text-center space-y-6"
        >
          <div className="w-14 h-14 rounded-full bg-cyber-surface border border-cyber-primary/40 mx-auto flex items-center justify-center text-cyber-primary shadow-cyber-glow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-cyber-text">
              LOGIN REQUIRED
            </h2>
            <p className="text-xs font-mono text-cyber-text-muted mt-1.5 leading-relaxed">
              Sign in with Google to proceed with registration.
            </p>
          </div>

          <Link href="/login?callbackUrl=/register" className="block">
            <CyberButton variant="primary" glow size="lg" className="w-full gap-2">
              <span>SIGN IN TO REGISTER</span>
              <ArrowRight className="w-4 h-4" />
            </CyberButton>
          </Link>
        </motion.div>
      </div>
    );
  }

  // If registration just succeeded
  if (successRegId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md cyber-glass-glow rounded-2xl p-8 border border-emerald-500/40 text-center space-y-6"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-emerald-400">
              REGISTRATION SUCCESSFUL!
            </h2>
            <p className="text-xs font-mono text-cyber-text-muted mt-2">
              Your registration profile has been created successfully.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-cyber-bg border border-cyber-border font-mono text-sm font-bold text-cyber-primary">
              ID: {successRegId}
            </div>
          </div>

          <div className="pt-2">
            <Link href={`/register/payment?regId=${successRegId}`} className="block">
              <CyberButton variant="primary" glow size="lg" className="w-full gap-2">
                <span>PROCEED TO PAYMENT</span>
                <ArrowRight className="w-4 h-4" />
              </CyberButton>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // If existing registration found
  if (existingRegId) {
    const isUnpaid = !existingPaymentStatus || existingPaymentStatus === 'unpaid' || existingPaymentStatus === 'rejected';

    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md cyber-glass-glow rounded-2xl p-8 border ${isUnpaid ? 'border-cyan-500/40' : 'border-cyber-primary/40'} text-center space-y-6`}
        >
          <div className={`w-14 h-14 rounded-full ${isUnpaid ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400' : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'} mx-auto flex items-center justify-center border`}>
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className={`text-xl font-bold font-mono ${isUnpaid ? 'text-cyan-400' : 'text-cyber-text'}`}>
              {isUnpaid ? 'PAYMENT PENDING' : 'ALREADY REGISTERED'}
            </h2>
            <p className="text-xs font-mono text-cyber-text-muted mt-2 leading-relaxed">
              {isUnpaid ? 'Your application has been submitted successfully, but your payment is still pending. Please complete your payment to secure your spot.' : 'You already have an active registration:'}
            </p>
            {!isUnpaid && (
              <div className="mt-3 p-3 rounded-lg bg-cyber-bg border border-cyber-border font-mono text-sm font-bold text-cyber-primary">
                {existingRegId}
              </div>
            )}
          </div>

          <div className="pt-2">
            {isUnpaid ? (
              <Link href={`/register/payment?regId=${existingRegId}`} className="block">
                <CyberButton variant="primary" glow size="lg" className="w-full gap-2">
                  <span>PROCEED TO PAYMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </CyberButton>
              </Link>
            ) : (
              <Link href="/portal" className="block">
                <CyberButton variant="primary" glow size="lg" className="w-full">
                  GO TO PARTICIPANT PORTAL
                </CyberButton>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const stepLabels = ['PERSONAL', 'ACADEMIC', 'REVIEW'];
  const progressPercent = Math.round((formStep / TOTAL_STEPS) * 100);

  return (
    <div className="flex-1 py-6 sm:py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Stage 1: Guidelines */}
        {flowStage === 'guidelines' && (
          <GuidelinesModal onContinue={() => setFlowStage('terms')} />
        )}

        {/* Stage 2: Terms */}
        {flowStage === 'terms' && (
          <TermsModal onAccept={() => setFlowStage('form')} />
        )}

        {/* Stage 3: Multi-step Registration Form (3 Steps) */}
        {flowStage === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-glass-glow rounded-2xl p-5 sm:p-8 border border-cyber-border shadow-cyber-card space-y-6"
          >
            {/* Stepper Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-cyber-text-muted">
                <span className="text-cyber-primary font-bold">
                  STEP {formStep} OF {TOTAL_STEPS} : {stepLabels[formStep - 1]}
                </span>
                <span>{progressPercent}% COMPLETE</span>
              </div>
              <div className="h-2 w-full rounded-full bg-cyber-bg border border-cyber-border overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyber-secondary via-cyber-primary to-emerald-400"
                />
              </div>
            </div>

            {/* Form Steps */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {formStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Step1Personal form={form} googleEmail={session.user?.email || ''} />
                  </motion.div>
                )}

                {formStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Step2Academic form={form} />
                  </motion.div>
                )}

                {formStep === 3 && (
                  <motion.div
                    key="step3-review"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Step4Review form={form} onEditStep={(s) => setFormStep(s)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-cyber-border flex items-center justify-between">
                {formStep > 1 ? (
                  <CyberButton
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setFormStep((prev) => Math.max(1, prev - 1))}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>BACK</span>
                  </CyberButton>
                ) : (
                  <div />
                )}

                {formStep < TOTAL_STEPS ? (
                  <CyberButton
                    type="button"
                    variant="primary"
                    glow
                    size="md"
                    onClick={handleNextStep}
                    className="gap-2"
                  >
                    <span>NEXT STEP</span>
                    <ArrowRight className="w-4 h-4" />
                  </CyberButton>
                ) : (
                  <CyberButton
                    type="submit"
                    variant="primary"
                    glow
                    size="lg"
                    loading={submitting}
                    className="gap-2"
                  >
                    <span>{submitting ? 'SUBMITTING...' : 'CONFIRM & PAY ₹300'}</span>
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </CyberButton>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 font-mono text-cyber-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">LOADING REGISTRATION...</span>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
