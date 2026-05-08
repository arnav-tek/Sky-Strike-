import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import { 
    EnemyHelicopterModel, EnemyDroneModel, EnemyTankModel,
    EnemyArmoredCarModel, EnemyMissileTruckModel, EnemyJeepModel,
    EnemyGunshipModel, EnemyScoutHeliModel
} from '../models/EnemyModels';
import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../constants';
import { spawnEffect } from './EffectsManager';

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
  type: 'helicopter' | 'drone' | 'tank' | 'armored_car' | 'missile_truck' | 'jeep' | 'gunship' | 'scout';
  variant: 'standard' | 'aggressive' | 'sniper';
}

const isGroundEnemy = (type: string) => ['tank', 'armored_car', 'missile_truck', 'jeep'].includes(type);

const WAVE_CONFIG: Record<string, { spawnRate: number, composition: Record<string, number> }> = {
    buildup: {
        spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE * 0.8,
        composition: { jeep: 0.3, drone: 0.3, scout: 0.2, helicopter: 0.2 }
    },
    tension: {
        spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE * 0.5,
        composition: { armored_car: 0.3, helicopter: 0.2, drone: 0.2, tank: 0.2, missile_truck: 0.1 }
    },
    climax: {
        spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE * 0.35,
        composition: { tank: 0.3, gunship: 0.3, missile_truck: 0.2, armored_car: 0.2 }
    },
    release: {
        spawnRate: 999, // no spawns
        composition: { drone: 1.0 }
    }
};

