import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import { 
    EnemyHelicopterModel, EnemyDroneModel, EnemyTankModel,
    EnemyArmoredCarModel, EnemyMissileTruckModel, EnemyJeepModel,
    EnemyGunshipModel, EnemyScoutHeliModel, EnemyBlackSharkModel
} from '../models/EnemyModels';
import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../constants';
import { spawnEffect } from './EffectsManager';
import { audioManager } from '../../audio/AudioManager';

export interface EnemyData {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  health: number;
  fireTimer: number;
  state: 'approach' | 'attack' | 'evade' | 'kamikaze' | 'defensive';
  stateTimer: number;
  targetY: number;
  baseY: number;
  timeOffset: number;
  type: 'helicopter' | 'drone' | 'tank' | 'armored_car' | 'missile_truck' | 'jeep' | 'gunship' | 'scout' | 'blackshark';
  variant: 'standard' | 'aggressive' | 'sniper';
}

const isGroundEnemy = (type: string) => ['tank', 'armored_car', 'missile_truck', 'jeep'].includes(type);

const WAVE_CONFIG: Record<string, { spawnRate: number, composition: Record<string, number> }> = {
    buildup: {
        spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE * 0.8,
        composition: { jeep: 0.4, armored_car: 0.1, drone: 0.2, scout: 0.2, helicopter: 0.1 }
    },
    tension: {
        spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE * 0.7,
        composition: { armored_car: 0.2, helicopter: 0.3, drone: 0.2, tank: 0.1, missile_truck: 0.2 }
    },
    climax: {
        spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE * 0.5,
        composition: { tank: 0.2, gunship: 0.3, missile_truck: 0.1, armored_car: 0.1, helicopter: 0.3 }
    },
    release: {
        spawnRate: 999, // no spawns
        composition: { drone: 1.0 }
    }
};

