import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import { spawnEffect } from './EffectsManager';
import { spawnEnemyExplosion } from './ExplosionHelper';
import { audioManager } from '../../audio/AudioManager';
import * as THREE from 'three';

const SCORE_TABLE: Record<string, number> = {
    drone: 50, jeep: 75, scout: 100, helicopter: 150,
    armored_car: 150, tank: 250, gunship: 350,
    missile_truck: 200, blackshark: 1000,
    mega_tank: 2500, heavy_gunship: 3000, 
    mega_missile_truck: 3500, blackshark_twin: 4000, blackshark_final: 10000
};

export default function CollisionManager({ bullets, missiles, enemies, enemyBullets, effects }: { bullets: any[], missiles: any[], enemies: any[], enemyBullets: any[], effects: any[] }) {
    useFrame((_, delta) => {
        const state = useStore.getState();
        if (state.gameOver || state.gameState !== 'playing') return;

        const hitStop = useStore.getState().hitStop;
        if (hitStop > 0) {
            useStore.getState().tickHitStop(delta);
            return;
        }

        useStore.getState().tickCombo(delta);

        const playerPos = useStore.getState().playerPos;
        const takeDamage = useStore.getState().takeDamage;
        const addScore = useStore.getState().addScore;
        const isInvulnerable = useStore.getState().invulnerable;

        const _playerPos = new THREE.Vector3().fromArray(playerPos);

        const bulletRadius = 1.0;
        const enemyRadius = 1.5;
        const playerRadius = 1.5;
        const missileExplosionRadius = 5.0; // AOE damage

        // Missiles hitting road or active enemies and exploding
        for (let m of missiles) {
            if (!m.active) continue;

            let explode = false;
            let explodePos = m.position.clone();

            // 1. Ground impact
            if (m.position.y <= 0) {
                explode = true;
                explodePos.y = 0;
            }

            // 2. Direct hit on active enemies in mid-air
            if (!explode) {
                for (let e of enemies) {
                    if (!e.active) continue;

                    const dx = m.position.x - e.position.x;
                    const dy = m.position.y - e.position.y;
                    const dz = m.position.z - e.position.z;
                    const distSq = dx*dx + dy*dy;
                    
                    const isGround = ['tank', 'armored_car', 'missile_truck', 'jeep', 'mega_tank', 'mega_missile_truck'].includes(e.type);
                    const zThreshold = isGround ? 6.0 : 2.5;

                    // Missile radius is 1.0, Enemy radius is 1.5
                    const radiusSum = bulletRadius + enemyRadius;

                    if (distSq < radiusSum * radiusSum && Math.abs(dz) < zThreshold) {
                        explode = true;
                        explodePos.copy(m.position);
                        break;
                    }
                }
            }

            if (explode) {
                m.active = false; // Disable missile
                spawnEffect(effects, explodePos, 'explosion_large', 3.0, '#ea580c');
                useStore.getState().addShake(1.5);
                audioManager.playExplosionLarge();
                
                // Area of effect damage to enemies within range
                for (let e of enemies) {
                    if (!e.active) continue;
                    
                    const dx = explodePos.x - e.position.x;
                    const dy = explodePos.y - e.position.y;
                    const dz = explodePos.z - e.position.z;
                    
                    const distSq = dx*dx + dy*dy;
                    const zLimit = 8.0; // Wide Z impact for explosions
                    
                    if (distSq < missileExplosionRadius * missileExplosionRadius && Math.abs(dz) < zLimit) {
                        e.health -= 50; // High AOE damage
                        
                        if (e.health <= 0) {
                            e.active = false; 
                            useStore.getState().addCombo();
                            useStore.getState().addEnemyKill();
                            const scoreAmt = SCORE_TABLE[e.type] || 100;
                            addScore(scoreAmt); 
                            audioManager.playEnemyDeath(e.type);
                            spawnEnemyExplosion(effects, e.position, e.type, 1.5);
                            
                            const isBoss = ['blackshark', 'mega_tank', 'heavy_gunship', 'mega_missile_truck', 'blackshark_twin', 'blackshark_final'].includes(e.type);
                            if (isBoss) {
                                useStore.getState().completeLevel();
                            }
                        } else {
                            audioManager.playHit();
                            spawnEffect(effects, e.position, 'hit', 1.0, '#ffffff');
                        }
                    }
                }
                useStore.getState().triggerHitStop(0.08); // Big hitstop for missile explosion
            }
        }

        // Bullets hitting enemies
        for (let j = 0; j < bullets.length; j++) {
            let b = bullets[j];
            if (!b.active) continue;

            for (let i = 0; i < enemies.length; i++) {
                let e = enemies[i];
                if (!e.active) continue;

                const dx = b.position.x - e.position.x;
                const dy = b.position.y - e.position.y;
                const dz = b.position.z - e.position.z;
                const distSq = dx*dx + dy*dy;
                const radiusSum = bulletRadius + enemyRadius;
                
                // Lenient Z check for ground enemies to allow hitting different lanes
                const isGround = ['tank', 'armored_car', 'missile_truck', 'jeep', 'mega_tank', 'mega_missile_truck'].includes(e.type);
                const zThreshold = isGround ? 6.0 : 2.5;

                if (distSq < radiusSum * radiusSum && Math.abs(dz) < zThreshold) {
                    b.active = false; 
                    e.health -= 20; 
                    
                    if (e.health <= 0) {
                        e.active = false; 
                        useStore.getState().addCombo();
                        useStore.getState().addEnemyKill();
                        const scoreAmt = SCORE_TABLE[e.type] || 100;
                        addScore(scoreAmt); 
                        
                        audioManager.playEnemyDeath(e.type);
                        spawnEnemyExplosion(effects, e.position, e.type, 1.0);
                        
                        const isBoss = ['blackshark', 'mega_tank', 'heavy_gunship', 'mega_missile_truck', 'blackshark_twin', 'blackshark_final'].includes(e.type);
                        if (isBoss) {
                            useStore.getState().completeLevel();
                        }
                        
                        // Scale shake and hitstop by enemy type
                        let shakeAmt = 0.3;
                        let hitStopAmt = 0.05;
                        if (['tank', 'gunship', 'missile_truck'].includes(e.type)) { shakeAmt = 0.8; hitStopAmt = 0.1; }
                        if (isBoss) { shakeAmt = 1.5; hitStopAmt = 0.15; }
                        if (['drone', 'jeep'].includes(e.type)) { shakeAmt = 0.1; hitStopAmt = 0.02; }
                        
                        useStore.getState().addShake(shakeAmt);
                        useStore.getState().triggerHitStop(hitStopAmt); 
                        
                        // Play combo sound if multiplier is high
                        if (useStore.getState().combo > 1) {
                            audioManager.playCombo(useStore.getState().combo);
                        }
                    } else {
                        audioManager.playHit();
                        spawnEffect(effects, b.position, 'hit', 1.0, '#ffffff');
                        useStore.getState().addShake(0.05);
                    }
                }
            }
        }

        // ─── PLAYER DAMAGE (respects invulnerability) ───

        // Enemies hitting player (collision)
        if (!isInvulnerable && !state.respawning && !state.gameOver) {
            for (let i = 0; i < enemies.length; i++) {
                let e = enemies[i];
                if (e.active && _playerPos.distanceTo(e.position) < (playerRadius + enemyRadius)) {
                    const isBoss = ['blackshark', 'mega_tank', 'heavy_gunship', 'mega_missile_truck', 'blackshark_twin', 'blackshark_final'].includes(e.type);
                    if (isBoss) {
                        // Boss collision handling: deal heavy damage to player, normal damage to boss, trigger knockback
                        takeDamage(40);
                        e.health -= 150; // Boss takes some damage
                        
                        if (e.health <= 0) {
                            e.active = false;
                            useStore.getState().addCombo();
                            useStore.getState().addEnemyKill();
                            const scoreAmt = SCORE_TABLE[e.type] || 100;
                            addScore(scoreAmt);
                            audioManager.playEnemyDeath(e.type);
                            spawnEnemyExplosion(effects, e.position, e.type, 1.5);
                            useStore.getState().completeLevel();
                        } else {
                            audioManager.playHit();
                            spawnEffect(effects, e.position, 'hit', 2.0, '#ffffff');
                        }
                        
                        useStore.getState().addShake(2.0);
                        useStore.getState().triggerHitStop(0.15);
                    } else {
                        // Regular enemy collision
                        e.active = false;
                        const damage = e.state === 'kamikaze' ? 40 : 20;
                        takeDamage(damage);
                        audioManager.playEnemyDeath(e.type);
                        spawnEnemyExplosion(effects, e.position, e.type, 1.0);
                        spawnEffect(effects, _playerPos, 'hit', 2.0, '#ffffff');
                        useStore.getState().addShake(e.state === 'kamikaze' ? 2.5 : 1.5);
                    }
                }
            }

            // Enemy bullets hitting player
            for (let i = 0; i < enemyBullets.length; i++) {
                let b = enemyBullets[i];
                if (b.active && _playerPos.distanceTo(b.position) < (bulletRadius + playerRadius)) {
                    b.active = false;
                    takeDamage(8);
                    spawnEffect(effects, b.position, 'hit', 1.5, '#ffffff');
                    useStore.getState().addShake(0.5);
                }
            }
        } else {
            // While invulnerable, enemy bullets still get destroyed on contact but deal no damage
            for (let i = 0; i < enemyBullets.length; i++) {
                let b = enemyBullets[i];
                if (b.active && _playerPos.distanceTo(b.position) < (bulletRadius + playerRadius)) {
                    b.active = false;
                    spawnEffect(effects, b.position, 'hit', 0.5, '#60a5fa');
                }
            }
        }
    });

    return null;
}