export function EnemyManager({ enemies, enemyBullets, effects }: { enemies: any[], enemyBullets: any[], effects: any[] }) {
  const spawnTimer = useRef(0);
  const waveTimer = useRef(0);
  const totalTimer = useRef(0);
  const wavePhase = useRef<'buildup' | 'tension' | 'climax' | 'release'>('buildup');

  useFrame((_, delta) => {
    const state = useStore.getState();
    if (state.gameOver || state.hitStop > 0 || state.gameState === 'gameover' || state.gameState !== 'playing' || state.paused) return;

    const playerPos = state.playerPos;

    waveTimer.current += delta;
    spawnTimer.current += delta;
    totalTimer.current += delta;

    const difficulty = 1.0 + Math.floor(totalTimer.current / 60) * 0.5; // Increases by 50% every minute

    // Wave Logic
    if (waveTimer.current < 20) {
        wavePhase.current = 'buildup';
    } else if (waveTimer.current < 40) {
        wavePhase.current = 'tension';
    } else if (waveTimer.current < 55) {
        wavePhase.current = 'climax';
    } else if (waveTimer.current < 60) {
        wavePhase.current = 'release';
    } else {
        waveTimer.current = 0; // Loop waves
    }

    const { currentPhase } = { currentPhase: wavePhase.current };
    const waveParams = WAVE_CONFIG[currentPhase];
    
    if (spawnTimer.current > waveParams.spawnRate / difficulty) {
        spawnTimer.current = 0;
        const e = enemies.find(e => !e.active) as EnemyData | undefined;
        if (e) {
            e.active = true;
            
            const rand = Math.random();
            let chosenType = 'drone';
            let cumulativeProb = 0;
            for (const [type, prob] of Object.entries(waveParams.composition)) {
                cumulativeProb += prob;
                if (rand <= cumulativeProb) {
                    chosenType = type;
                    break;
                }
            }
            
            e.type = chosenType as any;
            const isGround = isGroundEnemy(e.type);
            
            e.health = GAME_CONSTANTS.ENEMY.HEALTH * (isGround ? 2.5 : 1.0) * (e.type === 'tank' ? 3.0 : 1.0) * (e.type === 'gunship' ? 4.0 : 1.0) * difficulty;
            e.state = 'approach';
            e.stateTimer = 0;
            e.fireTimer = 0;
            
            e.baseY = isGround ? 0.0 : Math.random() * (GAME_CONSTANTS.BOUNDS.Y_MAX - GAME_CONSTANTS.BOUNDS.Y_MIN) + GAME_CONSTANTS.BOUNDS.Y_MIN;
            e.targetY = e.baseY;
            
            const roadZ = (Math.random() - 0.5) * 10; // Road is 15 units wide, stay within center 10
            e.position.set(playerPos[0] + 70, e.baseY, isGround ? roadZ : 0);
            e.velocity.set(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0);
            
            const randVariant = Math.random();
            if (isGround) {
                e.variant = randVariant > 0.7 ? 'sniper' : 'standard';
            } else if (randVariant > 0.8) {
                e.variant = 'sniper';
            } else if (randVariant > 0.6) {
                e.variant = 'aggressive';
            } else {
                e.variant = 'standard';
            }
            e.timeOffset = Math.random() * Math.PI * 2;
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        let e = enemies[i] as EnemyData;
        if (!e.active) continue;

        e.stateTimer += delta;
        
        if (e.state === 'approach') {
            const speedMult = e.variant === 'aggressive' ? 1.2 : 1.0;
            const baseSpeed = isGroundEnemy(e.type) ? (e.type === 'tank' ? 0.6 : (e.type === 'armored_car' ? 1.4 : 1.0)) : (e.type === 'scout' ? 2.5 : 1.5);
            e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * speedMult * baseSpeed; 
            
            let approachDist = e.variant === 'sniper' ? 35 : (e.variant === 'aggressive' ? 15 : 25);
            if (isGroundEnemy(e.type)) {
                approachDist = e.variant === 'sniper' ? 25 : 18;
            }

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
                // Ground vehicles drive steadily without sliding
                const attackSpeedMod = e.type === 'tank' ? -0.5 : (e.type === 'armored_car' ? 1.0 : 0);
                e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 0.2 + attackSpeedMod;
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

        if (e.state !== 'kamikaze') {
            if (isGroundEnemy(e.type)) {
                e.velocity.y = 0;
                e.position.y = 0.0;
            } else {
                e.velocity.y = THREE.MathUtils.lerp(e.velocity.y, (e.targetY - e.position.y) * 2, delta * (e.variant === 'aggressive' ? 6 : 4));
            }
        }
        
        if (!isGroundEnemy(e.type)) {
            if (e.position.y > GAME_CONSTANTS.BOUNDS.Y_MAX) {
                e.position.y = GAME_CONSTANTS.BOUNDS.Y_MAX;
                if (e.velocity.y > 0) e.velocity.y = 0;
            }
            if (e.position.y < GAME_CONSTANTS.BOUNDS.Y_MIN) {
                e.position.y = GAME_CONSTANTS.BOUNDS.Y_MIN;
                if (e.velocity.y < 0) e.velocity.y = 0;
            }
        }

        e.position.addScaledVector(e.velocity, delta);
        if (isGroundEnemy(e.type)) {
            e.position.y = 0; // Absolute ground lock
        } else {
            e.position.z = 0; // Air enemies stay on plane
        }

        e.fireTimer += delta;
        
        const fireRateMult = e.variant === 'aggressive' ? 0.7 : (e.variant === 'sniper' ? 1.5 : 1.0);
        const baseFireRate = isGroundEnemy(e.type) ? (e.type === 'tank' ? 2.5 : e.type === 'missile_truck' ? 3.0 : e.type === 'armored_car' ? 0.8 : 1.5) : (e.type === 'gunship' ? 0.8 : e.type === 'scout' ? 0.5 : 1.5);
        const currentFireRate = (baseFireRate * fireRateMult) / Math.sqrt(difficulty);

        // Only fire if facing player or ground enemy
        if (e.fireTimer > currentFireRate && (e.state === 'attack' || e.state === 'defensive') && e.position.x > playerPos[0]) {
            e.fireTimer = 0;
            const b = enemyBullets.find(eb => !eb.active);
            if (b) {
                b.active = true;
                const zOffset = Math.random() > 0.5 ? 1.0 : -1.0;
                
                let spawnOffset = new THREE.Vector3(-1.5, -0.3, zOffset);
                if (isGroundEnemy(e.type)) {
                    spawnOffset = new THREE.Vector3(-1.0, 1.2, 0);
                } else if (e.type === 'drone' || e.type === 'scout') {
                    spawnOffset = new THREE.Vector3(0, -0.3, 0);
                }

                const spawnPos = e.position.clone().add(spawnOffset);
                b.position.copy(spawnPos);
                
                let targetPos = new THREE.Vector3(playerPos[0] + 5, playerPos[1], 0);
                
                // Add inaccuracy based on enemy type
                if (isGroundEnemy(e.type)) {
                    if (e.type === 'armored_car') {
                        targetPos.y += (Math.random() - 0.5) * 4;
                        targetPos.x += (Math.random() - 0.5) * 4;
                    }
                }

                const dir = targetPos.sub(e.position).normalize();
                let bulletSpeedMult = e.variant === 'sniper' ? 0.8 : (e.type === 'scout' ? 0.6 : 0.4);
                
                // Tanks have faster projectiles
                if (e.type === 'tank') bulletSpeedMult = 1.0;
                if (e.type === 'missile_truck') bulletSpeedMult = 0.5;

                b.velocity.copy(dir).multiplyScalar(GAME_CONSTANTS.BULLET.SPEED * bulletSpeedMult).add(new THREE.Vector3(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0));
                b.lifetime = GAME_CONSTANTS.BULLET.LIFETIME * (e.type === 'tank' || e.variant === 'sniper' ? 2.5 : 1.5);
                
                spawnEffect(effects, spawnPos, 'muzzle', (e.type === 'tank' || e.type === 'gunship' ? 1.0 : 0.5), '#ea580c');
            }
        }
        
        if (e.position.x < playerPos[0] - 40) {
            e.active = false;
        }
    }
    
    for (let i = 0; i < enemyBullets.length; i++) {
        let b = enemyBullets[i];
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
                  // Clamp missile launcher angle
                  targetAngle = Math.max(0, Math.min(Math.PI/2, targetAngle));
                  turretRef.current.rotation.z = THREE.MathUtils.lerp(turretRef.current.rotation.z, targetAngle, 3 * delta);
              }
              
              // Arcade suspension / bounce based on movement
              const speedRatio = Math.abs(GAME_CONSTANTS.PLAYER.SCROLL_SPEED - enemy.velocity.x) / GAME_CONSTANTS.PLAYER.SCROLL_SPEED;
              const bounceFreq = enemy.type === 'tank' ? 3 : 6;
              const bounceAmp = enemy.type === 'tank' ? 0.015 : 0.03;
              const bounce = Math.sin(enemy.position.x * bounceFreq) * bounceAmp * (speedRatio > 0.1 ? 1 : 0);
              
              // Apply bounce to Y but keep it extremely subtle to avoid "floating"
              // We also apply a slight pitch (X) and roll (Z) based on the "terrain" (simulated by noise)
              groupRef.current.position.y = enemy.position.y + Math.max(0, bounce); 
              groupRef.current.rotation.z = bounce * 0.5;
              groupRef.current.rotation.x = Math.cos(enemy.position.x * (bounceFreq * 0.7)) * (bounceAmp * 0.3);
          } else {
              // Tilt visually based on movement
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
        <EnemyDroneModel rotation={[0, -Math.PI / 2, 0]} />
      ) : enemy.type === 'tank' ? (
        <EnemyTankModel ref={turretRef} rotation={[0, Math.PI, 0]} />
      ) : enemy.type === 'armored_car' ? (
        <EnemyArmoredCarModel ref={turretRef} rotation={[0, Math.PI, 0]} />
      ) : enemy.type === 'missile_truck' ? (
        <EnemyMissileTruckModel ref={turretRef} rotation={[0, Math.PI, 0]} />
      ) : enemy.type === 'jeep' ? (
        <EnemyJeepModel rotation={[0, Math.PI, 0]} />
      ) : enemy.type === 'gunship' ? (
        <EnemyGunshipModel rotation={[0, -Math.PI / 2, 0]} />
      ) : enemy.type === 'scout' ? (
        <EnemyScoutHeliModel rotation={[0, -Math.PI / 2, 0]} />
      ) : (
        <EnemyHelicopterModel rotation={[0, -Math.PI / 2, 0]} />
      )}
    </group>
  );
}
