import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

const Tree = ({ position, scale }: any) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.3, 1, 5]} />
      <meshStandardMaterial color="#451a03" flatShading />
    </mesh>
    <mesh position={[0, 2, 0]} castShadow>
      <coneGeometry args={[1.5, 3, 5]} />
      <meshStandardMaterial color="#064e3b" flatShading />
    </mesh>
  </group>
);

const Cactus = ({ position, scale, rotation }: any) => (
  <group position={position} scale={scale} rotation={[0, rotation, 0]}>
    {/* Main Stem */}
    <mesh position={[0, 1.0, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.25, 2.0, 6]} />
      <meshStandardMaterial color="#166534" flatShading roughness={0.8} />
    </mesh>
    {/* Left Arm */}
    <group position={[-0.35, 1.1, 0]} rotation={[0, 0, Math.PI / 4]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 5]} />
        <meshStandardMaterial color="#166534" flatShading roughness={0.8} />
      </mesh>
    </group>
    <mesh position={[-0.52, 1.45, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.12, 0.5, 5]} />
      <meshStandardMaterial color="#166534" flatShading roughness={0.8} />
    </mesh>
    {/* Right Arm */}
    <group position={[0.35, 0.7, 0]} rotation={[0, 0, -Math.PI / 4]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 5]} />
        <meshStandardMaterial color="#166534" flatShading roughness={0.8} />
      </mesh>
    </group>
    <mesh position={[0.52, 1.05, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.12, 0.5, 5]} />
      <meshStandardMaterial color="#166534" flatShading roughness={0.8} />
    </mesh>
  </group>
);

const SnowyTree = ({ position, scale }: any) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.3, 1, 5]} />
      <meshStandardMaterial color="#382515" flatShading roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.8, 0]} castShadow>
      <coneGeometry args={[1.5, 2.6, 5]} />
      <meshStandardMaterial color="#064e3b" flatShading roughness={0.9} />
    </mesh>
    {/* Snow cap */}
    <mesh position={[0, 2.4, 0]} castShadow>
      <coneGeometry args={[1.0, 1.5, 5]} />
      <meshStandardMaterial color="#f8fafc" flatShading roughness={0.5} />
    </mesh>
  </group>
);

