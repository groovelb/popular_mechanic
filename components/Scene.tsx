import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import VintageCar from './VintageCar';
import RoadSystem, { createHighwayCurve } from './RoadSystem';
import { AnimationState, PALETTE } from '../types';

// Camera controller - LOW angle matching reference image
const CameraRig = ({ mode }: { mode: AnimationState }) => {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (mode === 'COVER') {
      // LOW camera angle - like sitting in a car behind the traffic
      // Position: slightly right of center, low height, looking towards top-left vanishing point
      const targetPos = new THREE.Vector3(
        12 + mousePos.current.x * 2,   // Right side of road
        4 + mousePos.current.y * 1,    // LOW - car height level
        55                              // Close to front of scene
      );
      camera.position.lerp(targetPos, 0.04);

      // Look towards the vanishing point (top-left)
      const lookTarget = new THREE.Vector3(-20, 3, -40);
      camera.lookAt(lookTarget);
    } else {
      // Explore mode - orbit around the scene
      const time = state.clock.getElapsedTime();
      camera.position.x = Math.sin(time * 0.15) * 60;
      camera.position.z = Math.cos(time * 0.15) * 60;
      camera.position.y = 30 + Math.sin(time * 0.1) * 10;
      camera.lookAt(-10, 0, -20);
    }
  });

  return null;
};

// Sky gradient background
const SkyBackground: React.FC = () => {
  return (
    <>
      {/* Sky gradient - positioned towards the vanishing point (top-left) */}
      <mesh position={[-30, 50, -120]} rotation={[0.1, 0.2, 0]}>
        <planeGeometry args={[500, 200]} />
        <meshBasicMaterial color={PALETTE.skyLight} />
      </mesh>
      <mesh position={[-20, 15, -100]} rotation={[0.2, 0.15, 0]}>
        <planeGeometry args={[500, 100]} />
        <meshBasicMaterial color={PALETTE.sky} />
      </mesh>
    </>
  );
};

// Traffic configuration - cars following the curved road
const TrafficFlow: React.FC<{ curve: THREE.CatmullRomCurve3 }> = ({ curve }) => {
  // Cars arranged across 6 lanes (-0.8 to 0.8 offset range)
  // startT: 0 = far end (vanishing point), 1 = close to camera
  // Lower startT = further away, higher = closer

  const cars = [
    // === FOREGROUND - Hero Red Convertible (closest to camera) ===
    { laneOffset: 0.2, startT: 0.05, speed: 0.8, color: PALETTE.coralRed, carType: 'convertible' as const, scale: 1.2 },

    // === NEAR FOREGROUND ===
    { laneOffset: 0.6, startT: 0.12, speed: 0.9, color: PALETTE.creamYellow, carType: 'sedan' as const, scale: 1.1 },
    { laneOffset: -0.3, startT: 0.15, speed: 0.85, color: PALETTE.peach, carType: 'sedan' as const, scale: 1.1 },
    { laneOffset: 0.8, startT: 0.18, speed: 0.95, color: PALETTE.ivory, carType: 'sedan' as const, scale: 1.0 },

    // === MIDDLE GROUND ===
    { laneOffset: -0.6, startT: 0.25, speed: 1.0, color: PALETTE.skyBlue, carType: 'sedan' as const, scale: 1.0 },
    { laneOffset: 0.4, startT: 0.28, speed: 0.9, color: PALETTE.mintGreen, carType: 'sedan' as const, scale: 1.0 },
    { laneOffset: -0.1, startT: 0.32, speed: 1.1, color: PALETTE.darkBlue, carType: 'sedan' as const, scale: 0.95 },
    { laneOffset: 0.7, startT: 0.35, speed: 0.85, color: PALETTE.orange, carType: 'sedan' as const, scale: 0.95 },

    // === BACKGROUND ===
    { laneOffset: -0.5, startT: 0.45, speed: 1.2, color: PALETTE.lavender, carType: 'sedan' as const, scale: 0.9 },
    { laneOffset: 0.3, startT: 0.48, speed: 1.0, color: PALETTE.turquoise, carType: 'sedan' as const, scale: 0.9 },
    { laneOffset: -0.7, startT: 0.52, speed: 1.15, color: PALETTE.creamYellow, carType: 'sedan' as const, scale: 0.85 },
    { laneOffset: 0.5, startT: 0.55, speed: 0.95, color: PALETTE.coralRed, carType: 'sedan' as const, scale: 0.85 },

    // === FAR BACKGROUND ===
    { laneOffset: 0.0, startT: 0.65, speed: 1.3, color: PALETTE.skyBlue, carType: 'sedan' as const, scale: 0.8 },
    { laneOffset: -0.4, startT: 0.70, speed: 1.2, color: PALETTE.ivory, carType: 'sedan' as const, scale: 0.75 },
    { laneOffset: 0.6, startT: 0.75, speed: 1.1, color: PALETTE.mintGreen, carType: 'sedan' as const, scale: 0.7 },
  ];

  return (
    <>
      {cars.map((car, index) => (
        <VintageCar
          key={index}
          curve={curve}
          laneOffset={car.laneOffset}
          startT={car.startT}
          speed={car.speed}
          color={car.color}
          carType={car.carType}
          scale={car.scale}
        />
      ))}
    </>
  );
};

// Main scene component
const IllustrationScene: React.FC<{ mode: AnimationState }> = ({ mode }) => {
  const curve = useMemo(() => createHighwayCurve(), []);

  return (
    <>
      <CameraRig mode={mode} />
      <PerspectiveCamera
        makeDefault
        fov={55}  // Wider FOV to capture more of the road
        near={0.1}
        far={500}
        position={[12, 4, 55]}
      />

      {/* Lighting - warm 50s illustration feel */}
      <ambientLight intensity={0.6} color="#fff5e6" />
      <directionalLight
        position={[20, 40, 30]}
        intensity={1.0}
        color="#fffaf0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      {/* Fill light from the right (where camera is) */}
      <directionalLight
        position={[30, 15, 50]}
        intensity={0.4}
        color="#ffe8d0"
      />
      {/* Back light for depth */}
      <directionalLight
        position={[-30, 20, -50]}
        intensity={0.3}
        color="#d0e8ff"
      />

      {/* Background */}
      <SkyBackground />

      {/* Road System */}
      <RoadSystem />

      {/* Traffic */}
      <TrafficFlow curve={curve} />

      {/* Atmospheric fog for depth */}
      <fog attach="fog" args={['#a8c8c0', 40, 120]} />
    </>
  );
};

export default IllustrationScene;
