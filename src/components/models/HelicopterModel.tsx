import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Premium Low-Poly Boeing AH-64 Apache Attack Helicopter
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Highly detailed, authentic recreation of the iconic AH-64 Apache.
 * Constructed from THREE.js primitives styled with a premium military finish.
 *
 * Key Features:
 * ─────────────
 * • Stepped Tandem Cockpit: Copilot/Gunner in front (lower), Pilot in rear (elevated).
 * • Electromagnetic Amber/Gold Shielded Glass for canopy windows.
 * • Extended Forward Avionics Bays (EFABs) cheek fairings running along both sides.
 * • Under-nose M230 30mm chain gun with curved ammo feed chute.
 * • Nose-mounted TADS/PNVS (Target Acquisition & Designation Sights) sensor turret.
 * • Single 4-blade main rotor with highly detailed hub, swashplate, and linkages.
 * • AN/APG-78 Longbow Fire Control Radar (FCR) dome mounted on the main mast.
 * • Twin GE T700 engine nacelles with curved intakes and angled IR-suppressing exhausts.
 * • Stub wings carrying M261 Hydra 70 rocket pods and AGM-114 Hellfire quad-missiles.
 * • Slender tapered tail boom with active 4-blade tail rotor and moving stabilator.
 * • Fixed tricycle heavy-duty landing gear with rubber tires and chrome shock struts.
 *
 * Component Hierarchy:
 * ────────────────────
 * ApacheGroup (root)
 *  ├── Fuselage (slender core, bottom armor plates)
 *  │    ├── EFABCheeks (left/right prominent sponsons)
 *  │    └── SteppedCockpit (tandem front/rear canopy, structural frames)
 *  ├── NoseSensors (TADS/PNVS rotating turret, avionic probes)
 *  ├── ChinGun (M230 chain gun, receiver, ammo feed, long barrel)
 *  ├── Engines (left/right turboshaft nacelles, intakes, Black Hole IRSS exhausts)
 *  ├── StubWings (left/right wings, pylons, endplates, nav lights)
 *  │    ├── HydraRocketPods (M261 19-tube cylindrical launchers)
 *  │    └── HellfireMissiles (outboard quad-rail launchers with AGM-114 missiles)
 *  ├── TailBoom (long tapered boom, vertical stabilizer fin, horizontal stabilator)
 *  │    └── TailRotor (active 4-blade torque counter-rotor)
 *  ├── LandingGear (two main struts/wheels, rear trailing-arm tailwheel)
 *  └── MainRotorSystem (mast, swashplate, control rods, 4-blade star grip, Longbow dome)
 *
 * Animations:
 * ───────────
 * • Main Rotor: Spins CCW around Y-axis at 20 rad/s
 * • Tail Rotor: Spins CW around X-axis at 35 rad/s
 * • M230 Chin Gun: Subtle tracking movement
 * • Fuselage: Smooth vibration hovering effect
 */
