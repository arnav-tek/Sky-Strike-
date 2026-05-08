import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface EffectData {
  active: boolean;
  position: THREE.Vector3;
  type: 'explosion' | 'muzzle' | 'hit' | 'smoke';
  timer: number;
  maxTime: number;
  scale: number;
  color: string;
}

export const useEffects = () => {
    return React.useState<EffectData[]>(() => Array.from({ length: 80 }, () => ({
        active: false,
        position: new THREE.Vector3(),
        type: 'explosion',
        timer: 0,
        maxTime: 1.0,
        scale: 1,
        color: '#ffffff'
    })));
};

export const spawnEffect = (
    effects: EffectData[], 
    position: THREE.Vector3, 
    type: 'explosion' | 'muzzle' | 'hit' | 'smoke',
    scale: number = 1.0,
    color: string = '#ffffff'
) => {
    const e = effects.find(eff => !eff.active);
    if (e) {
        e.active = true;
        e.position.copy(position);
        e.type = type;
        e.timer = 0;
        e.scale = scale;
        e.color = color;
        if (type === 'explosion') e.maxTime = 0.5;
        if (type === 'muzzle') e.maxTime = 0.1;
        if (type === 'hit') e.maxTime = 0.2;
        if (type === 'smoke') e.maxTime = 0.4;
    }
};

const EffectInstance = ({ effect }: { effect: EffectData }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame(() => {
        if (!meshRef.current || !materialRef.current || !effect.active) return;
        
        meshRef.current.position.copy(effect.position);
        meshRef.current.visible = true;
        
        const progress = effect.timer / effect.maxTime;
        
        if (effect.type === 'explosion') {
            meshRef.current.scale.setScalar(effect.scale * (1 + progress * 2));
            materialRef.current.opacity = 1 - progress;
            materialRef.current.color.set(effect.color);
        } else if (effect.type === 'muzzle') {
            meshRef.current.scale.setScalar(effect.scale * (1 - progress));
            materialRef.current.opacity = 1 - progress;
            materialRef.current.color.set('#fef08a'); // bright yellow
        } else if (effect.type === 'hit') {
            meshRef.current.scale.setScalar(effect.scale * (1 + progress));
            materialRef.current.opacity = 1 - progress;
            materialRef.current.color.set('#ffffff');
        } else if (effect.type === 'smoke') {
            meshRef.current.scale.setScalar(effect.scale * (1 + progress));
            materialRef.current.opacity = (1 - progress) * 0.5;
            materialRef.current.color.set('#52525b'); // gray smoke
        }
    });

    return (
        <mesh ref={meshRef} visible={false}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial ref={materialRef} transparent opacity={1} depthWrite={false} />
        </mesh>
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
