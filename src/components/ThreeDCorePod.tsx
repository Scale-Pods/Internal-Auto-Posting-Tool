"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, MeshWobbleMaterial, Environment, ContactShadows, Stars } from "@react-three/drei";
import * as THREE from "three";

// The inner glowing core
function Core() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 2]} />
      <MeshDistortMaterial 
        color="#f59e0b" // Primary amber
        emissive="#b45309"
        emissiveIntensity={2}
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// The outer wireframe shell
function Shell() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x -= delta * 0.1;
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial 
          color="#fde68a"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Orbiting particles */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin((i / 6) * Math.PI * 2) * 3, 
            Math.cos((i / 6) * Math.PI * 2) * 3, 
            0
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

export default function ThreeDCorePod() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#f59e0b" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#fde68a" />
        
        <Float
          speed={2} 
          rotationIntensity={1.5} 
          floatIntensity={2} 
        >
          <Core />
          <Shell />
        </Float>
        
        <Environment preset="city" />
        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
