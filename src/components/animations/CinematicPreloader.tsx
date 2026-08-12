'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarSphere3D from './RadarSphere3D';
import { Shield } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function CinematicPreloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [logText, setLogText] = useState('> INITIALIZING SCRS DEFENSE FRAMEWORK...');
  const [glitchText, setGlitchText] = useState('NEXT GEN SOC BOOTCAMP');

  // Phase 1: Progress Counter
  useEffect(() => {
    if (phase !== 1) return;

    let current = 0;
    const interval = setInterval(() => {
      // Non-linear progress simulation
      current += Math.floor(Math.random() * 3) + 1;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => setPhase(2), 200); // trigger Phase 2 Implosion
      }
      setProgress(current);

      // Telemetry Logs logic
      if (current < 25) setLogText('> INITIALIZING SCRS DEFENSE FRAMEWORK...');
      else if (current < 50) setLogText('> DEPLOYING NEXT GEN SOC NODE NETWORK...');
      else if (current < 75) setLogText('> SCANNING INCIDENT VECTORS & SIEM PROTOCOLS...');
      else if (current < 99) setLogText('> ESTABLISHING SECURE THREAT INTEL FEED...');
      else setLogText('> FIREWALL SYNCHRONIZED // ENGAGING REVEAL');

    }, 30); // Very fast load (~1.5s to 100%)
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: Shockwave & Transition to Phase 3
  useEffect(() => {
    if (phase === 2) {
      setTimeout(() => setPhase(3), 400); // Wait for implosion animation
    }
  }, [phase]);

  // Phase 3: Decrypt Animation & Completion
  useEffect(() => {
    if (phase === 3) {
      // Matrix glitch decrypt effect for main title
      const original = 'NEXT GEN SOC BOOTCAMP';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';
      let iterations = 0;
      
      const glitchInterval = setInterval(() => {
        setGlitchText(original.split('').map((c, i) => {
          if (c === ' ') return ' ';
          if (i < iterations) return c;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''));
        
        if (iterations >= original.length) {
          clearInterval(glitchInterval);
        }
        iterations += 1/3; // Speed of decrypt
      }, 30);

      // End sequence and trigger unmount
      setTimeout(() => {
        onComplete();
      }, 3500); 
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712] overflow-hidden font-mono text-cyber-primary selection:bg-none">
      
      {/* 3D Radar Sphere Layer */}
      <RadarSphere3D implode={phase >= 2} />

      {/* Phase 1: HUD Scanner Overlay */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div 
            key="hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none"
          >
            {/* Center HUD Target Ring */}
            <div className="relative flex items-center justify-center w-64 h-64 rounded-full border border-cyber-primary/20 bg-cyber-bg/20 backdrop-blur-sm shadow-[0_0_60px_rgba(16,185,129,0.1)]">
              {/* Rotating outer dash ring */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-15px] rounded-full border border-dashed border-cyber-primary/40"
              />
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-25px] rounded-full border border-dotted border-cyber-primary/20"
              />
              
              {/* Progress Text */}
              <div className="text-center">
                <div className="text-6xl font-black tracking-tighter text-cyber-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                  {progress.toString().padStart(2, '0')}<span className="text-3xl text-cyber-primary/60">%</span>
                </div>
                <div className="text-[10px] mt-2 text-cyber-primary/70 tracking-widest font-bold">
                  SYS_BOOT_SEQ
                </div>
              </div>
            </div>

            {/* Bottom Telemetry Terminal Log */}
            <div className="absolute bottom-16 w-full text-center">
              <div className="text-xs text-cyber-text-muted tracking-widest uppercase opacity-80 h-4">
                {logText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Shockwave Explosion Ring */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            key="shockwave"
            initial={{ scale: 0.1, opacity: 1, borderWidth: '20px' }}
            animate={{ scale: 15, opacity: 0, borderWidth: '1px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute z-20 rounded-full border-emerald-400 pointer-events-none"
            style={{ width: '100px', height: '100px' }}
          />
        )}
      </AnimatePresence>

      {/* Phase 3: High-Impact Brand Reveal Sequence */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div 
            key="reveal"
            className="relative z-30 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-4"
          >
            {/* Shield Logo Reveal */}
            <motion.div
              initial={{ rotateY: 180, scale: 0, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
              className="mb-8 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-cyber-bg/90 border border-cyber-primary backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                <Shield className="w-12 h-12 text-emerald-400" />
              </div>
            </motion.div>

            {/* Kinetic Subhead */}
            <motion.div
              initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-cyber-primary/90 text-sm md:text-base tracking-[0.4em] mb-4 font-bold"
            >
              SCRS CLUB PRESENTS
            </motion.div>

            {/* Cyber Decrypt Title with Chromatic Aberration */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none"
              style={{ 
                textShadow: '0 0 30px rgba(16,185,129,0.5), 3px 0 0 rgba(255,0,0,0.6), -3px 0 0 rgba(0,255,255,0.6)' 
              }}
            >
              {glitchText}
            </motion.h1>

            {/* Tagline Date Stamp */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8, type: 'spring' }}
              className="mt-8 flex flex-wrap justify-center gap-3 md:gap-6 text-[10px] md:text-sm font-mono text-cyber-text-muted tracking-[0.2em]"
            >
              <span className="text-white">CYBER DEFENSE</span>
              <span className="text-cyber-primary/40">//</span>
              <span className="text-white">INCIDENT RESPONSE</span>
              <span className="text-cyber-primary/40">//</span>
              <span className="text-white">SIEM</span>
            </motion.div>
            
            {/* Glowing Horizon Sweep Laser (Reveals the page) */}
            <motion.div 
              initial={{ scaleX: 0, opacity: 0, y: 150 }}
              animate={{ scaleX: 1, opacity: 1, y: -800 }}
              transition={{ duration: 1.5, delay: 2.8, ease: 'easeInOut' }}
              className="absolute bottom-0 w-full h-[3px] bg-cyber-primary shadow-[0_0_30px_#10b981]"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
