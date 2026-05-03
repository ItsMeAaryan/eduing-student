"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment, ContactShadows, Float } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import BookPremium from "./BookPremium";
import FloatingCards from "./FloatingCards";

function Particles({ count = 20 }) {
  const mesh = useRef<THREE.Points>(null);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(10);
      const y = THREE.MathUtils.randFloatSpread(10);
      const z = THREE.MathUtils.randFloatSpread(10);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.001;
    mesh.current.rotation.x += 0.0005;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3B82F6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroPremiumScene() {
  return (
    <div className="w-full h-[600px] lg:h-[800px] relative">
      {/* Background Orb - CSS for better blur performance */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
        }}
      />

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        className="z-10"
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
          
          {/* Lighting Setup */}
          {/* 1. Key Light (blue) */}
          <spotLight
            position={[-3, 3, 3]}
            intensity={2}
            color="#3B82F6"
            angle={0.3}
            penumbra={1}
            castShadow
          />
          
          {/* 2. Fill Light (purple) */}
          <pointLight
            position={[3, 2, 2]}
            intensity={1}
            color="#8B5CF6"
          />
          
          {/* 3. Rim Light (white) */}
          <directionalLight
            position={[0, 5, 0]}
            intensity={0.5}
            color="#ffffff"
          />

          <ambientLight intensity={0.4} />

          {/* Scene Objects */}
          <Float
            speed={1} 
            rotationIntensity={0.2} 
            floatIntensity={0.5}
          >
            <BookPremium />
          </Float>

          <FloatingCards />
          
          <Particles count={25} />

          {/* Realistic Shadow */}
          <ContactShadows 
            position={[0, -2.5, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2.5} 
            far={4} 
          />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
