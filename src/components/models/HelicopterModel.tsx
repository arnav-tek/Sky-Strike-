import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Premium Low-Poly Modern Helicopter Models System (Ka-50, Mi-28, AH-64)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * An advanced, visually spectacular 3D asset system rendering 3 distinct
 * modern military attack helicopters based on the store's selectedHelicopter.
 *
 * 1. KA-50 BLACK SHARK:
 *    • Tapered aerodynamic single-seat stealth cockpit in tactical matte black camos.
 *    • Advanced Coaxial Rotor System: Contra-rotating dual rotors spinning in
 *      opposite directions (CCW and CW) on a single tall mast.
 *    • Electromagnetic Electric-Cyan glass canopy coatings.
 *    • No tail rotor (torque is cancelled coaxially!).
 *
 * 2. MI-28 HAVOC:
 *    • Sturdy, boxy heavily-armored tandem stepped cockpits in desert sand camo.
 *    • Heavy single 5-blade main rotor.
 *    • Nose-mounted single-bar heavy autocannon.
 *    • Robust tail boom with a 3-blade tail rotor.
 *
 * 3. BOEING AH-64 APACHE:
 *    • Stepped tandem pilot/gunner cockpits in military olive drab camo.
 *    • Single 4-blade main rotor.
 *    • Main mast mounted AN/APG-78 Longbow Fire Control Radar (FCR) dome.
 *    • Slender tail boom with a 4-blade tail rotor.
 */

