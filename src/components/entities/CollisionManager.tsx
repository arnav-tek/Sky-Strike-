import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import { spawnEffect } from './EffectsManager';
import { audioManager } from '../../audio/AudioManager';
import * as THREE from 'three';

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

        // Missiles hitting road (y <= 0) and exploding
        for (let m of missiles) {
            if (m.active && m.position.y <= 0) {
                m.active = false; // Disable missile
                
                // Area of effect damage to enemies
                for (let e of enemies) {
                    if (!e.active) continue;
                    
                    const dx = m.position.x - e.position.x;
                    const dy = m.position.y - e.position.y;
                    const dz = m.position.z - e.position.z;
                    
                    // For ground enemies, we care less about Z distance as long as it's on the road
                    const distSq = dx*dx + dy*dy;
                    const zLimit = 8.0; // Wide Z impact for explosions
                    
                    if (distSq < missileExplosionRadius * missileExplosionRadius && Math.abs(dz) < zLimit) {
                        e.health -= 50; // High AOE damage
                        
                        if (e.health <= 0) {
                            e.active = false; 
                            useStore.getState().addCombo();
                            useStore.getState().addEnemyKill();
                            addScore(100); 
                            audioManager.playExplosion();
                            spawnEffect(effects, e.position, 'explosion', 2.0, '#ea580c');
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
                const isGround = ['tank', 'armored_car', 'missile_truck', 'jeep'].includes(e.type);
                const zThreshold = isGround ? 6.0 : 2.5;

                if (distSq < radiusSum * radiusSum && Math.abs(dz) < zThreshold) {
                    b.active = false; 
                    e.health -= 15; 
                    
                    if (e.health <= 0) {
                        e.active = false; 
                        useStore.getState().addCombo();
                        useStore.getState().addEnemyKill();
                        addScore(100); // multiplier is handled inside addScore
                        audioManager.playExplosion();
                        spawnEffect(effects, e.position, 'explosion', 2.0, '#ea580c');
                        useStore.getState().addShake(0.3);
                        useStore.getState().triggerHitStop(0.05); // 50ms hit stop for game feel
                        
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
        if (!isInvulnerable) {
            for (let i = 0; i < enemies.length; i++) {
                let e = enemies[i];
                if (e.active && _playerPos.distanceTo(e.position) < (playerRadius + enemyRadius)) {
                    e.active = false;
                    const damage = e.state === 'kamikaze' ? 40 : 20;
                    takeDamage(damage);
                    spawnEffect(effects, e.position, 'explosion', 2.5, '#ea580c');
                    spawnEffect(effects, _playerPos, 'hit', 2.0, '#ffffff');
                    useStore.getState().addShake(e.state === 'kamikaze' ? 2.5 : 1.5);
                    useStore.getState().addEnemyKill();
                }
            }

            // Enemy bullets hitting player
            for (let i = 0; i < enemyBullets.length; i++) {
                let b = enemyBullets[i];
                if (b.active && _playerPos.distanceTo(b.position) < (bulletRadius + playerRadius)) {
                    b.active = false;
                    takeDamage(10);
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
