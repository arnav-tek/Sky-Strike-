import * as THREE from 'three';
import { EffectData, spawnEffect } from './EffectsManager';
import { GAME_CONSTANTS } from '../../constants';

export function spawnEnemyExplosion(
  effects: EffectData[],
  position: THREE.Vector3,
  enemyType: string,
  baseScale: number = 1.0
) {
    let explosionCount = 1;
    let debrisCount = 0;
    let sparkCount = 0;
    let shockwave = false;
    let scaleMultiplier = 1.0;
    let color = '#ff7b00';

    switch (enemyType) {
        case 'drone':
        case 'jeep':
            explosionCount = 1;
            debrisCount = 2;
            sparkCount = 3;
            scaleMultiplier = 0.8;
            color = '#ffaa00';
            break;
        case 'helicopter':
        case 'scout':
        case 'armored_car':
            explosionCount = 2;
            debrisCount = 4;
            sparkCount = 5;
            shockwave = true;
            scaleMultiplier = 1.2;
            break;
        case 'tank':
        case 'gunship':
        case 'missile_truck':
            explosionCount = 3;
            debrisCount = 8;
            sparkCount = 8;
            shockwave = true;
            scaleMultiplier = 2.0;
            color = '#ff3300';
            break;
        case 'blackshark':
        case 'mega_tank':
        case 'heavy_gunship':
        case 'mega_missile_truck':
        case 'blackshark_twin':
        case 'blackshark_final':
            explosionCount = 8; // Extra spectacular multi-stage explosion
            debrisCount = 20;
            sparkCount = 20;
            shockwave = true;
            scaleMultiplier = 4.0;
            color = '#ff1100';
            break;
    }

    const finalScale = baseScale * scaleMultiplier;

    // Core explosion(s)
    for (let i = 0; i < explosionCount; i++) {
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * finalScale,
            (Math.random() - 0.5) * finalScale,
            0
        );
        const pos = position.clone().add(offset);
        
        spawnEffect(
            effects, 
            pos, 
            i === 0 && scaleMultiplier > 1.5 ? 'explosion_large' : 'explosion', 
            finalScale * (0.8 + Math.random() * 0.4), 
            i === 0 ? '#ffffff' : color
        );
        
        spawnEffect(effects, pos, 'smoke', finalScale * 1.5, '#52525b', new THREE.Vector3(GAME_CONSTANTS.PLAYER.SCROLL_SPEED * 0.5, 2, 0));
    }

    if (shockwave) {
        spawnEffect(effects, position, 'shockwave', finalScale * 1.5, '#ffffff');
    }

    for (let i = 0; i < debrisCount; i++) {
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 15 + GAME_CONSTANTS.PLAYER.SCROLL_SPEED,
            Math.random() * 15 + 5,
            (Math.random() - 0.5) * 10
        );
        const rot = new THREE.Vector3(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5
        );
        const col = Math.random() > 0.5 ? '#3f3f46' : '#18181b'; // dark grays
        spawnEffect(effects, position, 'debris', finalScale * (0.2 + Math.random() * 0.3), col, vel, 30, rot);
    }

    for (let i = 0; i < sparkCount; i++) {
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 30 + GAME_CONSTANTS.PLAYER.SCROLL_SPEED,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 10
        );
        spawnEffect(effects, position, 'sparks', finalScale * (0.1 + Math.random() * 0.2), '#fef08a', vel, 10);
    }
}
