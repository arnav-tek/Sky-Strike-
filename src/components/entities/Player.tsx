import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import HelicopterModel from '../models/HelicopterModel';
import * as THREE from 'three';
import { GAME_CONSTANTS, HELICOPTER_TEMPLATES } from '../../constants';
import { spawnEffect } from './EffectsManager';
import { audioManager } from '../../audio/AudioManager';

// Object pooling structure for bullets
interface BulletData {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
}

export default function Player({ bullets, missiles, effects, enemies }: { bullets: any[], missiles: any[], effects: any[], enemies: any[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const heliRef = useRef<THREE.Group>(null);
  
  // Controls state
  const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false });
  
  const velocity = useRef(new THREE.Vector3());
  const fireTimer = useRef(0);
  const missileTimer = useRef(0);
  const isMouseDown = useRef(false);
  const hitAnimTimer = useRef(0);
  const prevHealth = useRef(100);
  const exploded = useRef(false);
  const respawnCooldown = useRef(0);
  const blinkTimer = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
        if (keys.current.hasOwnProperty(e.key)) keys.current[e.key as keyof typeof keys.current] = true; 
        if (e.code === 'Space') keys.current.Space = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
        if (keys.current.hasOwnProperty(e.key)) keys.current[e.key as keyof typeof keys.current] = false; 
        if (e.code === 'Space') keys.current.Space = false;
    };
    
    const handleMouseDown = () => { isMouseDown.current = true; };
    const handleMouseUp = () => { isMouseDown.current = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useFrame((_, delta) => {
    const state = useStore.getState();
    if (!groupRef.current) return;

    const activeHelicopter = state.selectedHelicopter || 'ka50';
    const activeTemplate = HELICOPTER_TEMPLATES[activeHelicopter] || HELICOPTER_TEMPLATES.ka50;

    const speedMult = activeTemplate.stats.speed / 70; // 70 baseline Apache
    const playerSpeed = GAME_CONSTANTS.PLAYER.SPEED * speedMult;
    const scrollSpeed = GAME_CONSTANTS.PLAYER.SCROLL_SPEED * speedMult;

    const agilityMult = activeTemplate.stats.agility / 55; // 55 baseline Apache
    const dampFactor = 5 * agilityMult;

    if (state.gameState !== 'playing' && state.gameState !== 'menu' && state.gameState !== 'loadout' && state.gameState !== 'settings' && state.gameState !== 'hangar') {
      groupRef.current.visible = false;
      return;
    } else {
      groupRef.current.visible = state.gameState === 'playing';
    }

    // Tick mission time
    state.tickMissionTime(delta);

    // Hit Animation Trigger
    if (state.health < prevHealth.current && state.health > 0) {
        hitAnimTimer.current = 0.4;
    }
    prevHealth.current = state.health;

    // Tick invulnerability
    state.tickInvulnerability(delta);

    // ─── DEATH & RESPAWNING ANIMATION ───
    if (state.gameOver || state.respawning) {
      // Crash sequence
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, scrollSpeed * 0.5, delta);
      velocity.current.y -= 25 * delta; // Heavy gravity pull
      
      groupRef.current.position.addScaledVector(velocity.current, delta);
      groupRef.current.rotation.z -= delta * 4; // Nose dives
      groupRef.current.rotation.x += delta * 6; // Wild roll
      
      // Trail of smoke/fire
      if (Math.random() < 0.4) {
          spawnEffect(effects, groupRef.current.position.clone(), 'muzzle', 1.0, '#ea580c');
      }

      // Hit the ground
      if (groupRef.current.position.y <= 0 && !exploded.current) {
          groupRef.current.position.y = 0;
          spawnEffect(effects, groupRef.current.position.clone(), 'explosion_large', 4.0, '#ea580c');
          audioManager.playExplosionLarge();
          exploded.current = true;
          if (heliRef.current) heliRef.current.visible = false;
      }
      
      if (state.respawning) {
          respawnCooldown.current += delta;
          if (respawnCooldown.current > 2.0) { // 2 second crash view
              respawnCooldown.current = 0;
              exploded.current = false;
              if (heliRef.current) heliRef.current.visible = true;
              
              const currentX = groupRef.current.position.x;
              groupRef.current.position.set(currentX - 5, 8, 0);
              groupRef.current.rotation.set(0, 0, 0);
              velocity.current.set(scrollSpeed, 0, 0);
              
              Object.keys(keys.current).forEach(k => {
                keys.current[k as keyof typeof keys.current] = false;
              });
              
              state.respawnPlayer();
              audioManager.playExplosion();
              spawnEffect(effects, groupRef.current.position.clone(), 'explosion', 3.0, '#60a5fa');
          }
      }
      return;
    }
    
    if (state.hitStop > 0 || state.paused) return;

    // ─── Hit Jolt Animation ───
    if (hitAnimTimer.current > 0) {
      hitAnimTimer.current -= delta;
      // Add wild shake rotation
      groupRef.current.rotation.z += (Math.random() - 0.5) * 0.5;
      groupRef.current.rotation.x += (Math.random() - 0.5) * 0.5;
      
      // Flash red
      if (heliRef.current) {
         heliRef.current.scale.setScalar(1.0 + Math.random() * 0.1);
      }
    } else if (heliRef.current) {
      heliRef.current.scale.setScalar(1.0);
    }

    // ─── Invulnerability blink effect ───
    if (state.invulnerable && heliRef.current) {
      blinkTimer.current += delta * 15; // Fast blink
      const visible = Math.sin(blinkTimer.current) > 0;
      heliRef.current.visible = visible;
    } else if (heliRef.current) {
      heliRef.current.visible = true;
      blinkTimer.current = 0;
    }

    // Calculate target velocities based on input
    let targetVelY = 0;
    let targetVelX = scrollSpeed;

    if (state.gameState === 'playing') {
      if (keys.current.w || keys.current.ArrowUp) targetVelY = playerSpeed;
      if (keys.current.s || keys.current.ArrowDown) targetVelY = -playerSpeed;

      if (keys.current.d || keys.current.ArrowRight) targetVelX += playerSpeed;
      if (keys.current.a || keys.current.ArrowLeft) targetVelX -= playerSpeed;
      
      // Lock rotation to face gameplay direction (right)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 10 * delta);
    } else if (state.gameState === 'hangar') {
      // Rotate slowly in hangar and stay in place
      targetVelX = 0;
      targetVelY = Math.sin(state.playerPos[0] * 0.1) * 0.5;
      groupRef.current.rotation.y += delta * 0.5;
    } else {
      // Cinematic flying for menu
      targetVelY = Math.sin(state.playerPos[0] * 0.05) * 2.0;
      // Re-align to face right during menu flying
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 10 * delta);
    }

    // Smooth dampening (acceleration/deceleration)
    velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, targetVelX, dampFactor * delta);
    velocity.current.y = THREE.MathUtils.lerp(velocity.current.y, targetVelY, dampFactor * delta);
    velocity.current.z = 0;

    // Apply movement FIRST
    groupRef.current.position.addScaledVector(velocity.current, delta);

    // Hard lock Z position
    groupRef.current.position.z = 0;

    // ─── BOUNDS CLAMPING ───
    // The helicopter is an aircraft — it must NEVER go below Y_MIN (which is above the road).
    // Clamp position, then zero out velocity in that direction to prevent sticking.
    const minY = GAME_CONSTANTS.BOUNDS.Y_MIN;
    const maxY = GAME_CONSTANTS.BOUNDS.Y_MAX;

    if (groupRef.current.position.y < minY) {
      groupRef.current.position.y = minY;
      if (velocity.current.y < 0) velocity.current.y = 0;
    }
    if (groupRef.current.position.y > maxY) {
      groupRef.current.position.y = maxY;
      if (velocity.current.y > 0) velocity.current.y = 0;
    }

    // Tilt visually based on movement
    // Normalize relative velocities to [-1, 1] range to prevent extreme tilting on high-speed/agile helicopters
    const speedRatioX = playerSpeed > 0 ? (velocity.current.x - scrollSpeed) / playerSpeed : 0;
    const speedRatioY = playerSpeed > 0 ? velocity.current.y / playerSpeed : 0;

    // Apply controlled tilt limits (max ~15-25 degrees depending on agility)
    const maxPitchAngle = 0.28 * agilityMult; // Max pitch (nose up/down) in radians
    const maxRollAngle = 0.22 * agilityMult;  // Max roll (bank left/right) in radians

    const targetPitch = -speedRatioX * maxPitchAngle + speedRatioY * (maxPitchAngle * 0.4);
    const targetRoll = -speedRatioY * maxRollAngle;

    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetPitch, 10 * delta);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRoll, 10 * delta);


    // Store position for camera and others
    useStore.getState().setPlayerPos([groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z]);

    // Tick power-ups timers
    state.tickPowerups(delta);

    // Update bullets (Manual-fire logic + bullet lifetime)
    fireTimer.current += delta;
    
    const currentFireRate = GAME_CONSTANTS.BULLET.FIRE_RATE * Math.pow(0.9, state.fireRateLevel - 1);
    
    if (state.gameState === 'playing' && isMouseDown.current && fireTimer.current > currentFireRate) {
      fireTimer.current = 0;
      const power = state.weaponPower;
      audioManager.playShoot();

      if (power === 1) {
        // Power 1: Single straight bullet
        const p = bullets.find(b => !b.active);
        if (p) {
          p.active = true;
          p.enemyType = 'player';
          const zOffset = Math.random() > 0.5 ? 0.3 : -0.3;
          const spawnPos = groupRef.current.position.clone().add(new THREE.Vector3(1.2, -0.2, zOffset));
          p.position.copy(spawnPos);
          p.velocity.set(GAME_CONSTANTS.BULLET.SPEED + velocity.current.x, 0, 0);
          p.lifetime = GAME_CONSTANTS.BULLET.LIFETIME;
          spawnEffect(effects, spawnPos, 'muzzle', 0.5, '#fef08a');
        }
      } else if (power === 2) {
        // Power 2: Dual parallel bullets
        const zOffsets = [0.8, -0.8];
        for (let i = 0; i < 2; i++) {
          const p = bullets.find(b => !b.active);
          if (p) {
            p.active = true;
            p.enemyType = 'player';
            const spawnPos = groupRef.current.position.clone().add(new THREE.Vector3(1.2, -0.2, zOffsets[i]));
            p.position.copy(spawnPos);
            p.velocity.set(GAME_CONSTANTS.BULLET.SPEED + velocity.current.x, 0, 0);
            p.lifetime = GAME_CONSTANTS.BULLET.LIFETIME;
            spawnEffect(effects, spawnPos, 'muzzle', 0.5, '#fef08a');
          }
        }
      } else {
        // Power 3: 3-way spread shot
        const angles = [0, 0.22, -0.22];
        const zOffsets = [0.0, 0.8, -0.8];
        for (let i = 0; i < 3; i++) {
          const p = bullets.find(b => !b.active);
          if (p) {
            p.active = true;
            p.enemyType = 'player';
            const spawnPos = groupRef.current.position.clone().add(new THREE.Vector3(1.2, -0.2, zOffsets[i]));
            p.position.copy(spawnPos);
            
            const speed = GAME_CONSTANTS.BULLET.SPEED;
            p.velocity.set(
              speed + velocity.current.x,
              speed * angles[i],
              0
            );
            p.lifetime = GAME_CONSTANTS.BULLET.LIFETIME;
            spawnEffect(effects, spawnPos, 'muzzle', 0.55, '#fef08a');
          }
        }
      }
    }

    // Update missiles (Spacebar logic)
    missileTimer.current += delta;
    
    if (!groupRef.current.userData.reloadTimer) groupRef.current.userData.reloadTimer = 0;
    groupRef.current.userData.reloadTimer += delta;
    
    if (groupRef.current.userData.reloadTimer > 1.5) {
      groupRef.current.userData.reloadTimer = 0;
      useStore.getState().reloadMissile();
    }

    if (state.gameState === 'playing' && keys.current.Space && missileTimer.current > 0.2) {
      if (useStore.getState().fireMissile()) {
        missileTimer.current = 0;
        const m = missiles.find(m => !m.active);
        if (m) {
          m.active = true;
          
          // Lock onto nearest active enemy in front of player
          let closestTarget = null;
          let minDistance = 60; // lock range
          const playerPosVec = groupRef.current.position;
          
          for (let e of enemies) {
            if (e.active && e.position.x > playerPosVec.x) {
              const dx = e.position.x - playerPosVec.x;
              const dy = e.position.y - playerPosVec.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minDistance) {
                minDistance = dist;
                closestTarget = e;
              }
            }
          }
          
          m.target = closestTarget;
          const spawnPos = groupRef.current.position.clone().add(new THREE.Vector3(0, -0.5, 0));
          m.position.copy(spawnPos);
          
          if (closestTarget) {
            m.velocity.set(GAME_CONSTANTS.BULLET.SPEED * 0.5 + velocity.current.x, 0, 0);
          } else {
            m.velocity.set(GAME_CONSTANTS.BULLET.SPEED * 0.4 + velocity.current.x, -GAME_CONSTANTS.BULLET.SPEED * 0.6, 0);
          }
          
          m.lifetime = 4.0;
          audioManager.playMissile();
        }
      }
    }

    // Process bullets
    for (let i = 0; i < bullets.length; i++) {
        let p = bullets[i];
        if (p.active) {
            p.position.addScaledVector(p.velocity, delta);
            p.lifetime -= delta;
            if (p.lifetime <= 0) {
                p.active = false;
            }
        }
    }

    // Process missiles
    for (let i = 0; i < missiles.length; i++) {
        let m = missiles[i];
        if (m.active) {
            m.position.addScaledVector(m.velocity, delta);
            m.lifetime -= delta;
            
            // Predictive Homing curve physics steering
            if (m.target && m.target.active) {
              const currentSpeed = m.velocity.length() || GAME_CONSTANTS.BULLET.SPEED;
              const dist = m.position.distanceTo(m.target.position);
              const timeToIntercept = dist / currentSpeed;
              
              // Predict where target will be
              const predictedTargetPos = m.target.position.clone().addScaledVector(m.target.velocity, Math.min(timeToIntercept, 1.0));
              
              const targetDir = new THREE.Vector3().subVectors(predictedTargetPos, m.position).normalize();
              const steeringForce = 5.5; // Slightly stronger steering for predictive
              m.velocity.lerp(targetDir.multiplyScalar(currentSpeed), delta * steeringForce);
            } else {
              m.velocity.y -= 15 * delta; // Fallback to standard bullet drop
            }
            
            // Smoke trail
            if (Math.random() > 0.6) {
                spawnEffect(effects, m.position.clone().add(new THREE.Vector3(-0.2, 0.2, 0)), 'smoke', 0.8);
            }

            if (m.lifetime <= 0) m.active = false;
        }
    }
  });

  const state = useStore();

  return (
    <group ref={groupRef} position={[0, 5, 0]}>
      <group ref={heliRef}>
        <HelicopterModel type={state.selectedHelicopter} rotation={[0, Math.PI / 2, 0]} />
      </group>
      {state.shieldActive && (
        <mesh>
          <sphereGeometry args={[2.4, 16, 16]} />
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}
