import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- GPU Optimization: Instantiated once at module level ---
const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 6);
const wingGeo = new THREE.BoxGeometry(1.2, 0.12, 0.35);
const chunkGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);

export interface DebrisData {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotSpeed: THREE.Vector3;
  color: string;
  scale: number;
  lifetime: number;
  bounces: number;
  type: 'chunk' | 'tire' | 'wing';
}

export default function DebrisManager({ debris }: { debris: DebrisData[] }) {
  return (
    <group>
      {debris.map((item, idx) => (
        <DebrisInstance key={idx} data={item} />
      ))}
    </group>
  );
}

function DebrisInstance({ data }: { data: DebrisData }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.visible = data.active;
    if (data.active) {
      // 1. Gravity physics
      data.velocity.y -= 35 * delta;

      // 2. Apply movement velocity
      data.position.addScaledVector(data.velocity, delta);

      // 3. Spin rotation
      data.rotation.x += data.rotSpeed.x * delta;
      data.rotation.y += data.rotSpeed.y * delta;
      data.rotation.z += data.rotSpeed.z * delta;

      ref.current.position.copy(data.position);
      ref.current.rotation.copy(data.rotation);

      // 4. Boundary Collision (Ground road bounce)
      const roadZWidth = 8.5;
      if (data.position.y <= 0.1) {
        data.position.y = 0.1;
        
        if (Math.abs(data.position.z) <= roadZWidth) {
          // Bouncy tarmac highway!
          if (data.bounces < 3) {
            data.velocity.y = -data.velocity.y * 0.45; // Bounce up with dampening
            data.velocity.x *= 0.7; // Tarmac friction
            data.velocity.z *= 0.7;
            data.bounces++;
            
            // Randomize spin speed after bounce
            data.rotSpeed.set(
              (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 15
            );
          } else {
            // Stop bouncing, slide along road
            data.velocity.set(0, 0, 0);
            data.rotSpeed.set(0, 0, 0);
          }
        } else {
          // Off road: softer grass ground absorption
          if (data.bounces < 2) {
            data.velocity.y = -data.velocity.y * 0.2; // Soft dampening
            data.velocity.x *= 0.4; // Grass friction
            data.velocity.z *= 0.4;
            data.bounces++;
          } else {
            data.velocity.set(0, 0, 0);
            data.rotSpeed.set(0, 0, 0);
          }
        }
      }

      // 5. Decrement lifetime
      data.lifetime -= delta;
      if (data.lifetime <= 0) {
        data.active = false;
      }
    }
  });

  const geometry = React.useMemo(() => {
    if (data.type === 'tire') return tireGeo;
    if (data.type === 'wing') return wingGeo;
    return chunkGeo;
  }, [data.type]);

  const matColor = data.type === 'tire' ? '#1c1917' : data.color;

  return (
    <group ref={ref} visible={false} scale={data.scale}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={matColor} flatShading roughness={0.8} />
      </mesh>
    </group>
  );
}
