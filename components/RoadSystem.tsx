import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PALETTE } from '../types';

// Create the main curved highway path
// 우상(오른쪽 뒤) → 중앙(왼쪽으로 볼록) → 우하(오른쪽 앞, 카메라 쪽)
export const createHighwayCurve = () => {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(30, 0, -80),     // 시작: 우상 (오른쪽, 멀리)
    new THREE.Vector3(20, 0, -60),
    new THREE.Vector3(5, 0, -40),      // 왼쪽으로 커브 시작
    new THREE.Vector3(-10, 0, -20),    // 가장 왼쪽 지점
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(5, 0, 20),       // 다시 오른쪽으로
    new THREE.Vector3(15, 0, 40),
    new THREE.Vector3(20, 0, 60),      // 끝: 우하 (오른쪽, 카메라 쪽)
  ], false, 'catmullrom', 0.3);
};

// Curved Highway using the curve path
const CurvedHighway: React.FC = () => {
  const curve = useMemo(() => createHighwayCurve(), []);
  const roadWidth = 36;
  const segments = 100;

  // Generate road surface geometry following the curve
  const roadGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      // Get perpendicular vector (for road width)
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = point.clone().add(normal.clone().multiplyScalar(-roadWidth / 2));
      const right = point.clone().add(normal.clone().multiplyScalar(roadWidth / 2));

      positions.push(left.x, 0.01, left.z);
      positions.push(right.x, 0.01, right.z);

      uvs.push(0, t);
      uvs.push(1, t);
    }

    // Create faces
    const indices: number[] = [];
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    return geometry;
  }, [curve, segments, roadWidth]);

  // 중앙선 (노란색 실선)
  const centerLine = useMemo(() => {
    const lines: JSX.Element[] = [];

    for (let i = 0; i < segments; i += 1) {
      const t = i / segments;
      const t2 = Math.min((i + 1) / segments, 1);

      const point1 = curve.getPointAt(t);
      const point2 = curve.getPointAt(t2);

      const midPoint = point1.clone().add(point2).multiplyScalar(0.5);
      const length = point1.distanceTo(point2);
      const angle = Math.atan2(point2.x - point1.x, point2.z - point1.z);

      lines.push(
        <mesh
          key={`center-${i}`}
          position={[midPoint.x, 0.02, midPoint.z]}
          rotation={[-Math.PI / 2, -angle, 0]}
        >
          <planeGeometry args={[0.3, length * 1.1]} />
          <meshBasicMaterial color="#f0c040" />
        </mesh>
      );
    }

    return lines;
  }, [curve, segments]);

  // 레퍼런스 이미지에는 차선 구분선 없음 - 중앙선만 존재

  // Road edge lines (흰색 실선)
  const edgeLines = useMemo(() => {
    const edges: JSX.Element[] = [];

    [-1, 1].forEach((side, sideIdx) => {
      for (let i = 0; i < segments; i += 1) {
        const t = i / segments;
        const t2 = Math.min((i + 1) / segments, 1);

        const point1 = curve.getPointAt(t);
        const point2 = curve.getPointAt(t2);
        const tangent = curve.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const offset = (roadWidth / 2 - 0.3) * side;

        const pos1 = point1.clone().add(normal.clone().multiplyScalar(offset));
        const pos2 = point2.clone().add(normal.clone().multiplyScalar(offset));

        const midPoint = pos1.clone().add(pos2).multiplyScalar(0.5);
        const length = pos1.distanceTo(pos2);
        const angle = Math.atan2(pos2.x - pos1.x, pos2.z - pos1.z);

        edges.push(
          <mesh
            key={`edge-${sideIdx}-${i}`}
            position={[midPoint.x, 0.02, midPoint.z]}
            rotation={[-Math.PI / 2, -angle, 0]}
          >
            <planeGeometry args={[0.25, length * 1.1]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        );
      }
    });

    return edges;
  }, [curve, segments, roadWidth]);

  return (
    <group>
      {/* Main road surface */}
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial
          color={PALETTE.road}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* 중앙선 (노란색) - 레퍼런스 이미지처럼 중앙선만 */}
      {centerLine}

      {/* 도로 가장자리 (흰색) */}
      {edgeLines}
    </group>
  );
};

// Background city silhouette - 왼쪽에 배치 (도로가 왼쪽으로 휘어지므로)
const CityBackground: React.FC = () => {
  const buildings = useMemo(() => {
    const builds: JSX.Element[] = [];
    const positions = [
      { x: -50, z: -60, w: 18, h: 50, d: 18 },
      { x: -35, z: -70, w: 14, h: 65, d: 14 },
      { x: -60, z: -40, w: 20, h: 45, d: 20 },
      { x: -70, z: -55, w: 16, h: 75, d: 16 },
      { x: -45, z: -30, w: 12, h: 40, d: 12 },
      { x: -25, z: -50, w: 15, h: 55, d: 15 },
      { x: -80, z: -45, w: 22, h: 60, d: 18 },
      { x: 40, z: -70, w: 16, h: 45, d: 16 },
      { x: 55, z: -60, w: 14, h: 55, d: 14 },
    ];

    positions.forEach((p, i) => {
      builds.push(
        <mesh key={i} position={[p.x, p.h / 2 - 5, p.z]}>
          <boxGeometry args={[p.w, p.h, p.d]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#c8b8a0' : '#b8a890'}
            roughness={0.95}
          />
        </mesh>
      );
    });

    return builds;
  }, []);

  return <group>{buildings}</group>;
};

// Ground/terrain around the road
const Terrain: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#8a8070" roughness={1} />
    </mesh>
  );
};

// Complete road system
const RoadSystem: React.FC = () => {
  return (
    <group>
      <Terrain />
      <CurvedHighway />
      <CityBackground />
    </group>
  );
};

export default RoadSystem;
export { CurvedHighway, CityBackground };
