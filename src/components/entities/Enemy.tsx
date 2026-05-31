import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import { 
    EnemyHelicopterModel, EnemyDroneModel, EnemyTankModel,
    EnemyArmoredCarModel, EnemyMissileTruckModel, EnemyJeepModel,
    EnemyGunshipModel, EnemyScoutHeliModel, EnemyBlackSharkModel,
    EnemyMegaTankModel, EnemyHeavyGunshipModel, EnemyMegaMissileTruckModel,
    EnemyTwinBlackSharkModel, EnemyFinalBlackSharkModel
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
  state: 'approach' | 'attack' | 'evade' | 'kamikaze' | 'defensive' | 'strafe' | 'burst_fire' | 'retreat' | 'shield' | 'reposition';
  stateTimer: number;
  targetY: number;
  baseY: number;
  timeOffset: number;
  type: 'helicopter' | 'drone' | 'tank' | 'armored_car' | 'missile_truck' | 'jeep' | 'gunship' | 'scout' | 'blackshark' | 'mega_tank' | 'heavy_gunship' | 'mega_missile_truck' | 'blackshark_twin' | 'blackshark_final';
  variant: 'standard' | 'aggressive' | 'sniper';
  burstCount: number;
  shieldActive: boolean;
  laneIndex: number;
}

const isGroundEnemy = (type: string) => ['tank', 'armored_car', 'missile_truck', 'jeep', 'mega_tank', 'mega_missile_truck'].includes(type);
const isBossType = (type: string) => ['blackshark', 'mega_tank', 'heavy_gunship', 'mega_missile_truck', 'blackshark_twin', 'blackshark_final'].includes(type);

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
        spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE * 1.5,
        composition: { drone: 0.5, jeep: 0.3, scout: 0.2 }
    }
};

const ROAD_LANES = [-4, 0, 4];