export function EnemyManager({ enemies, enemyBullets, effects }: { enemies: any[], enemyBullets: any[], effects: any[] }) {
  const [spawnCount, setSpawnCount] = useState(0); // Force re-render on spawn to swap models
  const spawnTimer = useRef(0);
  const waveTimer = useRef(0);
  const totalTimer = useRef(0);
  const wavePhase = useRef<'buildup' | 'tension' | 'climax' | 'release'>('buildup');

  useFrame((state, delta) => {
    const gameState = useStore.getState().gameState;
    const playerPos = useStore.getState().playerPos;
    if (gameState !== 'playing') return;

    spawnTimer.current += delta;
    waveTimer.current += delta;
    totalTimer.current += delta;

    // Phase management
    if (waveTimer.current > 20) {
        waveTimer.current = 0;
        if (wavePhase.current === 'buildup') wavePhase.current = 'tension';
        else if (wavePhase.current === 'tension') wavePhase.current = 'climax';
        else if (wavePhase.current === 'climax') wavePhase.current = 'release';
        else if (wavePhase.current === 'release') wavePhase.current = 'buildup';
    }

    const difficulty = 1.0 + Math.floor(totalTimer.current / 60) * 0.5;
    const waveParams = WAVE_CONFIG[wavePhase.current];
    
    if (spawnTimer.current > waveParams.spawnRate / difficulty) {
        spawnTimer.current = 0;
        const e = enemies.find(e => !e.active) as EnemyData | undefined;
        if (e) {
            const rand = Math.random();
            let cumulativeProb = 0;
            let chosenType = 'helicopter';
            const activeGroundCount = enemies.filter(en => en.active && isGroundEnemy(en.type)).length;
            
            for (const [type, prob] of Object.entries(waveParams.composition)) {
                cumulativeProb += prob;
                if (rand <= cumulativeProb) {
                    chosenType = type;
                    // Prevent too many ground enemies
                    if (isGroundEnemy(chosenType) && activeGroundCount > 6) {
                        chosenType = 'helicopter';
                    }
                    break;
                }
            }

            e.type = chosenType as any;
            
            // Special Spawn Overrides
            if (useStore.getState().score >= 2000 && Math.random() > 0.85) {
                e.type = 'blackshark';
                audioManager.playBossMusic();
            }

            const isGround = isGroundEnemy(e.type);
            
            e.active = true;
            e.health = GAME_CONSTANTS.ENEMY.HEALTH * (isGround ? 2.5 : 1.0) * (e.type === 'tank' ? 3.0 : 1.0) * (e.type === 'gunship' ? 4.0 : 1.0) * (e.type === 'blackshark' ? 5.0 : 1.0) * difficulty;
            e.state = 'approach';
            e.stateTimer = 0;
            e.fireTimer = 0;
            e.baseY = isGround ? 0.0 : Math.random() * (GAME_CONSTANTS.BOUNDS.Y_MAX - GAME_CONSTANTS.BOUNDS.Y_MIN) + GAME_CONSTANTS.BOUNDS.Y_MIN;
            e.targetY = e.baseY;
            
            const roadZ = (Math.random() - 0.5) * 10;
            e.position.set(playerPos[0] + 50, e.baseY, isGround ? roadZ : 0);
            e.velocity.set(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0);
            
            const randVariant = Math.random();
            e.variant = randVariant > 0.8 ? 'sniper' : (randVariant > 0.6 ? 'aggressive' : 'standard');
            
            // Force re-render so EnemyInstance picks up the new type
            setSpawnCount(c => c + 1);
            if (isGround) console.log(`GROUND SPAWN: ${e.type} at ${e.position.x}`);
        }
    }

    // Update Enemies
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i] as EnemyData;
        if (!e.active) continue;

        e.stateTimer += delta;
        
        // AI Logic
        let approachDist = e.variant === 'aggressive' ? 15 : 25;
        if (isGroundEnemy(e.type)) {
            approachDist = e.variant === 'sniper' ? 35 : 20;
        }

        if (e.state === 'approach') {
            const speedMult = e.variant === 'aggressive' ? 1.2 : 1.0;
            const baseSpeed = isGroundEnemy(e.type) ? (e.type === 'tank' ? 0.8 : (e.type === 'armored_car' ? 1.6 : 1.2)) : (e.type === 'scout' ? 2.5 : (e.type === 'blackshark' ? 1.8 : 1.5));
            e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * speedMult * baseSpeed; 
            
            if (e.position.x - playerPos[0] < approachDist) {
                if (!isGroundEnemy(e.type) && (e.type === 'drone' || e.type === 'scout') && e.variant === 'aggressive' && Math.random() > 0.3) {
                    e.state = 'kamikaze';
                } else if (e.variant === 'sniper' && !isGroundEnemy(e.type)) {
                    e.state = 'defensive';
                } else {
                    e.state = 'attack';
                }
                e.stateTimer = 0;
            }
        } else if (e.state === 'attack') {
            const driftAmount = e.variant === 'aggressive' ? 4 : 2;
            const driftSpeed = isGroundEnemy(e.type) ? 0.5 : (e.type === 'scout' ? 4 : 2);
            
            if (isGroundEnemy(e.type)) {
                const attackSpeedMod = e.type === 'tank' ? 0.2 : (e.type === 'armored_car' ? 1.5 : 0.8);
                e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * attackSpeedMod;
                e.targetY = 0.0;
            } else {
                e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - 1 + Math.sin(e.stateTimer * driftSpeed + e.timeOffset) * driftAmount;
                const verticalDrift = e.variant === 'aggressive' ? 7 : 4;
                e.targetY = playerPos[1] + Math.sin(e.stateTimer * 2 + e.timeOffset) * verticalDrift;
            }
            
            const attackDuration = e.variant === 'aggressive' ? 8.0 : 5.0;
            if (e.stateTimer > attackDuration) {
                e.state = 'evade';
                e.stateTimer = 0;
            }
        } else if (e.state === 'defensive') {
            if (isGroundEnemy(e.type)) {
                e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED + 1.5;
                e.targetY = 0.0;
            } else {
                e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED + 2 + Math.sin(e.stateTimer) * 2;
                e.targetY = playerPos[1] + Math.cos(e.stateTimer * 3 + e.timeOffset) * 6;
            }
            
            if (e.stateTimer > 7.0 || e.position.x - playerPos[0] > 60) {
                e.state = 'approach';
                e.stateTimer = 0;
            }
        } else if (e.state === 'kamikaze') {
            if (isGroundEnemy(e.type)) {
                e.state = 'attack';
                e.stateTimer = 0;
            } else {
                const dir = new THREE.Vector3(playerPos[0] - e.position.x, playerPos[1] - e.position.y, 0).normalize();
                e.velocity.copy(dir).multiplyScalar(GAME_CONSTANTS.ENEMY.SPEED * 4.0).add(new THREE.Vector3(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0));
                
                if (e.position.x < playerPos[0] - 5) {
                    e.state = 'evade';
                    e.stateTimer = 0;
                }
            }
        } else if (e.state === 'evade') {
            const evadeSpeed = e.variant === 'aggressive' ? 1.5 : 2.0;
            if (isGroundEnemy(e.type)) {
                e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * evadeSpeed * 0.8;
                e.targetY = 0.0;
            } else {
                e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * evadeSpeed * 1.5; 
                e.targetY = e.baseY + Math.sin(e.stateTimer + e.timeOffset) * 5;
            }
        }

        // Apply movement
        if (e.state !== 'kamikaze') {
            if (isGroundEnemy(e.type)) {
                e.velocity.y = 0;
                e.position.y = 0.0;
            } else {
                e.velocity.y = THREE.MathUtils.lerp(e.velocity.y, (e.targetY - e.position.y) * 2, delta * (e.variant === 'aggressive' ? 6 : 4));
            }
        }
        
        if (!isGroundEnemy(e.type)) {
            if (e.position.y > GAME_CONSTANTS.BOUNDS.Y_MAX) { e.position.y = GAME_CONSTANTS.BOUNDS.Y_MAX; e.velocity.y = 0; }
            if (e.position.y < GAME_CONSTANTS.BOUNDS.Y_MIN) { e.position.y = GAME_CONSTANTS.BOUNDS.Y_MIN; e.velocity.y = 0; }
        }

        e.position.addScaledVector(e.velocity, delta);
        if (isGroundEnemy(e.type)) e.position.y = 0; else e.position.z = 0;

        // Fire bullets
        e.fireTimer += delta;
        const fireRateMult = e.variant === 'aggressive' ? 0.7 : (e.variant === 'sniper' ? 1.5 : 1.0);
        const baseFireRate = isGroundEnemy(e.type) ? (e.type === 'tank' ? 3.0 : 2.0) : (e.type === 'scout' ? 1.0 : 1.8);
        const currentFireRate = (baseFireRate * fireRateMult) / Math.sqrt(difficulty);

        if (e.fireTimer > currentFireRate && e.state === 'attack' && e.position.x > playerPos[0]) {
            e.fireTimer = 0;
            const b = enemyBullets.find(bullet => !bullet.active);
            if (b) {
                b.active = true;
                // Model-specific bullet spawn offsets (relative to center)
                let spawnOffset = new THREE.Vector3(0, 0.5, 0);
                if (e.type === 'tank') spawnOffset.set(-2.2, 0.8, 0);
                else if (e.type === 'armored_car') spawnOffset.set(-1.8, 0.8, 0);
                else if (e.type === 'missile_truck') spawnOffset.set(-1.0, 2.0, 0);
                else if (e.type === 'jeep') spawnOffset.set(-1.5, 0.8, 0);
                else if (e.type === 'helicopter' || e.type === 'blackshark') spawnOffset.set(-2.0, -0.2, 0);
                else if (e.type === 'gunship') spawnOffset.set(-2.5, -0.4, 0);
                else if (e.type === 'scout') spawnOffset.set(-0.8, -0.1, 0);
                else if (e.type === 'drone') spawnOffset.set(0, -0.6, 0);

                const spawnPos = e.position.clone().add(spawnOffset);
                b.position.copy(spawnPos);
                
                let targetPos = new THREE.Vector3(playerPos[0] + 5, playerPos[1], 0);
                if (isGroundEnemy(e.type)) {
                    targetPos.y += (Math.random() - 0.5) * 6; // High vertical spread for ground
                    targetPos.x += (Math.random() - 0.5) * 8;
                }

                const dir = targetPos.sub(spawnPos).normalize();
                let bulletSpeedMult = e.type === 'tank' ? 1.2 : 0.6;
                b.velocity.copy(dir).multiplyScalar(GAME_CONSTANTS.BULLET.SPEED * bulletSpeedMult).add(new THREE.Vector3(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0));
                b.lifetime = GAME_CONSTANTS.BULLET.LIFETIME * 2.0;
                
                spawnEffect(effects, spawnPos, 'muzzle', 0.5, '#ea580c');
            }
        }
        
        if (e.position.x < playerPos[0] - 40) e.active = false;
    }
    
    // Update Bullets
    for (let i = 0; i < enemyBullets.length; i++) {
        const b = enemyBullets[i];
        if (b.active) {
            b.position.addScaledVector(b.velocity, delta);
            b.lifetime -= delta;
            if (b.lifetime <= 0) b.active = false;
        }
    }
  });

  return (
    <group>
      {enemies.map((enemy, index) => (
        <EnemyInstance key={index} enemy={enemy} />
      ))}
    </group>
  );
}

