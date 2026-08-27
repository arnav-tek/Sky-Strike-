import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- R3F GPU Performance Optimization: Instantiated once at module level ---
const playerOuterGeo = new THREE.CapsuleGeometry(0.07, 0.45, 4, 8);
const playerInnerGeo = new THREE.CapsuleGeometry(0.07 * 0.5, 0.45 * 0.9, 4, 8);
const playerOuterMat = new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.6 });
const playerInnerMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

const bossOuterGeo = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8);
const bossInnerGeo = new THREE.CapsuleGeometry(0.13 * 0.5, 0.55 * 0.92, 4, 8);
const bossBoxGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const bossOuterMat = new THREE.MeshBasicMaterial({ color: '#d946ef', transparent: true, opacity: 0.5 });
const bossInnerMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
const bossCoronaMat = new THREE.MeshBasicMaterial({ color: '#c084fc', transparent: true, opacity: 0.8 });

const heavyOuterGeo = new THREE.CapsuleGeometry(0.11, 0.5, 4, 8);
const heavyInnerGeo = new THREE.CapsuleGeometry(0.09 * 0.55, 0.45 * 0.95, 4, 8);
const heavyOuterMat = new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.55 });
const heavyInnerMat = new THREE.MeshBasicMaterial({ color: '#f97316' });

const stdOuterGeo = new THREE.CapsuleGeometry(0.08, 0.35, 4, 8);
const stdInnerGeo = new THREE.CapsuleGeometry(0.08 * 0.5, 0.35 * 0.85, 4, 8);
const stdOuterMat = new THREE.MeshBasicMaterial({ color: '#ff0055', transparent: true, opacity: 0.7 });
const stdInnerMat = new THREE.MeshBasicMaterial({ color: '#ffe4e6' });

const missileBodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
const missileNoseGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
const missileFinGeo = new THREE.BoxGeometry(0.24, 0.02, 0.08);
const missileTailFinGeo = new THREE.BoxGeometry(0.4, 0.02, 0.12);
const missileExhaustGeo = new THREE.ConeGeometry(0.06, 0.2, 8);

const missileBodyMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 });
const missileNoseMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.3 });
const missileFinMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 });
const missileExhaustMat = new THREE.MeshBasicMaterial({ color: '#f97316', transparent: true, opacity: 0.85 });


export function BulletManager({ bullets, isEnemy = false }: { bullets: any[], isEnemy?: boolean }) {
  return (
    <group>
      {bullets.map((bullet, idx) => (
        <BulletInstance key={idx} bullet={bullet} isEnemy={isEnemy} />
      ))}
    </group>
  );
}

function BulletInstance({ bullet, isEnemy = false }: { bullet: any, isEnemy?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.copy(bullet.position);
      groupRef.current.visible = bullet.active;
      
      if (bullet.active) {
        // Point capsule geometry in direction of travel (velocity vector)
        if (bullet.velocity && bullet.velocity.lengthSq() > 0.1) {
          const angle = Math.atan2(bullet.velocity.y, bullet.velocity.x);
          groupRef.current.rotation.z = angle + Math.PI / 2; // capsule is vertical, align to horizontal
        }
        
        // Pulsating/vibrating size over time to look like active energy
        if (isEnemy) {
          const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 32) * 0.15;
          groupRef.current.scale.set(pulse, pulse, pulse);
        } else {
          // Player bullets have a very high-speed micro-vibration
          const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 50) * 0.05;
          groupRef.current.scale.set(pulse, pulse, pulse);
        }
      }
    }
  });

  const enemyType = bullet.enemyType || 'standard';
  const isBossBullet = ['blackshark', 'blackshark_twin', 'blackshark_final', 'mega_tank', 'heavy_gunship', 'mega_missile_truck'].includes(enemyType);
  const isHeavyBullet = ['tank', 'gunship', 'helicopter'].includes(enemyType);

  if (!isEnemy) {
    // Player Autocannon Bullets
    return (
      <group ref={groupRef} visible={false}>
        <mesh geometry={playerOuterGeo} material={playerOuterMat} castShadow />
        <mesh geometry={playerInnerGeo} material={playerInnerMat} scale={[0.5, 0.9, 0.5]} />
      </group>
    );
  }

  if (isBossBullet) {
    // Boss High-Energy Laser
    return (
      <group ref={groupRef} visible={false}>
        <mesh geometry={bossOuterGeo} material={bossOuterMat} castShadow />
        <mesh geometry={bossInnerGeo} material={bossInnerMat} scale={[0.5, 0.92, 0.5]} />
        <mesh geometry={bossBoxGeo} material={bossCoronaMat} rotation={[0, Math.PI / 4, 0]} scale={[1.1, 0.35, 0.2]} />
      </group>
    );
  }

  if (isHeavyBullet) {
    // Heavy Units Tracers
    return (
      <group ref={groupRef} visible={false}>
        <mesh geometry={heavyOuterGeo} material={heavyOuterMat} castShadow />
        <mesh geometry={heavyInnerGeo} material={heavyInnerMat} scale={[0.55, 0.95, 0.55]} />
      </group>
    );
  }

  // Light/Standard Enemy Ammo
  return (
    <group ref={groupRef} visible={false}>
      <mesh geometry={stdOuterGeo} material={stdOuterMat} castShadow />
      <mesh geometry={stdInnerGeo} material={stdInnerMat} scale={[0.5, 0.85, 0.5]} />
    </group>
  );
}

export function MissileManager({ missiles }: { missiles: any[] }) {
  return (
    <group>
      {missiles.map((missile, idx) => (
        <MissileInstance key={idx} missile={missile} />
      ))}
    </group>
  );
}

function MissileInstance({ missile }: { missile: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(missile.position);
      meshRef.current.visible = missile.active;
      
      if (missile.active && missile.velocity.lengthSq() > 0.1) {
        // Point missile in direction of velocity
        const angle = Math.atan2(missile.velocity.y, missile.velocity.x);
        meshRef.current.rotation.z = angle;
      }
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <group rotation={[0, 0, -Math.PI / 2]}>
        {/* Main Body */}
        <mesh geometry={missileBodyGeo} material={missileBodyMat} castShadow />
        {/* Seeker Nose Tip */}
        <mesh geometry={missileNoseGeo} material={missileNoseMat} position={[0, 0.625, 0]} castShadow />
        {/* Orange Warning Stripe */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.06, 8]} />
          <meshStandardMaterial color="#ea580c" roughness={0.4} />
        </mesh>
        {/* Canard Nose Fins */}
        <mesh geometry={missileFinGeo} material={missileFinMat} position={[0, 0.4, 0]} />
        <mesh geometry={missileFinGeo} material={missileFinMat} position={[0, 0.4, 0]} rotation={[0, Math.PI / 2, 0]} />
        {/* Main Rear Wings */}
        <mesh geometry={missileTailFinGeo} material={missileFinMat} position={[0, -0.35, 0]} />
        <mesh geometry={missileTailFinGeo} material={missileFinMat} position={[0, -0.35, 0]} rotation={[0, Math.PI / 2, 0]} />
        {/* Glowing Exhaust Cone */}
        <mesh geometry={missileExhaustGeo} material={missileExhaustMat} position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]} />
        {/* Engine Light */}
        <pointLight color="#f97316" intensity={1.5} distance={6} position={[0, -0.8, 0]} />
      </group>
    </mesh>
  );
}
