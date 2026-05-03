"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Float, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

function Book() {
  const groupRef = useRef<THREE.Group>(null);
  const leftCoverRef = useRef<THREE.Mesh>(null);
  const rightCoverRef = useRef<THREE.Mesh>(null);
  const leftPageRef = useRef<THREE.Mesh>(null);
  const rightPageRef = useRef<THREE.Mesh>(null);
  
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // 1. Gentle floating
    groupRef.current.position.y = Math.sin(time * 0.8) * 0.15;

    // 2. Slow auto-rotation/sway
    const sway = Math.sin(time * 0.2) * 0.3; // Swing between -0.3 and 0.3
    
    // 3. Mouse follow tilt with lerp
    const targetRotX = (mouse.y - 0.5) * 0.3;
    const targetRotY = sway + (mouse.x - 0.5) * 0.4;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);

    // 4. Page flutter animation
    if (rightCoverRef.current) {
      // Rotate between 0.4 and 0.5 radians (around 23-28 degrees)
      const flutter = 0.4 + Math.sin(time * 2) * 0.05;
      rightCoverRef.current.rotation.y = flutter;
      if (rightPageRef.current) rightPageRef.current.rotation.y = flutter;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Spine */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 3.2, 0.15]} />
        <meshStandardMaterial color="#1D4ED8" />
      </mesh>

      {/* Left Cover */}
      <mesh ref={leftCoverRef} position={[-1.25, 0, 0]} rotation={[0, -0.436, 0]}> {/* -25deg */}
        <boxGeometry args={[2.5, 3.2, 0.15]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Right Cover */}
      <mesh ref={rightCoverRef} position={[1.25, 0, 0]} rotation={[0, 0.436, 0]}> {/* +25deg */}
        <boxGeometry args={[2.5, 3.2, 0.15]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Left Page */}
      <mesh ref={leftPageRef} position={[-1.25, 0, 0.08]} rotation={[0, -0.436, 0]}>
        <boxGeometry args={[2.3, 3.0, 0.02]} />
        <meshStandardMaterial color="#F1F5F9" />
        {/* Text Decorations */}
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[0, 1 - i * 0.4, 0.015]}>
            <boxGeometry args={[1.6, 0.08, 0.01]} />
            <meshBasicMaterial color="#CBD5E1" />
          </mesh>
        ))}
      </mesh>

      {/* Right Page */}
      <mesh ref={rightPageRef} position={[1.25, 0, 0.08]} rotation={[0, 0.436, 0]}>
        <boxGeometry args={[2.3, 3.0, 0.02]} />
        <meshStandardMaterial color="#F8FAFC" />
        
        {/* Graduation Cap */}
        <group position={[0, 0, 0.02]}>
          <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.05, 4]} />
            <meshStandardMaterial color="#3B82F6" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.3, 0.15, 0.3]} />
            <meshStandardMaterial color="#1E3A8A" />
          </mesh>
          <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.01, 0.4, 0.01]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      </mesh>
    </group>
  );
}

function Particles({ count = 60 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 0.3 + Math.random() * 0.5;
      const speed = 0.01 + Math.random() * 0.02;
      const xFactor = -8 + Math.random() * 16;
      const yFactor = -8 + Math.random() * 16;
      const zFactor = -8 + Math.random() * 16;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      const dummy = new THREE.Object3D();
      dummy.position.set(
        (xFactor + Math.cos(t) * factor) * 0.5,
        (yFactor + Math.sin(t) * factor) * 0.5,
        (zFactor + Math.cos(t) * factor) * 0.5
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.03]} />
      <meshStandardMaterial color="#3B82F6" emissive="#8B5CF6" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

function FloatingInfoCard({ position, title, subtitle, color = "#3B82F6", delay = 0 }: { position: [number, number, number], title: string, subtitle: string, color?: string, delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() + delay;
    ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.1;
  });

  return (
    <group ref={ref} position={position}>
      <Html center distanceFactor={10}>
        <div style={{
          background: "rgba(17,24,39,0.85)",
          border: `1px solid ${color}66`,
          borderRadius: "12px",
          padding: "10px 14px",
          backdropFilter: "blur(10px)",
          whiteSpace: "nowrap",
          color: "white",
          fontSize: "13px",
          fontFamily: "Inter, sans-serif",
          boxShadow: `0 0 20px ${color}33`,
        }}>
          <div style={{ color: color, fontSize: "11px", marginBottom: "4px", fontWeight: "bold" }}>
            {title}
          </div>
          <div style={{ fontWeight: 600 }}>
            {subtitle}
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function HeroScene3D() {
  return (
    <div className="w-full h-full">
      <Canvas gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[-3, 3, 3]} intensity={2} color="#3B82F6" />
        <pointLight position={[3, -2, 2]} intensity={1} color="#8B5CF6" />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

        <Book />
        <Particles count={60} />

        <FloatingInfoCard 
          position={[-3.5, 2, 1]} 
          title="🏛 IIT Delhi" 
          subtitle="Applications Open" 
          delay={0}
        />
        <FloatingInfoCard 
          position={[3.8, 0, 1]} 
          title="🎓 Programs" 
          subtitle="MBA Programs — 47 seats left" 
          color="#8B5CF6" 
          delay={2}
        />
        <FloatingInfoCard 
          position={[-3.2, -1.8, 1]} 
          title="⏰ Deadline" 
          subtitle="Deadline: May 30" 
          color="#F97316" 
          delay={4}
        />

        {/* Glow Effect behind book */}
        <mesh position={[0, 0, -1]}>
          <circleGeometry args={[2.5, 32]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.06} />
        </mesh>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
