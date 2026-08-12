'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, CheckCircle2, AlertTriangle, Video } from 'lucide-react';
import { toast } from 'sonner';

interface CameraQrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  activeDay: number;
}

export function CameraQrScanner({ onScanSuccess, activeDay }: CameraQrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'cyber-qr-reader';

  // Fetch available cameras on mount
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if mobile, otherwise first available
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
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
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
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
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          let cleanId = decodedText.trim().toUpperCase();
          if (cleanId.startsWith('NGSOC-ATTENDANCE:')) {
            cleanId = cleanId.replace('NGSOC-ATTENDANCE:', '');
          }

          toast.success(`✓ QR Code Scanned: ${cleanId}`);
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
        <div className="flex items-center gap-2 text-cyber-primary font-bold text-sm">
          <Camera className="w-5 h-5 animate-pulse" />
          <span>LIVE WEBRTC CAMERA SCANNER</span>
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
              className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-400 font-bold hover:bg-red-900/60 transition-colors flex items-center gap-1.5"
            >
              <CameraOff className="w-4 h-4" />
              <span>STOP CAMERA</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startScanner}
              className="px-3 py-1.5 rounded-lg bg-cyber-primary/20 border border-cyber-primary/60 text-cyber-primary font-bold hover:bg-cyber-primary/30 transition-colors flex items-center gap-1.5 shadow-cyber-glow-sm"
            >
              <Video className="w-4 h-4" />
              <span>START CAMERA SCANNER</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Scanner Container */}
      <div className="relative rounded-2xl bg-black border-2 border-cyber-border overflow-hidden min-h-[260px] flex items-center justify-center">
        {/* HTML5 QR Container */}
        <div id={scannerContainerId} className={`w-full ${!scanning ? 'hidden' : 'block'}`} />

        {!scanning && (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-cyber-surface border border-cyber-border mx-auto flex items-center justify-center text-cyber-text-dim">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-cyber-text font-bold block text-sm">
                WebRTC Camera Scanner Offline
              </span>
              <span className="text-cyber-text-dim text-[11px] block mt-1">
                Click <strong className="text-cyber-primary">"START CAMERA SCANNER"</strong> above to enable live QR video check-in for Day {activeDay}.
              </span>
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
