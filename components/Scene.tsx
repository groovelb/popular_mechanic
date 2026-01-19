import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import VintageCar from './VintageCar';
import RoadSystem, { createHighwayCurve } from './RoadSystem';
import PostEffects from './PostEffects';
import { AnimationState, PALETTE } from '../types';

// Camera controller - 고가도로 뒤에서 바라보는 시점
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
      // 레퍼런스 이미지처럼 - 도로 위에서 차량 가까이
      const targetPos = new THREE.Vector3(
        45 + mousePos.current.x * 8,    // 더 오른쪽으로
        24 + mousePos.current.y * 3,    // 도로 높이보다 약간 위 (18 + 6)
        150                              // 차량과 가까운 위치
      );
      camera.position.lerp(targetPos, 0.03);

      // 도로를 따라 앞쪽을 바라봄 (멀리 소실점)
      const lookTarget = new THREE.Vector3(-20, 20, -120);
      camera.lookAt(lookTarget);
    } else {
      // Explore mode - 넓은 궤도
      const time = state.clock.getElapsedTime();
      camera.position.x = Math.sin(time * 0.1) * 200;
      camera.position.z = Math.cos(time * 0.1) * 200;
      camera.position.y = 80 + Math.sin(time * 0.08) * 30;
      camera.lookAt(0, 18, -50);
    }
  });

  return null;
};

// 하늘은 이제 RoadSystem에서 처리

// Traffic configuration - 레퍼런스처럼 가까운 차량 강조
const TrafficFlow: React.FC<{ curve: THREE.CatmullRomCurve3; timeOfDay?: number }> = ({ curve, timeOfDay = 0 }) => {
  const cars = [
    // === 최전경 - 히어로 차량 (카메라 바로 앞) ===
    { laneOffset: 0.3, startT: 0.88, speed: 0.35, color: PALETTE.coralRed, carType: 'cadillac' as const },
    { laneOffset: -0.4, startT: 0.86, speed: 0.4, color: PALETTE.creamYellow, carType: 'impala' as const },
    { laneOffset: 0.6, startT: 0.84, speed: 0.38, color: PALETTE.skyBlue, carType: 'fury' as const },

    // === 전경 ===
    { laneOffset: -0.2, startT: 0.80, speed: 0.45, color: PALETTE.ivory, carType: 'fairlane' as const },
    { laneOffset: 0.45, startT: 0.78, speed: 0.42, color: PALETTE.mintGreen, carType: 'cadillac' as const },
    { laneOffset: -0.55, startT: 0.76, speed: 0.48, color: PALETTE.orange, carType: 'impala' as const },
    { laneOffset: 0.1, startT: 0.74, speed: 0.44, color: PALETTE.peach, carType: 'fury' as const },

    // === 근경 ===
    { laneOffset: 0.5, startT: 0.70, speed: 0.5, color: PALETTE.darkBlue, carType: 'fairlane' as const },
    { laneOffset: -0.35, startT: 0.68, speed: 0.52, color: PALETTE.coralRed, carType: 'cadillac' as const },
    { laneOffset: 0.25, startT: 0.65, speed: 0.48, color: PALETTE.turquoise, carType: 'impala' as const },
    { laneOffset: -0.5, startT: 0.62, speed: 0.55, color: PALETTE.creamYellow, carType: 'fury' as const },

    // === 중경 ===
    { laneOffset: 0.4, startT: 0.58, speed: 0.6, color: PALETTE.skyBlue, carType: 'fairlane' as const },
    { laneOffset: -0.15, startT: 0.54, speed: 0.58, color: PALETTE.mintGreen, carType: 'cadillac' as const },
    { laneOffset: 0.55, startT: 0.50, speed: 0.62, color: PALETTE.ivory, carType: 'impala' as const },
    { laneOffset: -0.45, startT: 0.46, speed: 0.65, color: PALETTE.orange, carType: 'fury' as const },

    // === 원경 ===
    { laneOffset: 0.2, startT: 0.40, speed: 0.7, color: PALETTE.peach, carType: 'fairlane' as const },
    { laneOffset: -0.3, startT: 0.35, speed: 0.72, color: PALETTE.darkBlue, carType: 'cadillac' as const },
    { laneOffset: 0.5, startT: 0.30, speed: 0.75, color: PALETTE.coralRed, carType: 'impala' as const },
    { laneOffset: -0.55, startT: 0.25, speed: 0.78, color: PALETTE.turquoise, carType: 'fury' as const },

    // === 먼 거리 ===
    { laneOffset: 0.35, startT: 0.20, speed: 0.82, color: PALETTE.creamYellow, carType: 'fairlane' as const },
    { laneOffset: -0.2, startT: 0.15, speed: 0.85, color: PALETTE.skyBlue, carType: 'cadillac' as const },
    { laneOffset: 0.1, startT: 0.10, speed: 0.9, color: PALETTE.mintGreen, carType: 'impala' as const },
    { laneOffset: -0.4, startT: 0.06, speed: 0.95, color: PALETTE.ivory, carType: 'fury' as const },
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
          scale={1.0}
          timeOfDay={timeOfDay}
        />
      ))}
    </>
  );
};

