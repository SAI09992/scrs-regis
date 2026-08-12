'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Anime.js Glowing Aurora Meshes
    if (containerRef.current) {
      anime({
        targets: '.cyber-aurora-blob-1',
        translateX: () => anime.random(-140, 140),
        translateY: () => anime.random(-100, 100),
        scale: [1, 1.3, 0.95, 1],
        opacity: [0.25, 0.5, 0.3],
        easing: 'easeInOutQuad',
        duration: 16000,
        loop: true,
        direction: 'alternate',
      });

      anime({
        targets: '.cyber-aurora-blob-2',
        translateX: () => anime.random(-120, 120),
        translateY: () => anime.random(-120, 120),
        scale: [0.9, 1.35, 1],
        opacity: [0.2, 0.45, 0.25],
        easing: 'easeInOutSine',
        duration: 20000,
        loop: true,
        direction: 'alternate',
      });

      anime({
        targets: '.cyber-aurora-blob-3',
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-80, 80),
        scale: [1.1, 0.85, 1.2],
        opacity: [0.2, 0.45, 0.25],
        easing: 'easeInOutCubic',
        duration: 18000,
        loop: true,
        direction: 'alternate',
      });

      // Animate laser radar sweep
      anime({
        targets: '.cyber-radar-sweep',
        translateY: ['-100%', '200%'],
        opacity: [0, 0.6, 0.8, 0],
        easing: 'linear',
        duration: 8000,
        loop: true,
      });
    }

    // 2. High-Performance Canvas Neural Network + Embedded Telemetry Tags
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const isMobile = width < 768;
    const nodeCount = isMobile ? 24 : 48;
    const maxConnectionDist = isMobile ? 120 : 175;
    const maxDistSq = maxConnectionDist * maxConnectionDist;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulsePhase: number;
      pulseSpeed: number;
    }

    const colors = ['#00E5FF', '#10B981', '#38BDF8', '#818CF8'];
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[i % colors.length],
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Floating Telemetry Badges drawn strictly on Canvas
    interface FloatingBadge {
      x: number;
      y: number;
      speedY: number;
      text: string;
      alpha: number;
      maxAlpha: number;
      fadeIn: boolean;
    }

    const telemetryPhrases = [
      '01001100', 'SOC::LIVE', '0x7F4A', 'SIEM:ACTIVE', 'DETECTION:OK',
      'THREAT:ZERO', 'PORT:443', 'TLS::v1.3', 'IP:10.208.4.1', 'PCAP://STREAM',
      'KLU::SOC', 'SCRS::NODE'
    ];

    const badges: FloatingBadge[] = [];
    const badgeCount = isMobile ? 4 : 8;

    for (let i = 0; i < badgeCount; i++) {
      badges.push({
        x: Math.random() * (width - 120) + 40,
        y: Math.random() * height,
        speedY: -0.2 - Math.random() * 0.25,
        text: telemetryPhrases[i % telemetryPhrases.length],
        alpha: Math.random() * 0.4 + 0.1,
        maxAlpha: 0.45 + Math.random() * 0.25,
        fadeIn: Math.random() > 0.5,
      });
    }

    // Data packet signals traveling between connected nodes
    interface SignalPacket {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      color: string;
    }

    const packets: SignalPacket[] = [];
    const maxPackets = isMobile ? 4 : 10;
    let lastPacketSpawn = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Spawn periodic pulse signals
      if (time - lastPacketSpawn > 900 && packets.length < maxPackets && nodes.length > 2) {
        lastPacketSpawn = time;
        const fromIdx = Math.floor(Math.random() * nodes.length);
        let toIdx = -1;
        let minDistSq = Infinity;

        for (let j = 0; j < nodes.length; j++) {
          if (j === fromIdx) continue;
          const dx = nodes[fromIdx].x - nodes[j].x;
          const dy = nodes[fromIdx].y - nodes[j].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < maxDistSq && dSq < minDistSq) {
            minDistSq = dSq;
            toIdx = j;
          }
        }

        if (toIdx !== -1) {
          packets.push({
            fromIdx,
            toIdx,
            progress: 0,
            speed: 0.015 + Math.random() * 0.02,
            color: nodes[fromIdx].color,
          });
        }
      }

      // 1. Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulsePhase += node.pulseSpeed;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const ratio = 1 - Math.sqrt(distSq) / maxConnectionDist;
            const alpha = ratio * ratio * 0.28;

            const grad = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            grad.addColorStop(0, `rgba(0, 229, 255, ${alpha})`);
            grad.addColorStop(1, `rgba(16, 185, 129, ${alpha * 0.8})`);

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = ratio * 1.2;
            ctx.stroke();
          }
        }
      }

      // 2. Draw traveling signal packets
      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed;

        if (pkt.progress >= 1) {
          packets.splice(p, 1);
          continue;
        }

        const start = nodes[pkt.fromIdx];
        const end = nodes[pkt.toIdx];
        if (!start || !end) continue;

        const curX = start.x + (end.x - start.x) * pkt.progress;
        const curY = start.y + (end.y - start.y) * pkt.progress;

        ctx.save();
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(curX, curY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw nodes with pulsating halos
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pulse = (Math.sin(node.pulsePhase) + 1) * 0.5;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (1.8 + pulse * 1.2), 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${Math.floor((0.15 + pulse * 0.2) * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      }

      // 4. Draw Floating Telemetry Badges strictly on Canvas (Zero DOM elements)
      ctx.font = '10px monospace';
      for (let b = 0; b < badges.length; b++) {
        const badge = badges[b];
        badge.y += badge.speedY;

        if (badge.fadeIn) {
          badge.alpha += 0.003;
          if (badge.alpha >= badge.maxAlpha) badge.fadeIn = false;
        } else {
          badge.alpha -= 0.003;
          if (badge.alpha <= 0.05) badge.fadeIn = true;
        }

        if (badge.y < -30) {
          badge.y = height + 20;
          badge.x = Math.random() * (width - 120) + 40;
          badge.text = telemetryPhrases[Math.floor(Math.random() * telemetryPhrases.length)];
        }

        const textMetrics = ctx.measureText(badge.text);
        const paddingX = 8;
        const boxWidth = textMetrics.width + paddingX * 2;
        const boxHeight = 18;

        // Badge box
        ctx.save();
        ctx.fillStyle = `rgba(5, 15, 25, ${badge.alpha * 0.8})`;
        ctx.strokeStyle = `rgba(0, 229, 255, ${badge.alpha * 0.5})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(badge.x - paddingX, badge.y - 12, boxWidth, boxHeight, 4);
        } else {
          ctx.rect(badge.x - paddingX, badge.y - 12, boxWidth, boxHeight);
        }
        ctx.fill();
        ctx.stroke();

        // Text inside badge
        ctx.fillStyle = `rgba(0, 229, 255, ${badge.alpha * 1.5})`;
        ctx.fillText(badge.text, badge.x, badge.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030712]">
      {/* 1. Animated Ambient Neon Aurora Mesh Blobs (Anime.js) */}
      <div className="cyber-aurora-blob-1 absolute -top-[15%] -left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-cyan-500/25 via-blue-600/15 to-transparent blur-[140px]" />
      <div className="cyber-aurora-blob-2 absolute top-[35%] -right-[15%] w-[750px] h-[750px] rounded-full bg-gradient-to-bl from-emerald-500/20 via-cyan-600/15 to-transparent blur-[150px]" />
      <div className="cyber-aurora-blob-3 absolute -bottom-[15%] left-[25%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-transparent blur-[140px]" />

      {/* 2. Cyber Circuit Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00E5FF0A_1px,transparent_1px),linear-gradient(to_bottom,#00E5FF0A_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]" />

      {/* 3. Sweeping Holographic Radar Laser Line */}
      <div className="cyber-radar-sweep absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent shadow-[0_0_15px_#00E5FF]" />

      {/* 4. Interactive Neural Constellation & Telemetry Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Subtle Vignette Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#030712_100%)] opacity-70" />
    </div>
  );
}
