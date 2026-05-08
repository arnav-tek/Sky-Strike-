import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PS1-style Kamov Ka-50 "Black Shark" 
 * Tail assembly corrected to match reference image layout.
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
          MAIN HULL (Faceted & Aggressive)
          ───────────────────────────────────────────────────────────────── */}
      
      {/* Nose Section - Stepped Faceted Wedge */}
      <group position={[0, 0, 1.0]}>
        <mesh castShadow position={[0, -0.1, 1.0]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.4, 0.2, 0.6]} />
          <meshStandardMaterial color={colors.deepGreen} flatShading />
        </mesh>
        <mesh castShadow position={[0, 0, 0.4]}>
          <boxGeometry args={[0.65, 0.6, 1.0]} />
          <meshStandardMaterial color={colors.olive} flatShading />
        </mesh>
        <mesh castShadow position={[0.2, 0.3, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 4]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>
        <mesh castShadow position={[0, -0.4, 0.6]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.25]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>
      </group>

      {/* Cockpit Canopy */}
      <group position={[0, 0.45, 0.5]}>
        <mesh castShadow position={[0, -0.1, 0.4]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.6]} />
          <meshStandardMaterial color="#0a1525" flatShading metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh castShadow position={[0, 0, -0.1]}>
          <boxGeometry args={[0.7, 0.6, 0.7]} />
          <meshStandardMaterial color="#0a1525" flatShading metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.3, -0.1]}>
          <boxGeometry args={[0.72, 0.08, 0.72]} />
          <meshStandardMaterial color={colors.olive} flatShading />
        </mesh>
      </group>

      {/* Midsection Core */}
      <mesh castShadow position={[0, 0.1, -0.3]}>
        <boxGeometry args={[1.0, 1.0, 1.6]} />
        <meshStandardMaterial color={colors.olive} flatShading />
      </mesh>

      {/* Red Star Marking on Mid-Rear Fuselage */}
      <mesh position={[0.51, 0.1, -0.6]}>
        <boxGeometry args={[0.02, 0.22, 0.22]} />
        <meshStandardMaterial color={colors.red} flatShading />
      </mesh>

      {/* Side Engine Pods */}
      {[0.55, -0.55].map((x, i) => (
        <group key={i} position={[x, 0.3, 0.1]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.8, 6]} />
            <meshStandardMaterial color={colors.slate} flatShading />
          </mesh>
          <mesh position={[0, 0, 0.35]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color={colors.brown} flatShading />
          </mesh>
          <mesh position={[x > 0 ? 0.3 : -0.3, 0.1, 0]}>
            <boxGeometry args={[0.02, 0.25, 0.35]} />
            <meshStandardMaterial color={colors.orange} flatShading />
          </mesh>
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────────
          TAIL ASSEMBLY (Corrected Layout)
          ───────────────────────────────────────────────────────────────── */}
      
      {/* Tail Boom - Longer and more tapered */}
      <mesh castShadow position={[0, 0.15, -1.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.18, 2.0, 5]} />
        <meshStandardMaterial color={colors.olive} flatShading />
      </mesh>

      {/* Horizontal Stabilizers - Moved Forward (Approx halfway along boom) */}
      <group position={[0, 0.2, -1.3]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.08, 0.5]} />
          <meshStandardMaterial color={colors.deepGreen} flatShading />
        </mesh>
        {/* Vertical Tip Fins */}
        {[0.9, -0.9].map((x, i) => (
          <mesh key={i} position={[x, 0.15, 0]}>
            <boxGeometry args={[0.05, 0.45, 0.4]} />
            <meshStandardMaterial color={colors.olive} flatShading />
          </mesh>
        ))}
      </group>

      {/* Main Vertical Fin - Placed at the very end */}
      <group position={[0, 0.8, -2.6]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 1.3, 0.7]} />
          <meshStandardMaterial color={colors.olive} flatShading />
        </mesh>
        {/* Red Star Marking on Fin */}
        <mesh position={[0.06, 0.35, 0]}>
          <boxGeometry args={[0.02, 0.25, 0.25]} />
          <meshStandardMaterial color={colors.red} flatShading />
        </mesh>
        {/* Tail Fin Foot detail */}
        <mesh position={[0, -0.65, 0.1]}>
          <boxGeometry args={[0.12, 0.1, 0.8]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────────
          WINGS & WEAPONS
          ───────────────────────────────────────────────────────────────── */}
      
      <mesh castShadow position={[0, 0, -0.2]}>
        <boxGeometry args={[3.2, 0.18, 0.8]} />
        <meshStandardMaterial color={colors.deepGreen} flatShading />
      </mesh>

      {[1.2, -1.2].map((x, i) => (
        <group key={i} position={[x, -0.25, -0.1]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.8, 8]} />
            <meshStandardMaterial color={colors.slate} flatShading />
          </mesh>
          <group position={[x > 0 ? 0.35 : -0.35, -0.1, 0]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.9, 4]} />
              <meshStandardMaterial color={colors.olive} flatShading />
            </mesh>
            <mesh position={[0, 0, 0.4]}>
              <boxGeometry args={[0.2, 0.2, 0.1]} />
              <meshStandardMaterial color={colors.orange} flatShading />
            </mesh>
          </group>
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────────
          COAXIAL ROTOR SYSTEM
          ───────────────────────────────────────────────────────────────── */}
      
      <group position={[0, 0.6, -0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.18, 1.8, 6]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>

        {[0, 0.8].map((yOffset, rotorIdx) => (
          <group key={rotorIdx} position={[0, yOffset - 0.1, 0]} ref={rotorIdx === 0 ? rotorLowerRef : rotorUpperRef}>
            <mesh>
              <cylinderGeometry args={[0.28, 0.3, 0.25, 8]} />
              <meshStandardMaterial color={colors.slate} flatShading />
            </mesh>
            {[0, 1, 2].map((i) => (
              <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
                <mesh position={[0, 0, 2.2]}>
                  <boxGeometry args={[0.4, 0.05, 4.2]} />
                  <meshStandardMaterial color={colors.slate} flatShading />
                </mesh>
                <mesh position={[0, 0, 4.35]}>
                  <boxGeometry args={[0.42, 0.06, 0.25]} />
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
      
      <group position={[0, -0.6, 1.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color={colors.slate} flatShading />
        </mesh>
        <mesh castShadow position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.15, 6]} />
          <meshStandardMaterial color="#050505" flatShading />
        </mesh>
      </group>

      {[0.7, -0.7].map((x, i) => (
        <group key={i} position={[x, -0.6, -0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial color={colors.slate} flatShading />
          </mesh>
          <mesh castShadow position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.15, 6]} />
            <meshStandardMaterial color="#050505" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}