function EnemyInstance({ enemy }: { enemy: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const turretRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.copy(enemy.position);
      groupRef.current.visible = enemy.active;
      
      if (enemy.active) {
          if (isGroundEnemy(enemy.type)) {
              const playerPos = useStore.getState().playerPos;
              if (turretRef.current && (enemy.type === 'tank' || enemy.type === 'armored_car')) {
                  const dx = playerPos[0] - enemy.position.x;
                  const dy = playerPos[1] - enemy.position.y;
                  let targetAngle = Math.atan2(dy, -dx);
                  turretRef.current.rotation.z = THREE.MathUtils.lerp(turretRef.current.rotation.z, targetAngle, 5 * delta);
              } else if (turretRef.current && enemy.type === 'missile_truck') {
                  const dx = playerPos[0] - enemy.position.x;
                  const dy = playerPos[1] - enemy.position.y;
                  let targetAngle = Math.atan2(dy, -dx);
                  targetAngle = Math.max(0, Math.min(Math.PI/2, targetAngle));
                  turretRef.current.rotation.z = THREE.MathUtils.lerp(turretRef.current.rotation.z, targetAngle, 3 * delta);
              }
              
              const speedRatio = Math.abs(GAME_CONSTANTS.PLAYER.SCROLL_SPEED - enemy.velocity.x) / GAME_CONSTANTS.PLAYER.SCROLL_SPEED;
              const bounceFreq = enemy.type === 'tank' ? 3 : 6;
              const bounceAmp = enemy.type === 'tank' ? 0.015 : 0.03;
              const bounce = Math.sin(enemy.position.x * bounceFreq) * bounceAmp * (speedRatio > 0.1 ? 1 : 0);
              
              groupRef.current.position.y = enemy.position.y + Math.max(0, bounce); 
              groupRef.current.rotation.z = bounce * 0.5;
              groupRef.current.rotation.x = Math.cos(enemy.position.x * (bounceFreq * 0.7)) * (bounceAmp * 0.3);
          } else {
              const forwardTilt = (GAME_CONSTANTS.PLAYER.SCROLL_SPEED - enemy.velocity.x) * (enemy.type === 'drone' ? 0.08 : 0.05);
              const verticalTilt = enemy.velocity.y * (enemy.type === 'drone' ? 0.04 : 0.02);
              const targetRotZ = THREE.MathUtils.clamp(-forwardTilt + verticalTilt, -0.6, 0.6);
              const targetRotX = THREE.MathUtils.clamp(-enemy.velocity.y * 0.05, -0.5, 0.5);
              groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 10 * delta);
              groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 10 * delta);
          }
      }
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {enemy.active && enemy.state === 'kamikaze' && (
        <pointLight position={[0, 0, 0]} distance={5} intensity={5} color="#ff0000" />
      )}
      {enemy.type === 'drone' ? (
        <EnemyDroneModel rotation={[0, -Math.PI / 2, 0]} scale={1.8} />
      ) : enemy.type === 'tank' ? (
        <EnemyTankModel ref={turretRef} rotation={[0, -Math.PI / 2, 0]} />
      ) : enemy.type === 'armored_car' ? (
        <EnemyArmoredCarModel ref={turretRef} rotation={[0, Math.PI, 0]} />
      ) : enemy.type === 'missile_truck' ? (
        <EnemyMissileTruckModel ref={turretRef} rotation={[0, Math.PI, 0]} />
      ) : enemy.type === 'jeep' ? (
        <EnemyJeepModel rotation={[0, Math.PI, 0]} />
      ) : enemy.type === 'gunship' ? (
        <EnemyGunshipModel rotation={[0, 0, 0]} />
      ) : enemy.type === 'scout' ? (
        <EnemyScoutHeliModel rotation={[0, 0, 0]} scale={1.5} />
      ) : enemy.type === 'blackshark' ? (
        <EnemyBlackSharkModel rotation={[0, -Math.PI / 2, 0]} />
      ) : (
        <EnemyHelicopterModel rotation={[0, -Math.PI / 2, 0]} />
      )}
    </group>
  );
}
