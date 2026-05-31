import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function EnemyHelicopterModel(props: any) {
  const rotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rotorRef.current) rotorRef.current.rotation.y += 18 * delta;
    if (tailRotorRef.current) tailRotorRef.current.rotation.x += 20 * delta;
  });

  // Futuristic Stealth Military Scheme
  const bodyBase   = "#3f3f46"; // Sleek Navy Zinc-Grey
  const bodyDark   = "#18181b"; // Dark Stealth Plates
  const steel      = "#27272a"; // Metal Parts
  const glowOrange = "#ff4400"; // Glowing HUD / Canopy Glass

  return (
    <group {...props} scale={[0.5, 0.5, 0.5]}>
      {/* Sleek Apache-style Fuselage */}
      <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 2.5, 6]} />
        <meshStandardMaterial color={bodyBase} flatShading roughness={0.6} />
      </mesh>

      {/* Camouflage Panel detail */}
      <mesh castShadow position={[0, 0.05, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.31, 0.36, 1.2, 6]} />
        <meshStandardMaterial color={bodyDark} flatShading roughness={0.6} />
      </mesh>

      {/* Pointy Nose */}
      <mesh castShadow position={[0, -0.1, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.3, 0.6, 6]} />
        <meshStandardMaterial color={bodyDark} flatShading roughness={0.5} />
      </mesh>

      {/* Tandem Cockpit Canopy with orange HUD glow */}
      <mesh castShadow position={[0, 0.3, 0.8]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 1.2]} />
        <meshStandardMaterial 
          color={glowOrange} 
          roughness={0.1} 
          metalness={0.9} 
          emissive={glowOrange} 
          emissiveIntensity={0.6} 
          flatShading 
        />
      </mesh>

      {/* Tail Boom */}
      <mesh castShadow position={[0, 0.1, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.1, 1.6, 5]} />
        <meshStandardMaterial color={bodyBase} flatShading roughness={0.6} />
      </mesh>

      {/* Tail Fin (Vertical) */}
      <mesh castShadow position={[0, 0.4, -2.5]}>
        <boxGeometry args={[0.08, 0.8, 0.5]} />
        <meshStandardMaterial color={bodyDark} flatShading roughness={0.6} />
      </mesh>

      {/* Tail Fin (Horizontal) */}
      <mesh castShadow position={[0, 0.1, -2.5]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color={bodyDark} flatShading roughness={0.6} />
      </mesh>

      {/* Stub Wings */}
      <mesh castShadow position={[0, 0, 0.2]}>
        <boxGeometry args={[2.0, 0.1, 0.5]} />
        <meshStandardMaterial color={steel} flatShading roughness={0.6} />
      </mesh>

      {/* Weapon Pods */}
      <mesh castShadow position={[0.8, -0.2, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 6]} />
        <meshStandardMaterial color={bodyDark} flatShading roughness={0.5} />
      </mesh>
      {/* Red Missile Tips on Pods */}
      <mesh castShadow position={[0.8, -0.2, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.15, 6]} />
        <meshStandardMaterial color="#ef4444" flatShading />
      </mesh>
      
      <mesh castShadow position={[-0.8, -0.2, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 6]} />
        <meshStandardMaterial color={bodyDark} flatShading roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.8, -0.2, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.15, 6]} />
        <meshStandardMaterial color="#ef4444" flatShading />
      </mesh>

      {/* Sensor Pod / Chin Gun mount */}
      <mesh castShadow position={[0, -0.3, 1.2]}>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color={bodyDark} flatShading />
      </mesh>

      {/* Main Rotor System */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.4, 6]} />
        <meshStandardMaterial color={steel} flatShading />
      </mesh>
      <group position={[0, 0.7, 0]} ref={rotorRef}>
        <mesh castShadow>
          <boxGeometry args={[5.5, 0.04, 0.2]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
        <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[5.5, 0.04, 0.2]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
      </group>

      {/* Tail Rotor */}
      <group position={[0.1, 0.5, -2.5]} ref={tailRotorRef}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 1.0, 0.1]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.04, 1.0, 0.1]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
      </group>

      {/* Landing Skids */}
      <group position={[0, -0.1, 0]}>
        <mesh castShadow position={[0.4, -0.4, 0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
        <mesh castShadow position={[-0.4, -0.4, 0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
        <mesh castShadow position={[0.4, -0.4, -0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
        <mesh castShadow position={[-0.4, -0.4, -0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
        <mesh castShadow position={[0.4, -0.6, 0]}>
          <boxGeometry args={[0.05, 0.05, 1.6]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
        <mesh castShadow position={[-0.4, -0.6, 0]}>
          <boxGeometry args={[0.05, 0.05, 1.6]} />
          <meshStandardMaterial color={steel} flatShading />
        </mesh>
      </group>
    </group>
  );
}

export function EnemyDroneModel(props: any) {
  const rotor1Ref = useRef<THREE.Group>(null);
  const rotor2Ref = useRef<THREE.Group>(null);
  const rotor3Ref = useRef<THREE.Group>(null);
  const rotor4Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rotor1Ref.current) rotor1Ref.current.rotation.y += 30 * delta;
    if (rotor2Ref.current) rotor2Ref.current.rotation.y += 30 * delta;
    if (rotor3Ref.current) rotor3Ref.current.rotation.y += 30 * delta;
    if (rotor4Ref.current) rotor4Ref.current.rotation.y += 30 * delta;
  });

  return (
    <group {...props} scale={[0.8, 0.8, 0.8]}>
      {/* Main drone body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#7f1d1d" flatShading />
      </mesh>
      
      {/* Glowing eye/sensor */}
      <mesh castShadow position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
        <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={0.8} flatShading />
      </mesh>

      {/* Arms for rotors */}
      <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>
      <mesh castShadow rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[2.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>

      {/* Rotors */}
      <group position={[0.88, 0.2, 0.88]} ref={rotor1Ref}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.05, 0.15]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
      </group>
      <group position={[-0.88, 0.2, -0.88]} ref={rotor2Ref}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.05, 0.15]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
      </group>
      <group position={[0.88, 0.2, -0.88]} ref={rotor3Ref}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.05, 0.15]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
      </group>
      <group position={[-0.88, 0.2, 0.88]} ref={rotor4Ref}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.05, 0.15]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
      </group>

      {/* Underbelly weapon */}
      <mesh castShadow position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#450a0a" flatShading />
      </mesh>
    </group>
  );
}

export const EnemyTankModel = React.forwardRef((props: any, ref: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const barrelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Subtle turret scanning animation (additive to AI aiming on Z)
    if (ref.current) {
      ref.current.rotation.y = Math.sin(time * 0.5) * 0.3;
    }
    
    // Barrel recoil/vibration
    if (barrelRef.current) {
      barrelRef.current.position.z = Math.sin(time * 2) * 0.02 + 0.8;
    }

    // Heavy mechanical vibration for the whole tank
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 10) * 0.005;
    }
  });

  // Palette: T-90 / Modern MBT Inspired
  const primaryGreen = "#2a2d20"; // Forest/Army Green
  const darkSteel = "#1a1c1d"; 
  const treadGray = "#111111";
  const highlightedPlate = "#363a2b";
  const markerYellow = "#ccaa22";
  const redDetail = "#cc3333";

  return (
    <group {...props} ref={groupRef} scale={1.2}>
      <group position={[0, -0.2, 0]}>
        {/* --- Main Chassis (Lower Hull) --- */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.5, 3.2]} />
          <meshStandardMaterial color={primaryGreen} flatShading />
        </mesh>

        {/* --- Sloped Front Glacis --- */}
        <mesh position={[0, 0.55, 1.4]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.1, 0.8]} />
          <meshStandardMaterial color={primaryGreen} flatShading />
        </mesh>

        {/* --- Side Skirts / Armor Plates --- */}
        <group position={[0.95, 0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.6, 3.4]} />
            <meshStandardMaterial color={darkSteel} flatShading />
          </mesh>
          {/* Simple rivets/details */}
          {[-1, 0, 1].map((z, i) => (
            <mesh key={i} position={[0.11, 0, z]}>
              <boxGeometry args={[0.02, 0.4, 0.2]} />
              <meshStandardMaterial color={markerYellow} />
            </mesh>
          ))}
        </group>
        <group position={[-0.95, 0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.6, 3.4]} />
            <meshStandardMaterial color={darkSteel} flatShading />
          </mesh>
          {[-1, 0, 1].map((z, i) => (
            <mesh key={i} position={[-0.11, 0, z]}>
              <boxGeometry args={[0.02, 0.4, 0.2]} />
              <meshStandardMaterial color={markerYellow} />
            </mesh>
          ))}
        </group>

        {/* --- Caterpillar Treads --- */}
        <mesh position={[0.7, 0.1, 0]}>
          <boxGeometry args={[0.4, 0.3, 3.4]} />
          <meshStandardMaterial color={treadGray} />
        </mesh>
        <mesh position={[-0.7, 0.1, 0]}>
          <boxGeometry args={[0.4, 0.3, 3.4]} />
          <meshStandardMaterial color={treadGray} />
        </mesh>

        {/* --- Turret Section --- */}
        <group ref={ref} position={[0, 0.65, -0.2]}>
          {/* Main Turret Block */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.4, 0.5, 1.6]} />
            <meshStandardMaterial color={primaryGreen} flatShading />
          </mesh>
          {/* Sloped Turret Front Cheek Plates */}
          <mesh position={[0.4, 0.25, 0.6]} rotation={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.8, 0.45, 0.6]} />
            <meshStandardMaterial color={highlightedPlate} flatShading />
          </mesh>
          <mesh position={[-0.4, 0.25, 0.6]} rotation={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.8, 0.45, 0.6]} />
            <meshStandardMaterial color={highlightedPlate} flatShading />
          </mesh>

          {/* Commander's Hatch */}
          <mesh position={[0.3, 0.52, -0.2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 8]} />
            <meshStandardMaterial color={darkSteel} />
          </mesh>
          {/* Anti-Air Machine Gun */}
          <mesh position={[0.3, 0.7, -0.2]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.4]} />
            <meshStandardMaterial color="#000" />
          </mesh>

          {/* --- Main Gun Barrel --- */}
          <group position={[0, 0.25, 0]} ref={barrelRef}>
            {/* Mantlet */}
            <mesh position={[0, 0, 0.8]}>
              <boxGeometry args={[0.4, 0.3, 0.4]} />
              <meshStandardMaterial color={darkSteel} />
            </mesh>
            {/* Main Long Tube */}
            <mesh position={[0, 0, 2.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 2.4, 8]} />
              <meshStandardMaterial color={darkSteel} />
            </mesh>
            {/* Muzzle Brake */}
            <mesh position={[0, 0, 3.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.3, 8]} />
              <meshStandardMaterial color={primaryGreen} />
            </mesh>
          </group>
        </group>

        {/* --- Rear Engine Deck / Details --- */}
        <mesh position={[0, 0.7, -1.2]} castShadow>
          <boxGeometry args={[1.2, 0.1, 0.6]} />
          <meshStandardMaterial color={highlightedPlate} />
        </mesh>
        {/* Exhaust Pipes */}
        <mesh position={[0.7, 0.5, -1.5]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* --- Identity Details --- */}
        <mesh position={[0.71, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial color={redDetail} />
        </mesh>
        <mesh position={[-0.71, 0.3, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial color={redDetail} />
        </mesh>
      </group>
    </group>
  );
});

export const EnemyArmoredCarModel = React.forwardRef((props: any, ref: any) => {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current) {
      wheelsRef.current.children.forEach((w) => {
        w.rotation.x += 8 * delta; // Rotate around axle
      });
    }
  });

  return (
    <group {...props} scale={[1.2, 1.2, 1.2]}>
      <group position={[0, -0.05, 0]}>
        {/* Compact APC Body */}
        <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
          <boxGeometry args={[2.8, 0.9, 1.6]} />
          <meshStandardMaterial color="#451a03" flatShading />
        </mesh>
        {/* Angled Armor Front */}
        <mesh castShadow receiveShadow position={[1.4, 0.5, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.8, 0.5, 1.6]} />
          <meshStandardMaterial color="#451a03" flatShading />
        </mesh>
        {/* Upper Hull Details */}
        <mesh castShadow receiveShadow position={[-0.2, 1.3, 0]}>
          <boxGeometry args={[1.4, 0.4, 1.4]} />
          <meshStandardMaterial color="#78350f" flatShading />
        </mesh>
        
        {/* Wheels - 4 large off-road wheels */}
        <group ref={wheelsRef}>
          {[[-0.9, 0.9], [0.9, 0.9], [-0.9, -0.9], [0.9, -0.9]].map((pos, i) => (
            <mesh key={i} castShadow position={[pos[0], 0.35, pos[1]]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.35, 10]} />
              <meshStandardMaterial color="#111827" flatShading />
            </mesh>
          ))}
        </group>

        {/* Fast Machine Gun Turret */}
        <group ref={ref} position={[0.2, 1.6, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.6, 0.4, 8]} />
            <meshStandardMaterial color="#1f2937" flatShading />
          </mesh>
          {/* Twin MG Barrels */}
          <mesh castShadow position={[0.6, 0, 0.1]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#000000" flatShading />
          </mesh>
          <mesh castShadow position={[0.6, 0, -0.1]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#000000" flatShading />
          </mesh>
        </group>
      </group>
    </group>
  );
});

