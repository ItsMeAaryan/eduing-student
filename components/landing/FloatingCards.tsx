"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";

interface CardProps {
  position: [number, number, number];
  text: string;
  delay: number;
}

function FloatingCard({ position, text, delay }: CardProps) {
  const cardRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!cardRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    // Smooth drift: different speed and range for variety
    cardRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.15;
    cardRef.current.position.x = position[0] + Math.cos(t * 0.3) * 0.1;
  });

  return (
    <group ref={cardRef} position={position}>
      <Html transform distanceFactor={10} occlude>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: delay * 0.5 }}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "12px 20px",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            pointerEvents: "none",
          }}
        >
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#3B82F6",
            boxShadow: "0 0 10px #3B82F6"
          }} />
          {text}
        </motion.div>
      </Html>
    </group>
  );
}

export default function FloatingCards() {
  return (
    <>
      <FloatingCard 
        position={[-3, 2, 0.5]} 
        text="IIT Delhi — Applications Open" 
        delay={0} 
      />
      <FloatingCard 
        position={[3.2, 1.2, 1]} 
        text="MBA Programs — 47 seats left" 
        delay={1.5} 
      />
      <FloatingCard 
        position={[2, -2.2, 0.8]} 
        text="Deadline: May 30" 
        delay={3} 
      />
    </>
  );
}