const DynamicTent = ({ position, scale, rotation, color }: any) => (
  <group position={position} scale={scale} rotation={[0, rotation, 0]}>
    <mesh position={[0, 1, 0]} castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[2, 2, 4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  </group>
);

const DynamicWatchTower = ({ position, scale, rotation, color, topColor }: any) => (
  <group position={position} scale={scale} rotation={[0, rotation, 0]}>
    <mesh position={[0, 2, 0]} castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
      <cylinderGeometry args={[0.8, 1, 4, 4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
    <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.5, 1, 2.5]} />
      <meshStandardMaterial color={topColor} flatShading />
    </mesh>
  </group>
);

const THEMES: Record<number, {
  groundColor: string;
  roadColor: string;
  roadEdgeColor: string;
  laneColor: string;
  midMountainColor: string;
  farMountainColor: string;
  tentColor: string;
  towerColor: string;
  towerTopColor: string;
}> = {
  0: { // Forest
    groundColor: "#14532d",
    roadColor: "#27272a",
    roadEdgeColor: "#94a3b8",
    laneColor: "#fbbf24",
    midMountainColor: "#166534",
    farMountainColor: "#475569",
    tentColor: "#4d7c0f",
    towerColor: "#3f3f46",
    towerTopColor: "#52525b",
  },
  1: { // Desert Mountain
    groundColor: "#cca46c",
    roadColor: "#5c4033",
    roadEdgeColor: "#c2410c",
    laneColor: "#ca8a04",
    midMountainColor: "#b45309",
    farMountainColor: "#7c2d12",
    tentColor: "#d9a05b",
    towerColor: "#854d0e",
    towerTopColor: "#7c2d12",
  },
  2: { // Snow Mountain
    groundColor: "#f1f5f9",
    roadColor: "#1e293b",
    roadEdgeColor: "#cbd5e1",
    laneColor: "#94a3b8",
    midMountainColor: "#cbd5e1",
    farMountainColor: "#f8fafc",
    tentColor: "#f8fafc",
    towerColor: "#94a3b8",
    towerTopColor: "#64748b",
  }
};

export default function Environment() {
  const currentLevel = useStore(state => state.currentLevel);
  const theme = (currentLevel - 1) % 3; // 0 = Forest, 1 = Desert, 2 = Snow
  const cfg = THEMES[theme];

  const closeLayerRef = useRef<THREE.Group>(null);
  const midLayerRef = useRef<THREE.Group>(null);
  const farLayerRef = useRef<THREE.Group>(null);
  const groundRef = useRef<THREE.Mesh>(null);
  const roadRef = useRef<THREE.Mesh>(null);

  // Generate random positions once using useMemo to keep them stable
  const decorations = useMemo(() => {
    return Array.from({ length: 80 }).map(() => ({
      x: (Math.random() - 0.5) * 240,
      z: Math.random() * -60 - 5,
      type: Math.floor(Math.random() * 10), // weighted towards trees
      scale: 0.8 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI,
    }));
  }, []);

  const laneMarkings = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      x: (i - 20) * 10,
    }));
  }, []);

  const midMountains = useMemo(() => {
    return Array.from({ length: 25 }).map(() => ({
      x: (Math.random() - 0.5) * 400,
      z: -80 - Math.random() * 30,
      scale: 1 + Math.random() * 1.5,
      rotY: Math.random() * Math.PI,
    }));
  }, []);

  const farMountains = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      x: (Math.random() - 0.5) * 500,
      z: -180 - Math.random() * 50,
      scale: 2 + Math.random() * 3,
      rotY: Math.random() * Math.PI,
    }));
  }, []);

  useFrame(({ camera }) => {
    const { gameState } = useStore.getState();
    if (gameState !== 'playing' && gameState !== 'menu' && gameState !== 'loadout' && gameState !== 'settings') return;

    const camX = camera.position.x;
    
    // ground tracks camera to prevent player reaching edge
    if (groundRef.current) groundRef.current.position.x = camX;
    if (roadRef.current) roadRef.current.position.x = camX;

    // Parallax scrolling
    if (closeLayerRef.current) {
      closeLayerRef.current.children.forEach((child, i) => {
        if (i < 40) {
          // Lane markings (first 40 children)
          let xPos = (laneMarkings[i].x - camX) % 100;
          if (xPos > 50) xPos -= 100;
          if (xPos < -50) xPos += 100;
          child.position.x = camX + xPos;
        } else {
          // Decorations
          const decIndex = i - 40;
          let xPos = (decorations[decIndex].x - camX) % 240;
          if (xPos > 120) xPos -= 240;
          if (xPos < -120) xPos += 240;
          child.position.x = camX + xPos;
        }
      });
    }

    if (midLayerRef.current) {
      midLayerRef.current.children.forEach((child, i) => {
        let xPos = (midMountains[i].x - camX * 0.4) % 400; // 0.4 speed
        if (xPos > 200) xPos -= 400;
        if (xPos < -200) xPos += 400;
        child.position.x = camX + xPos;
      });
    }

    if (farLayerRef.current) {
      farLayerRef.current.children.forEach((child, i) => {
        let xPos = (farMountains[i].x - camX * 0.15) % 500; // 0.15 speed
        if (xPos > 250) xPos -= 500;
        if (xPos < -250) xPos += 500;
        child.position.x = camX + xPos;
      });
    }
  });

  return (
    <group>
      {/* Endless Flat Ground */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[1000, 400]} />
        <meshStandardMaterial color={cfg.groundColor} flatShading />
      </mesh>

      {/* Road System for Ground Enemies */}
      <group position={[0, 0.0, 0]}>
        {/* Road Base */}
        <mesh ref={roadRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[1000, 15]} />
          <meshStandardMaterial color={cfg.roadColor} flatShading roughness={0.9} />
        </mesh>
        
        {/* Road Edges */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 7.5]} receiveShadow>
          <planeGeometry args={[1000, 0.5]} />
          <meshStandardMaterial color={cfg.roadEdgeColor} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -7.5]} receiveShadow>
          <planeGeometry args={[1000, 0.5]} />
          <meshStandardMaterial color={cfg.roadEdgeColor} />
        </mesh>
        
        {/* Scrolling Lane Markings */}
        <group ref={closeLayerRef}>
          {Array.from({ length: 40 }).map((_, i) => (
            <mesh key={`line-${i}`} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 0.5]} />
              <meshBasicMaterial color={cfg.laneColor} />
            </mesh>
          ))}
          {/* Keep decorations in closeLayerRef but positioned further back */}
          {decorations.map((item, i) => {
            if (item.type < 7) {
              if (theme === 0) {
                return <Tree key={`dec-${i}`} position={[0, 0, item.z - 10]} scale={item.scale} />;
              } else if (theme === 1) {
                return <Cactus key={`dec-${i}`} position={[0, 0, item.z - 10]} scale={item.scale} rotation={item.rotation} />;
              } else {
                return <SnowyTree key={`dec-${i}`} position={[0, 0, item.z - 10]} scale={item.scale} />;
              }
            } else if (item.type < 9) {
              return <DynamicTent key={`dec-${i}`} position={[0, 0, item.z - 10]} scale={item.scale} rotation={item.rotation} color={cfg.tentColor} />;
            } else {
              return <DynamicWatchTower key={`dec-${i}`} position={[0, 0, item.z - 10]} scale={item.scale} rotation={item.rotation} color={cfg.towerColor} topColor={cfg.towerTopColor} />;
            }
          })}
        </group>
      </group>

      {/* Midground Low Poly Hills */}
      <group ref={midLayerRef}>
        {midMountains.map((item, i) => (
          <mesh 
            key={`mid-${i}`} 
            position={[0, 0, item.z]} 
            scale={item.scale} 
            rotation={[0, item.rotY, 0]}
            receiveShadow
            castShadow
          >
            <coneGeometry args={[25, 40, 5]} />
            <meshStandardMaterial color={cfg.midMountainColor} flatShading />
          </mesh>
        ))}
      </group>

      {/* Distant Cold Mountain Peaks */}
      <group ref={farLayerRef}>
        {farMountains.map((item, i) => (
          <mesh 
            key={`far-${i}`} 
            position={[0, 0, item.z]} 
            scale={item.scale} 
            rotation={[0, item.rotY, 0]}
          >
            <coneGeometry args={[40, 90, 6]} />
            <meshStandardMaterial color={cfg.farMountainColor} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  );
}