export const EnemyMissileTruckModel = React.forwardRef((props: any, ref: any) => {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current) {
      wheelsRef.current.children.forEach((w) => {
        w.rotation.y += 5 * delta;
      });
    }
  });

  return (
    <group {...props} scale={[1.1, 1.1, 1.1]}>
      <group position={[0, -0.05, 0]}>
        {/* Heavy Truck Chassis */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[4.0, 0.4, 1.8]} />
          <meshStandardMaterial color="#064e3b" flatShading />
        </mesh>
        
        {/* Large Cabin */}
        <mesh castShadow receiveShadow position={[1.6, 1.0, 0]}>
          <boxGeometry args={[1.4, 1.2, 1.6]} />
          <meshStandardMaterial color="#064e3b" flatShading />
        </mesh>
        {/* Armored Windows */}
        <mesh castShadow position={[2.31, 1.2, 0]}>
          <boxGeometry args={[0.02, 0.5, 1.4]} />
          <meshStandardMaterial color="#000000" flatShading metalness={0.9} />
        </mesh>
        
        {/* 6 Heavy Wheels */}
        <group ref={wheelsRef}>
          {[[-1.4, 1.0], [-0.4, 1.0], [1.6, 1.0], [-1.4, -1.0], [-0.4, -1.0], [1.6, -1.0]].map((pos, i) => (
            <mesh key={i} castShadow position={[pos[0], 0.4, pos[1]]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.45, 0.45, 0.4, 12]} />
              <meshStandardMaterial color="#111827" flatShading />
            </mesh>
          ))}
        </group>

        {/* Large SAM Launcher Rack */}
        <group position={[-0.8, 0.8, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.5, 12]} />
            <meshStandardMaterial color="#1f2937" flatShading />
          </mesh>
          
          <group ref={ref} position={[0, 0.2, 0]}>
            {/* Launcher Box */}
            <mesh castShadow position={[0, 0.5, 0]}>
              <boxGeometry args={[2.5, 1.0, 1.5]} />
              <meshStandardMaterial color="#374151" flatShading />
            </mesh>
            
            {/* 4 Large Missiles */}
            {[[-0.35, 0.3], [0.35, 0.3], [-0.35, 0.7], [0.35, 0.7]].map((pos, i) => (
              <mesh key={i} castShadow position={[0.2, pos[1], pos[0]]} rotation={[0, 0, -Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.18, 2.6, 6]} />
                <meshStandardMaterial color="#b91c1c" flatShading />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
});

export const EnemyJeepModel = React.forwardRef((props: any, ref: any) => {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current) {
      wheelsRef.current.children.forEach((w) => {
        w.rotation.x += 8 * delta;
      });
    }
  });

  return (
    <group {...props} scale={[1.1, 1.1, 1.1]}>
      <group position={[0, -0.05, 0]}>
        {/* Scout Jeep Body */}
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[2.4, 0.5, 1.4]} />
          <meshStandardMaterial color="#166534" flatShading />
        </mesh>
        {/* Hood & Grille */}
        <mesh castShadow receiveShadow position={[0.6, 0.8, 0]}>
          <boxGeometry args={[1.2, 0.3, 1.3]} />
          <meshStandardMaterial color="#166534" flatShading />
        </mesh>
        {/* Roll Cage / Frame */}
        <mesh castShadow position={[-0.4, 1.0, 0]}>
          <boxGeometry args={[0.9, 0.7, 1.3]} />
          <meshStandardMaterial color="#14532d" flatShading />
        </mesh>
        
        {/* Wheels */}
        <group ref={wheelsRef}>
          {[[-0.8, 0.7], [0.8, 0.7], [-0.8, -0.7], [0.8, -0.7]].map((pos, i) => (
            <mesh key={i} castShadow position={[pos[0], 0.3, pos[1]]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.25, 8]} />
              <meshStandardMaterial color="#111827" flatShading />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
});

