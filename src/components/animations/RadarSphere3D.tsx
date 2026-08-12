'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface RadarSphereProps {
  implode: boolean;
}

function ParticleSphere({ implode }: { implode: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 4000;
  
  // Generate points on a sphere
  const { positions, initialPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initial = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere mapping for even distribution
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const r = 2.5; 
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);
      
      pos.set([x, y, z], i * 3);
      initial.set([x, y, z], i * 3);
    }
    return { positions: pos, initialPositions: initial };
  }, []);

  // Mouse Parallax & Idle Rotation
  useFrame((state, delta) => {
    if (pointsRef.current && !implode) {
      // Base rotation
      pointsRef.current.rotation.y += delta * 0.1;
      pointsRef.current.rotation.x += delta * 0.05;
      
      // Mouse Parallax
      const targetX = (state.pointer.x * Math.PI) / 8;
      const targetY = (state.pointer.y * Math.PI) / 8;
      
      pointsRef.current.rotation.x += (targetY - pointsRef.current.rotation.x) * 0.1;
      pointsRef.current.rotation.y += (targetX - pointsRef.current.rotation.y) * 0.1;
    }
  });

  // Implosion Animation
  useEffect(() => {
    if (implode && pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      const posAttribute = geometry.attributes.position;

      const dummy = { t: 0 };
      gsap.to(dummy, {
        t: 1,
        duration: 0.35, // rapid pull
        ease: 'power4.in',
        onUpdate: () => {
          const arr = posAttribute.array as Float32Array;
          for (let i = 0; i < count; i++) {
            const ix = i * 3;
            // Pull particles into center
            arr[ix] = initialPositions[ix] * (1 - dummy.t);
            arr[ix + 1] = initialPositions[ix + 1] * (1 - dummy.t);
            arr[ix + 2] = initialPositions[ix + 2] * (1 - dummy.t);
          }
          posAttribute.needsUpdate = true;
        },
      });
    }
  }, [implode, initialPositions]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#10b981"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Radar Scanner Ring
function RadarSweep({ implode }: { implode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current && !implode) {
      // Rotating the entire group around the Y axis
      groupRef.current.rotation.y -= delta * 1.5;
    }
    if (groupRef.current && implode) {
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Semi-transparent scanning plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 64]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={0.03} 
          side={THREE.DoubleSide} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Radar sweeping laser line */}
      <mesh position={[1.3, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 0.05]} />
        <meshBasicMaterial 
          color="#34d399" 
          transparent 
          opacity={0.6} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function RadarSphere3D({ implode }: RadarSphereProps) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <ParticleSphere implode={implode} />
        <RadarSweep implode={implode} />
      </Canvas>
    </div>
  );
}
