'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, CheckCircle2, AlertTriangle, Video, Scan } from 'lucide-react';
import { toast } from 'sonner';

interface CameraQrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  activeDay: number;
  autoStopOnScan?: boolean;
}

export function CameraQrScanner({
  onScanSuccess,
  activeDay,
  autoStopOnScan = true,
}: CameraQrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const scannerContainerId = 'cyber-qr-reader';

  // Fetch available cameras on mount
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if mobile, otherwise first available
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCam ? backCam.id : devices[0].id);
        } else {
          setError('No video cameras detected on this device.');
        }
      } catch (err: any) {
        setError('Camera permission denied or unsupported device.');
      }
    }
    getCameras();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (isStoppingRef.current) return;
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      isStoppingRef.current = true;
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      } finally {
        isStoppingRef.current = false;
      }
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setError(null);
    if (!selectedCamera && cameras.length > 0) {
      setSelectedCamera(cameras[0].id);
    }

    const cameraIdToUse = selectedCamera || (cameras.length > 0 ? cameras[0].id : null);
    if (!cameraIdToUse) {
      toast.error('No camera selected. Please grant camera permissions.');
      return;
    }

    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      setScanning(true);

      await html5QrcodeRef.current.start(
        cameraIdToUse,
        {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          let cleanId = decodedText.trim().toUpperCase();
          if (cleanId.startsWith('NGSOC-ATTENDANCE:')) {
            cleanId = cleanId.replace('NGSOC-ATTENDANCE:', '');
          }

          toast.success(`✓ Scanned: ${cleanId}`);

          // Immediately stop scanner after single scan if autoStopOnScan is enabled
          if (autoStopOnScan) {
            await stopScanner();
          }

          onScanSuccess(cleanId);
        },
        () => {
          // Frame-by-frame error ignored (normal when no QR code in frame)
        }
      );
    } catch (err: any) {
      console.error('Failed to start camera scanner:', err);
      setError('Could not access camera. Ensure camera permission is allowed.');
      setScanning(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Camera className={`w-5 h-5 ${scanning ? 'animate-pulse text-amber-400' : 'text-cyber-text-muted'}`} />
          <span>{scanning ? 'CAMERA SCANNING ACTIVE...' : 'CAMERA SCANNER READY'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Camera Selection Dropdown */}
          {cameras.length > 1 && (
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              disabled={scanning}
              className="px-2.5 py-1 rounded bg-cyber-surface border border-cyber-border text-cyber-text text-[11px] focus:outline-none"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id.slice(0, 5)}...`}
                </option>
              ))}
            </select>
          )}

          {/* Toggle Camera Button */}
          {scanning ? (
            <button
              type="button"
              onClick={stopScanner}
              className="px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-400 font-bold hover:bg-red-900/60 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CameraOff className="w-4 h-4" />
              <span>CANCEL SCAN</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startScanner}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
            >
              <Scan className="w-4 h-4" />
              <span>SCAN QR CODE</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Scanner Container */}
      <div
        onClick={() => {
          if (!scanning) startScanner();
        }}
        className={`relative rounded-2xl bg-black border-2 transition-all duration-300 overflow-hidden min-h-[260px] flex items-center justify-center ${
          scanning
            ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
            : 'border-cyber-border hover:border-amber-500/60 cursor-pointer group bg-cyber-surface/20'
        }`}
      >
        {/* HTML5 QR Container */}
        <div id={scannerContainerId} className={`w-full ${!scanning ? 'hidden' : 'block'}`} />

        {!scanning && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 group-hover:scale-110 group-hover:border-amber-400 mx-auto flex items-center justify-center text-amber-400 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <Scan className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <span className="text-cyber-text font-bold block text-sm">
                Single-Shot QR Scanner (Click to Scan)
              </span>
              <span className="text-cyber-text-muted text-[11px] block mt-1">
                Click here or tap <strong className="text-amber-400">"SCAN QR CODE"</strong>. Camera will automatically turn off once QR is read!
              </span>
            </div>
            <div className="inline-block px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold text-xs group-hover:bg-amber-500 group-hover:text-black transition-colors">
              + TAP TO SCAN NEXT CADET
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <span className="text-amber-400 font-bold text-xs">{error}</span>
            <span className="text-[10px] text-cyber-text-dim max-w-xs">
              Make sure browser camera access is granted or use the manual Registration ID input below.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