export function EnemyGunshipModel(props: any) {
  const rotorRef1 = useRef<THREE.Group>(null);
  const rotorRef2 = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rotorRef1.current) rotorRef1.current.rotation.y += 15 * delta;
    if (rotorRef2.current) rotorRef2.current.rotation.y -= 15 * delta;
  });

  return (
    <group {...props} scale={[0.6, 0.6, 0.6]}>
      {/* Massive Fuselage */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 1.2, 1.2]} />
        <meshStandardMaterial color="#1e3a8a" flatShading />
      </mesh>
      {/* Cockpit */}
      <mesh castShadow position={[-1.2, 0.3, 0]}>
        <boxGeometry args={[1.0, 0.8, 0.8]} />
        <meshStandardMaterial color="#000000" flatShading />
      </mesh>
      {/* Wings */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[1.5, 0.2, 3.5]} />
        <meshStandardMaterial color="#1e3a8a" flatShading />
      </mesh>
      {/* Twin Rotors */}
      <group position={[0, 0.8, 1.2]} ref={rotorRef1}>
        <mesh castShadow>
          <boxGeometry args={[4.0, 0.05, 0.3]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
      </group>
      <group position={[0, 0.8, -1.2]} ref={rotorRef2}>
        <mesh castShadow>
          <boxGeometry args={[4.0, 0.05, 0.3]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
      </group>
    </group>
  );
}

