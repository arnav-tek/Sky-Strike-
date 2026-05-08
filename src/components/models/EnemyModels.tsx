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

  return (
    <group {...props} scale={[0.5, 0.5, 0.5]}>
      {/* Sleek Apache-style Fuselage */}
      <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 2.5, 6]} />
        <meshStandardMaterial color="#7f1d1d" flatShading />
      </mesh>

      {/* Pointy Nose */}
      <mesh castShadow position={[0, -0.1, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.3, 0.6, 6]} />
        <meshStandardMaterial color="#450a0a" flatShading />
      </mesh>

      {/* Tandem Cockpit Canopy */}
      <mesh castShadow position={[0, 0.3, 0.8]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 1.2]} />
        <meshStandardMaterial color="#000000" flatShading metalness={0.8} />
      </mesh>

      {/* Tail Boom */}
      <mesh castShadow position={[0, 0.1, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.1, 1.6, 5]} />
        <meshStandardMaterial color="#7f1d1d" flatShading />
      </mesh>

      {/* Tail Fin (Vertical) */}
      <mesh castShadow position={[0, 0.4, -2.5]}>
        <boxGeometry args={[0.08, 0.8, 0.5]} />
        <meshStandardMaterial color="#450a0a" flatShading />
      </mesh>

      {/* Tail Fin (Horizontal) */}
      <mesh castShadow position={[0, 0.1, -2.5]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#450a0a" flatShading />
      </mesh>

      {/* Stub Wings */}
      <mesh castShadow position={[0, 0, 0.2]}>
        <boxGeometry args={[2.0, 0.1, 0.5]} />
        <meshStandardMaterial color="#7f1d1d" flatShading />
      </mesh>

      {/* Weapon Pods */}
      <mesh castShadow position={[0.8, -0.2, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 6]} />
        <meshStandardMaterial color="#ea580c" flatShading />
      </mesh>
      <mesh castShadow position={[-0.8, -0.2, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 6]} />
        <meshStandardMaterial color="#ea580c" flatShading />
      </mesh>

      {/* Sensor Pod / Chin Gun mount */}
      <mesh castShadow position={[0, -0.3, 1.2]}>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color="#000000" flatShading />
      </mesh>

      {/* Main Rotor System */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.4, 6]} />
        <meshStandardMaterial color="#111827" flatShading />
      </mesh>
      <group position={[0, 0.7, 0]} ref={rotorRef}>
        <mesh castShadow>
          <boxGeometry args={[5.5, 0.04, 0.2]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
        <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[5.5, 0.04, 0.2]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
      </group>

      {/* Tail Rotor */}
      <group position={[0.1, 0.5, -2.5]} ref={tailRotorRef}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 1.0, 0.1]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.04, 1.0, 0.1]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
      </group>

      {/* Landing Skids */}
      <group position={[0, -0.1, 0]}>
        <mesh castShadow position={[0.4, -0.4, 0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
        <mesh castShadow position={[-0.4, -0.4, 0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
        <mesh castShadow position={[0.4, -0.4, -0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
        <mesh castShadow position={[-0.4, -0.4, -0.5]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
        <mesh castShadow position={[0.4, -0.6, 0]}>
          <boxGeometry args={[0.05, 0.05, 1.6]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
        <mesh castShadow position={[-0.4, -0.6, 0]}>
          <boxGeometry args={[0.05, 0.05, 1.6]} />
          <meshStandardMaterial color="#111827" flatShading />
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
    <group {...props} scale={[0.4, 0.4, 0.4]}>
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
  const wheelsRef = useRef<THREE.Group>(null);
  const wheelsRef2 = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current) {
      wheelsRef.current.children.forEach((w) => {
        w.rotation.y += 5 * delta;
      });
    }
    if (wheelsRef2.current) {
      wheelsRef2.current.children.forEach((w) => {
        w.rotation.y += 5 * delta;
      });
    }
  });

  return (
    <group {...props} scale={[1.3, 1.3, 1.3]}>
      {/* Grounding offset: move everything down slightly to avoid floating */}
      <group position={[0, -0.05, 0]}>
        {/* Heavy Hull - Wider for "Heavy" feel */}
        <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[3.2, 0.7, 2.6]} />
          <meshStandardMaterial color="#3f3f46" flatShading />
        </mesh>
        
        {/* Sloped Glacis Plate */}
        <mesh castShadow receiveShadow position={[0.6, 0.85, 0]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[2.0, 0.3, 2.2]} />
          <meshStandardMaterial color="#52525b" flatShading />
        </mesh>

        {/* Side Armor Skirts */}
        <mesh castShadow position={[0, 0.45, 1.35]}>
          <boxGeometry args={[3.4, 0.6, 0.1]} />
          <meshStandardMaterial color="#27272a" flatShading />
        </mesh>
        <mesh castShadow position={[0, 0.45, -1.35]}>
          <boxGeometry args={[3.4, 0.6, 0.1]} />
          <meshStandardMaterial color="#27272a" flatShading />
        </mesh>

        {/* Treads - Lowered to touch ground properly */}
        <group position={[0, 0.25, 1.1]}>
          <mesh castShadow>
            <boxGeometry args={[3.6, 0.5, 0.4]} />
            <meshStandardMaterial color="#18181b" flatShading roughness={0.9} />
          </mesh>
          <group ref={wheelsRef}>
            {[-1.3, -0.6, 0, 0.6, 1.3].map((x, i) => (
              <mesh key={i} position={[x, -0.05, 0.21]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.08, 8]} />
                <meshStandardMaterial color="#3f3f46" flatShading />
              </mesh>
            ))}
          </group>
        </group>
        <group position={[0, 0.25, -1.1]}>
          <mesh castShadow>
            <boxGeometry args={[3.6, 0.5, 0.4]} />
            <meshStandardMaterial color="#18181b" flatShading roughness={0.9} />
          </mesh>
          <group ref={wheelsRef2}>
            {[-1.3, -0.6, 0, 0.6, 1.3].map((x, i) => (
              <mesh key={i} position={[x, -0.05, -0.21]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.08, 8]} />
                <meshStandardMaterial color="#3f3f46" flatShading />
              </mesh>
            ))}
          </group>
        </group>

        {/* Heavy Turret */}
        <group ref={ref} position={[-0.2, 1.2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.7, 1.8]} />
            <meshStandardMaterial color="#27272a" flatShading />
          </mesh>
          {/* Main Gun Barrel - Longer and thicker */}
          <mesh castShadow position={[1.8, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.15, 2.4, 8]} />
            <meshStandardMaterial color="#18181b" flatShading />
          </mesh>
          {/* Muzzle Brake */}
          <mesh castShadow position={[3.0, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 8]} />
            <meshStandardMaterial color="#000000" flatShading />
          </mesh>
          {/* Hatch Details */}
          <mesh castShadow position={[-0.4, 0.4, 0.4]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 8]} />
            <meshStandardMaterial color="#52525b" flatShading />
          </mesh>
          <mesh castShadow position={[0.4, 0.4, -0.4]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
            <meshStandardMaterial color="#52525b" flatShading />
          </mesh>
        </group>
      </group>
    </group>
  );
});

export const EnemyArmoredCarModel = React.forwardRef((props: any, ref: any) => {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current) {
      wheelsRef.current.children.forEach((w) => {
        w.rotation.y += 8 * delta; // Faster wheels for fast car
      });
    }
  });

  return (
    <group {...props} scale={[0.8, 0.8, 0.8]}>
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
        w.rotation.y += 8 * delta;
      });
    }
  });

  return (
    <group {...props} scale={[0.75, 0.75, 0.75]}>
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
    <group {...props} scale={[0.3, 0.3, 0.3]}>
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
