"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, PerspectiveCamera, Environment, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Book() {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Auto rotation
    meshRef.current.rotation.y += 0.005;
    
    // Mouse tilt
    const { x, y } = state.mouse;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.2, 0.1);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, x * 0.1, 0.1);
  });

  return (
    <group ref={meshRef}>
      {/* Book Cover (Back) */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3, 4, 0.1]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
      
      {/* Pages (Left) */}
      <mesh position={[-0.75, 0, 0.05]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[1.5, 3.8, 0.05]} />
        <meshStandardMaterial color="#FDFCF0" />
      </mesh>

      {/* Pages (Right) */}
      <mesh position={[0.75, 0, 0.05]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[1.5, 3.8, 0.05]} />
        <meshStandardMaterial color="#FDFCF0" />
      </mesh>

      {/* Decorative lines on pages */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[-0.75, 1 - i * 0.3, 0.08]} rotation={[0, -0.2, 0]}>
          <planeGeometry args={[1, 0.05]} />
          <meshBasicMaterial color="#E5E7EB" transparent opacity={0.5} />
        </mesh>
      ))}
      
      {/* Graduation Cap Icon placeholder (Right page) */}
      <mesh position={[0.75, 0.5, 0.08]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
      <mesh position={[0.75, 0.4, 0.08]} rotation={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 32]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
    </group>
  );
}

function FloatingCard({ position, title, subtitle, color = "#3B82F6", delay = 0 }: { position: [number, number, number], title: string, subtitle: string, color?: string, delay?: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef} position={position}>
        <mesh>
          <planeGeometry args={[2.2, 0.8]} />
          <meshStandardMaterial 
            color="#0F172A" 
            transparent 
            opacity={0.8} 
            metalness={0.8} 
            roughness={0.2} 
          />
        </mesh>
        {/* Border */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.25, 0.85]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
        
        <Text
          position={[-1, 0.15, 0.05]}
          fontSize={0.12}
          color="white"
          anchorX="left"
          fontWeight="bold"
        >
          {title}
        </Text>
        <Text
          position={[-1, -0.1, 0.05]}
          fontSize={0.08}
          color="#94A3B8"
          anchorX="left"
        >
          {subtitle}
        </Text>
      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas gl={{ alpha: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3B82F6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Book />
        </Float>

        <FloatingCard 
          position={[-2.5, 2.5, 1]} 
          title="IIT Delhi" 
          subtitle="Applications Open" 
          delay={0}
        />
        <FloatingCard 
          position={[2.8, 1.5, 2]} 
          title="MBA Programs" 
          subtitle="47 seats left" 
          color="#8B5CF6" 
          delay={1}
        />
        <FloatingCard 
          position={[2, -2.5, 1]} 
          title="Deadline: May 30" 
          subtitle="Apply Now" 
          color="#06B6D4" 
          delay={2}
        />

        <mesh position={[0, 0, -2]}>
          <sphereGeometry args={[4, 64, 64]} />
          <MeshDistortMaterial
            color="#1E3A8A"
            speed={3}
            distort={0.4}
            radius={1}
            transparent
            opacity={0.1}
          />
        </mesh>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
