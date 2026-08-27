import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import { spawnEffect } from './EffectsManager';
import { spawnEnemyExplosion } from './ExplosionHelper';
import { audioManager } from '../../audio/AudioManager';
import * as THREE from 'three';
import { HELICOPTER_TEMPLATES } from '../../constants';

const SCORE_TABLE: Record<string, number> = {
    drone: 50, jeep: 75, scout: 100, helicopter: 150,
    armored_car: 150, tank: 250, gunship: 350,
    missile_truck: 200, blackshark: 1000,
    mega_tank: 2500, heavy_gunship: 3000, 
    mega_missile_truck: 3500, blackshark_twin: 4000, blackshark_final: 10000
};

export default function CollisionManager({ bullets, missiles, enemies, enemyBullets, effects, debris, powerups }: { bullets: any[], missiles: any[], enemies: any[], enemyBullets: any[], effects: any[], debris: any[], powerups: any[] }) {
    
    const spawnDebris = (pos: THREE.Vector3, enemyType: string) => {
        const debrisCount = ['tank', 'mega_tank', 'gunship', 'heavy_gunship', 'missile_truck', 'mega_missile_truck'].includes(enemyType) ? 5 : 3;
        
        // Detect current level theme color to match dynamic wreckage paint!
        const currentLevel = useStore.getState().currentLevel;
        const theme = (currentLevel - 1) % 3;
        let wreckageColor = '#52525b';
        if (theme === 0) wreckageColor = Math.random() > 0.5 ? '#15803d' : '#27272a';
        else if (theme === 1) wreckageColor = Math.random() > 0.5 ? '#b45309' : '#5c4033';
        else if (theme === 2) wreckageColor = Math.random() > 0.5 ? '#e2e8f0' : '#475569';
        
        let spawned = 0;
        for (let d of debris) {
            if (!d.active) {
                d.active = true;
                d.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 1.0));
                
                // Exploding vector arcs
                d.velocity.set(
                    (Math.random() - 0.5) * 12,
                    Math.random() * 16 + 5,
                    (Math.random() - 0.5) * 8
                );
                
                d.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                d.rotSpeed.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
                d.bounces = 0;
                d.color = wreckageColor;
                d.scale = 0.7 + Math.random() * 0.5;
                d.lifetime = 4.0;
                
                const isGroundVehicle = ['tank', 'armored_car', 'missile_truck', 'jeep', 'mega_tank', 'mega_missile_truck'].includes(enemyType);
                const isAirborne = ['scout', 'helicopter', 'gunship', 'drone', 'heavy_gunship', 'blackshark', 'blackshark_twin', 'blackshark_final'].includes(enemyType);
                
                if (isGroundVehicle && spawned === 0) d.type = 'tire';
                else if (isAirborne && spawned === 0) d.type = 'wing';
                else d.type = 'chunk';
                
                spawned++;
                if (spawned >= debrisCount) break;
            }
        }
    };

    const spawnPowerup = (pos: THREE.Vector3) => {
        if (Math.random() > 0.18) return; // 18% drop rate
        
        const p = powerups.find((item: any) => !item.active);
        if (p) {
            p.active = true;
            p.position.copy(pos);
            p.lifetime = 8.0;
            
            const rand = Math.random();
            if (rand < 0.6) {
                p.type = 'weapon';
            } else if (rand < 0.9) {
                p.type = 'shield';
            } else {
                p.type = 'nuke';
            }
        }
    };

    useFrame((_, delta) => {
        const state = useStore.getState();
        if (state.gameOver || state.gameState !== 'playing') return;

        const hitStop = useStore.getState().hitStop;
        if (hitStop > 0) {
            useStore.getState().tickHitStop(delta);
            return;
        }

        useStore.getState().tickCombo(delta);

        const selectedHelicopter = state.selectedHelicopter || 'ka50';
        const template = HELICOPTER_TEMPLATES[selectedHelicopter] || HELICOPTER_TEMPLATES.ka50;
        
        // Armor multiplier: AH-64 (85 armor) => 1.0, Mi-28 (95 armor) => 0.5, Ka-50 (75 armor) => 1.5
        const armorMult = (105 - template.stats.armor) / 20;

        // Firepower multiplier: AH-64 (90 firepower) => 1.0
        const firepowerMult = template.stats.firepower / 90;

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
                        e.health -= 50 * firepowerMult; // High AOE damage
                        
                        if (e.health <= 0) {
                            e.active = false; 
                            useStore.getState().addCombo();
                            useStore.getState().addEnemyKill();
                            const scoreAmt = SCORE_TABLE[e.type] || 100;
                            addScore(scoreAmt); 
                            audioManager.playEnemyDeath(e.type);
                            spawnEnemyExplosion(effects, e.position, e.type, 1.5);
                            spawnDebris(e.position, e.type);
                            spawnPowerup(e.position);
                            
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
                    e.health -= 20 * firepowerMult; 
                    
                    if (e.health <= 0) {
                        e.active = false; 
                        useStore.getState().addCombo();
                        useStore.getState().addEnemyKill();
                        const scoreAmt = SCORE_TABLE[e.type] || 100;
                        addScore(scoreAmt); 
                        
                        audioManager.playEnemyDeath(e.type);
                        spawnEnemyExplosion(effects, e.position, e.type, 1.0);
                        spawnDebris(e.position, e.type);
                        spawnPowerup(e.position);
                        
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

        // ─── PLAYER DAMAGE (respects energy shield & invulnerability) ───

        // Enemies hitting player (collision)
        if (!isInvulnerable && !state.shieldActive && !state.respawning && !state.gameOver) {
            for (let i = 0; i < enemies.length; i++) {
                let e = enemies[i];
                if (e.active && _playerPos.distanceTo(e.position) < (playerRadius + enemyRadius)) {
                    const isBoss = ['blackshark', 'mega_tank', 'heavy_gunship', 'mega_missile_truck', 'blackshark_twin', 'blackshark_final'].includes(e.type);
                    if (isBoss) {
                        // Boss collision handling: deal heavy damage to player, normal damage to boss, trigger knockback
                        takeDamage(40 * armorMult);
                        e.health -= 150 * firepowerMult; // Boss takes some damage
                        
                        if (e.health <= 0) {
                            e.active = false;
                            useStore.getState().addCombo();
                            useStore.getState().addEnemyKill();
                            const scoreAmt = SCORE_TABLE[e.type] || 100;
                            addScore(scoreAmt);
                            audioManager.playEnemyDeath(e.type);
                            spawnEnemyExplosion(effects, e.position, e.type, 1.5);
                            spawnDebris(e.position, e.type);
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
                        takeDamage(damage * armorMult);
                        audioManager.playEnemyDeath(e.type);
                        spawnEnemyExplosion(effects, e.position, e.type, 1.0);
                        spawnDebris(e.position, e.type);
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
                    takeDamage(8 * armorMult);
                    spawnEffect(effects, b.position, 'hit', 1.5, '#ffffff');
                    useStore.getState().addShake(0.5);
                }
            }
        } else {
            // While invulnerable or shielded, enemy bullets still get destroyed on contact but deal no damage
            for (let i = 0; i < enemyBullets.length; i++) {
                let b = enemyBullets[i];
                if (b.active && _playerPos.distanceTo(b.position) < (bulletRadius + playerRadius)) {
                    b.active = false;
                    spawnEffect(effects, b.position, 'hit', 0.5, '#60a5fa');
                }
            }
            
            // Regular enemies ramming player deflect or blow up
            for (let i = 0; i < enemies.length; i++) {
                let e = enemies[i];
                if (e.active && _playerPos.distanceTo(e.position) < (playerRadius + enemyRadius)) {
                    const isBoss = ['blackshark', 'mega_tank', 'heavy_gunship', 'mega_missile_truck', 'blackshark_twin', 'blackshark_final'].includes(e.type);
                    if (!isBoss) {
                        e.active = false;
                        useStore.getState().addCombo();
                        useStore.getState().addEnemyKill();
                        const scoreAmt = SCORE_TABLE[e.type] || 100;
                        addScore(scoreAmt);
                        audioManager.playEnemyDeath(e.type);
                        spawnEnemyExplosion(effects, e.position, e.type, 1.0);
                        spawnDebris(e.position, e.type);
                        useStore.getState().addShake(1.0);
                    }
                }
            }
        }

        // ─── PLAYER POWERUP COLLECTION ───
        for (let p of powerups) {
            if (p.active && _playerPos.distanceTo(p.position) < (playerRadius + 1.2)) {
                p.active = false;
                
                audioManager.playUIClick(); // Play visual/audio confirmation
                spawnEffect(effects, p.position.clone(), 'hit', 2.0, '#ffffff');
                
                if (p.type === 'weapon') {
                    useStore.getState().upgradeWeapon();
                    spawnEffect(effects, _playerPos, 'explosion', 1.0, '#ef4444');
                } else if (p.type === 'shield') {
                    useStore.getState().activateShield(6.0); // 6 seconds shield deflection
                    spawnEffect(effects, _playerPos, 'explosion', 1.0, '#06b6d4');
                } else if (p.type === 'nuke') {
                    // Trigger dynamic nuke flash shake
                    useStore.getState().addShake(2.0);
                    spawnEffect(effects, _playerPos, 'explosion_large', 6.0, '#a855f7');
                    
                    // Detonate active on-screen non-boss units
                    for (let e of enemies) {
                        if (e.active && e.position.x < playerPos[0] + 50) {
                            const isBoss = ['blackshark', 'mega_tank', 'heavy_gunship', 'mega_missile_truck', 'blackshark_twin', 'blackshark_final'].includes(e.type);
                            if (isBoss) {
                                e.health -= 350; // Bosses take heavy chunk damage
                                if (e.health <= 0) {
                                    e.active = false;
                                    useStore.getState().completeLevel();
                                }
                            } else {
                                e.active = false;
                                useStore.getState().addCombo();
                                useStore.getState().addEnemyKill();
                                const scoreAmt = SCORE_TABLE[e.type] || 100;
                                addScore(scoreAmt);
                                audioManager.playEnemyDeath(e.type);
                                spawnEnemyExplosion(effects, e.position, e.type, 1.2);
                                spawnDebris(e.position, e.type);
                            }
                        }
                    }
                }
            }
        }
    });

    return null;
}
