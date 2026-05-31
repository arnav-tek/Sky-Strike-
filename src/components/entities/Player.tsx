import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import HelicopterModel from '../models/HelicopterModel';
import * as THREE from 'three';
import { GAME_CONSTANTS } from '../../constants';
import { spawnEffect } from './EffectsManager';
import { audioManager } from '../../audio/AudioManager';

// Object pooling structure for bullets
interface BulletData {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
}

export default function Player({ bullets, missiles, effects }: { bullets: any[], missiles: any[], effects: any[] }) {
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
    if (state.gameOver || state.gameState === 'gameover' || state.respawning) {
      // Crash sequence
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, GAME_CONSTANTS.PLAYER.SCROLL_SPEED * 0.5, delta);
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
              
              const currentX = groupRef.current.position.x;
              groupRef.current.position.set(currentX - 5, 8, 0);
              groupRef.current.rotation.set(0, 0, 0);
              velocity.current.set(GAME_CONSTANTS.PLAYER.SCROLL_SPEED, 0, 0);
              
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
    let targetVelX = GAME_CONSTANTS.PLAYER.SCROLL_SPEED;

    if (state.gameState === 'playing') {
      if (keys.current.w || keys.current.ArrowUp) targetVelY = GAME_CONSTANTS.PLAYER.SPEED;
      if (keys.current.s || keys.current.ArrowDown) targetVelY = -GAME_CONSTANTS.PLAYER.SPEED;

      if (keys.current.d || keys.current.ArrowRight) targetVelX += GAME_CONSTANTS.PLAYER.SPEED;
      if (keys.current.a || keys.current.ArrowLeft) targetVelX -= GAME_CONSTANTS.PLAYER.SPEED;
      
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
    const dampFactor = 5;
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
    const forwardTilt = (GAME_CONSTANTS.PLAYER.SCROLL_SPEED - velocity.current.x) * 0.05;
    const verticalTilt = velocity.current.y * 0.02;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, forwardTilt + verticalTilt, 10 * delta);
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -velocity.current.y * 0.05, 10 * delta);

    // Store position for camera and others
    useStore.getState().setPlayerPos([groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z]);

    // Update bullets (Manual-fire logic + bullet lifetime)
    fireTimer.current += delta;
    if (state.gameState === 'playing' && isMouseDown.current && fireTimer.current > GAME_CONSTANTS.BULLET.FIRE_RATE) {
      fireTimer.current = 0;
      // Spawn bullet
      const p = bullets.find(b => !b.active);
      if (p) {
        p.active = true;
        // Spawn at player weapon mount position
        // Helicopter is rotated so weapon pods are offset in global Z
        const zOffset = Math.random() > 0.5 ? 1.0 : -1.0;
        const spawnPos = groupRef.current.position.clone().add(new THREE.Vector3(0.8, -0.2, zOffset));
        p.position.copy(spawnPos);
        p.velocity.set(GAME_CONSTANTS.BULLET.SPEED + velocity.current.x, 0, 0);
        p.lifetime = GAME_CONSTANTS.BULLET.LIFETIME;
        
        audioManager.playShoot();
        spawnEffect(effects, spawnPos, 'muzzle', 0.5, '#fef08a');
      }
    }

    // Update missiles (Spacebar logic)
    // We use a local cooldown so we don't fire 4 missiles in 4 frames
    missileTimer.current += delta;
    
    // Auto reload handled by global store, wait, if we handle reload here, we can just do it on a timer.
    // Let's use a separate timer for reload.
    if (!groupRef.current.userData.reloadTimer) groupRef.current.userData.reloadTimer = 0;
    groupRef.current.userData.reloadTimer += delta;
    
    if (groupRef.current.userData.reloadTimer > 1.5) {
      groupRef.current.userData.reloadTimer = 0;
      useStore.getState().reloadMissile();
    }

    if (state.gameState === 'playing' && keys.current.Space && missileTimer.current > 0.2) {
      if (useStore.getState().fireMissile()) {
        missileTimer.current = 0;
        // Spawn missile
        const m = missiles.find(m => !m.active);
        if (m) {
          m.active = true;
          const spawnPos = groupRef.current.position.clone().add(new THREE.Vector3(0, -0.5, 0));
          m.position.copy(spawnPos);
          // Fire diagonally down-right
          m.velocity.set(GAME_CONSTANTS.BULLET.SPEED * 0.4 + velocity.current.x, -GAME_CONSTANTS.BULLET.SPEED * 0.6, 0);
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
            // Gravity acceleration for missiles
            m.velocity.y -= 15 * delta;
            
            // Smoke trail
            if (Math.random() > 0.6) {
                spawnEffect(effects, m.position.clone().add(new THREE.Vector3(-0.2, 0.2, 0)), 'smoke', 0.8);
            }

            // Ground explosion is handled by CollisionManager
            if (m.lifetime <= 0) m.active = false;
            if (m.lifetime <= 0) m.active = false;
        }
    }
  });

  return (
    <group ref={groupRef} position={[0, 5, 0]}>
      <group ref={heliRef}>
        <HelicopterModel rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  );
}
