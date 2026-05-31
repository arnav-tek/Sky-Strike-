import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface EffectData {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'explosion' | 'muzzle' | 'hit' | 'smoke' | 'explosion_large' | 'debris' | 'fire_trail' | 'shockwave' | 'sparks';
  timer: number;
  maxTime: number;
  scale: number;
  color: string;
  gravity: number;
  rotationSpeed: THREE.Vector3;
}

export const useEffects = () => {
    return React.useState<EffectData[]>(() => Array.from({ length: 200 }, () => ({
        active: false,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        type: 'explosion',
        timer: 0,
        maxTime: 1.0,
        scale: 1,
        color: '#ffffff',
        gravity: 0,
        rotationSpeed: new THREE.Vector3()
    })));
};

export const spawnEffect = (
    effects: EffectData[], 
    position: THREE.Vector3, 
    type: EffectData['type'],
    scale: number = 1.0,
    color: string = '#ffffff',
    velocity?: THREE.Vector3,
    gravity: number = 0,
    rotationSpeed?: THREE.Vector3
) => {
    const e = effects.find(eff => !eff.active);
    if (e) {
        e.active = true;
        e.position.copy(position);
        e.type = type;
        e.timer = 0;
        e.scale = scale;
        e.color = color;
        e.velocity.copy(velocity || new THREE.Vector3());
        e.gravity = gravity;
        e.rotationSpeed.copy(rotationSpeed || new THREE.Vector3());

        if (type === 'explosion') e.maxTime = 0.5;
        if (type === 'explosion_large') e.maxTime = 0.8;
        if (type === 'muzzle') e.maxTime = 0.1;
        if (type === 'hit') e.maxTime = 0.2;
        if (type === 'smoke') e.maxTime = 0.8;
        if (type === 'debris') e.maxTime = 1.0;
        if (type === 'fire_trail') e.maxTime = 0.5;
        if (type === 'shockwave') e.maxTime = 0.3;
        if (type === 'sparks') e.maxTime = 0.4;
    }
};

const EffectInstance = ({ effect }: { effect: EffectData }) => {
    const groupRef = useRef<THREE.Group>(null);
    const sphereRef = useRef<THREE.Mesh>(null);
    const boxRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const coneRef = useRef<THREE.Mesh>(null);
    
    const sphereMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const boxMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const coneMatRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((_, delta) => {
        if (!groupRef.current || !effect.active) return;
        
        groupRef.current.position.copy(effect.position);
        groupRef.current.visible = true;
        
        const progress = effect.timer / effect.maxTime;
        let activeMesh: THREE.Mesh | null = null;
        let activeMat: THREE.MeshBasicMaterial | null = null;

        // Reset visibility
        if (sphereRef.current) sphereRef.current.visible = false;
        if (boxRef.current) boxRef.current.visible = false;
        if (ringRef.current) ringRef.current.visible = false;
        if (coneRef.current) coneRef.current.visible = false;

        // Apply physics
        if (effect.velocity.lengthSq() > 0) {
            effect.position.addScaledVector(effect.velocity, delta);
        }
        if (effect.gravity !== 0) {
            effect.velocity.y -= effect.gravity * delta;
        }

        if (effect.type === 'explosion' || effect.type === 'explosion_large' || effect.type === 'muzzle' || effect.type === 'hit' || effect.type === 'smoke' || effect.type === 'fire_trail') {
            activeMesh = sphereRef.current;
            activeMat = sphereMatRef.current;
            if (activeMesh) activeMesh.visible = true;
            
            if (effect.type === 'explosion' || effect.type === 'explosion_large') {
                activeMesh!.scale.setScalar(effect.scale * (1 + progress * 2));
                activeMat!.opacity = 1 - Math.pow(progress, 2);
                activeMat!.color.set(effect.color);
            } else if (effect.type === 'muzzle') {
                activeMesh!.scale.setScalar(effect.scale * (1 - progress));
                activeMat!.opacity = 1 - progress;
                activeMat!.color.set('#fef08a');
            } else if (effect.type === 'hit') {
                activeMesh!.scale.setScalar(effect.scale * (1 + progress));
                activeMat!.opacity = 1 - progress;
                activeMat!.color.set('#ffffff');
            } else if (effect.type === 'smoke') {
                activeMesh!.scale.setScalar(effect.scale * (1 + progress * 1.5));
                activeMat!.opacity = (1 - progress) * 0.5;
                activeMat!.color.set('#52525b');
            } else if (effect.type === 'fire_trail') {
                activeMesh!.scale.setScalar(effect.scale * (1 - progress));
                activeMat!.opacity = 1 - progress;
                activeMat!.color.set(effect.color);
            }
        } 
        else if (effect.type === 'debris') {
            activeMesh = boxRef.current;
            activeMat = boxMatRef.current;
            if (activeMesh) {
                activeMesh.visible = true;
                activeMesh.rotation.x += effect.rotationSpeed.x * delta;
                activeMesh.rotation.y += effect.rotationSpeed.y * delta;
                activeMesh.rotation.z += effect.rotationSpeed.z * delta;
                activeMesh.scale.setScalar(effect.scale * (1 - progress * 0.5));
                activeMat!.opacity = 1 - progress;
                activeMat!.color.set(effect.color);
            }
        }
        else if (effect.type === 'shockwave') {
            activeMesh = ringRef.current;
            activeMat = ringMatRef.current;
            if (activeMesh) {
                activeMesh.visible = true;
                activeMesh.scale.setScalar(effect.scale * (1 + progress * 5));
                activeMat!.opacity = (1 - progress) * 0.7;
                activeMat!.color.set(effect.color);
            }
        }
        else if (effect.type === 'sparks') {
            activeMesh = coneRef.current;
            activeMat = coneMatRef.current;
            if (activeMesh) {
                activeMesh.visible = true;
                // Align cone to velocity
                if (effect.velocity.lengthSq() > 0.1) {
                    const dir = effect.velocity.clone().normalize();
                    const axis = new THREE.Vector3(0, 1, 0);
                    activeMesh.quaternion.setFromUnitVectors(axis, dir);
                }
                activeMesh.scale.set(effect.scale * 0.5, effect.scale * (2 + progress * 2), effect.scale * 0.5);
                activeMat!.opacity = 1 - progress;
                activeMat!.color.set(effect.color);
            }
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            <mesh ref={sphereRef} visible={false}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial ref={sphereMatRef} transparent opacity={1} depthWrite={false} />
            </mesh>
            <mesh ref={boxRef} visible={false}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial ref={boxMatRef} transparent opacity={1} depthWrite={false} />
            </mesh>
            <mesh ref={ringRef} visible={false} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1, 16]} />
                <meshBasicMaterial ref={ringMatRef} transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={coneRef} visible={false}>
                <coneGeometry args={[1, 2, 4]} />
                <meshBasicMaterial ref={coneMatRef} transparent opacity={1} depthWrite={false} />
            </mesh>
        </group>
    );
};

export default function EffectsManager({ effects }: { effects: EffectData[] }) {
    useFrame((_, delta) => {
        for (let i = 0; i < effects.length; i++) {
            if (effects[i].active) {
                effects[i].timer += delta;
                if (effects[i].timer >= effects[i].maxTime) {
                    effects[i].active = false;
                }
            }
        }
    });

    return (
        <group>
            {effects.map((eff, i) => (
                <EffectInstance key={i} effect={eff} />
            ))}
        </group>
    );
}
