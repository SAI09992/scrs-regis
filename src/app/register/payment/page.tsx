'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberButton } from '@/components/ui/CyberButton';
import PaymentScannerAnimation from '@/components/animations/PaymentScannerAnimation';
import { ShieldCheck, Upload, QrCode, Copy, Check, Hash, FileCheck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function PaymentContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const regIdParam = searchParams.get('regId');

  const [registrationId, setRegistrationId] = useState<string>(regIdParam || '');
  const [feeAmount, setFeeAmount] = useState<number>(300);
  const [upiId, setUpiId] = useState<string>('scrs@upi');
  const [customQrUrl, setCustomQrUrl] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Form State
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch registration & settings details and verify payment state
  useEffect(() => {
    async function loadData() {
      try {
        const portalRes = await fetch('/api/portal/me');
        const portalData = await portalRes.json();
        if (portalData.success && portalData.payment?.status === 'rejected') {
          toast.error('Payment re-submission is locked for this registration. Please contact event coordinators.');
          router.replace('/portal');
          return;
        }

        const statsRes = await fetch('/api/event-stats');
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          if (statsData.stats.registrationFee) setFeeAmount(statsData.stats.registrationFee);
          if (statsData.stats.paymentUpiId) setUpiId(statsData.stats.paymentUpiId);
          if (statsData.stats.paymentQrUrl) setCustomQrUrl(statsData.stats.paymentQrUrl);
        }
      } catch (e) {
        console.error('Failed to load payment settings:', e);
      }
    }
    loadData();
  }, [router]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 8 * 1024 * 1024) {
      toast.error('Screenshot file exceeds maximum 8MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(selected);
    setFile(selected);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationId) {
      toast.error('Registration ID is required');
      return;
    }

    if (!utr || utr.trim().length < 10) {
      toast.error('Please enter a valid 10 to 18 digit UTR / Transaction Reference ID');
      return;
    }

    if (!file) {
      toast.error('Please upload your payment screenshot receipt');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload screenshot
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/payment/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload screenshot');
      }

      const screenshotUrl = uploadData.url;

      // 2. Submit payment
      const submitRes = await fetch('/api/payment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registrationId.trim().toUpperCase(),
          utr: utr.trim().toUpperCase(),
          amount: feeAmount,
          screenshotUrl,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.success) {
        throw new Error(submitData.error || 'Failed to submit payment');
      }

      // 3. Trigger Scanner sequence animation
      setOcrResult(submitData.ocrAnalysis);
      setScannerActive(true);
    } catch (err: any) {
      toast.error(err.message || 'Payment submission failed. Please try again.');
      setUploading(false);
    }
  };

  // UPI deep link
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=NEXTGEN%20SOC%20BOOTCAMP&am=${feeAmount}&cu=INR&tn=NGSOC-${registrationId || 'CADET'}`;

  return (
    <div className="flex-1 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {scannerActive ? (
            <PaymentScannerAnimation
              key="scanner"
              ocrDetails={ocrResult}
              onComplete={() => {
                toast.success('Payment submitted! Admin will verify your UTR and screenshot.');
                router.push('/portal');
              }}
            />
          ) : (
            <motion.div
              key="paymentForm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="cyber-glass-glow rounded-2xl p-5 sm:p-8 border border-cyber-border shadow-cyber-card space-y-6 font-mono"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyber-primary/10 border border-cyber-primary/40 text-cyber-primary">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-cyber-text">
                      PAYMENT SUBMISSION
                    </h2>
                    <p className="text-xs text-cyber-text-muted">
                      PAY REGISTRATION FEE VIA UPI & SUBMIT TRANSACTION DETAILS
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-cyber-text-dim block">FEE DUE</span>
                  <span className="text-2xl font-extrabold text-cyber-primary font-mono-numbers">
                    ₹{feeAmount}
                  </span>
                </div>
              </div>

              {/* SECTION 1: QR CODE DISPLAY */}
              <div className="p-5 rounded-xl bg-cyber-surface/60 border border-cyber-border space-y-4">
                <div className="text-xs font-bold text-cyber-primary uppercase tracking-wider flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>STEP 1: SCAN QR CODE & PAY ₹{feeAmount}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center sm:justify-start">
                  {/* QR Code Container */}
                  <div className="p-3 rounded-xl bg-white text-black shadow-cyber-glow-sm shrink-0">
                    {customQrUrl ? (
                      /* Custom uploaded QR image by Admin */
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={customQrUrl}
                        alt="Official UPI Payment QR Code"
                        className="w-40 h-40 object-contain rounded"
                      />
                    ) : (
                      /* Auto-generated QR Code SVG */
                      <QRCodeSVG
                        value={upiDeepLink}
                        size={160}
                        level="H"
                        includeMargin
                        className="w-40 h-40"
                      />
                    )}
                    <span className="text-[9px] font-bold text-slate-800 mt-1 block text-center uppercase tracking-wider">
                      SCAN WITH ANY UPI APP
                    </span>
                  </div>

                  {/* UPI Details & Instructions */}
                  <div className="space-y-3 text-xs flex-1">
                    <div>
                      <span className="text-cyber-text-dim block text-[11px]">OFFICIAL UPI ID:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-3 py-1.5 rounded-lg bg-cyber-bg border border-cyber-border text-cyber-primary font-bold text-sm">
                          {upiId}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-cyber-primary transition-colors"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-cyber-text-muted text-[11px] leading-relaxed">
                      <p>• Open GPay / PhonePe / Paytm / BHIM</p>
                      <p>• Scan QR code or copy UPI ID</p>
                      <p>• Pay exact fee amount of ₹{feeAmount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM FOR UTR & SCREENSHOT */}
              <form onSubmit={handlePaymentSubmit} className="space-y-5 text-xs">
                {/* Registration ID Input (Read-Only / Locked) */}
                <div className="space-y-1.5">
                  <label className="text-cyber-text flex items-center justify-between">
                    <span className="font-bold">Registration Reference ID (Locked)</span>
                    <span className="text-[10px] text-cyber-text-dim">Auto-assigned</span>
                  </label>
                  <input
                    type="text"
                    value={registrationId}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-bg-elevated border border-cyber-border text-cyber-primary text-sm font-bold uppercase cursor-not-allowed select-none"
                  />
                </div>

                {/* SECTION 2: UTR NUMBER INPUT */}
                <div className="space-y-1.5">
                  <label className="text-cyber-text flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-cyber-primary" />
                      <span>STEP 2: ENTER 12-DIGIT UTR / TRANSACTION REF ID *</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\s+/g, '').toUpperCase())}
                    placeholder="Enter 12-digit UTR number from UPI app"
                    maxLength={24}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-sm font-mono uppercase focus:outline-none focus:border-cyber-primary"
                  />
                  <p className="text-[11px] text-cyber-text-dim">
                    Look for &quot;UPI Ref No&quot; or &quot;UTR&quot; in your payment app receipt details.
                  </p>
                </div>

                {/* SECTION 3: SCREENSHOT UPLOAD DROPZONE */}
                <div className="space-y-2">
                  <label className="text-cyber-text font-bold flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-cyber-secondary" />
                    <span>STEP 3: UPLOAD PAYMENT SCREENSHOT *</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                      previewUrl
                        ? 'border-emerald-500/60 bg-emerald-950/10'
                        : 'border-cyber-border hover:border-cyber-primary/60 bg-cyber-surface/40'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="space-y-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Receipt Preview"
                          className="max-h-44 mx-auto rounded-lg border border-cyber-border shadow-md object-contain"
                        />
                        <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>SCREENSHOT LOADED: {file?.name}</span>
                        </div>
                        <span className="text-[10px] text-cyber-text-dim underline block">
                          Click to change screenshot
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-cyber-primary mx-auto opacity-80" />
                        <div className="text-cyber-text font-bold text-xs">
                          CLICK TO UPLOAD PAYMENT SCREENSHOT
                        </div>
                        <p className="text-[11px] text-cyber-text-dim">
                          PNG, JPG, or WebP (Max 8MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4 border-t border-cyber-border flex items-center justify-between">
                  <Link href="/portal" className="text-xs text-cyber-text-muted hover:text-cyber-primary">
                    ← Back to Portal
                  </Link>

                  <CyberButton
                    type="submit"
                    variant="primary"
                    glow
                    size="lg"
                    loading={uploading}
                    className="gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{uploading ? 'SUBMITTING PAYMENT...' : 'SUBMIT PAYMENT FOR VERIFICATION'}</span>
                    {!uploading && <ArrowRight className="w-4 h-4" />}
                  </CyberButton>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 font-mono text-cyber-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">LOADING PAYMENT TERMINAL...</span>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
