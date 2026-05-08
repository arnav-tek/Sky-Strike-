import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function CameraController() {
  const target = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();

  useFrame((state, delta) => {
    const gameState = useStore.getState().gameState;
    const playerPos = useStore.getState().playerPos;
    const gameOver = useStore.getState().gameOver;
    let cameraShake = useStore.getState().cameraShake;

    if (gameOver || gameState === 'gameover') {
      // Dramatic slow zoom out during game over
      target.set(playerPos[0] + 5, playerPos[1] + 5, 45);
      state.camera.position.lerp(target, 0.02);
      lookTarget.set(playerPos[0], playerPos[1], 0);
      state.camera.lookAt(lookTarget);
      return;
    }

    if (gameState === 'hangar') {
      // Cinematic close-up on helicopter in hangar
      const time = state.clock.getElapsedTime();
      target.set(playerPos[0] + 5 + Math.sin(time * 0.5) * 2, playerPos[1] + 2 + Math.cos(time * 0.3), 10);
      state.camera.position.lerp(target, 0.05);
      lookTarget.set(playerPos[0], playerPos[1], 0);
      state.camera.lookAt(lookTarget);
      return;
    }

    if (gameState === 'menu' || gameState === 'loadout' || gameState === 'settings') {
      // Cinematic tracking shot, player is off-center
      const time = state.clock.getElapsedTime();
      target.set(playerPos[0] + 15, playerPos[1] + 5 + Math.sin(time * 0.2) * 5, 35);
      state.camera.position.lerp(target, 0.02);
      lookTarget.set(playerPos[0] + 5, playerPos[1], 0);
      state.camera.lookAt(lookTarget);
      return;
    }

    // For a strict 2.5D side-scroller, the camera must be straight.
    // Position the camera ahead of the player (so player is on the left)
    target.set(playerPos[0] + 10, playerPos[1] + 2, 28);
    
    // Apply camera shake
    if (cameraShake > 0) {
      target.x += (Math.random() - 0.5) * cameraShake;
      target.y += (Math.random() - 0.5) * cameraShake;
      target.z += (Math.random() - 0.5) * cameraShake;
      
      // Decay the shake
      useStore.getState().setCameraShake(Math.max(0, cameraShake - delta * 5));
    }

    state.camera.position.lerp(target, 0.08);

    // Look directly forward from the camera's current position to eliminate angle
    lookTarget.set(state.camera.position.x, state.camera.position.y, 0);
    state.camera.lookAt(lookTarget);
  });

  return null;
}