export function EnemyScoutHeliModel(props: any) {
  const rotorRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (rotorRef.current) rotorRef.current.rotation.y += 25 * delta;
  });

  return (
    <group {...props} scale={[0.6, 0.6, 0.6]}>
      {/* Small agile body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#d97706" flatShading />
      </mesh>
      <mesh castShadow position={[1.0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.1, 0.2, 1.5, 6]} />
        <meshStandardMaterial color="#d97706" flatShading />
      </mesh>
      {/* Fast Rotor */}
      <group position={[0, 0.7, 0]} ref={rotorRef}>
        <mesh castShadow>
          <boxGeometry args={[3.0, 0.02, 0.1]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
      </group>
    </group>
  );
}

export function EnemyBlackSharkModel(props: any) {
  const groupRef = useRef<THREE.Group>(null);
  const topRotorRef = useRef<THREE.Group>(null);
  const bottomRotorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate rotors in opposite directions
    if (topRotorRef.current) topRotorRef.current.rotation.y += 0.5;
    if (bottomRotorRef.current) bottomRotorRef.current.rotation.y -= 0.5;

    // Gentle mechanical bobbing
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.1;
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.012;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.01;
    }
  });

  // Palette: Ka-50 "Black Shark"
  const bodyColor = "#1a1b1c"; // Dark Charcoal
  const accentGray = "#2c2e30"; // Lighter contrast plates
  const mechanicalGray = "#35383b";
  const sharkRed = "#cc3333";
  const markerWhite = "#f0f0f0";
  const numbersGold = "#d4af37";
  const cockpitGlass = "#16202b";

  return (
    <group {...props} ref={groupRef} scale={1.1}>
      {/* --- Main Armored Fuselage --- */}
      <mesh position={[0, -0.05, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.75, 2.6]} />
        <meshStandardMaterial color={bodyColor} flatShading />
      </mesh>

      {/* --- Tapered Aggressive Nose --- */}
      <group position={[0, 0, 0.9]}>
        {/* Upper Nose Bridge */}
        <mesh position={[0, 0.1, 0.4]} rotation={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.45, 0.8]} />
          <meshStandardMaterial color={bodyColor} flatShading />
        </mesh>
        {/* Sloped Nose Mid */}
        <mesh position={[0, -0.12, 0.8]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.35, 1.2]} />
          <meshStandardMaterial color={bodyColor} flatShading />
        </mesh>
        {/* Sharp Tip (Sensor Housing) */}
        <mesh position={[0, -0.28, 1.4]} rotation={[0.65, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.2, 0.45]} />
          <meshStandardMaterial color="#0a0a0a" flatShading />
        </mesh>
        {/* Long Pitot Probe */}
        <mesh position={[0, -0.3, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.8]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* --- Shark Mouth (Side Details) --- */}
        <group position={[0, -0.05, 0.6]}>
          {/* Red Base */}
          <mesh position={[0.255, -0.15, 0.3]} rotation={[0.2, Math.PI / 2, 0]}>
             <planeGeometry args={[1.0, 0.3]} />
             <meshStandardMaterial color={sharkRed} transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.255, -0.15, 0.3]} rotation={[-0.2, -Math.PI / 2, 0]}>
             <planeGeometry args={[1.0, 0.3]} />
             <meshStandardMaterial color={sharkRed} transparent opacity={0.9} />
          </mesh>
          {/* Teeth (Simple boxes) */}
          {[0, 0.2, 0.4, 0.6].map((z, i) => (
             <mesh key={i} position={[0.26, -0.08, z]} rotation={[0, Math.PI / 2, 0]}>
               <planeGeometry args={[0.08, 0.1]} />
               <meshStandardMaterial color={markerWhite} />
             </mesh>
          ))}
          {[0, 0.2, 0.4, 0.6].map((z, i) => (
             <mesh key={`l-${i}`} position={[-0.26, -0.08, z]} rotation={[0, -Math.PI / 2, 0]}>
               <planeGeometry args={[0.08, 0.1]} />
               <meshStandardMaterial color={markerWhite} />
             </mesh>
          ))}
        </group>
      </group>

      {/* --- Narrow Cockpit Canopy --- */}
      <group position={[0, 0.35, 0.7]}>
        <mesh rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.45, 0.45, 1.2]} />
          <meshStandardMaterial color={bodyColor} flatShading />
        </mesh>
        {/* Armored Glass */}
        <mesh position={[0, 0.15, 0.55]} rotation={[1.0, 0, 0]}>
          <boxGeometry args={[0.35, 0.5, 0.02]} />
          <meshStandardMaterial color={cockpitGlass} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.23, 0.05, 0]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.02, 0.3, 0.9]} />
          <meshStandardMaterial color={cockpitGlass} transparent opacity={0.7} />
        </mesh>
        <mesh position={[-0.23, 0.05, 0]} rotation={[0, -0.1, 0]}>
          <boxGeometry args={[0.02, 0.3, 0.9]} />
          <meshStandardMaterial color={cockpitGlass} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* --- Wing Sponsons / Engine Pods --- */}
      <group position={[0, 0.25, -0.2]}>
        {/* Mechanical Pods */}
        <mesh position={[0.55, 0, 0.2]} castShadow>
          <boxGeometry args={[0.45, 0.55, 1.4]} />
          <meshStandardMaterial color={accentGray} flatShading />
        </mesh>
        <mesh position={[-0.55, 0, 0.2]} castShadow>
          <boxGeometry args={[0.45, 0.55, 1.4]} />
          <meshStandardMaterial color={accentGray} flatShading />
        </mesh>
        {/* "50" Number on pod side */}
        <mesh position={[0.78, 0.05, 0.5]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color={numbersGold} transparent opacity={0.9} />
        </mesh>
        <mesh position={[-0.78, 0.05, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color={numbersGold} transparent opacity={0.9} />
        </mesh>
        {/* Engine Intake detail */}
        <mesh position={[0.5, 0.1, 0.8]}>
           <boxGeometry args={[0.3, 0.35, 0.1]} />
           <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[-0.5, 0.1, 0.8]}>
           <boxGeometry args={[0.3, 0.35, 0.1]} />
           <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* --- Weapon Pylons (Stub Wings) --- */}
      <group position={[0, -0.2, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[2.6, 0.1, 0.6]} />
          <meshStandardMaterial color={bodyColor} flatShading />
        </mesh>
        {/* Rocket Pods */}
        <group position={[0.9, -0.2, 0]}>
           <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
             <cylinderGeometry args={[0.22, 0.22, 0.6, 12]} />
             <meshStandardMaterial color="#333" />
           </mesh>
           <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.23, 0.23, 0.05]} />
              <meshStandardMaterial color="#111" />
           </mesh>
        </group>
        <group position={[-0.9, -0.2, 0]}>
           <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
             <cylinderGeometry args={[0.22, 0.22, 0.6, 12]} />
             <meshStandardMaterial color="#333" />
           </mesh>
           <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.23, 0.23, 0.05]} />
              <meshStandardMaterial color="#111" />
           </mesh>
        </group>
        {/* AT Missile Tubes */}
        <mesh position={[1.25, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
           <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
           <meshStandardMaterial color={numbersGold} />
        </mesh>
        <mesh position={[-1.25, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
           <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
           <meshStandardMaterial color={numbersGold} />
        </mesh>
      </group>

      {/* --- Tail Unit --- */}
      <group position={[0, 0.1, -2.2]}>
        <mesh rotation={[-0.05, 0, 0]} castShadow>
          <boxGeometry args={[0.28, 0.45, 2.0]} />
          <meshStandardMaterial color={bodyColor} flatShading />
        </mesh>
        {/* Tall Vertical Tail Fin */}
        <group position={[0, 0.8, -0.8]}>
           <mesh castShadow>
             <boxGeometry args={[0.1, 1.4, 0.9]} />
             <meshStandardMaterial color={bodyColor} flatShading />
           </mesh>
           {/* White Top Trim */}
           <mesh position={[0, 0.65, 0]} castShadow>
             <boxGeometry args={[0.12, 0.12, 0.9]} />
             <meshStandardMaterial color={markerWhite} />
           </mesh>
           {/* Red Star Side Emblem */}
           <mesh position={[0.06, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.35, 0.35]} />
              <meshStandardMaterial color={sharkRed} />
           </mesh>
           <mesh position={[-0.06, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.35, 0.35]} />
              <meshStandardMaterial color={sharkRed} />
           </mesh>
        </group>
        {/* Horizontal Elevators */}
        <mesh position={[0, 0.25, -0.6]} castShadow>
           <boxGeometry args={[1.4, 0.06, 0.5]} />
           <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>

      {/* --- Tricycle Gear --- */}
      <group position={[0, -0.65, 0]}>
        {/* Nose Gear */}
        <mesh position={[0, 0, 1.25]}>
           <boxGeometry args={[0.1, 0.4, 0.1]} />
           <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, -0.2, 1.3]} rotation={[0, 0, Math.PI / 2]}>
           <cylinderGeometry args={[0.1, 0.1, 0.12, 8]} />
           <meshStandardMaterial color="#222" />
        </mesh>
        {/* Rear Gear */}
        <mesh position={[0.42, 0, -0.4]} castShadow>
           <boxGeometry args={[0.1, 0.4, 0.1]} />
           <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.42, 0, -0.4]} castShadow>
           <boxGeometry args={[0.1, 0.4, 0.1]} />
           <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.42, -0.2, -0.4]} rotation={[0, 0, Math.PI / 2]}>
           <cylinderGeometry args={[0.14, 0.14, 0.15, 8]} />
           <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-0.42, -0.2, -0.4]} rotation={[0, 0, Math.PI / 2]}>
           <cylinderGeometry args={[0.14, 0.14, 0.15, 8]} />
           <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {/* --- Coaxial Rotor System --- */}
      <group position={[0, 0.9, -0.1]}>
        {/* Heavy Mast */}
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.15, 2.0, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Mechanical Hub Detail */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.3, 8]} />
          <meshStandardMaterial color={mechanicalGray} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.3, 8]} />
          <meshStandardMaterial color={mechanicalGray} />
        </mesh>

        {/* Rotors with 3 blades each for "Ka-50" accuracy */}
        <group position={[0, -0.2, 0]} ref={bottomRotorRef}>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
             <group key={i} rotation={[0, angle, 0]}>
               <mesh position={[1.25, 0, 0]} castShadow>
                 <boxGeometry args={[2.5, 0.04, 0.2]} />
                 <meshStandardMaterial color="#0a0a0a" />
               </mesh>
               <mesh position={[2.4, 0.015, 0]}>
                 <boxGeometry args={[0.2, 0.05, 0.2]} />
                 <meshStandardMaterial color={numbersGold} />
               </mesh>
             </group>
          ))}
        </group>

        <group position={[0, 0.65, 0]} ref={topRotorRef}>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
             <group key={i} rotation={[0, angle, 0]}>
               <mesh position={[1.25, 0, 0]} castShadow>
                 <boxGeometry args={[2.5, 0.04, 0.2]} />
                 <meshStandardMaterial color="#0a0a0a" />
               </mesh>
               <mesh position={[2.4, 0.015, 0]}>
                 <boxGeometry args={[0.2, 0.05, 0.2]} />
                 <meshStandardMaterial color={numbersGold} />
               </mesh>
             </group>
          ))}
        </group>
      </group>

      {/* --- Belly Details (PS1 chunky feel) --- */}
      <mesh position={[0.4, -0.15, 0.8]} rotation={[0, 1.2, 0]}>
         <planeGeometry args={[0.6, 0.4]} />
         <meshStandardMaterial color={accentGray} />
      </mesh>
      <group position={[0, -0.4, 0.1]}>
         <mesh position={[0.2, 0, 0]} castShadow>
           <boxGeometry args={[0.15, 0.05, 0.8]} />
           <meshStandardMaterial color="#000" />
         </mesh>
         <mesh position={[-0.2, 0, 0]} castShadow>
           <boxGeometry args={[0.15, 0.05, 0.8]} />
           <meshStandardMaterial color="#000" />
         </mesh>
      </group>
    </group>
  );
}

