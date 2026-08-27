import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../constants';

// --- GPU Optimization: Instantiated once at module level ---
const weaponGeo = new THREE.OctahedronGeometry(0.55);
const shieldGeo = new THREE.SphereGeometry(0.45, 8, 8);
const nukeGeo = new THREE.TorusGeometry(0.35, 0.12, 6, 12);
const glowRingGeo = new THREE.TorusGeometry(0.75, 0.04, 4, 16);

export interface PowerupData {
  active: boolean;
  position: THREE.Vector3;
  type: 'weapon' | 'shield' | 'nuke';
  lifetime: number;
}

export default function PowerupManager({ powerups }: { powerups: PowerupData[] }) {
  return (
    <group>
      {powerups.map((item, idx) => (
        <PowerupInstance key={idx} data={item} />
      ))}
    </group>
  );
}

function PowerupInstance({ data }: { data: PowerupData }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.visible = data.active;
    if (data.active) {
      // Drift slowly to the left
      data.position.x -= (GAME_CONSTANTS.PLAYER.SCROLL_SPEED * 0.1 + 2.5) * delta;
      
      // Bobbing floating animation
      const bobbing = Math.sin(data.lifetime * 4.0) * 0.2;
      ref.current.position.set(data.position.x, data.position.y + bobbing, data.position.z);

      if (meshRef.current) {
        meshRef.current.rotation.y += 2.0 * delta;
        meshRef.current.rotation.x += 1.0 * delta;
      }

      // Check lifetime
      data.lifetime -= delta;
      if (data.lifetime <= 0) {
        data.active = false;
      }
    }
  });

  const geometry = React.useMemo(() => {
    if (data.type === 'weapon') return weaponGeo;
    if (data.type === 'shield') return shieldGeo;
    return nukeGeo;
  }, [data.type]);

  const color = React.useMemo(() => {
    if (data.type === 'weapon') return '#ef4444'; // Red Weapon
    if (data.type === 'shield') return '#06b6d4'; // Cyan Shield
    return '#a855f7'; // Purple Nuke
  }, [data.type]);

  return (
    <group ref={ref} visible={false}>
      {/* Glow aura */}
      <mesh rotation={[Math.PI / 2, 0, 0]} geometry={glowRingGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      
      {/* Light cast */}
      <pointLight distance={6} intensity={2} color={color} />
      
      {/* Central crystal */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} flatShading roughness={0.3} />
      </mesh>
    </group>
  );
}
