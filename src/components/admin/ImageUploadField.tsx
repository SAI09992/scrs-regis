'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  description?: string;
  placeholder?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  description,
  placeholder = 'https://... or upload an image file',
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    // Allowed image types: jpeg, jpg, png, webp, svg, gif
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
      toast.error('Invalid format! Please upload JPG, JPEG, PNG, WEBP, or SVG image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
        toast.success(`✓ Image uploaded successfully (${(file.size / 1024).toFixed(1)} KB)`);
      }
      setLoading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <label className="text-cyber-text block font-bold flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-cyber-primary" />
          <span>{label}</span>
        </label>

        {/* Toggle Mode: Upload vs URL */}
        <div className="flex items-center gap-1 bg-cyber-bg p-0.5 rounded-lg border border-cyber-border text-[10px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-cyber-primary/20 text-cyber-primary font-bold border border-cyber-primary/40'
                : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>DIRECT UPLOAD</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-cyber-primary/20 text-cyber-primary font-bold border border-cyber-primary/40'
                : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>IMAGE URL</span>
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-3">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,image/gif,.jpeg,.jpg,.png,.webp,.svg,.gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drag & Drop Upload Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
              dragOver
                ? 'border-cyber-primary bg-cyber-primary/10 shadow-cyber-glow-sm'
                : 'border-cyber-border hover:border-cyber-primary/60 bg-cyber-surface/40 hover:bg-cyber-surface'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2 text-cyber-primary py-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-bold">PROCESSING IMAGE FILE...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-cyber-surface-elevated border border-cyber-primary/40 flex items-center justify-center text-cyber-primary shadow-cyber-glow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-cyber-text text-xs block">
                    Click to browse or drag & drop image
                  </span>
                  <span className="text-[10px] text-cyber-text-dim mt-0.5 block">
                    Supports JPG, JPEG, PNG, WEBP, SVG (Max 5MB)
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* URL Input Mode */
        <div className="space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs focus:outline-none focus:border-cyber-primary font-mono"
          />
        </div>
      )}

      {/* Preview Card */}
      {value && (
        <div className="p-3 rounded-xl bg-cyber-surface/60 border border-cyber-primary/40 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Image Preview"
              className="w-14 h-14 object-contain rounded-lg bg-black/60 border border-cyber-border shrink-0 p-1"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-cyber-text flex items-center gap-1.5 truncate">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Image Loaded & Configured</span>
              </span>
              <span className="text-[10px] text-cyber-text-dim block truncate mt-0.5">
                {value.startsWith('data:') ? 'Base64 Encoded Image Data' : value}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/60 transition-colors shrink-0"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {description && <p className="text-[10px] text-cyber-text-dim">{description}</p>}
    </div>
  );
}
