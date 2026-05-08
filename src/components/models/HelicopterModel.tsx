import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PS1-style Kamov Ka-50 "Black Shark" 
 * Precisely matched to reference image proportions and details.
 */
export default function HelicopterModel(props: any) {
  const rotorLowerRef = useRef<THREE.Group>(null);
  const rotorUpperRef = useRef<THREE.Group>(null);

  // Palette from reference
  const colors = {
    olive: "#4b5332",       // Base Camo Green
    deepGreen: "#2d341c",   // Dark Camo Green
    slate: "#3c444c",       // Mechanical Gray/Blue
    brown: "#2b261d",       // Dark Accent
    orange: "#d97706",      // Numbering/Warning
    yellow: "#eab308",      // Blade tips
    red: "#b91c1c",         // Star detail
  };

  useFrame((state, delta) => {
    if (rotorLowerRef.current) rotorLowerRef.current.rotation.y -= 22 * delta;
    if (rotorUpperRef.current) rotorUpperRef.current.rotation.y += 22 * delta;
  });

  return (
    <group {...props}>
      {/* ─────────────────────────────────────────────────────────────────
          MAIN HULL (Faceted & Camouflaged)
          ───────────────────────────────────────────────────────────────── */}
      
      {/* Nose Section - Multi-faceted wedge */}
      <group position={[0, 0, 1.2]}>
        {/* Upper Nose */}
        <mesh castShadow position={[0, 0.1, 0.3]}>
          <boxGeometry args={[0.6, 0.4, 0.8]} />
          <meshStandardMaterial color={colors.olive} flatShading />
        </mesh>
        {/* Lower Nose Wedge */}
        <mesh castShadow position={[0, -0.15, 0.4]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.7]} />
          <meshStandardMaterial color={colors.deepGreen} flatShading />
        </mesh>
        {/* Pitot Tube / Probe */}
        <mesh castShadow position={[0.2, 0.2, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 4]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>
        {/* Sensor Turret (Under nose) */}
        <mesh castShadow position={[0, -0.3, 0.4]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>
      </group>

      {/* Cockpit Section */}
      <group position={[0, 0.4, 0.6]}>
        {/* Main Glass Area */}
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.6, 0.8]} />
          <meshStandardMaterial color="#0a0f1a" flatShading metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Frame / Camo mix */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.72, 0.15, 0.82]} />
          <meshStandardMaterial color={colors.olive} flatShading />
        </mesh>
      </group>

      {/* Main Body / Midsection */}
      <mesh castShadow position={[0, 0, -0.2]}>
        <boxGeometry args={[0.9, 0.9, 1.4]} />
        <meshStandardMaterial color={colors.olive} flatShading />
      </mesh>

      {/* Side Engine Intakes (Round mechanical pods) */}
      {[0.5, -0.5].map((x, i) => (
        <group key={i} position={[x, 0.25, 0.1]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.6, 8]} />
            <meshStandardMaterial color={colors.slate} flatShading />
          </mesh>
          {/* Intake Guard */}
          <mesh position={[0, 0, 0.3]}>
            <boxGeometry args={[0.3, 0.3, 0.05]} />
            <meshStandardMaterial color={colors.brown} flatShading />
          </mesh>
          {/* "50" Marking (Simplified) */}
          <mesh position={[x > 0 ? 0.26 : -0.26, 0.1, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.3]} />
            <meshStandardMaterial color={colors.orange} flatShading />
          </mesh>
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────────
          TAIL SECTION
          ───────────────────────────────────────────────────────────────── */}
      
      {/* Tail Boom */}
      <mesh castShadow position={[0, 0.1, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 1.2, 5]} />
        <meshStandardMaterial color={colors.olive} flatShading />
      </mesh>

      {/* Horizontal Stabilizer (The "T" shape at rear) */}
      <group position={[0, 0.2, -2.0]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 0.1, 0.5]} />
          <meshStandardMaterial color={colors.olive} flatShading />
        </mesh>
        {/* Tip Fins */}
        {[0.8, -0.8].map((x, i) => (
          <mesh key={i} position={[x, 0.2, 0]}>
            <boxGeometry args={[0.05, 0.4, 0.4]} />
            <meshStandardMaterial color={colors.olive} flatShading />
          </mesh>
        ))}
      </group>

      {/* Vertical Fin (The large one) */}
      <group position={[0, 0.7, -2.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 1.0, 0.6]} />
          <meshStandardMaterial color={colors.olive} flatShading />
        </mesh>
        {/* Red Star Marking */}
        <mesh position={[0.06, 0.2, 0]}>
          <boxGeometry args={[0.02, 0.2, 0.2]} />
          <meshStandardMaterial color={colors.red} flatShading />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────────
          WINGS & ARMAMENT
          ───────────────────────────────────────────────────────────────── */}
      
      {/* Stub Wings */}
      <mesh castShadow position={[0, -0.1, -0.2]}>
        <boxGeometry args={[2.8, 0.15, 0.6]} />
        <meshStandardMaterial color={colors.deepGreen} flatShading />
      </mesh>

      {/* Weapon Loadout (Pods + Missiles) */}
      {[1.1, -1.1].map((x, i) => (
        <group key={i} position={[x, -0.3, -0.1]}>
          {/* Rocket Pod (Honeycombed cylinder) */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.6, 6]} />
            <meshStandardMaterial color={colors.slate} flatShading />
          </mesh>
          {/* Missiles (Outer racks) */}
          <group position={[x > 0 ? 0.3 : -0.3, -0.1, 0]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.7, 4]} />
              <meshStandardMaterial color={colors.olive} flatShading />
            </mesh>
            <mesh position={[0, 0, 0.3]}>
              <boxGeometry args={[0.15, 0.15, 0.1]} />
              <meshStandardMaterial color={colors.orange} flatShading />
            </mesh>
          </group>
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────────
          COAXIAL ROTOR SYSTEM
          ───────────────────────────────────────────────────────────────── */}
      
      <group position={[0, 0.5, -0.1]}>
        {/* Mast */}
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.14, 1.4, 6]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>

        {/* Rotors */}
        {[0, 0.7].map((yOffset, rotorIdx) => (
          <group key={rotorIdx} position={[0, yOffset + 0.1, 0]} ref={rotorIdx === 0 ? rotorLowerRef : rotorUpperRef}>
            <mesh>
              <cylinderGeometry args={[0.22, 0.22, 0.2, 8]} />
              <meshStandardMaterial color={colors.slate} flatShading />
            </mesh>
            {[0, 1, 2].map((i) => (
              <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
                {/* Main Blade */}
                <mesh position={[0, 0, 2.0]}>
                  <boxGeometry args={[0.3, 0.04, 3.8]} />
                  <meshStandardMaterial color={colors.slate} flatShading />
                </mesh>
                {/* Yellow Tip */}
                <mesh position={[0, 0, 3.9]}>
                  <boxGeometry args={[0.32, 0.05, 0.2]} />
                  <meshStandardMaterial color={colors.yellow} flatShading />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* ─────────────────────────────────────────────────────────────────
          LANDING GEAR
          ───────────────────────────────────────────────────────────────── */}
      
      {/* Nose Gear */}
      <group position={[0, -0.6, 1.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>
        <mesh castShadow position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 6]} />
          <meshStandardMaterial color="#0a0a0a" flatShading />
        </mesh>
      </group>

      {/* Main Gear */}
      {[0.6, -0.6].map((x, i) => (
        <group key={i} position={[x, -0.6, -0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial color={colors.slate} flatShading />
          </mesh>
          <mesh castShadow position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.12, 6]} />
            <meshStandardMaterial color="#0a0a0a" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}