export default function HelicopterModel(props: any) {
  const groupRef = useRef<THREE.Group>(null);
  const mainRotorRef = useRef<THREE.Group>(null);
  const coaxialRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);
  const gunRef = useRef<THREE.Group>(null);

  const selectedHelicopter = useStore(state => state.selectedHelicopter);
  const type = props.type || selectedHelicopter || 'ka50';

  useFrame((state, delta) => {
    // ── Main Rotor Spin ──
    if (mainRotorRef.current) {
      mainRotorRef.current.rotation.y -= 22 * delta;
    }

    // ── Coaxial Counter-Rotor Spin (Ka-50 Only) ──
    if (coaxialRotorRef.current) {
      coaxialRotorRef.current.rotation.y += 22 * delta;
    }

    // ── Tail Rotor Spin ──
    if (tailRotorRef.current) {
      tailRotorRef.current.rotation.x += 35 * delta;
    }

    // ── Chin Gun Subtle Tracking ──
    if (gunRef.current) {
      const time = state.clock.getElapsedTime();
      gunRef.current.rotation.y = Math.sin(time * 0.4) * 0.18;
    }

    // ── Hovering Micro-Vibration ──
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const freq = props.isHangarPreview ? 2.5 : 4.5;
      const amp = props.isHangarPreview ? 0.03 : 0.022;
      groupRef.current.position.y = Math.sin(time * freq) * amp;
      
      // Auto-rotation in Hangar Preview
      if (props.isHangarPreview) {
        groupRef.current.rotation.y = time * 0.15;
      }
    }
  });

  // ═══════════════════════════════════════════
  // Camouflage & Color Palette Declarations
  // ═══════════════════════════════════════════
  let camoPrimary = "#2d382e";   // Olive Drab (Default Apache)
  let camoSecondary = "#1f261f"; // Shaded Dark Olive
  let camoHighlight = "#3e4d3f"; // Highlight Olive
  let glassColor = "#cca533";    // Amber Gold
  let metalGunmetal = "#373b3e";  // Gunmetal
  let metalExhaust = "#433e3b";   // Heat Treated Exhaust Metal
  let rotorDark = "#161719";      // Carbon Rotor blades
  let rotorHub = "#292c2f";       // Rotor Hub Metal
  let tireGrey = "#1b1b1d";       // Rubber Tire
  let warningYellow = "#e0b000";  // Yellow Warning
  let warningRed = "#b82020";     // Red Safety strobe
  let sensorGreen = "#00ff55";    // FLIR lens
  let sensorRed = "#ff1a40";      // Seeker Red lens
  let shadowDeep = "#090a0c";     // Exhaust Intake Core

  if (type === 'ka50') {
    // Ka-50 Black Shark: Stealth Matte Black & Electric Cyan Glass
    camoPrimary = "#18181b";     // Dark Carbon Black
    camoSecondary = "#09090b";   // Deep Coal Black
    camoHighlight = "#27272a";   // Shaded Graphite
    glassColor = "#06b6d4";      // Electric Cyan Glow
  } else if (type === 'mi28') {
    // Mi-28 Havoc: Desert Sand camo & Vibrant Orange Glass
    camoPrimary = "#cca46c";     // Sand Tan
    camoSecondary = "#a17a4c";   // Shaded Sandy Brown
    camoHighlight = "#e2b67f";   // Sand Dust highlight
    glassColor = "#f97316";      // Tactical Orange Glow
  }

  // 4-blade or 5-blade arrays
  const mainBladeCount = type === 'mi28' ? 5 : 4;
  const mainBladeAngleStep = (Math.PI * 2) / mainBladeCount;

  return (
    <group {...props} ref={groupRef} scale={1.0} rotation={props.isHangarPreview ? [0.1, 0, 0] : [0, Math.PI / 2, 0]}>

      {/* ══════════════════════════════════════════════════════════════
          1. CENTRAL FUSELAGE
          ══════════════════════════════════════════════════════════════ */}
      {type === 'ka50' ? (
        // Ka-50 Sleek Stealth Fuselage
        <group>
          <mesh position={[0, 0.05, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.6, 1.55]} />
            <meshStandardMaterial color={camoPrimary} roughness={0.5} metalness={0.4} flatShading />
          </mesh>
          <mesh position={[0, -0.3, 0.05]} castShadow>
            <boxGeometry args={[0.38, 0.1, 1.35]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.55} flatShading />
          </mesh>
          {/* Stealth angled side plates */}
          <mesh position={[0.22, -0.05, 0.1]} rotation={[0, 0, -0.15]} castShadow>
            <boxGeometry args={[0.06, 0.52, 1.45]} />
            <meshStandardMaterial color={camoHighlight} roughness={0.5} flatShading />
          </mesh>
          <mesh position={[-0.22, -0.05, 0.1]} rotation={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[0.06, 0.52, 1.45]} />
            <meshStandardMaterial color={camoHighlight} roughness={0.5} flatShading />
          </mesh>
        </group>
      ) : type === 'mi28' ? (
        // Mi-28 Heavily Armored Boxy Fuselage
        <group>
          <mesh position={[0, 0.08, -0.05]} castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.72, 1.5]} />
            <meshStandardMaterial color={camoPrimary} roughness={0.85} metalness={0.1} flatShading />
          </mesh>
          <mesh position={[0, -0.34, -0.1]} castShadow>
            <boxGeometry args={[0.52, 0.15, 1.3]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.88} flatShading />
          </mesh>
          <mesh position={[0, 0.48, -0.32]} castShadow>
            <boxGeometry args={[0.5, 0.2, 1.0]} />
            <meshStandardMaterial color={camoHighlight} roughness={0.8} flatShading />
          </mesh>
        </group>
      ) : (
        // AH-64 Classical Fuselage
        <group>
          <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.54, 0.65, 1.45]} />
            <meshStandardMaterial color={camoPrimary} roughness={0.7} metalness={0.2} flatShading />
          </mesh>
          <mesh position={[0, -0.32, -0.05]} castShadow>
            <boxGeometry args={[0.48, 0.12, 1.25]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.78} metalness={0.25} flatShading />
          </mesh>
          <mesh position={[0, 0.4, -0.22]} castShadow>
            <boxGeometry args={[0.46, 0.22, 1.05]} />
            <meshStandardMaterial color={camoHighlight} roughness={0.65} metalness={0.2} flatShading />
          </mesh>
          {/* EFAB cheeks */}
          <mesh position={[0.34, -0.12, 0.15]} castShadow>
            <boxGeometry args={[0.16, 0.42, 1.55]} />
            <meshStandardMaterial color={camoPrimary} roughness={0.68} metalness={0.2} flatShading />
          </mesh>
          <mesh position={[-0.34, -0.12, 0.15]} castShadow>
            <boxGeometry args={[0.16, 0.42, 1.55]} />
            <meshStandardMaterial color={camoPrimary} roughness={0.68} metalness={0.2} flatShading />
          </mesh>
        </group>
      )}


      {/* ══════════════════════════════════════════════════════════════
          2. COCKPIT CANOPY
          ══════════════════════════════════════════════════════════════ */}
      {type === 'ka50' ? (
        // Ka-50 Pointed Single-Seat Canopy
        <group>
          <mesh position={[0, 0.35, 0.68]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.62]} />
            <meshStandardMaterial
              color={glassColor}
              transparent
              opacity={0.65}
              roughness={0.05}
              metalness={0.9}
              emissive={glassColor}
              emissiveIntensity={0.15}
              flatShading
            />
          </mesh>
          <mesh position={[0, 0.27, 1.0]} rotation={[-0.55, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.02, 0.24]} />
            <meshStandardMaterial
              color={glassColor}
              transparent
              opacity={0.65}
              roughness={0.05}
              metalness={0.9}
              emissive={glassColor}
              emissiveIntensity={0.15}
              flatShading
            />
          </mesh>
          {/* Frames */}
          <mesh position={[0, 0.51, 0.65]}>
            <boxGeometry args={[0.03, 0.025, 0.62]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.35, 0.36]}>
            <boxGeometry args={[0.32, 0.3, 0.03]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.7} />
          </mesh>
        </group>
      ) : type === 'mi28' ? (
        // Mi-28 Heavily Segmented Boxy Tandem Canopy
        <group>
          <mesh position={[0, 0.34, 0.72]} castShadow>
            <boxGeometry args={[0.38, 0.3, 0.44]} />
            <meshStandardMaterial
              color={glassColor}
              transparent
              opacity={0.6}
              roughness={0.08}
              metalness={0.8}
              emissive={glassColor}
              emissiveIntensity={0.1}
              flatShading
            />
          </mesh>
          <mesh position={[0, 0.52, 0.22]} castShadow>
            <boxGeometry args={[0.38, 0.38, 0.54]} />
            <meshStandardMaterial
              color={glassColor}
              transparent
              opacity={0.6}
              roughness={0.08}
              metalness={0.8}
              emissive={glassColor}
              emissiveIntensity={0.1}
              flatShading
            />
          </mesh>
          {/* Vertical and horizontal armored window frames */}
          <mesh position={[0, 0.34, 0.5]}>
            <boxGeometry args={[0.4, 0.32, 0.04]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} />
          </mesh>
          <mesh position={[0.2, 0.34, 0.72]}>
            <boxGeometry args={[0.02, 0.32, 0.02]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} />
          </mesh>
          <mesh position={[-0.2, 0.34, 0.72]}>
            <boxGeometry args={[0.02, 0.32, 0.02]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} />
          </mesh>
          <mesh position={[0.2, 0.52, 0.22]}>
            <boxGeometry args={[0.02, 0.4, 0.02]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} />
          </mesh>
          <mesh position={[-0.2, 0.52, 0.22]}>
            <boxGeometry args={[0.02, 0.4, 0.02]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} />
          </mesh>
        </group>
      ) : (
        // AH-64 Tandem Canopy (Original)
        <group>
          <mesh position={[0, 0.28, 0.74]} castShadow>
            <boxGeometry args={[0.34, 0.28, 0.48]} />
            <meshStandardMaterial color={glassColor} transparent opacity={0.62} roughness={0.06} metalness={0.88} emissive={glassColor} emissiveIntensity={0.08} flatShading />
          </mesh>
          <mesh position={[0, 0.22, 1.0]} rotation={[-0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.34, 0.02, 0.22]} />
            <meshStandardMaterial color={glassColor} transparent opacity={0.62} roughness={0.06} metalness={0.88} emissive={glassColor} emissiveIntensity={0.08} flatShading />
          </mesh>
          <mesh position={[0, 0.45, 0.24]} castShadow>
            <boxGeometry args={[0.34, 0.36, 0.58]} />
            <meshStandardMaterial color={glassColor} transparent opacity={0.62} roughness={0.06} metalness={0.88} emissive={glassColor} emissiveIntensity={0.08} flatShading />
          </mesh>
          <mesh position={[0, 0.41, 0.55]} rotation={[-0.5, 0, 0]} castShadow>
            <boxGeometry args={[0.34, 0.02, 0.24]} />
            <meshStandardMaterial color={glassColor} transparent opacity={0.62} roughness={0.06} metalness={0.88} emissive={glassColor} emissiveIntensity={0.08} flatShading />
          </mesh>
          <mesh position={[0, 0.32, 0.51]}>
            <boxGeometry args={[0.36, 0.32, 0.035]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.48, -0.06]}>
            <boxGeometry args={[0.36, 0.38, 0.035]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.635, 0.24]}>
            <boxGeometry args={[0.03, 0.025, 0.58]} />
            <meshStandardMaterial color={camoSecondary} roughness={0.8} metalness={0.3} />
          </mesh>
        </group>
      )}


      {/* ══════════════════════════════════════════════════════════════
          3. CHIN GUN / NOSE TURRET SENSORS
          ══════════════════════════════════════════════════════════════ */}
      {type === 'ka50' ? (
        // Ka-50 undernose search sensors & static side cannon
        <group>
          <mesh position={[0, -0.18, 1.1]} castShadow>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[0, -0.32, 1.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
            <meshStandardMaterial color={metalGunmetal} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.32, 1.21]}>
            <circleGeometry args={[0.04]} />
            <meshStandardMaterial color={sensorGreen} emissive={sensorGreen} emissiveIntensity={0.2} />
          </mesh>
          {/* Side-mounted 30mm Shipunov 2A42 Autocannon (Standard Ka-50 starboard side mount) */}
          <group ref={gunRef} position={[-0.24, -0.2, 0.3]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.08, 0.35]} />
              <meshStandardMaterial color={rotorHub} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.015, 0.55, 6]} />
              <meshStandardMaterial color={shadowDeep} metalness={0.9} />
            </mesh>
          </group>
        </group>
      ) : type === 'mi28' ? (
        // Mi-28 Undernose heavy NPPU-28 Turret with M230-style single bar
        <group ref={gunRef} position={[0, -0.44, 0.72]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.08, 8]} />
            <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.09, 0.05]} castShadow>
            <boxGeometry args={[0.1, 0.13, 0.3]} />
            <meshStandardMaterial color={rotorHub} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.11, 0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.022, 0.72, 8]} />
            <meshStandardMaterial color={shadowDeep} metalness={0.95} />
          </mesh>
          {/* Large muzzle stabilizer */}
          <mesh position={[0, -0.11, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.05, 8]} />
            <meshStandardMaterial color={metalGunmetal} />
          </mesh>
        </group>
      ) : (
        // AH-64 Apache Undernose Turret & Chin M230 Gun (Original)
        <group>
          <group position={[0, -0.1, 1.1]}>
            <mesh position={[0, -0.05, 0.1]} castShadow>
              <boxGeometry args={[0.36, 0.36, 0.35]} />
              <meshStandardMaterial color={camoPrimary} flatShading />
            </mesh>
            <mesh position={[0, 0.14, 0.12]} castShadow><cylinderGeometry args={[0.065, 0.065, 0.05, 8]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
            <mesh position={[0, 0.20, 0.14]} castShadow><sphereGeometry args={[0.065, 8, 8]} /><meshStandardMaterial color={rotorHub} /></mesh>
            <mesh position={[0, 0.20, 0.205]}><circleGeometry args={[0.038]} /><meshStandardMaterial color={sensorGreen} emissive={sensorGreen} emissiveIntensity={0.2} /></mesh>
            <group position={[0, -0.15, 0.26]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.115, 0.115, 0.08, 10]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
              <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.11, 0.11, 0.22, 12]} /><meshStandardMaterial color={rotorHub} /></mesh>
              <mesh position={[0.075, 0.03, 0.165]}><circleGeometry args={[0.046]} /><meshStandardMaterial color={sensorGreen} emissive={sensorGreen} emissiveIntensity={0.3} /></mesh>
              <mesh position={[-0.075, -0.02, 0.165]}><circleGeometry args={[0.036]} /><meshStandardMaterial color={sensorRed} emissive={sensorRed} emissiveIntensity={0.3} /></mesh>
            </group>
          </group>
          <group ref={gunRef} position={[0, -0.42, 0.65]}>
            <mesh castShadow><cylinderGeometry args={[0.09, 0.09, 0.09, 8]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
            <mesh position={[0, -0.1, 0.02]} castShadow><boxGeometry args={[0.095, 0.12, 0.26]} /><meshStandardMaterial color={rotorHub} /></mesh>
            <mesh position={[0, -0.13, 0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.014, 0.018, 0.66, 8]} /><meshStandardMaterial color={shadowDeep} /></mesh>
            <mesh position={[0, -0.13, 0.7]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.022, 0.022, 0.045, 8]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
          </group>
        </group>
      )}


      {/* ══════════════════════════════════════════════════════════════
          4. ENGINES & STUB WINGS
          ══════════════════════════════════════════════════════════════ */}
      {type === 'ka50' ? (
        // Ka-50 streamlined side engines & smaller high-aspect stub wings
        <group>
          {/* Left Engine */}
          <mesh position={[0.26, 0.2, -0.2]} castShadow>
            <boxGeometry args={[0.22, 0.22, 0.88]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[0.26, 0.2, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 8]} />
            <meshStandardMaterial color={metalGunmetal} />
          </mesh>
          <mesh position={[0.3, 0.14, -0.66]} rotation={[0.2, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.28, 8]} />
            <meshStandardMaterial color={metalExhaust} />
          </mesh>
          {/* Right Engine */}
          <mesh position={[-0.26, 0.2, -0.2]} castShadow>
            <boxGeometry args={[0.22, 0.22, 0.88]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[-0.26, 0.2, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 8]} />
            <meshStandardMaterial color={metalGunmetal} />
          </mesh>
          <mesh position={[-0.3, 0.14, -0.66]} rotation={[0.2, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.28, 8]} />
            <meshStandardMaterial color={metalExhaust} />
          </mesh>

          {/* Ka-50 Stub Wings */}
          <mesh position={[0.44, 0.08, 0]} rotation={[0, 0, -0.06]} castShadow>
            <boxGeometry args={[0.48, 0.05, 0.28]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[-0.44, 0.08, 0]} rotation={[0, 0, 0.06]} castShadow>
            <boxGeometry args={[0.48, 0.05, 0.28]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          
          {/* Outboard endplate fins */}
          <mesh position={[0.68, 0.06, 0]} castShadow><boxGeometry args={[0.02, 0.15, 0.24]} /><meshStandardMaterial color={camoSecondary} /></mesh>
          <mesh position={[-0.68, 0.06, 0]} castShadow><boxGeometry args={[0.02, 0.15, 0.24]} /><meshStandardMaterial color={camoSecondary} /></mesh>

          {/* Underwing Weapons pylons & rocket pods */}
          <group position={[0.34, -0.1, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.11, 0.11, 0.38, 8]} /><meshStandardMaterial color={camoSecondary} /></mesh>
            <mesh position={[0, 0, 0.195]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.1, 8]} /><meshStandardMaterial color={shadowDeep} /></mesh>
          </group>
          <group position={[-0.34, -0.1, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.11, 0.11, 0.38, 8]} /><meshStandardMaterial color={camoSecondary} /></mesh>
            <mesh position={[0, 0, 0.195]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.1, 8]} /><meshStandardMaterial color={shadowDeep} /></mesh>
          </group>
        </group>
      ) : type === 'mi28' ? (
        // Mi-28 heavy armored twin engines & boxy stub wings
        <group>
          {/* Left Engine */}
          <mesh position={[0.38, 0.28, -0.1]} castShadow>
            <boxGeometry args={[0.26, 0.26, 0.95]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[0.38, 0.28, 0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
            <meshStandardMaterial color={metalGunmetal} />
          </mesh>
          <mesh position={[0.42, 0.18, -0.62]} rotation={[0.22, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.32, 8]} />
            <meshStandardMaterial color={metalExhaust} />
          </mesh>
          {/* Right Engine */}
          <mesh position={[-0.38, 0.28, -0.1]} castShadow>
            <boxGeometry args={[0.26, 0.26, 0.95]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[-0.38, 0.28, 0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
            <meshStandardMaterial color={metalGunmetal} />
          </mesh>
          <mesh position={[-0.42, 0.18, -0.62]} rotation={[0.22, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.32, 8]} />
            <meshStandardMaterial color={metalExhaust} />
          </mesh>

          {/* Mi-28 Stub Wings */}
          <mesh position={[0.56, 0.1, 0.05]} rotation={[0, 0, -0.08]} castShadow>
            <boxGeometry args={[0.54, 0.06, 0.36]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[-0.56, 0.1, 0.05]} rotation={[0, 0, 0.08]} castShadow>
            <boxGeometry args={[0.54, 0.06, 0.36]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>

          {/* Wingtip endplates */}
          <mesh position={[0.82, 0.04, 0.05]} castShadow><boxGeometry args={[0.03, 0.18, 0.32]} /><meshStandardMaterial color={camoSecondary} /></mesh>
          <mesh position={[-0.82, 0.04, 0.05]} castShadow><boxGeometry args={[0.03, 0.18, 0.32]} /><meshStandardMaterial color={camoSecondary} /></mesh>

          {/* Inboard pod mounts (Heavy cylindrical unguided rocket pod) */}
          <group position={[0.44, -0.14, 0.08]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.42, 8]} /><meshStandardMaterial color={camoSecondary} /></mesh>
            <mesh position={[0, 0, 0.215]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.12, 8]} /><meshStandardMaterial color={shadowDeep} /></mesh>
          </group>
          <group position={[-0.44, -0.14, 0.08]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.42, 8]} /><meshStandardMaterial color={camoSecondary} /></mesh>
            <mesh position={[0, 0, 0.215]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.12, 8]} /><meshStandardMaterial color={shadowDeep} /></mesh>
          </group>
        </group>
      ) : (
        // AH-64 Engines & Stub Wings (Original)
        <group>
          <mesh position={[0.34, 0.32, -0.15]} castShadow><boxGeometry args={[0.25, 0.28, 0.95]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[0.34, 0.47, -0.19]} castShadow><boxGeometry args={[0.22, 0.06, 0.78]} /><meshStandardMaterial color={camoHighlight} flatShading /></mesh>
          <mesh position={[0.34, 0.32, 0.33]} castShadow><boxGeometry args={[0.22, 0.24, 0.05]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
          <mesh position={[0.42, 0.24, -0.75]} rotation={[0.25, 0.32, 0]} castShadow><cylinderGeometry args={[0.1, 0.08, 0.35, 8]} /><meshStandardMaterial color={metalExhaust} /></mesh>
          <mesh position={[-0.34, 0.32, -0.15]} castShadow><boxGeometry args={[0.25, 0.28, 0.95]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[-0.34, 0.47, -0.19]} castShadow><boxGeometry args={[0.22, 0.06, 0.78]} /><meshStandardMaterial color={camoHighlight} flatShading /></mesh>
          <mesh position={[-0.34, 0.32, 0.33]} castShadow><boxGeometry args={[0.22, 0.24, 0.05]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
          <mesh position={[-0.42, 0.24, -0.75]} rotation={[0.25, -0.32, 0]} castShadow><cylinderGeometry args={[0.1, 0.08, 0.35, 8]} /><meshStandardMaterial color={metalExhaust} /></mesh>
          
          <mesh position={[0.54, 0.02, 0.1]} rotation={[0, 0, -0.08]} castShadow><boxGeometry args={[0.58, 0.055, 0.34]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[0.82, -0.03, 0.1]} rotation={[0, 0, -0.06]} castShadow><boxGeometry args={[0.04, 0.18, 0.3]} /><meshStandardMaterial color={camoSecondary} flatShading /></mesh>
          <mesh position={[-0.54, 0.02, 0.1]} rotation={[0, 0, 0.08]} castShadow><boxGeometry args={[0.58, 0.055, 0.34]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[-0.82, -0.03, 0.1]} rotation={[0, 0, 0.06]} castShadow><boxGeometry args={[0.04, 0.18, 0.3]} /><meshStandardMaterial color={camoSecondary} flatShading /></mesh>
          
          <group position={[0.42, -0.26, 0.09]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.44, 10]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
            <mesh position={[0, 0, 0.225]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.12, 10]} /><meshStandardMaterial color={shadowDeep} /></mesh>
          </group>
          <group position={[-0.42, -0.26, 0.09]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.44, 10]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
            <mesh position={[0, 0, 0.225]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.12, 10]} /><meshStandardMaterial color={shadowDeep} /></mesh>
          </group>
        </group>
      )}


      {/* ══════════════════════════════════════════════════════════════
          5. TAIL BOOM & TAIL ROTOR counter torque Counter-parts
          ══════════════════════════════════════════════════════════════ */}
      {type === 'ka50' ? (
        // Ka-50 Sleek Tail boom with no tail rotor (replace with dual vertical fin)
        <group position={[0, 0.12, -0.85]}>
          <mesh position={[0, -0.06, -0.24]} castShadow>
            <boxGeometry args={[0.26, 0.28, 0.58]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[0, 0, -0.85]} castShadow>
            <boxGeometry args={[0.15, 0.17, 0.72]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[0, 0.05, -1.45]} castShadow>
            <boxGeometry args={[0.08, 0.11, 0.54]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>

          {/* Large Vertical Stabilizer (Fins) */}
          <mesh position={[0, 0.54, -1.78]} castShadow>
            <boxGeometry args={[0.04, 0.74, 0.38]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          
          {/* Slanted tip tail fin cap */}
          <mesh position={[0, 0.9, -1.82]} castShadow>
            <boxGeometry args={[0.044, 0.08, 0.24]} />
            <meshStandardMaterial color={camoHighlight} />
          </mesh>

          {/* Ka-50 Large swept back horizontal stabilizer */}
          <mesh position={[0, 0.18, -1.45]} castShadow>
            <boxGeometry args={[0.74, 0.03, 0.26]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          {/* Outboard endplates on horizontal stabilizer */}
          <mesh position={[0.36, 0.18, -1.45]} castShadow><boxGeometry args={[0.02, 0.16, 0.22]} /><meshStandardMaterial color={camoSecondary} /></mesh>
          <mesh position={[-0.36, 0.18, -1.45]} castShadow><boxGeometry args={[0.02, 0.16, 0.22]} /><meshStandardMaterial color={camoSecondary} /></mesh>
        </group>
      ) : type === 'mi28' ? (
        // Mi-28 massive tapered boom and 3-blade tail rotor
        <group position={[0, 0.16, -0.85]}>
          <mesh position={[0, -0.04, -0.22]} castShadow>
            <boxGeometry args={[0.34, 0.35, 0.56]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[0, 0.02, -0.82]} castShadow>
            <boxGeometry args={[0.22, 0.22, 0.74]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>
          <mesh position={[0, 0.08, -1.42]} castShadow>
            <boxGeometry args={[0.12, 0.15, 0.52]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>

          {/* Large Vertical Stabilizer fin */}
          <mesh position={[0, 0.55, -1.8]} castShadow>
            <boxGeometry args={[0.05, 0.8, 0.42]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>

          {/* Swept back Horizontal Stabilizer (single-sided right mount typical for Havoc) */}
          <mesh position={[-0.26, 0.22, -1.5]} rotation={[0, 0, -0.1]} castShadow>
            <boxGeometry args={[0.42, 0.035, 0.22]} />
            <meshStandardMaterial color={camoPrimary} flatShading />
          </mesh>

          {/* ─── ACTIVE 3-BLADE TAIL ROTOR (Left side typical for Havoc) ─── */}
          <group position={[0.08, 0.65, -1.82]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.028, 0.028, 0.08, 6]} /><meshStandardMaterial color={rotorHub} /></mesh>
            {/* 3 active spinning blades */}
            <group ref={tailRotorRef} position={[0.042, 0, 0]}>
              {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rot, i) => (
                <mesh key={`mi-tail-${i}`} rotation={[rot, 0, 0]} position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[0.01, 0.56, 0.045]} />
                  <meshStandardMaterial color={rotorDark} />
                </mesh>
              ))}
            </group>
          </group>
        </group>
      ) : (
        // AH-64 Tail Boom & 4-blade Tail Rotor (Original)
        <group position={[0, 0.12, -0.85]}>
          <mesh position={[0, -0.06, -0.24]} castShadow><boxGeometry args={[0.3, 0.32, 0.58]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[0, 0, -0.85]} castShadow><boxGeometry args={[0.18, 0.2, 0.72]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[0, 0.05, -1.45]} castShadow><boxGeometry args={[0.1, 0.13, 0.54]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[0, 0.5, -1.82]} castShadow><boxGeometry args={[0.05, 0.78, 0.38]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[0, 0.16, -1.72]} castShadow><boxGeometry args={[0.82, 0.034, 0.26]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
          <mesh position={[0.4, 0.16, -1.72]} castShadow><boxGeometry args={[0.025, 0.14, 0.24]} /><meshStandardMaterial color={camoSecondary} /></mesh>
          <mesh position={[-0.4, 0.16, -1.72]} castShadow><boxGeometry args={[0.025, 0.14, 0.24]} /><meshStandardMaterial color={camoSecondary} /></mesh>
          
          <group position={[-0.08, 0.62, -1.9]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.026, 0.026, 0.09, 8]} /><meshStandardMaterial color={rotorHub} /></mesh>
            <group ref={tailRotorRef} position={[-0.05, 0, 0]}>
              <mesh castShadow><boxGeometry args={[0.01, 0.58, 0.042]} /><meshStandardMaterial color={rotorDark} /></mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><boxGeometry args={[0.01, 0.58, 0.042]} /><meshStandardMaterial color={rotorDark} /></mesh>
            </group>
          </group>
        </group>
      )}


      {/* ══════════════════════════════════════════════════════════════
          6. LANDING GEAR WHEELS
          ══════════════════════════════════════════════════════════════ */}
      <group position={[0, -0.32, 0]}>
        {/* Port Wheel struts */}
        <mesh position={[0.26, -0.06, 0.52]} rotation={[0.2, 0, -0.3]} castShadow>
          <boxGeometry args={[0.05, 0.22, 0.05]} />
          <meshStandardMaterial color={camoPrimary} />
        </mesh>
        <mesh position={[0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 8]} />
          <meshStandardMaterial color={tireGrey} roughness={0.85} />
        </mesh>
        <mesh position={[0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.088, 6]} />
          <meshStandardMaterial color={metalGunmetal} />
        </mesh>

        {/* Starboard Wheel struts */}
        <mesh position={[-0.26, -0.06, 0.52]} rotation={[0.2, 0, 0.3]} castShadow>
          <boxGeometry args={[0.05, 0.22, 0.05]} />
          <meshStandardMaterial color={camoPrimary} />
        </mesh>
        <mesh position={[-0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 8]} />
          <meshStandardMaterial color={tireGrey} roughness={0.85} />
        </mesh>
        <mesh position={[-0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.088, 6]} />
          <meshStandardMaterial color={metalGunmetal} />
        </mesh>

        {/* Tailwheel */}
        <mesh position={[0, -0.08, -1.82]} rotation={[0.35, 0, 0]} castShadow><boxGeometry args={[0.03, 0.16, 0.03]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
        <mesh position={[0, -0.16, -1.9]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.055, 0.055, 0.04, 6]} /><meshStandardMaterial color={tireGrey} /></mesh>
      </group>


      {/* ══════════════════════════════════════════════════════════════
          7. MAIN ROTOR SYSTEM
          ══════════════════════════════════════════════════════════════ */}
      {type === 'ka50' ? (
        // Ka-50 Advanced Coaxial Dual-Rotor System (Mast has two spinning rotor couplers)
        <group position={[0, 0.44, -0.1]}>
          {/* Main transmission base */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.12, 8]} />
            <meshStandardMaterial color={camoSecondary} />
          </mesh>
          {/* Tall Coaxial Steel Mast Shaft */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.48, 8]} />
            <meshStandardMaterial color="#dddddd" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* LOWER ROTOR ASSEMBLY (Spins CCW) */}
          <group ref={mainRotorRef} position={[0, 0.16, 0]}>
            <mesh castShadow><cylinderGeometry args={[0.09, 0.09, 0.04, 8]} /><meshStandardMaterial color={rotorHub} /></mesh>
            {/* 3 Carbon Blades */}
            {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rot, i) => (
              <mesh key={`ka-lower-${i}`} rotation={[0, rot, 0]} position={[0, 0, 0]} castShadow>
                <boxGeometry args={[2.1, 0.012, 0.1]} />
                <meshStandardMaterial color={rotorDark} roughness={0.8} />
              </mesh>
            ))}
          </group>

          {/* UPPER ROTOR ASSEMBLY (Spins CW - Taller mast mount) */}
          <group ref={coaxialRotorRef} position={[0, 0.42, 0]}>
            <mesh castShadow><cylinderGeometry args={[0.09, 0.09, 0.04, 8]} /><meshStandardMaterial color={rotorHub} /></mesh>
            {/* 3 Carbon Blades */}
            {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rot, i) => (
              <mesh key={`ka-upper-${i}`} rotation={[0, rot, 0]} position={[0, 0, 0]} castShadow>
                <boxGeometry args={[2.1, 0.012, 0.1]} />
                <meshStandardMaterial color={rotorDark} roughness={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      ) : (
        // AH-64 and Mi-28 Single Main Rotor System
        <group position={[0, 0.49, -0.15]}>
          <mesh position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.09, 0.12, 0.14, 8]} /><meshStandardMaterial color={camoSecondary} /></mesh>
          <mesh position={[0, 0.18, 0]} castShadow><cylinderGeometry args={[0.035, 0.035, 0.28, 8]} /><meshStandardMaterial color="#dddddd" metalness={0.9} /></mesh>
          <mesh position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[0.08, 0.08, 0.035, 8]} /><meshStandardMaterial color={rotorHub} /></mesh>
          
          {/* Rotor hub head */}
          <mesh position={[0, 0.23, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.045, 10]} />
            <meshStandardMaterial color={rotorHub} />
          </mesh>

          {/* MAIN ROTOR BLADES ASSEMBLY */}
          <group ref={mainRotorRef} position={[0, 0.25, 0]}>
            {Array.from({ length: mainBladeCount }).map((_, i) => {
              const angle = i * mainBladeAngleStep;
              return (
                <mesh key={`blade-${i}`} rotation={[0, angle, 0]} position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[2.15, 0.015, 0.105]} />
                  <meshStandardMaterial color={rotorDark} roughness={0.85} />
                </mesh>
              );
            })}
          </group>

          {/* Longbow Dome (Only for Apache ah64) */}
          {type === 'ah64' && (
            <group>
              <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.03, 0.035, 0.16, 6]} /><meshStandardMaterial color={metalGunmetal} /></mesh>
              <mesh position={[0, 0.47, 0]} castShadow><cylinderGeometry args={[0.34, 0.34, 0.13, 16]} /><meshStandardMaterial color={camoPrimary} flatShading /></mesh>
            </group>
          )}
        </group>
      )}

      {/* Warning navigation Wingtip lights */}
      <mesh position={[0.825, 0.05, 0.12]}><sphereGeometry args={[0.025, 6, 6]} /><meshBasicMaterial color="#ff052b" /></mesh>
      <mesh position={[-0.825, 0.05, 0.12]}><sphereGeometry args={[0.025, 6, 6]} /><meshBasicMaterial color="#05ff3a" /></mesh>
      <mesh position={[0, -0.38, 0]}><sphereGeometry args={[0.028, 6, 6]} /><meshBasicMaterial color={warningRed} /></mesh>

    </group>
  );
}