// ==========================================
// BOSS VARIANTS (Levels 5, 10, 15, 20, 25, 30)
// ==========================================

export const EnemyMegaTankModel = React.forwardRef((props: any, ref: any) => {
  return (
    <group {...props} scale={3.0}>
      {/* A massive 3x scale tank for Level 5 */}
      <EnemyTankModel ref={ref} />
    </group>
  );
});

export const EnemyHeavyGunshipModel = React.forwardRef((props: any, ref: any) => {
  return (
    <group {...props} scale={2.5}>
      {/* A massive 2.5x scale gunship for Level 10 */}
      <EnemyGunshipModel ref={ref} />
    </group>
  );
});

export const EnemyMegaMissileTruckModel = React.forwardRef((props: any, ref: any) => {
  return (
    <group {...props} scale={2.5}>
      {/* Level 20 Boss */}
      <EnemyMissileTruckModel ref={ref} />
    </group>
  );
});

export const EnemyTwinBlackSharkModel = React.forwardRef((props: any, ref: any) => {
  return (
    <group {...props} ref={ref}>
      {/* Level 25 Boss - Two sharks attached together basically, or just one extra large */}
      <group position={[4, 0, 0]}>
        <EnemyBlackSharkModel />
      </group>
      <group position={[-4, 0, 0]}>
        <EnemyBlackSharkModel />
      </group>
    </group>
  );
});

export const EnemyFinalBlackSharkModel = React.forwardRef((props: any, ref: any) => {
  return (
    <group {...props} scale={2.0} ref={ref}>
      {/* Level 30 Final Boss - Scaled up and menacing */}
      <EnemyBlackSharkModel />
      {/* Added glowing red aura / shield visual to the final boss */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
});