export default function HelicopterModel(props: any) {
  const groupRef = useRef<THREE.Group>(null);
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);
  const gunRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // ── Main Rotor Spin ──
    if (mainRotorRef.current) {
      mainRotorRef.current.rotation.y -= 20 * delta;
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
      groupRef.current.position.y = Math.sin(time * 4.5) * 0.022;
    }
  });

  // ═══════════════════════════════════════════
  // Boeing AH-64 Apache — Premium Color Palette
  // Standard US Army Helo Drab / Olive Drab Scheme
  // ═══════════════════════════════════════════
  const camoOliveDrab   = "#2d382e";   // Primary military olive drab
  const camoOliveDark   = "#1f261f";   // Deep shaded armor panels
  const camoOliveLight  = "#3e4d3f";   // Highlight panels and upper surfaces
  const metalGunmetal   = "#373b3e";   // Metallic parts, landing gear struts, guns
  const metalExhaust    = "#433e3b";   // Heat-treated metallic engine exhaust
  const glassAmber      = "#cca533";   // Translucent gold-amber electromagnetic coating
  const rotorDark       = "#161719";   // Composite carbon black rotor blades
  const rotorHub        = "#292c2f";   // Structural metallic hub
  const tireGrey        = "#1b1b1d";   // Landing gear rubber tires
  const warningYellow   = "#e0b000";   // Warning markings, seeker noses, stencil outlines
  const warningRed      = "#b82020";   // Red hazard lines and strobe beacon
  const sensorGreen     = "#00ff55";   // FLIR optical green laser lens
  const sensorRed       = "#ff1a40";   // Laser tracker red lens
  const shadowDeep      = "#090a0c";   // Engine intakes, exhausts, shadow areas

  return (
    <group {...props} ref={groupRef} scale={1.0} rotation={[0, Math.PI / 2, 0]}>

      {/* ══════════════════════════════════════════════════════════════
          MAIN FUSELAGE — Slender, armored, contoured body
          Tapered forward section with characteristic EFAB cheeks
          ══════════════════════════════════════════════════════════════ */}
      
      {/* Central Fuselage Core */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.65, 1.45]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
      </mesh>

      {/* Armored Belly Plate */}
      <mesh position={[0, -0.32, -0.05]} castShadow>
        <boxGeometry args={[0.48, 0.12, 1.25]} />
        <meshStandardMaterial color={camoOliveDark} roughness={0.78} metalness={0.25} flatShading />
      </mesh>

      {/* Upper Engine Deck Spine Fairing */}
      <mesh position={[0, 0.4, -0.22]} castShadow>
        <boxGeometry args={[0.46, 0.22, 1.05]} />
        <meshStandardMaterial color={camoOliveLight} roughness={0.65} metalness={0.2} flatShading />
      </mesh>

      {/* ─── EFAB CHEEK FAIRINGS (Left & Right Avionics Bays) ─── */}
      {/* Left Cheek Sponson */}
      <mesh position={[0.34, -0.12, 0.15]} castShadow>
        <boxGeometry args={[0.16, 0.42, 1.55]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.68} metalness={0.2} flatShading />
      </mesh>
      {/* Left Cheek Slope Front */}
      <mesh position={[0.34, -0.12, 0.96]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.32, 0.25]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.68} metalness={0.2} flatShading />
      </mesh>
      {/* Left Cheek Slope Rear */}
      <mesh position={[0.34, -0.12, -0.68]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.36, 0.25]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.68} metalness={0.2} flatShading />
      </mesh>

      {/* Right Cheek Sponson */}
      <mesh position={[-0.34, -0.12, 0.15]} castShadow>
        <boxGeometry args={[0.16, 0.42, 1.55]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.68} metalness={0.2} flatShading />
      </mesh>
      {/* Right Cheek Slope Front */}
      <mesh position={[-0.34, -0.12, 0.96]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.32, 0.25]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.68} metalness={0.2} flatShading />
      </mesh>
      {/* Right Cheek Slope Rear */}
      <mesh position={[-0.34, -0.12, -0.68]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.36, 0.25]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.68} metalness={0.2} flatShading />
      </mesh>

      {/* Panel Line Accents */}
      <mesh position={[0.425, -0.1, 0.2]}>
        <boxGeometry args={[0.005, 0.005, 1.1]} />
        <meshBasicMaterial color={camoOliveDark} />
      </mesh>
      <mesh position={[-0.425, -0.1, 0.2]}>
        <boxGeometry args={[0.005, 0.005, 1.1]} />
        <meshBasicMaterial color={camoOliveDark} />
      </mesh>


      {/* ══════════════════════════════════════════════════════════════
          TANDEM COCKPIT — Iconic stepped pilot & gunner cabin
          Gunner sits in front (lower), Pilot sits in rear (elevated)
          ══════════════════════════════════════════════════════════════ */}
      
      {/* Front Cockpit Canopy (Copilot/Gunner - lower, forward) */}
      <mesh position={[0, 0.28, 0.74]} castShadow>
        <boxGeometry args={[0.34, 0.28, 0.48]} />
        <meshStandardMaterial
          color={glassAmber}
          transparent
          opacity={0.62}
          roughness={0.06}
          metalness={0.88}
          emissive={glassAmber}
          emissiveIntensity={0.08}
          flatShading
        />
      </mesh>

      {/* Front Windscreen Slope */}
      <mesh position={[0, 0.22, 1.0]} rotation={[-0.45, 0, 0]} castShadow>
        <boxGeometry args={[0.34, 0.02, 0.22]} />
        <meshStandardMaterial
          color={glassAmber}
          transparent
          opacity={0.62}
          roughness={0.06}
          metalness={0.88}
          emissive={glassAmber}
          emissiveIntensity={0.08}
          flatShading
        />
      </mesh>

      {/* Rear Cockpit Canopy (Pilot - elevated, rearward) */}
      <mesh position={[0, 0.45, 0.24]} castShadow>
        <boxGeometry args={[0.34, 0.36, 0.58]} />
        <meshStandardMaterial
          color={glassAmber}
          transparent
          opacity={0.62}
          roughness={0.06}
          metalness={0.88}
          emissive={glassAmber}
          emissiveIntensity={0.08}
          flatShading
        />
      </mesh>

      {/* Rear Windscreen Slope */}
      <mesh position={[0, 0.41, 0.55]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.34, 0.02, 0.24]} />
        <meshStandardMaterial
          color={glassAmber}
          transparent
          opacity={0.62}
          roughness={0.06}
          metalness={0.88}
          emissive={glassAmber}
          emissiveIntensity={0.08}
          flatShading
        />
      </mesh>

      {/* Canopy Structural Frame Ribs */}
      {/* Vertical center spacer */}
      <mesh position={[0, 0.32, 0.51]}>
        <boxGeometry args={[0.36, 0.32, 0.035]} />
        <meshStandardMaterial color={camoOliveDark} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Front frame rim */}
      <mesh position={[0, 0.31, 0.98]}>
        <boxGeometry args={[0.36, 0.03, 0.03]} />
        <meshStandardMaterial color={camoOliveDark} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Rear frame backwall */}
      <mesh position={[0, 0.48, -0.06]}>
        <boxGeometry args={[0.36, 0.38, 0.035]} />
        <meshStandardMaterial color={camoOliveDark} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Roof frame spine */}
      <mesh position={[0, 0.635, 0.24]}>
        <boxGeometry args={[0.03, 0.025, 0.58]} />
        <meshStandardMaterial color={camoOliveDark} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Port frame bottom plate */}
      <mesh position={[0.18, 0.28, 0.5]}>
        <boxGeometry args={[0.02, 0.04, 1.0]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.7} />
      </mesh>
      {/* Starboard frame bottom plate */}
      <mesh position={[-0.18, 0.28, 0.5]}>
        <boxGeometry args={[0.02, 0.04, 1.0]} />
        <meshStandardMaterial color={camoOliveDrab} roughness={0.7} />
      </mesh>

      {/* HUD Green CRT Panel Glow inside canopy */}
      <mesh position={[0, 0.16, 0.88]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[0.14, 0.095]} />
        <meshBasicMaterial color={sensorGreen} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 0.32, 0.42]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[0.14, 0.095]} />
        <meshBasicMaterial color={sensorGreen} transparent opacity={0.65} />
      </mesh>


      {/* ══════════════════════════════════════════════════════════════
          NOSE SECTION & TARGETING SENSORS (TADS/PNVS)
          ══════════════════════════════════════════════════════════════ */}
      
      <group position={[0, -0.1, 1.1]}>
        {/* Forward Avionics Nose Cone Taper */}
        <mesh position={[0, -0.05, 0.1]} castShadow>
          <boxGeometry args={[0.36, 0.36, 0.35]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>

        {/* PNVS Sensor Base (Upper Nose) */}
        <mesh position={[0, 0.14, 0.12]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 8]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* PNVS Flir Sensor Ball */}
        <mesh position={[0, 0.20, 0.14]} castShadow>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color={rotorHub} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* PNVS Lens */}
        <mesh position={[0, 0.20, 0.205]}>
          <circleGeometry args={[0.038]} />
          <meshStandardMaterial color={sensorGreen} roughness={0.1} metalness={0.9} emissive={sensorGreen} emissiveIntensity={0.2} />
        </mesh>

        {/* TADS Sensor Turret Assembly (Tip of Nose) */}
        <group position={[0, -0.15, 0.26]}>
          {/* TADS Turret Mount Collar */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.115, 0.115, 0.08, 10]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.45} metalness={0.75} />
          </mesh>
          {/* TADS Sensor Drum (Rotated sideways) */}
          <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.22, 12]} />
            <meshStandardMaterial color={rotorHub} roughness={0.35} metalness={0.8} flatShading />
          </mesh>
          {/* TADS FLIR sensor lens (Left side) */}
          <mesh position={[0.075, 0.03, 0.165]}>
            <circleGeometry args={[0.046]} />
            <meshStandardMaterial color={sensorGreen} roughness={0.05} metalness={0.95} emissive={sensorGreen} emissiveIntensity={0.35} />
          </mesh>
          {/* TADS Laser tracking lens (Right side) */}
          <mesh position={[-0.075, -0.02, 0.165]}>
            <circleGeometry args={[0.036]} />
            <meshStandardMaterial color={sensorRed} roughness={0.05} metalness={0.95} emissive={sensorRed} emissiveIntensity={0.4} />
          </mesh>
        </group>

        {/* Long Nose Air Data Sensor Probe */}
        <mesh position={[0, 0.16, 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.014, 0.3, 6]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Left Pitot Probe */}
        <mesh position={[0.19, -0.05, 0.05]} rotation={[Math.PI / 2, 0.08, 0.04]} castShadow>
          <cylinderGeometry args={[0.007, 0.012, 0.22, 6]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.9} />
        </mesh>
        {/* Right Pitot Probe */}
        <mesh position={[-0.19, -0.05, 0.05]} rotation={[Math.PI / 2, -0.08, -0.04]} castShadow>
          <cylinderGeometry args={[0.007, 0.012, 0.22, 6]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.9} />
        </mesh>
      </group>


      {/* ══════════════════════════════════════════════════════════════
          CHIN-MOUNTED M230 30MM CHAIN GUN
          Dynamic targeting gun under nose area
          ══════════════════════════════════════════════════════════════ */}
      
      <group ref={gunRef} position={[0, -0.42, 0.65]}>
        {/* Gun Turret Base Mount */}
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.09, 8]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Gun Receiver Box & Cradle */}
        <mesh position={[0, -0.1, 0.02]} castShadow>
          <boxGeometry args={[0.095, 0.12, 0.26]} />
          <meshStandardMaterial color={rotorHub} roughness={0.3} metalness={0.8} flatShading />
        </mesh>

        {/* Ammo Feed Belt */}
        <mesh position={[0.07, 0.02, -0.05]} castShadow>
          <boxGeometry args={[0.05, 0.12, 0.1]} />
          <meshStandardMaterial color={metalExhaust} roughness={0.5} metalness={0.75} />
        </mesh>

        {/* M230 Gun Barrel */}
        <mesh position={[0, -0.13, 0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.018, 0.66, 8]} />
          <meshStandardMaterial color={shadowDeep} roughness={0.25} metalness={0.95} />
        </mesh>

        {/* Muzzle Brake & Flash Hider */}
        <mesh position={[0, -0.13, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.045, 8]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Support stabilization linkage bars */}
        <mesh position={[0, -0.03, 0.24]} rotation={[Math.PI / 2 - 0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.44, 4]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
        </mesh>
      </group>


      {/* ══════════════════════════════════════════════════════════════
          TWIN GE T700 SHOULDER ENGINES
          Massive side-mounted turboshaft nacelles
          ══════════════════════════════════════════════════════════════ */}
      
      <group position={[0, 0.32, -0.15]}>
        
        {/* ─── PORT ENGINE (Left Side) ─── */}
        {/* Nacelle Main Shell */}
        <mesh position={[0.34, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.28, 0.95]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>
        {/* Curved Cowl Top Accent */}
        <mesh position={[0.34, 0.15, -0.04]} castShadow>
          <boxGeometry args={[0.22, 0.06, 0.78]} />
          <meshStandardMaterial color={camoOliveLight} roughness={0.65} metalness={0.25} flatShading />
        </mesh>
        {/* Front Air Intake */}
        <mesh position={[0.34, 0, 0.48]} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.05]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Dark Air Intake Hole */}
        <mesh position={[0.34, 0, 0.51]}>
          <planeGeometry args={[0.17, 0.19]} />
          <meshStandardMaterial color={shadowDeep} roughness={0.95} />
        </mesh>

        {/* Port Black Hole IRSS Exhaust (Angled down, out, and back) */}
        <mesh position={[0.42, -0.08, -0.6]} rotation={[0.25, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.35, 8]} />
          <meshStandardMaterial color={metalExhaust} roughness={0.4} metalness={0.75} />
        </mesh>
        {/* Burnt Exhaust opening */}
        <mesh position={[0.455, -0.12, -0.76]} rotation={[0.25, 0.32, 0]}>
          <circleGeometry args={[0.076]} />
          <meshStandardMaterial color={shadowDeep} roughness={0.9} />
        </mesh>
        {/* Faint Reddish Exhaust Heat Glow */}
        <mesh position={[0.45, -0.118, -0.75]} rotation={[0.25, 0.32, 0]}>
          <ringGeometry args={[0.04, 0.07, 8]} />
          <meshBasicMaterial color="#3a1100" transparent opacity={0.45} />
        </mesh>


        {/* ─── STARBOARD ENGINE (Right Side) ─── */}
        {/* Nacelle Main Shell */}
        <mesh position={[-0.34, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.28, 0.95]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>
        {/* Curved Cowl Top Accent */}
        <mesh position={[-0.34, 0.15, -0.04]} castShadow>
          <boxGeometry args={[0.22, 0.06, 0.78]} />
          <meshStandardMaterial color={camoOliveLight} roughness={0.65} metalness={0.25} flatShading />
        </mesh>
        {/* Front Air Intake */}
        <mesh position={[-0.34, 0, 0.48]} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.05]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Dark Air Intake Hole */}
        <mesh position={[-0.34, 0, 0.51]}>
          <planeGeometry args={[0.17, 0.19]} />
          <meshStandardMaterial color={shadowDeep} roughness={0.95} />
        </mesh>

        {/* Starboard Black Hole IRSS Exhaust */}
        <mesh position={[-0.42, -0.08, -0.6]} rotation={[0.25, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.35, 8]} />
          <meshStandardMaterial color={metalExhaust} roughness={0.4} metalness={0.75} />
        </mesh>
        {/* Burnt Exhaust opening */}
        <mesh position={[-0.455, -0.12, -0.76]} rotation={[0.25, -0.32, 0]}>
          <circleGeometry args={[0.076]} />
          <meshStandardMaterial color={shadowDeep} roughness={0.9} />
        </mesh>
        {/* Faint Reddish Exhaust Heat Glow */}
        <mesh position={[-0.45, -0.118, -0.75]} rotation={[0.25, -0.32, 0]}>
          <ringGeometry args={[0.04, 0.07, 8]} />
          <meshBasicMaterial color="#3a1100" transparent opacity={0.45} />
        </mesh>

      </group>


      {/* ══════════════════════════════════════════════════════════════
          STUB WINGS & PREMIUM ORDNANCE LOADOUT
          Equipped with M261 Hydra rocket pods & AGM-114 Hellfire missiles
          ══════════════════════════════════════════════════════════════ */}
      
      <group position={[0, -0.1, 0.05]}>
        
        {/* ─── PORT STUB WING (Left Side) ─── */}
        <mesh position={[0.54, 0.12, 0]} rotation={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[0.58, 0.055, 0.34]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>
        {/* Swept Leading Edge Wing Panel */}
        <mesh position={[0.54, 0.14, 0.16]} rotation={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[0.56, 0.02, 0.05]} />
          <meshStandardMaterial color={camoOliveLight} roughness={0.6} metalness={0.3} flatShading />
        </mesh>
        {/* Left Wingtip Endplate Fairing */}
        <mesh position={[0.82, 0.07, 0]} rotation={[0, 0, -0.06]} castShadow>
          <boxGeometry args={[0.04, 0.18, 0.3]} />
          <meshStandardMaterial color={camoOliveDark} roughness={0.65} metalness={0.3} flatShading />
        </mesh>

        {/* Left Pylons (Inboard & Outboard) */}
        {/* Inboard Mount */}
        <mesh position={[0.42, -0.02, 0]} castShadow>
          <boxGeometry args={[0.05, 0.14, 0.08]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Outboard Mount */}
        <mesh position={[0.66, -0.02, 0]} castShadow>
          <boxGeometry args={[0.05, 0.14, 0.08]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.7} />
        </mesh>

        {/* ─── Left Inboard Weapon: M261 Hydra 70 Rocket Pod ─── */}
        <group position={[0.42, -0.16, 0.04]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.44, 10]} />
            <meshStandardMaterial color={camoOliveDrab} roughness={0.55} metalness={0.4} flatShading />
          </mesh>
          {/* Honeycomb 19-Tube Rocket Tube Front Face */}
          <mesh position={[0, 0, 0.225]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 10]} />
            <meshStandardMaterial color={shadowDeep} roughness={0.9} />
          </mesh>
          {/* Honeycomb details (yellow circles representing rocket nose tips) */}
          {[[0,0], [-0.06,0], [0.06,0], [0,-0.06], [0,0.06], [-0.03,-0.05], [0.03,0.05], [-0.03,0.05], [0.03,-0.05]].map((coord, i) => (
            <mesh key={`p-rocket-${i}`} position={[coord[0], -0.16, 0.23]}>
              <circleGeometry args={[0.012, 4]} />
              <meshBasicMaterial color={warningYellow} />
            </mesh>
          ))}
          {/* Tail tube exit cap */}
          <mesh position={[0, 0, -0.225]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 10]} />
            <meshStandardMaterial color={camoOliveDark} roughness={0.8} />
          </mesh>
        </group>

        {/* ─── Left Outboard Weapon: AGM-114 Hellfire Guided Missiles ─── */}
        {/* Quad Launcher Rack */}
        <mesh position={[0.66, -0.1, 0.02]} castShadow>
          <boxGeometry args={[0.14, 0.04, 0.44]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
        </mesh>
        {/* Vertical suspension rods */}
        <mesh position={[0.66, -0.16, 0.1]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
        </mesh>
        <mesh position={[0.66, -0.16, -0.1]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
        </mesh>

        {/* Hellfire Missiles (We'll mount 2 detailed missiles) */}
        {/* Missile 1 (Inboard lower) */}
        <group position={[0.59, -0.22, 0.08]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.45, 6]} />
            <meshStandardMaterial color={rotorDark} roughness={0.5} metalness={0.7} />
          </mesh>
          {/* Warning Stripe */}
          <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.029, 0.029, 0.03, 6]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          {/* Glass optical seeker dome nose */}
          <mesh position={[0, 0, 0.225]} castShadow>
            <sphereGeometry args={[0.027, 6, 6]} />
            <meshStandardMaterial color={warningRed} metalness={0.9} roughness={0.05} transparent opacity={0.75} />
          </mesh>
          {/* Tiny seeker lens core */}
          <mesh position={[0, 0, 0.245]}>
            <sphereGeometry args={[0.01]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          {/* Missile Rear Stabilizer Fins (Quad) */}
          <mesh position={[0, 0, -0.18]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.18]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
        </group>

        {/* Missile 2 (Outboard lower) */}
        <group position={[0.73, -0.22, 0.08]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.45, 6]} />
            <meshStandardMaterial color={rotorDark} roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.029, 0.029, 0.03, 6]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          <mesh position={[0, 0, 0.225]} castShadow>
            <sphereGeometry args={[0.027, 6, 6]} />
            <meshStandardMaterial color={warningRed} metalness={0.9} roughness={0.05} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0, -0.18]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.18]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
        </group>


        {/* ─── STARBOARD STUB WING (Right Side) ─── */}
        <mesh position={[-0.54, 0.12, 0]} rotation={[0, 0, 0.08]} castShadow>
          <boxGeometry args={[0.58, 0.055, 0.34]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>
        {/* Swept Leading Edge Wing Panel */}
        <mesh position={[-0.54, 0.14, 0.16]} rotation={[0, 0, 0.08]} castShadow>
          <boxGeometry args={[0.56, 0.02, 0.05]} />
          <meshStandardMaterial color={camoOliveLight} roughness={0.6} metalness={0.3} flatShading />
        </mesh>
        {/* Right Wingtip Endplate Fairing */}
        <mesh position={[-0.82, 0.07, 0]} rotation={[0, 0, 0.06]} castShadow>
          <boxGeometry args={[0.04, 0.18, 0.3]} />
          <meshStandardMaterial color={camoOliveDark} roughness={0.65} metalness={0.3} flatShading />
        </mesh>

        {/* Right Pylons */}
        <mesh position={[-0.42, -0.02, 0]} castShadow>
          <boxGeometry args={[0.05, 0.14, 0.08]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-0.66, -0.02, 0]} castShadow>
          <boxGeometry args={[0.05, 0.14, 0.08]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.7} />
        </mesh>

        {/* ─── Right Inboard Weapon: M261 Hydra 70 Rocket Pod ─── */}
        <group position={[-0.42, -0.16, 0.04]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.44, 10]} />
            <meshStandardMaterial color={camoOliveDrab} roughness={0.55} metalness={0.4} flatShading />
          </mesh>
          <mesh position={[0, 0, 0.225]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 10]} />
            <meshStandardMaterial color={shadowDeep} roughness={0.9} />
          </mesh>
          {[[0,0], [-0.06,0], [0.06,0], [0,-0.06], [0,0.06], [-0.03,-0.05], [0.03,0.05], [-0.03,0.05], [0.03,-0.05]].map((coord, i) => (
            <mesh key={`s-rocket-${i}`} position={[coord[0], -0.16, 0.23]}>
              <circleGeometry args={[0.012, 4]} />
              <meshBasicMaterial color={warningYellow} />
            </mesh>
          ))}
          <mesh position={[0, 0, -0.225]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 10]} />
            <meshStandardMaterial color={camoOliveDark} roughness={0.8} />
          </mesh>
        </group>

        {/* ─── Right Outboard Weapon: AGM-114 Hellfire Guided Missiles ─── */}
        <mesh position={[-0.66, -0.1, 0.02]} castShadow>
          <boxGeometry args={[0.14, 0.04, 0.44]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
        </mesh>
        <mesh position={[-0.66, -0.16, 0.1]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
        </mesh>
        <mesh position={[-0.66, -0.16, -0.1]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={metalGunmetal} metalness={0.8} />
        </mesh>

        {/* Hellfire Missiles */}
        <group position={[-0.59, -0.22, 0.08]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.45, 6]} />
            <meshStandardMaterial color={rotorDark} roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.029, 0.029, 0.03, 6]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          <mesh position={[0, 0, 0.225]} castShadow>
            <sphereGeometry args={[0.027, 6, 6]} />
            <meshStandardMaterial color={warningRed} metalness={0.9} roughness={0.05} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0, -0.18]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.18]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
        </group>

        <group position={[-0.73, -0.22, 0.08]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.45, 6]} />
            <meshStandardMaterial color={rotorDark} roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.029, 0.029, 0.03, 6]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          <mesh position={[0, 0, 0.225]} castShadow>
            <sphereGeometry args={[0.027, 6, 6]} />
            <meshStandardMaterial color={warningRed} metalness={0.9} roughness={0.05} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0, -0.18]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.18]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.1, 0.005, 0.04]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
          </mesh>
        </group>

      </group>


      {/* ══════════════════════════════════════════════════════════════
          SLENDER TAIL BOOM & ACTIVE SPINNING TAIL ROTOR
          Long tapered structural arm counter-balancing main torque
          ══════════════════════════════════════════════════════════════ */}
      
      <group position={[0, 0.12, -0.85]}>
        
        {/* Tail Boom Section 1 (Root Transition) */}
        <mesh position={[0, -0.06, -0.24]} castShadow>
          <boxGeometry args={[0.3, 0.32, 0.58]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>

        {/* Tail Boom Section 2 (Slender Tapered Boom) */}
        <mesh position={[0, 0, -0.85]} castShadow>
          <boxGeometry args={[0.18, 0.2, 0.72]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>

        {/* Tail Boom Section 3 (Rearmost segment) */}
        <mesh position={[0, 0.05, -1.45]} castShadow>
          <boxGeometry args={[0.1, 0.13, 0.54]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>

        {/* Spine Dorsal fairing along tail boom */}
        <mesh position={[0, 0.12, -0.8]} castShadow>
          <boxGeometry args={[0.07, 0.05, 1.4]} />
          <meshStandardMaterial color={camoOliveLight} roughness={0.6} metalness={0.3} flatShading />
        </mesh>

        {/* Tail panel details */}
        <mesh position={[0.095, -0.02, -0.8]}>
          <boxGeometry args={[0.005, 0.005, 1.0]} />
          <meshBasicMaterial color={camoOliveDark} />
        </mesh>
        <mesh position={[-0.095, -0.02, -0.8]}>
          <boxGeometry args={[0.005, 0.005, 1.0]} />
          <meshBasicMaterial color={camoOliveDark} />
        </mesh>

        {/* ─── VERTICAL TAIL FIN (Stabilizer) ─── */}
        <mesh position={[0, 0.5, -1.82]} castShadow>
          <boxGeometry args={[0.05, 0.78, 0.38]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.65} metalness={0.3} flatShading />
        </mesh>
        {/* Tail Fin Swept Cap fairing */}
        <mesh position={[0, 0.9, -1.9]} castShadow>
          <boxGeometry args={[0.056, 0.08, 0.22]} />
          <meshStandardMaterial color={camoOliveLight} roughness={0.6} />
        </mesh>

        {/* ─── HORIZONTAL STABILATOR (Large tail wing) ─── */}
        <mesh position={[0, 0.16, -1.72]} castShadow>
          <boxGeometry args={[0.82, 0.034, 0.26]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} metalness={0.2} flatShading />
        </mesh>
        {/* Endplates on tail wing */}
        <mesh position={[0.4, 0.16, -1.72]} castShadow>
          <boxGeometry args={[0.025, 0.14, 0.24]} />
          <meshStandardMaterial color={camoOliveDark} roughness={0.65} />
        </mesh>
        <mesh position={[-0.4, 0.16, -1.72]} castShadow>
          <boxGeometry args={[0.025, 0.14, 0.24]} />
          <meshStandardMaterial color={camoOliveDark} roughness={0.65} />
        </mesh>

        {/* ─── ACTIVE FOUR-BLADE TAIL ROTOR (Left Side) ─── */}
        <group position={[-0.08, 0.62, -1.9]}>
          {/* Tail Rotor Hub Assembly (Protrudes along X axis) */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.09, 8]} />
            <meshStandardMaterial color={rotorHub} roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[-0.046, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.038, 0.038, 0.015, 8]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.25} />
          </mesh>

          {/* Active Tail Rotor Blades Group (Spins CW) */}
          <group ref={tailRotorRef} position={[-0.05, 0, 0]}>
            {/* Blade 1 & 3 */}
            <mesh castShadow>
              <boxGeometry args={[0.01, 0.58, 0.042]} />
              <meshStandardMaterial color={rotorDark} roughness={0.8} metalness={0.15} />
            </mesh>
            {/* Blade 2 & 4 */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <boxGeometry args={[0.01, 0.58, 0.042]} />
              <meshStandardMaterial color={rotorDark} roughness={0.8} metalness={0.15} />
            </mesh>

            {/* Warning yellow tips on tail rotor blades */}
            <mesh position={[0, 0.27, 0]}>
              <boxGeometry args={[0.012, 0.04, 0.042]} />
              <meshBasicMaterial color={warningYellow} />
            </mesh>
            <mesh position={[0, -0.27, 0]}>
              <boxGeometry args={[0.012, 0.04, 0.042]} />
              <meshBasicMaterial color={warningYellow} />
            </mesh>
            <mesh position={[0, 0, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.012, 0.04, 0.042]} />
              <meshBasicMaterial color={warningYellow} />
            </mesh>
            <mesh position={[0, 0, -0.27]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.012, 0.04, 0.042]} />
              <meshBasicMaterial color={warningYellow} />
            </mesh>
          </group>
        </group>

        {/* Tail Strobe light (Red blinking warning on vertical stabilizer) */}
        <mesh position={[0, 0.94, -1.9]}>
          <sphereGeometry args={[0.024, 6, 6]} />
          <meshBasicMaterial color={warningRed} />
        </mesh>
        
        {/* Tail navigation light (White, rear tip) */}
        <mesh position={[0, 0.44, -2.02]}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>


      {/* ══════════════════════════════════════════════════════════════
          LANDING GEAR — Robust fixed tricycle military gear
          Two heavy-duty main wheels under cockpit + trailing tailwheel
          ══════════════════════════════════════════════════════════════ */}
      
      <group position={[0, -0.32, 0]}>
        
        {/* ─── PORT MAIN LANDING GEAR (Left Side) ─── */}
        {/* Angled Heavy Strut */}
        <mesh position={[0.26, -0.06, 0.52]} rotation={[0.2, 0, -0.3]} castShadow>
          <boxGeometry args={[0.05, 0.22, 0.05]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} />
        </mesh>
        {/* Shock-absorber Piston (Polished Chrome) */}
        <mesh position={[0.34, -0.16, 0.56]} rotation={[0, 0, -0.1]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 6]} />
          <meshStandardMaterial color="#eeeeee" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Port Main Wheel Tire */}
        <mesh position={[0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 8]} />
          <meshStandardMaterial color={tireGrey} roughness={0.85} metalness={0.1} />
        </mesh>
        {/* Port Wheel Hub */}
        <mesh position={[0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.088, 6]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.8} />
        </mesh>


        {/* ─── STARBOARD MAIN LANDING GEAR (Right Side) ─── */}
        {/* Angled Heavy Strut */}
        <mesh position={[-0.26, -0.06, 0.52]} rotation={[0.2, 0, 0.3]} castShadow>
          <boxGeometry args={[0.05, 0.22, 0.05]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.7} />
        </mesh>
        {/* Shock-absorber Piston */}
        <mesh position={[-0.34, -0.16, 0.56]} rotation={[0, 0, 0.1]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 6]} />
          <meshStandardMaterial color="#eeeeee" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Starboard Main Wheel Tire */}
        <mesh position={[-0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 8]} />
          <meshStandardMaterial color={tireGrey} roughness={0.85} metalness={0.1} />
        </mesh>
        {/* Starboard Wheel Hub */}
        <mesh position={[-0.39, -0.23, 0.58]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.088, 6]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.8} />
        </mesh>


        {/* ─── REAR TAILWHEEL ASSEMBLY (Under Rear Tail Boom) ─── */}
        {/* Trailing Fork strut */}
        <mesh position={[0, -0.08, -1.82]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.03, 0.16, 0.03]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Small Tail Wheel Tire */}
        <mesh position={[0, -0.16, -1.9]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 6]} />
          <meshStandardMaterial color={tireGrey} roughness={0.85} />
        </mesh>
        {/* Small Hub */}
        <mesh position={[0, -0.16, -1.9]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.046, 4]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} />
        </mesh>

      </group>


      {/* ══════════════════════════════════════════════════════════════
          MAIN ROTOR SYSTEM & AN/APG-78 LONGBOW RADAR DOME
          Single 4-blade massive rotor with FCR cheese-wheel dome
          ══════════════════════════════════════════════════════════════ */}
      
      <group position={[0, 0.49, -0.15]}>
        
        {/* Main Rotor Mast Base (Transmission housing) */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.12, 0.14, 8]} />
          <meshStandardMaterial color={camoOliveDark} roughness={0.65} metalness={0.3} />
        </mesh>

        {/* Steel Main Rotor Shaft */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.28, 8]} />
          <meshStandardMaterial color="#dddddd" metalness={0.92} roughness={0.08} />
        </mesh>

        {/* Swashplate Ring Mechanism */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.035, 8]} />
          <meshStandardMaterial color={rotorHub} roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Control linkage rods */}
        {[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].map((angle, i) => (
          <mesh key={`rod-${i}`} position={[Math.cos(angle) * 0.055, 0.12, Math.sin(angle) * 0.055]}>
            <cylinderGeometry args={[0.006, 0.006, 0.08, 4]} />
            <meshStandardMaterial color={metalGunmetal} roughness={0.2} metalness={0.8} />
          </mesh>
        ))}

        {/* Pitch Horn Hub grip disc */}
        <mesh position={[0, 0.23, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.045, 10]} />
          <meshStandardMaterial color={rotorHub} roughness={0.35} metalness={0.8} />
        </mesh>

        {/* ─── ACTIVE FOUR-BLADE MAIN ROTOR ASSEMBLY (Spins CCW) ─── */}
        <group ref={mainRotorRef} position={[0, 0.25, 0]}>
          
          {/* Blade 1 & 3 Core Structure */}
          <mesh castShadow>
            <boxGeometry args={[4.4, 0.015, 0.11]} />
            <meshStandardMaterial color={rotorDark} roughness={0.86} metalness={0.14} />
          </mesh>
          {/* Blade 2 & 4 (At 90 degrees) */}
          <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[4.4, 0.015, 0.11]} />
            <meshStandardMaterial color={rotorDark} roughness={0.86} metalness={0.14} />
          </mesh>

          {/* Silver Leading Edge Strip for aesthetic speed and premium detail */}
          <mesh position={[0, 0.008, 0.055]}>
            <boxGeometry args={[4.4, 0.002, 0.006]} />
            <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.008, -0.055]}>
            <boxGeometry args={[4.4, 0.002, 0.006]} />
            <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0.055, 0.008, 0]}>
            <boxGeometry args={[4.4, 0.002, 0.006]} />
            <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.055, 0.008, 0]}>
            <boxGeometry args={[4.4, 0.002, 0.006]} />
            <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Blade Grips / root couplers */}
          {[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].map((angle, i) => (
            <mesh key={`root-${i}`} position={[Math.cos(angle) * 0.14, -0.005, Math.sin(angle) * 0.14]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.13, 0.024, 0.06]} />
              <meshStandardMaterial color={rotorHub} roughness={0.4} metalness={0.7} />
            </mesh>
          ))}

          {/* High-visibility Warning Yellow/Red Safety Tips */}
          {/* Blade 1 tips */}
          <mesh position={[2.14, 0.009, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.11]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          <mesh position={[2.19, 0.01, 0]}>
            <boxGeometry args={[0.02, 0.022, 0.11]} />
            <meshBasicMaterial color={warningRed} />
          </mesh>
          {/* Blade 3 tips */}
          <mesh position={[-2.14, 0.009, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.11]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          <mesh position={[-2.19, 0.01, 0]}>
            <boxGeometry args={[0.02, 0.022, 0.11]} />
            <meshBasicMaterial color={warningRed} />
          </mesh>
          {/* Blade 2 tips */}
          <mesh position={[0, 0.009, 2.14]}>
            <boxGeometry args={[0.11, 0.02, 0.12]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          <mesh position={[0, 0.01, 2.19]}>
            <boxGeometry args={[0.11, 0.022, 0.02]} />
            <meshBasicMaterial color={warningRed} />
          </mesh>
          {/* Blade 4 tips */}
          <mesh position={[0, 0.009, -2.14]}>
            <boxGeometry args={[0.11, 0.02, 0.12]} />
            <meshBasicMaterial color={warningYellow} />
          </mesh>
          <mesh position={[0, 0.01, -2.19]}>
            <boxGeometry args={[0.11, 0.022, 0.02]} />
            <meshBasicMaterial color={warningRed} />
          </mesh>
        </group>

        {/* ─── AN/APG-78 LONGBOW FIRE CONTROL RADAR (FCR) DOME ─── */}
        {/* Supporting Pylon above main rotor hub */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.16, 6]} />
          <meshStandardMaterial color={metalGunmetal} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Radar Cheese-Wheel Dome */}
        <mesh position={[0, 0.47, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.13, 16]} />
          <meshStandardMaterial color={camoOliveDrab} roughness={0.65} metalness={0.3} flatShading />
        </mesh>
        {/* Metal Trim ring around FCR dome */}
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.344, 0.344, 0.02, 16, 1, true]} />
          <meshBasicMaterial color={rotorHub} />
        </mesh>
        {/* Stencil marker line */}
        <mesh position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 8]} />
          <meshStandardMaterial color={metalExhaust} />
        </mesh>
      </group>

      {/* Navigation Lights (Wingtips) */}
      {/* Port - Red (Left wingtip endplate) */}
      <mesh position={[0.825, 0.05, 0.12]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial color="#ff052b" />
      </mesh>
      {/* Starboard - Green (Right wingtip endplate) */}
      <mesh position={[-0.825, 0.05, 0.12]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial color="#05ff3a" />
      </mesh>

      {/* Fuselage Anti-collision beacon (Belly Red light) */}
      <mesh position={[0, -0.38, 0]}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshBasicMaterial color={warningRed} />
      </mesh>

    </group>
  );
}
