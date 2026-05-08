import React from 'react';
import { Canvas } from '@react-three/fiber';
import Environment from './world/Environment';
import Player from './entities/Player';
import { EnemyManager } from './entities/Enemy';
import { BulletManager, MissileManager } from './entities/Bullets';
import CollisionManager from './entities/CollisionManager';
import CameraController from './CameraController';
import EffectsManager, { useEffects } from './entities/EffectsManager';
import * as THREE from 'three';

export default function GameCanvas() {
  const [bullets] = React.useState(() => Array.from({ length: 50 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lifetime: 0
  })));

  const [enemies] = React.useState(() => Array.from({ length: 40 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    health: 0,
    fireTimer: 0,
    state: 'approach',
    stateTimer: 0,
    targetY: 0,
    baseY: 0,
    timeOffset: Math.random() * 100,
    type: 'helicopter',
    variant: 'standard'
  })));

  const [enemyBullets] = React.useState(() => Array.from({ length: 100 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lifetime: 0
  })));

  const [playerMissiles] = React.useState(() => Array.from({ length: 15 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lifetime: 0
  })));

  const [effects] = useEffects();

  return (
    <Canvas shadows camera={{ position: [0, 10, 30], fov: 45 }}>
      <color attach="background" args={["#7dd3fc"]} />
      <fog attach="fog" args={["#7dd3fc", 60, 250]} />

      <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#064e3b" />
      <directionalLight 
        position={[40, 60, 20]} 
        intensity={1.5} 
        color="#fef08a"
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />

      <Environment />
      <Player bullets={bullets} missiles={playerMissiles} effects={effects} />
      <BulletManager bullets={bullets} />
      <MissileManager missiles={playerMissiles} />
      <EnemyManager enemies={enemies} enemyBullets={enemyBullets} effects={effects} />
      <BulletManager bullets={enemyBullets} />
      <CollisionManager bullets={bullets} missiles={playerMissiles} enemies={enemies} enemyBullets={enemyBullets} effects={effects} />
      <EffectsManager effects={effects} />
      <CameraController />
    </Canvas>
  );
}
