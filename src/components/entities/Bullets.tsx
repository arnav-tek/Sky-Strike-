import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function BulletManager({ bullets }: { bullets: any[] }) {
  return (
    <group>
      {bullets.map((bullet, idx) => (
        <BulletInstance key={idx} bullet={bullet} />
      ))}
    </group>
  );
}

function BulletInstance({ bullet }: { bullet: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(bullet.position);
      meshRef.current.visible = bullet.active;
    }
  });

  return (
    <mesh ref={meshRef} visible={false} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
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
      <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
      <meshStandardMaterial color="#fef08a" />
      <mesh position={[0, -0.4, 0]}>
         <cylinderGeometry args={[0.05, 0.1, 0.2, 8]} />
         <meshStandardMaterial color="#ea580c" />
      </mesh>
    </mesh>
  );
}
