'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Radio, Activity, Target, Lock, Zap } from 'lucide-react';

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Outer Cyan Cyber Flare */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyber-primary/20 via-transparent to-cyber-secondary/20 rounded-full blur-3xl animate-pulse-glow" />

      {/* Layer 1: Outer Rotating Angle Coordinate Reticle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
        className="absolute inset-2 rounded-full border border-dashed border-cyber-primary/25 flex items-center justify-between px-2"
      >
        <span className="text-[8px] font-mono text-cyber-primary/60 bg-cyber-bg px-1">000°</span>
        <span className="text-[8px] font-mono text-cyber-primary/60 bg-cyber-bg px-1">180°</span>
      </motion.div>

      {/* Layer 2: Counter-Rotating Dashed Segment Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        className="absolute inset-8 rounded-full border-2 border-dashed border-cyber-secondary/30"
      />

      {/* Layer 3: Concentric Pulse Rings */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.75, 0.3] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="absolute inset-16 rounded-full border border-cyber-primary/40 shadow-cyber-glow-sm"
      />

      {/* Layer 4: Central Tactical Cyber Shield SVG */}
      <div className="relative z-10 w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center">
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full drop-shadow-[0_0_35px_rgba(0,229,255,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Shield Path */}
          <path
            d="M100 10 L180 45 V125 C180 175 100 225 100 225 C100 225 20 175 20 125 V45 Z"
            stroke="url(#shield_border_grad_v2)"
            strokeWidth="3"
            fill="url(#shield_bg_grad_v2)"
          />

          {/* Inner Dashed Geometry */}
          <path
            d="M100 28 L165 57 V123 C165 163 100 205 100 205 C100 205 35 163 35 123 V57 Z"
            stroke="rgba(0, 229, 255, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />

          {/* Crosshair Target Rings */}
          <circle cx="100" cy="115" r="34" stroke="#00E5FF" strokeWidth="2" fill="rgba(0, 229, 255, 0.08)" />
          <circle cx="100" cy="115" r="18" fill="#00E5FF" opacity="0.25" />
          <circle cx="100" cy="115" r="5" fill="#00E5FF" />

          {/* Rotating Scanner Needle */}
          <line x1="100" y1="115" x2="128" y2="98" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />

          {/* Crosshair Ticks */}
          <line x1="100" y1="70" x2="100" y2="82" stroke="#00E5FF" strokeWidth="2" />
          <line x1="100" y1="148" x2="100" y2="160" stroke="#00E5FF" strokeWidth="2" />
          <line x1="55" y1="115" x2="67" y2="115" stroke="#00E5FF" strokeWidth="2" />
          <line x1="133" y1="115" x2="145" y2="115" stroke="#00E5FF" strokeWidth="2" />

          {/* Gradients */}
          <defs>
            <linearGradient id="shield_border_grad_v2" x1="20" y1="10" x2="180" y2="225" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5FF" />
              <stop offset="0.5" stopColor="#2293EE" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="shield_bg_grad_v2" x1="100" y1="10" x2="100" y2="225" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F1720" stopOpacity="0.96" />
              <stop offset="1" stopColor="#050A0F" stopOpacity="0.99" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Orbiting Telemetry Badges */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="absolute top-4 left-0 sm:-left-6 cyber-glass px-3.5 py-1.5 rounded-xl text-[11px] font-mono text-cyber-primary flex items-center gap-2 shadow-cyber-card border border-cyber-border/80"
      >
        <span className="w-2 h-2 rounded-full bg-cyber-primary animate-ping" />
        <span>THREAT MATRIX : MONITORED</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 right-0 sm:-right-6 cyber-glass px-3.5 py-1.5 rounded-xl text-[11px] font-mono text-emerald-400 flex items-center gap-2 shadow-cyber-card border border-cyber-border/80"
      >
        <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
        <span>SIEM LOG FEED : 1.2M EPS</span>
      </motion.div>
    </div>
  );
}
