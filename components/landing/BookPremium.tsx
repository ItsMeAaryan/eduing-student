"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function BookPremium() {
  const groupRef = useRef<THREE.Group>(null);
  const coverRef = useRef<THREE.Group>(null);
  const pagesRef = useRef<THREE.Group>(null);

  // Materials
  const coverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1E3A8A",
    roughness: 0.1,
    metalness: 0.5,
  }), []);

  const pageMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#F8FAFC",
    roughness: 0.8,
    metalness: 0.0,
  }), []);

  // Geometry for curved pages
  const pageGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Create a curved profile for an open book page
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.5, 0.05, 1.5, 0.2, 2, 0.1);
    shape.lineTo(2, -0.05);
    shape.bezierCurveTo(1.5, 0.05, 0.5, -0.1, 0, -0.05);
    shape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 3,
      beveled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. FLOATING: Up/down movement using sin(time)
    groupRef.current.position.y = Math.sin(t) * 0.1;

    // 2. MICRO ROTATION: Very slow sway
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;

    // 3. MOUSE INTERACTION: Tilt toward cursor
    const { x, y } = state.mouse;
    // Max tilt: 10 degrees (approx 0.17 radians)
    const targetRotationX = -y * 0.17;
    const targetRotationZ = x * 0.17;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotationZ, 0.05);

    // 4. PAGE LIFE: Subtle movement
    if (pagesRef.current) {
      pagesRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t * 0.5 + i) * 0.005;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Spine */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 3, 32]} />
        <primitive object={coverMaterial} attach="material" />
      </mesh>

      {/* Covers */}
      <group ref={coverRef}>
        {/* Left Cover */}
        <mesh position={[-1.1, 1.5, 0.05]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[2.2, 3.2, 0.1]} />
          <primitive object={coverMaterial} attach="material" />
        </mesh>
        {/* Right Cover */}
        <mesh position={[1.1, 1.5, 0.05]} rotation={[0, -0.1, 0]}>
          <boxGeometry args={[2.2, 3.2, 0.1]} />
          <primitive object={coverMaterial} attach="material" />
        </mesh>
      </group>

      {/* Pages Stack */}
      <group ref={pagesRef} position={[0, 0, 0.1]}>
        {/* Left Pages */}
        <group position={[0, 0, 0]}>
          {[...Array(5)].map((_, i) => (
            <mesh 
              key={`left-page-${i}`} 
              geometry={pageGeometry} 
              position={[-0.05, 0.05 + i * 0.02, 0]} 
              rotation={[Math.PI / 2, 0, Math.PI]}
            >
              <primitive object={pageMaterial} attach="material" />
            </mesh>
          ))}
        </group>

        {/* Right Pages */}
        <group position={[0, 0, 0]}>
          {[...Array(5)].map((_, i) => (
            <mesh 
              key={`right-page-${i}`} 
              geometry={pageGeometry} 
              position={[0.05, 0.05 + i * 0.02, 0]} 
              rotation={[Math.PI / 2, 0, 0]}
            >
              <primitive object={pageMaterial} attach="material" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Soft Shadow Placeholder (Simple plane with gradient) */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial 
          transparent 
          opacity={0.2} 
          color="#000000" 
          side={THREE.DoubleSide} 
          map={null} // We could use a radial texture here
        />
        {/* Using a ContactShadows from drei is better, but let's stick to basics for now or use ContactShadows later */}
      </mesh>
    </group>
  );
}