// 색상 보간 함수
const lerpColor = (color1: string, color2: string, t: number): string => {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  const result = c1.lerp(c2, t);
  return `#${result.getHexString()}`;
};

// Main scene component
interface SceneProps {
  mode: AnimationState;
  timeOfDay?: number; // 0 = 낮, 1 = 밤
}

const IllustrationScene: React.FC<SceneProps> = ({ mode, timeOfDay = 0 }) => {
  const curve = useMemo(() => createHighwayCurve(), []);

  // 낮/밤 색상 팔레트
  const dayColors = {
    ambient: '#fff5e6',
    main: '#fffaf0',
    fill: '#ffe8d0',
    back: '#d0e8ff',
  };

  // 밤 - 보라색이 살짝 도는 어두운 톤
  const nightColors = {
    ambient: '#06040c',  // 매우 어두운 보라
    main: '#0a0818',     // 어두운 보라/남색
    fill: '#050410',     // 거의 검정
    back: '#020206',     // 거의 검정
  };

  // 조명 강도 - 낮 줄임, 밤 어둡게
  const ambientIntensity = 0.4 - timeOfDay * 0.37; // 0.4 → 0.03
  const mainIntensity = 0.7 - timeOfDay * 0.62; // 0.7 → 0.08
  const fillIntensity = 0.25 - timeOfDay * 0.23; // 0.25 → 0.02
  const backIntensity = 0.2 - timeOfDay * 0.18; // 0.2 → 0.02

  return (
    <>
      <CameraRig mode={mode} />
      <PerspectiveCamera
        makeDefault
        fov={65}
        near={0.1}
        far={1500}
        position={[45, 24, 150]}
      />

      {/* Lighting - 낮/밤 전환 */}
      <ambientLight
        intensity={ambientIntensity}
        color={lerpColor(dayColors.ambient, nightColors.ambient, timeOfDay)}
      />
      <directionalLight
        position={[20, 40, 30]}
        intensity={mainIntensity}
        color={lerpColor(dayColors.main, nightColors.main, timeOfDay)}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      {/* Fill light */}
      <directionalLight
        position={[30, 15, 50]}
        intensity={fillIntensity}
        color={lerpColor(dayColors.fill, nightColors.fill, timeOfDay)}
      />
      {/* Back light */}
      <directionalLight
        position={[-30, 20, -50]}
        intensity={backIntensity}
        color={lerpColor(dayColors.back, nightColors.back, timeOfDay)}
      />

      {/* Road System */}
      <RoadSystem timeOfDay={timeOfDay} />

      {/* Traffic */}
      <TrafficFlow curve={curve} timeOfDay={timeOfDay} />

      {/* 50년대 빈티지 포스트 프로세싱 */}
      <PostEffects />
    </>
  );
};

export default IllustrationScene;