export function EnemyManager({ enemies, enemyBullets, effects }: { enemies: any[], enemyBullets: any[], effects: any[] }) {
  const spawnTimer = useRef(0);
  const waveTimer = useRef(0);
  const totalTimer = useRef(0);
  const wavePhase = useRef<'buildup' | 'tension' | 'climax' | 'release'>('buildup');

  const bossSpawnedRef = useRef(false);
  const previousLevel = useRef(1);

  useFrame((state, delta) => {
    const storeState = useStore.getState();
    const { gameState, playerPos, currentLevel, levelTransitioning, score } = storeState;
    
    if (gameState !== 'playing') return;

    if (currentLevel !== previousLevel.current) {
        previousLevel.current = currentLevel;
        bossSpawnedRef.current = false;
        wavePhase.current = 'buildup';
        waveTimer.current = 0;
        totalTimer.current = 0;
    }

    // Tick level timer for stats/tracking
    if (!levelTransitioning) {
        useStore.getState().tickLevelTimer(delta);
    }

    const isBossLevel = currentLevel % 5 === 0;

    // Score-based level completion: 2000 + (currentLevel-1)*500 points earned during the current level
    // Boss levels complete when the boss is killed (handled in CollisionManager)
    const levelScoreGained = score - useStore.getState().levelStartScore;
    const levelScoreTarget = 2000 + (currentLevel - 1) * 500;
    if (!isBossLevel && !levelTransitioning && levelScoreGained >= levelScoreTarget) {
        useStore.getState().completeLevel();
    }

    if (levelTransitioning) {
        // Stop spawning during transitions
        return;
    }

    spawnTimer.current += delta;
    waveTimer.current += delta;
    totalTimer.current += delta;

    // Phase management (15 seconds per phase)
    if (waveTimer.current > 15) {
        waveTimer.current = 0;
        if (wavePhase.current === 'buildup') wavePhase.current = 'tension';
        else if (wavePhase.current === 'tension') wavePhase.current = 'climax';
        else if (wavePhase.current === 'climax') wavePhase.current = 'release';
        else if (wavePhase.current === 'release') wavePhase.current = 'buildup';
    }

    // Difficulty scaling based on current level
    const healthMult = 1.0 + (currentLevel * 0.15);
    const fireRateMult = 1.0 + (currentLevel * 0.1);
    const spawnRateMult = 1.0 + (currentLevel * 0.08);
    const waveParams = WAVE_CONFIG[wavePhase.current];
    
    if (spawnTimer.current > waveParams.spawnRate / spawnRateMult) {
        spawnTimer.current = 0;
        const e = enemies.find(e => !e.active) as EnemyData | undefined;
        if (e) {
            let chosenType = 'helicopter';

            if (isBossLevel && !bossSpawnedRef.current && totalTimer.current > 5) {
                // Spawn the specific boss for this level
                if (currentLevel === 5) chosenType = 'mega_tank';
                else if (currentLevel === 10) chosenType = 'heavy_gunship';
                else if (currentLevel === 15) chosenType = 'blackshark';
                else if (currentLevel === 20) chosenType = 'mega_missile_truck';
                else if (currentLevel === 25) chosenType = 'blackshark_twin';
                else chosenType = 'blackshark_final'; // 30+

                bossSpawnedRef.current = true;
                audioManager.playBossMusic();
            } else if (isBossLevel) {
                // Spawn light fodder during boss levels
                chosenType = Math.random() > 0.5 ? 'drone' : 'jeep';
            } else {
                const rand = Math.random();
                let cumulativeProb = 0;
                
                for (const [type, prob] of Object.entries(waveParams.composition)) {
                    cumulativeProb += prob;
                    if (rand <= cumulativeProb) {
                        chosenType = type;
                        break;
                    }
                }
            }

            e.type = chosenType as any;
            const isGround = isGroundEnemy(e.type);
            const isBoss = isBossType(e.type);
            
            e.active = true;
            // Balance pass on health per enemy
            let baseHealthMult = 1.0;
            if (e.type === 'tank') baseHealthMult = 3.0;
            if (e.type === 'gunship') baseHealthMult = 4.0;
            if (e.type === 'drone') baseHealthMult = 0.5;
            if (e.type === 'jeep') baseHealthMult = 0.8;

            // Boss health scaling
            if (e.type === 'mega_tank') baseHealthMult = 15.0;
            if (e.type === 'heavy_gunship') baseHealthMult = 18.0;
            if (e.type === 'blackshark') baseHealthMult = 20.0;
            if (e.type === 'mega_missile_truck') baseHealthMult = 25.0;
            if (e.type === 'blackshark_twin') baseHealthMult = 30.0;
            if (e.type === 'blackshark_final') baseHealthMult = 40.0;
            
            e.health = GAME_CONSTANTS.ENEMY.HEALTH * baseHealthMult * healthMult;
            e.state = 'approach';
            e.stateTimer = 0;
            e.fireTimer = 0;
            e.burstCount = 0;
            e.shieldActive = false;
            
            if (isGround) {
                 e.baseY = GAME_CONSTANTS.ENEMY.GROUND_Y_OFFSETS[e.type as keyof typeof GAME_CONSTANTS.ENEMY.GROUND_Y_OFFSETS] || 0;
                 // Mega tank offset slightly higher
                 if (e.type === 'mega_tank') e.baseY = 1.8;
                 if (e.type === 'mega_missile_truck') e.baseY = 1.5;
            } else {
                 // Airborne units should spawn higher up, not near the ground
                 const minAirY = Math.max(6, GAME_CONSTANTS.BOUNDS.Y_MIN + 4);
                 e.baseY = Math.random() * (GAME_CONSTANTS.BOUNDS.Y_MAX - minAirY) + minAirY;
            }
            e.targetY = e.baseY;
            
            e.laneIndex = isGround ? Math.floor(Math.random() * ROAD_LANES.length) : 0;
            if (isBoss && isGround) e.laneIndex = 1; // Bosses always in center lane
            const roadZ = isGround ? ROAD_LANES[e.laneIndex] : 0;
            
            e.position.set(playerPos[0] + 50, e.baseY, roadZ);
            e.velocity.set(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0);
            
            const randVariant = Math.random();
            e.variant = randVariant > 0.8 ? 'sniper' : (randVariant > 0.6 ? 'aggressive' : 'standard');
            if (isBoss) e.variant = 'aggressive';
        }
    }

    // Update Enemies
    let bossFound = false;
    let bossHpPct = 0;
    
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i] as EnemyData;
        if (isBossType(e.type)) {
            bossFound = true;
            let baseHealthMult = 15.0;
            if (e.type === 'mega_tank') baseHealthMult = 15.0;
            if (e.type === 'heavy_gunship') baseHealthMult = 18.0;
            if (e.type === 'blackshark') baseHealthMult = 20.0;
            if (e.type === 'mega_missile_truck') baseHealthMult = 25.0;
            if (e.type === 'blackshark_twin') baseHealthMult = 30.0;
            if (e.type === 'blackshark_final') baseHealthMult = 40.0;

            const maxHp = GAME_CONSTANTS.ENEMY.HEALTH * baseHealthMult * healthMult;
            bossHpPct = (e.health / maxHp) * 100;
        }

        e.stateTimer += delta;
        const dx = e.position.x - playerPos[0];
        const isGround = isGroundEnemy(e.type);

        // --- NEW AI BEHAVIORS ---
        switch (e.type) {
            case 'drone':
                // Sine wave kamikaze or fast evasive
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 1.5;
                    e.targetY = Math.max(6, e.baseY + Math.sin(e.timeOffset + e.stateTimer * 2) * 3);
                    if (dx < 20) {
                        e.state = e.variant === 'aggressive' ? 'kamikaze' : 'attack';
                        e.stateTimer = 0;
                    }
                } else if (e.state === 'attack') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 0.5;
                    e.targetY = Math.max(6, playerPos[1] + Math.sin(e.stateTimer * 4) * 4);
                    if (e.stateTimer > 4) e.state = 'evade';
                } else if (e.state === 'kamikaze') {
                    const dir = new THREE.Vector3(playerPos[0] - e.position.x, playerPos[1] - e.position.y, 0).normalize();
                    e.velocity.copy(dir).multiplyScalar(GAME_CONSTANTS.ENEMY.SPEED * 3.0).add(new THREE.Vector3(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0));
                } else if (e.state === 'evade') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 2.0;
                    e.targetY = GAME_CONSTANTS.BOUNDS.Y_MAX;
                }
                break;
                
            case 'scout':
                // Hit and run strafing
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 2.5;
                    if (dx < 25) { e.state = 'strafe'; e.stateTimer = 0; }
                } else if (e.state === 'strafe') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - 1;
                    e.targetY = Math.max(6, playerPos[1] + Math.cos(e.stateTimer * 3) * 5);
                    if (e.stateTimer > 3) { e.state = 'retreat'; e.stateTimer = 0; }
                } else if (e.state === 'retreat') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED + GAME_CONSTANTS.ENEMY.SPEED * 1.5; // Fly forward away
                    e.targetY = GAME_CONSTANTS.BOUNDS.Y_MAX;
                    if (dx > 60) e.active = false;
                }
                break;
                
            case 'helicopter':
                // Standard hover and shoot
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 1.2;
                    if (dx < 25) { e.state = 'attack'; e.stateTimer = 0; }
                } else if (e.state === 'attack') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED;
                    e.targetY = Math.max(6, playerPos[1] + Math.sin(e.stateTimer) * 2);
                    if (e.stateTimer > 6) { e.state = 'evade'; e.stateTimer = 0; }
                } else if (e.state === 'evade') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 1.5;
                    e.targetY = e.baseY;
                }
                break;
                
            case 'gunship':
            case 'heavy_gunship':
                // Flying fortress, slow advance, burst fire
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 0.5;
                    e.targetY = Math.max(6, playerPos[1]);
                    if (dx < 35) { e.state = 'burst_fire'; e.stateTimer = 0; }
                } else if (e.state === 'burst_fire') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED;
                    e.targetY = Math.max(6, playerPos[1] + Math.sin(e.stateTimer * 2) * 3);
                    if (e.stateTimer > 5) { e.state = 'reposition'; e.stateTimer = 0; }
                } else if (e.state === 'reposition') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED + GAME_CONSTANTS.ENEMY.SPEED;
                    e.targetY = Math.random() > 0.5 ? GAME_CONSTANTS.BOUNDS.Y_MAX - 2 : Math.max(6, GAME_CONSTANTS.BOUNDS.Y_MIN + 4);
                    if (e.stateTimer > 2) { e.state = 'burst_fire'; e.stateTimer = 0; }
                }
                break;
                
            case 'blackshark':
            case 'blackshark_twin':
            case 'blackshark_final':
                // Boss behavior
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 1.8;
                    if (dx < 20) { e.state = 'attack'; e.stateTimer = 0; }
                } else if (e.state === 'attack') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED + Math.sin(e.stateTimer) * 5; // Swoop back and forth
                    e.targetY = playerPos[1] + Math.cos(e.stateTimer * 1.5) * 6;
                    
                    // Periodic shields
                    if (e.health < GAME_CONSTANTS.ENEMY.HEALTH * 15 * 0.5 && e.stateTimer > 10) {
                        e.state = 'shield'; e.stateTimer = 0;
                    }
                } else if (e.state === 'shield') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED;
                    e.targetY = GAME_CONSTANTS.BOUNDS.Y_MAX - 2;
                    e.shieldActive = true;
                    if (e.stateTimer > 5) { e.state = 'attack'; e.stateTimer = 0; e.shieldActive = false; }
                }
                break;
                
            case 'tank':
            case 'mega_tank':
                // Slow ground advance
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 0.8;
                    if (dx < 20) { e.state = 'attack'; e.stateTimer = 0; }
                } else if (e.state === 'attack') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 0.2; // Crawl
                    if (e.stateTimer > 5) { e.state = 'approach'; e.stateTimer = 0; }
                }
                break;
                
            case 'armored_car':
                // Weaves between lanes
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 1.5;
                    e.position.z = ROAD_LANES[e.laneIndex] + Math.sin(e.stateTimer * 2) * 1.5;
                    if (dx < 15) { e.state = 'attack'; e.stateTimer = 0; }
                } else if (e.state === 'attack') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 0.8;
                    e.position.z = Math.sin(e.timeOffset + e.stateTimer) * 3;
                    if (e.stateTimer > 4) { e.state = 'evade'; e.stateTimer = 0; }
                } else if (e.state === 'evade') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 2.0;
                }
                break;
                
            case 'missile_truck':
            case 'mega_missile_truck':
                // Snipes from afar
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 1.0;
                    if (dx < 35) { e.state = 'defensive'; e.stateTimer = 0; } // Stop far back
                } else if (e.state === 'defensive') {
                    // Match player speed to stay far away
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED;
                    if (dx < 15) e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED + 2; // Retreat if player gets close
                    if (e.stateTimer > 8) { e.state = 'evade'; e.stateTimer = 0; } // Prevent getting stuck
                } else if (e.state === 'evade') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 1.5; // Fall back and despawn
                }
                break;
                
            case 'jeep':
                // Fast rush
                if (e.state === 'approach') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 2.5;
                    if (dx < 5) { e.state = 'retreat'; e.stateTimer = 0; } // Zoom past
                } else if (e.state === 'retreat') {
                    e.velocity.x = GAME_CONSTANTS.PLAYER.SCROLL_SPEED - GAME_CONSTANTS.ENEMY.SPEED * 3.0; // Keep going fast
                }
                break;
        }

        // Apply movement
        if (e.state !== 'kamikaze' && !isGround) {
            e.velocity.y = THREE.MathUtils.lerp(e.velocity.y, (e.targetY - e.position.y) * 2, delta * 4);
        }
        
        e.position.addScaledVector(e.velocity, delta);

        // Enforce bounds for airborne enemies
        if (!isGround && e.state !== 'kamikaze') {
            if (e.position.y > GAME_CONSTANTS.BOUNDS.Y_MAX) { e.position.y = GAME_CONSTANTS.BOUNDS.Y_MAX; e.velocity.y = 0; }
            if (e.position.y < GAME_CONSTANTS.BOUNDS.Y_MIN) { e.position.y = GAME_CONSTANTS.BOUNDS.Y_MIN; e.velocity.y = 0; }
        }
        
        if (isGround) {
            e.position.y = e.baseY; // Hard lock to ground Y offset
            e.velocity.y = 0;
            // Z controlled by specific AI (e.g. armored car weaving) or fixed lane
        } else {
            e.position.z = 0;
        }

        // Fire bullets
        e.fireTimer += delta;
        
        let currentFireRate = 1.0 / fireRateMult;
        let shouldFire = false;
        
        switch(e.type) {
            case 'drone':
                currentFireRate *= 1.5;
                shouldFire = (e.state === 'attack' || e.state === 'kamikaze') && dx > 0;
                break;
            case 'scout':
                currentFireRate *= 0.8;
                shouldFire = e.state === 'strafe' && dx > 0;
                break;
            case 'helicopter':
                currentFireRate *= 1.8;
                shouldFire = e.state === 'attack' && dx > 0;
                break;
            case 'gunship':
            case 'heavy_gunship':
                currentFireRate *= 0.3; // Very fast bursts
                shouldFire = e.state === 'burst_fire' && dx > 0;
                if (shouldFire && e.fireTimer > currentFireRate) {
                    e.burstCount++;
                    if (e.burstCount > 5) {
                        e.fireTimer = -2.0; // Cooldown after burst
                        e.burstCount = 0;
                    }
                }
                break;
            case 'blackshark':
            case 'blackshark_twin':
            case 'blackshark_final':
                currentFireRate *= 0.8;
                shouldFire = e.state === 'attack' && !e.shieldActive && dx > -5;
                break;
            case 'tank':
            case 'mega_tank':
                currentFireRate *= 3.0;
                shouldFire = e.state === 'attack' && dx > 0;
                break;
            case 'armored_car':
                currentFireRate *= 0.5;
                shouldFire = e.state === 'attack' && dx > 0;
                break;
            case 'missile_truck':
            case 'mega_missile_truck':
                currentFireRate *= 4.0; // Slow reload
                shouldFire = e.state === 'defensive' && dx > 0;
                break;
            case 'jeep':
                currentFireRate *= 1.0;
                shouldFire = e.state === 'approach' && dx > 0 && dx < 20;
                break;
        }

        if (e.fireTimer > currentFireRate && shouldFire) {
            e.fireTimer = 0;
            const b = enemyBullets.find(bullet => !bullet.active);
            if (b) {
                b.active = true;
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
                if (isGround) {
                    targetPos.y += (Math.random() - 0.5) * 6;
                    targetPos.x += (Math.random() - 0.5) * 8;
                }

                const dir = targetPos.sub(spawnPos).normalize();
                let bulletSpeedMult = e.type === 'tank' || e.type === 'missile_truck' ? 1.2 : 0.6;
                b.velocity.copy(dir).multiplyScalar(GAME_CONSTANTS.BULLET.SPEED * bulletSpeedMult).add(new THREE.Vector3(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0));
                b.lifetime = GAME_CONSTANTS.BULLET.LIFETIME * 2.0;
                
                spawnEffect(effects, spawnPos, 'muzzle', 0.5, '#ea580c');
            }
        }
        
        if (e.position.x < playerPos[0] - 40) e.active = false;
        if (e.position.x > playerPos[0] + 120) e.active = false; // despawn if too far ahead
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
    
    let bossName = "UNKNOWN BOSS";
    const bossEntity = enemies.find(e => e.active && isBossType(e.type));
    if (bossEntity) {
        if (bossEntity.type === 'mega_tank') bossName = "MEGA TANK";
        if (bossEntity.type === 'heavy_gunship') bossName = "HEAVY GUNSHIP";
        if (bossEntity.type === 'blackshark') bossName = "BLACK SHARK";
        if (bossEntity.type === 'mega_missile_truck') bossName = "MEGA MISSILE TRUCK";
        if (bossEntity.type === 'blackshark_twin') bossName = "TWIN SHARKS";
        if (bossEntity.type === 'blackshark_final') bossName = "FINAL BLACK SHARK";
    }

    if (bossFound !== useStore.getState().bossActive || Math.abs(bossHpPct - useStore.getState().bossHealthPercent) > 1 || bossName !== useStore.getState().bossName) {
        useStore.getState().setBossState(bossFound, bossHpPct, bossName);
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

function EnemyInstance({ enemy }: { enemy: EnemyData }) {
  const groupRef = useRef<THREE.Group>(null);
  const turretRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.copy(enemy.position);
      groupRef.current.visible = enemy.active;
      
      if (enemy.active) {
          // Dynamic model visibility update without React re-renders
          groupRef.current.children.forEach(child => {
              if (child.name && child.name.startsWith("model_")) {
                  const modelType = child.name.substring(6); // remove "model_"
                  child.visible = (enemy.type === modelType);
              }
          });

          const isGround = isGroundEnemy(enemy.type);
          if (isGround) {
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
              
              groupRef.current.position.y = enemy.baseY + Math.max(0, bounce); 
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
      {enemy.shieldActive && (
        <mesh>
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} wireframe />
        </mesh>
      )}
      
      {/* Dynamic Model Rendering without React State updates */}
      <group name="model_drone" visible={false}><EnemyDroneModel rotation={[0, -Math.PI / 2, 0]} scale={1.8} /></group>
      <group name="model_tank" visible={false}><EnemyTankModel ref={turretRef} rotation={[0, -Math.PI / 2, 0]} /></group>
      <group name="model_mega_tank" visible={false}><EnemyMegaTankModel ref={turretRef} rotation={[0, -Math.PI / 2, 0]} /></group>
      <group name="model_armored_car" visible={false}><EnemyArmoredCarModel ref={turretRef} rotation={[0, Math.PI, 0]} /></group>
      <group name="model_missile_truck" visible={false}><EnemyMissileTruckModel ref={turretRef} rotation={[0, Math.PI, 0]} /></group>
      <group name="model_mega_missile_truck" visible={false}><EnemyMegaMissileTruckModel ref={turretRef} rotation={[0, Math.PI, 0]} /></group>
      <group name="model_jeep" visible={false}><EnemyJeepModel rotation={[0, Math.PI, 0]} /></group>
      <group name="model_gunship" visible={false}><EnemyGunshipModel rotation={[0, 0, 0]} /></group>
      <group name="model_heavy_gunship" visible={false}><EnemyHeavyGunshipModel rotation={[0, 0, 0]} /></group>
      <group name="model_scout" visible={false}><EnemyScoutHeliModel rotation={[0, 0, 0]} /></group>
      <group name="model_helicopter" visible={false}><EnemyHelicopterModel rotation={[0, -Math.PI / 2, 0]} scale={1.5} /></group>
      <group name="model_blackshark" visible={false}><EnemyBlackSharkModel rotation={[0, -Math.PI / 2, 0]} scale={1.1} /></group>
      <group name="model_blackshark_twin" visible={false}><EnemyTwinBlackSharkModel rotation={[0, -Math.PI / 2, 0]} scale={1.1} /></group>
      <group name="model_blackshark_final" visible={false}><EnemyFinalBlackSharkModel rotation={[0, -Math.PI / 2, 0]} scale={1.1} /></group>
    </group>
  );
}
