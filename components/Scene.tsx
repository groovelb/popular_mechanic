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
// 도로: 우상(t=0, 멀리) → 중앙(왼쪽 볼록) → 우하(t=1, 카메라 근처)
// 차량: t가 증가하면서 카메라 쪽으로 다가옴
const TrafficFlow: React.FC<{ curve: THREE.CatmullRomCurve3 }> = ({ curve }) => {
  // startT: 0 = 우상(멀리, 소실점), 1 = 우하(카메라 근처)
  // 차들이 카메라를 향해 다가오므로 앞면(헤드라이트, 그릴)이 보임

  const cars = [
    // === 전경 - 히어로 빨간 컨버터블 (카메라에 가장 가까움) ===
    { laneOffset: 0.15, startT: 0.88, speed: 0.6, color: PALETTE.coralRed, carType: 'convertible' as const, scale: 1.3 },

    // === 근경 ===
    { laneOffset: 0.55, startT: 0.78, speed: 0.7, color: PALETTE.creamYellow, carType: 'sedan' as const, scale: 1.15 },
    { laneOffset: -0.25, startT: 0.75, speed: 0.65, color: PALETTE.peach, carType: 'sedan' as const, scale: 1.1 },
    { laneOffset: -0.6, startT: 0.72, speed: 0.75, color: PALETTE.ivory, carType: 'sedan' as const, scale: 1.05 },

    // === 중경 ===
    { laneOffset: 0.35, startT: 0.62, speed: 0.8, color: PALETTE.skyBlue, carType: 'sedan' as const, scale: 1.0 },
    { laneOffset: -0.45, startT: 0.58, speed: 0.85, color: PALETTE.mintGreen, carType: 'sedan' as const, scale: 0.95 },
    { laneOffset: 0.7, startT: 0.55, speed: 0.9, color: PALETTE.darkBlue, carType: 'sedan' as const, scale: 0.9 },
    { laneOffset: -0.1, startT: 0.50, speed: 0.75, color: PALETTE.orange, carType: 'sedan' as const, scale: 0.9 },

    // === 원경 ===
    { laneOffset: 0.5, startT: 0.42, speed: 0.95, color: PALETTE.lavender, carType: 'sedan' as const, scale: 0.85 },
    { laneOffset: -0.35, startT: 0.38, speed: 0.9, color: PALETTE.turquoise, carType: 'sedan' as const, scale: 0.8 },
    { laneOffset: 0.2, startT: 0.32, speed: 1.0, color: PALETTE.creamYellow, carType: 'sedan' as const, scale: 0.75 },
    { laneOffset: -0.55, startT: 0.28, speed: 0.85, color: PALETTE.coralRed, carType: 'sedan' as const, scale: 0.7 },

    // === 소실점 근처 ===
    { laneOffset: 0.4, startT: 0.20, speed: 1.1, color: PALETTE.skyBlue, carType: 'sedan' as const, scale: 0.65 },
    { laneOffset: -0.2, startT: 0.15, speed: 1.0, color: PALETTE.ivory, carType: 'sedan' as const, scale: 0.6 },
    { laneOffset: 0.0, startT: 0.08, speed: 1.15, color: PALETTE.mintGreen, carType: 'sedan' as const, scale: 0.5 },
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
