import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Environment from './world/Environment';
import Player from './entities/Player';
import { EnemyManager } from './entities/Enemy';
import { BulletManager, MissileManager } from './entities/Bullets';
import CollisionManager from './entities/CollisionManager';
import CameraController from './CameraController';
import EffectsManager, { useEffects } from './entities/EffectsManager';
import DebrisManager from './entities/DebrisManager';
import PowerupManager from './entities/PowerupManager';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

// Custom component to link camera shake to Chromatic Aberration
function DynamicEffects() {
  const cameraShake = useStore(state => state.cameraShake);
  
  // Create a ref for the chromatic aberration offset
  const caOffset = new THREE.Vector2(0, 0);
  if (cameraShake > 0) {
    caOffset.set(cameraShake * 0.01, cameraShake * 0.01);
  }

  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={1.5} 
      />
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL} 
        offset={caOffset} 
      />
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={0.6} 
      />
    </EffectComposer>
  );
}

function GameSession() {
  const bulletsRef = useRef(Array.from({ length: 50 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lifetime: 0
  })));

  const enemiesRef = useRef(Array.from({ length: 50 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    health: 0,
    fireTimer: 0,
    state: 'approach' as any,
    stateTimer: 0,
    targetY: 0,
    baseY: 0,
    timeOffset: Math.random() * 100,
    type: 'helicopter' as any,
    variant: 'standard' as any,
    burstCount: 0,
    shieldActive: false,
    laneIndex: 0
  })));

  const enemyBulletsRef = useRef(Array.from({ length: 100 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lifetime: 0
  })));

  const playerMissilesRef = useRef(Array.from({ length: 15 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lifetime: 0
  })));

  const debrisRef = useRef(Array.from({ length: 60 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    rotSpeed: new THREE.Vector3(),
    color: '#78716c',
    scale: 1.0,
    lifetime: 0,
    bounces: 0,
    type: 'chunk' as 'chunk' | 'tire' | 'wing'
  })));

  const powerupsRef = useRef(Array.from({ length: 10 }, () => ({
    active: false,
    position: new THREE.Vector3(),
    type: 'weapon' as 'weapon' | 'shield' | 'nuke',
    lifetime: 0
  })));

  const effects = useEffects();

  return (
    <>
      <Player bullets={bulletsRef.current} missiles={playerMissilesRef.current} effects={effects} enemies={enemiesRef.current} />
      <BulletManager bullets={bulletsRef.current} />
      <MissileManager missiles={playerMissilesRef.current} />
      <EnemyManager enemies={enemiesRef.current} enemyBullets={enemyBulletsRef.current} effects={effects} />
      <BulletManager bullets={enemyBulletsRef.current} isEnemy />
      
      <DebrisManager debris={debrisRef.current} />
      <PowerupManager powerups={powerupsRef.current} />
      
      <CollisionManager 
        bullets={bulletsRef.current} 
        missiles={playerMissilesRef.current} 
        enemies={enemiesRef.current} 
        enemyBullets={enemyBulletsRef.current} 
        effects={effects} 
        debris={debrisRef.current}
        powerups={powerupsRef.current}
      />
      <EffectsManager effects={effects} />
      <DynamicEffects />
    </>
  );
}

const LIGHT_CONFIGS: Record<number, {
  skyColor: string;
  hemisphereGroundColor: string;
  directionalColor: string;
  directionalIntensity: number;
}> = {
  0: { // Forest
    skyColor: "#7dd3fc",
    hemisphereGroundColor: "#064e3b",
    directionalColor: "#fef08a",
    directionalIntensity: 1.5,
  },
  1: { // Desert Mountain
    skyColor: "#fed7aa",
    hemisphereGroundColor: "#b45309",
    directionalColor: "#fbbf24",
    directionalIntensity: 1.8,
  },
  2: { // Snow Mountain
    skyColor: "#cbd5e1",
    hemisphereGroundColor: "#475569",
    directionalColor: "#e0f2fe",
    directionalIntensity: 1.4,
  }
};

export default function GameCanvas() {
  const playSessionId = useStore(state => state.playSessionId);
  const currentLevel = useStore(state => state.currentLevel);
  const theme = (currentLevel - 1) % 3; // 0 = Forest, 1 = Desert, 2 = Snow
  const cfg = LIGHT_CONFIGS[theme];

  return (
    <Canvas shadows camera={{ position: [0, 10, 30], fov: 45 }}>
      <color attach="background" args={[cfg.skyColor]} />
      <fog attach="fog" args={[cfg.skyColor, 60, 250]} />

      <hemisphereLight intensity={0.6} color="#ffffff" groundColor={cfg.hemisphereGroundColor} />
      <directionalLight 
        position={[40, 60, 20]} 
        intensity={cfg.directionalIntensity} 
        color={cfg.directionalColor}
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />

      <Environment />
      
      {/* GameSession is keyed by playSessionId so all internal states (enemy pools, bullets, effects) 
          are completely destroyed and recreated from scratch on game reset */}
      <GameSession key={playSessionId} />
      
      <CameraController />
    </Canvas>
  );
}
