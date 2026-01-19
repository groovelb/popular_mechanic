import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Sky } from '@react-three/drei';
import { PALETTE } from '../types';

// ============================================
// Toon Shading용 그라디언트 맵
// ============================================
function createGradientTexture(steps: number = 4): THREE.DataTexture {
  const colors = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) {
    colors[i] = Math.floor((i / (steps - 1)) * 255);
  }
  const texture = new THREE.DataTexture(colors, steps, 1, THREE.RedFormat);
  texture.needsUpdate = true;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const toonGradient3 = createGradientTexture(3);
const toonGradient5 = createGradientTexture(5);

// 고가도로 높이
const ELEVATED_HEIGHT = 18;

// 도로 경로 근처인지 확인하는 함수
const isNearRoad = (x: number, z: number, curve: THREE.CatmullRomCurve3, margin: number = 25): boolean => {
  // 도로 곡선을 따라 샘플링하여 거리 체크
  for (let t = 0; t <= 1; t += 0.05) {
    const point = curve.getPointAt(t);
    const dx = x - point.x;
    const dz = z - point.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < margin) return true;
  }
  return false;
};

// 시드 기반 랜덤 (결정적 랜덤)
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// ============================================
// 샌프란시스코 스타일 고가도로 - 더 확장 (끝이 안보이도록)
// ============================================
export const createHighwayCurve = () => {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(120, ELEVATED_HEIGHT, -450),    // 시작: 훨씬 멀리 (안보이게)
    new THREE.Vector3(100, ELEVATED_HEIGHT, -380),
    new THREE.Vector3(80, ELEVATED_HEIGHT, -300),
    new THREE.Vector3(50, ELEVATED_HEIGHT, -220),
    new THREE.Vector3(20, ELEVATED_HEIGHT, -160),
    new THREE.Vector3(-20, ELEVATED_HEIGHT, -100),    // 왼쪽으로
    new THREE.Vector3(-40, ELEVATED_HEIGHT, -40),     // 가장 왼쪽
    new THREE.Vector3(-25, ELEVATED_HEIGHT, 20),
    new THREE.Vector3(10, ELEVATED_HEIGHT, 80),       // 오른쪽으로
    new THREE.Vector3(50, ELEVATED_HEIGHT, 140),
    new THREE.Vector3(90, ELEVATED_HEIGHT, 220),
    new THREE.Vector3(130, ELEVATED_HEIGHT, 320),     // 끝: 카메라 뒤까지
  ], false, 'catmullrom', 0.5);
};

// Frenet Frame 기반으로 곡선을 따라가는 라인 지오메트리 생성
const createLineGeometry = (
  curve: THREE.CatmullRomCurve3,
  width: number,
  segments: number,
  offsetFromCenter: number = 0
): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    const binormal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const centerPoint = point.clone().add(binormal.clone().multiplyScalar(offsetFromCenter));
    const left = centerPoint.clone().add(binormal.clone().multiplyScalar(-width / 2));
    const right = centerPoint.clone().add(binormal.clone().multiplyScalar(width / 2));

    const lineY = point.y + 0.03;
    positions.push(left.x, lineY, left.z);
    positions.push(right.x, lineY, right.z);

    if (i > 0) {
      const base = (i - 1) * 2;
      indices.push(base, base + 2, base + 1);
      indices.push(base + 1, base + 2, base + 3);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  return geometry;
};

// 고가도로 지지대 - 더 많이 (확장된 도로에 맞춤)
const HighwayPillars: React.FC<{ curve: THREE.CatmullRomCurve3 }> = ({ curve }) => {
  const pillars = useMemo(() => {
    const result: JSX.Element[] = [];
    const pillarCount = 18; // 확장된 도로에 맞게 증가

    for (let i = 0; i < pillarCount; i++) {
      const t = (i + 0.5) / pillarCount;
      const point = curve.getPointAt(t);
      const pillarHeight = point.y;

      result.push(
        <mesh key={i} position={[point.x, pillarHeight / 2, point.z]}>
          <boxGeometry args={[3, pillarHeight, 3]} />
          <meshToonMaterial color="#a09080" gradientMap={toonGradient3} />
        </mesh>
      );
    }
    return result;
  }, [curve]);

  return <>{pillars}</>;
};

// 고가도로
const CurvedHighway: React.FC = () => {
  const curve = useMemo(() => createHighwayCurve(), []);
  const roadWidth = 32;
  const segments = 200;

  const roadGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      const binormal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const left = point.clone().add(binormal.clone().multiplyScalar(-roadWidth / 2));
      const right = point.clone().add(binormal.clone().multiplyScalar(roadWidth / 2));

      positions.push(left.x, point.y, left.z);
      positions.push(right.x, point.y, right.z);

      uvs.push(0, t);
      uvs.push(1, t);
    }

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

  const centerLineGeometry = useMemo(() => createLineGeometry(curve, 0.5, segments, 0), [curve, segments]);
  const leftEdgeGeometry = useMemo(() => createLineGeometry(curve, 0.4, segments, -roadWidth / 2 + 1), [curve, segments, roadWidth]);
  const rightEdgeGeometry = useMemo(() => createLineGeometry(curve, 0.4, segments, roadWidth / 2 - 1), [curve, segments, roadWidth]);

  return (
    <group>
      <HighwayPillars curve={curve} />

      <mesh geometry={roadGeometry} receiveShadow>
        <meshToonMaterial
          color="#d8cbb0"
          gradientMap={toonGradient5}
          side={THREE.DoubleSide}
          polygonOffset={true}
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      <mesh geometry={centerLineGeometry} renderOrder={2}>
        <meshBasicMaterial color="#d4a030" side={THREE.DoubleSide} />
      </mesh>

      <mesh geometry={leftEdgeGeometry} renderOrder={2}>
        <meshBasicMaterial color="#f0f0f0" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rightEdgeGeometry} renderOrder={2}>
        <meshBasicMaterial color="#f0f0f0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ============================================
// 샌프란시스코 스타일 건물 - 검정/어두운 지붕
// ============================================
// 건물 색상 - 자동차와 별도 (원래 탁한 톤 유지)
const BUILDING_COLORS = {
  coral: '#b84a3a',       // 테라코타
  yellow: '#c9a848',      // 머스타드
  blue: '#4a7a9a',        // 더스티 블루
  mint: '#5a9068',        // 세이지
  peach: '#c88a58',       // 피치
  turquoise: '#4a8a7a',   // 터콰이즈
  orange: '#b86830',      // 오렌지
  ivory: '#e8e0c8',       // 아이보리
  white: '#e8e4dc',       // 화이트
  cream: '#d8d0c0',       // 크림
};

interface BuildingProps {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  color: string;
  type?: 'residential' | 'commercial' | 'tower';
}

interface BuildingPropsExtended extends BuildingProps {
  timeOfDay?: number;
}

const SFBuilding: React.FC<BuildingPropsExtended> = ({ position, width, height, depth, color, type = 'residential', timeOfDay = 0 }) => {
  const windowColor = timeOfDay > 0.3 ? '#e8c855' : '#3a5570'; // 밤에 따뜻한 노란 불빛 (덜 밝게)
  const windowEmissive = timeOfDay > 0.3 ? timeOfDay * 0.5 : 0; // 발광 줄임
  const roofColor = '#2a2a2a';  // 검정 지붕
  const darkRoofColor = '#1a1a1a';

  const renderRoof = () => {
    if (type === 'tower') {
      return (
        <mesh position={[0, height + 2, 0]}>
          <coneGeometry args={[width * 0.5, 4, 4]} />
          <meshToonMaterial color={darkRoofColor} gradientMap={toonGradient3} />
        </mesh>
      );
    } else if (type === 'commercial') {
      return (
        <mesh position={[0, height + 0.5, 0]}>
          <boxGeometry args={[width + 0.5, 0.8, depth + 0.5]} />
          <meshToonMaterial color={roofColor} gradientMap={toonGradient3} />
        </mesh>
      );
    } else {
      return (
        <mesh position={[0, height + 1.5, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[width * 0.7, 3, 4]} />
          <meshToonMaterial color={roofColor} gradientMap={toonGradient3} />
        </mesh>
      );
    }
  };

  // 창문은 건물 앞면에만 (간소화하여 z-fighting 방지)
  const windowCount = Math.min(3, Math.max(1, Math.floor(width / 6)));
  const floorCount = Math.min(4, Math.max(1, Math.floor(height / 12)));

  return (
    <group position={position}>
      {/* 건물 본체 - 더 강한 polygonOffset */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshToonMaterial
          color={color}
          gradientMap={toonGradient5}
          polygonOffset={true}
          polygonOffsetFactor={4}
          polygonOffsetUnits={4}
        />
      </mesh>

      {/* 창문 - 밤에 발광 */}
      {Array.from({ length: floorCount }).map((_, row) =>
        Array.from({ length: windowCount }).map((_, col) => {
          const xPos = (col - (windowCount - 1) / 2) * 5;
          // 랜덤하게 일부 창문만 켜짐 (시드 기반)
          const windowSeed = row * 100 + col + Math.floor(width * 10);
          const isLit = seededRandom(windowSeed) > 0.3;
          const litColor = isLit ? windowColor : '#2a3a4a';
          const litEmissive = isLit && timeOfDay > 0.3 ? '#ffee99' : '#000000';
          const litIntensity = isLit ? windowEmissive : 0;

          return (
            <mesh
              key={`window-${row}-${col}`}
              position={[xPos, 5 + row * 10, depth / 2 + 0.5]}
            >
              <boxGeometry args={[2, 3, 0.15]} />
              <meshToonMaterial
                color={litColor}
                emissive={litEmissive}
                emissiveIntensity={litIntensity}
                gradientMap={toonGradient3}
              />
            </mesh>
          );
        })
      )}

      {renderRoof()}
    </group>
  );
};

// 대규모 도시 배경 - 도로 회피 로직 포함
const CityBackground: React.FC<{ timeOfDay?: number }> = ({ timeOfDay = 0 }) => {
  const colorArray = Object.values(BUILDING_COLORS);
  const types: Array<'residential' | 'commercial' | 'tower'> = ['residential', 'commercial', 'tower'];
  const curve = useMemo(() => createHighwayCurve(), []);

  const buildings = useMemo(() => {
    const positions: Array<{ x: number; z: number; w: number; h: number; d: number; type: string }> = [];
    let seed = 42; // 시드 기반 랜덤으로 결정적 결과

    // 왼쪽 도시 블록들 (대규모) - 도로에서 충분히 멀리
    for (let i = 0; i < 50; i++) {
      seed++;
      const x = -60 - seededRandom(seed) * 200;
      seed++;
      const z = -300 + seededRandom(seed) * 500;

      // 도로 근처면 스킵
      if (isNearRoad(x, z, curve, 35)) continue;

      seed++;
      const h = 15 + seededRandom(seed) * 50;
      seed++;
      const w = 8 + seededRandom(seed) * 12;
      positions.push({
        x, z, w, h, d: w,
        type: types[Math.floor(seededRandom(seed + 100) * 3)]
      });
    }

    // 오른쪽 도시 블록들 - 도로에서 충분히 멀리
    for (let i = 0; i < 45; i++) {
      seed++;
      const x = 70 + seededRandom(seed) * 200;
      seed++;
      const z = -300 + seededRandom(seed) * 500;

      // 도로 근처면 스킵
      if (isNearRoad(x, z, curve, 35)) continue;

      seed++;
      const h = 15 + seededRandom(seed) * 45;
      seed++;
      const w = 8 + seededRandom(seed) * 12;
      positions.push({
        x, z, w, h, d: w,
        type: types[Math.floor(seededRandom(seed + 200) * 3)]
      });
    }

    // 먼 배경 건물들 (바다 근처 스카이라인)
    for (let i = 0; i < 30; i++) {
      seed++;
      const x = -200 + seededRandom(seed) * 400;
      const z = -350 - seededRandom(seed + 1) * 100; // 바다 근처

      if (isNearRoad(x, z, curve, 35)) continue;

      seed++;
      const h = 25 + seededRandom(seed) * 80; // 높은 스카이라인
      seed++;
      const w = 10 + seededRandom(seed) * 15;
      positions.push({
        x, z, w, h, d: w,
        type: 'tower'
      });
    }

    return positions;
  }, [curve]);

  return (
    <group>
      {buildings.map((p, i) => (
        <SFBuilding
          key={i}
          position={[p.x, 0, p.z]}
          width={p.w}
          height={p.h}
          depth={p.d}
          color={colorArray[i % colorArray.length]}
          type={p.type as 'residential' | 'commercial' | 'tower'}
          timeOfDay={timeOfDay}
        />
      ))}
    </group>
  );
};

// ============================================
// 바다 (샌프란시스코 베이) - 질감 강화
// ============================================
const Ocean: React.FC = () => {
  // 파도 질감을 위한 여러 레이어
  return (
    <group>
      {/* 기본 바다 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -700]}>
        <planeGeometry args={[3000, 1500]} />
        <meshToonMaterial
          color="#3a7090"
          gradientMap={toonGradient5}
        />
      </mesh>
      {/* 중간 바다 - 약간 밝은 색 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, -500]}>
        <planeGeometry args={[2500, 600]} />
        <meshToonMaterial
          color="#4a8ab0"
          gradientMap={toonGradient3}
        />
      </mesh>
      {/* 해안선 근처 - 더 밝은 색 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, -380]}>
        <planeGeometry args={[2000, 200]} />
        <meshToonMaterial
          color="#5a9ac0"
          gradientMap={toonGradient3}
        />
      </mesh>
      {/* 파도 하이라이트 줄들 */}
      {[-450, -520, -600, -700, -800].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, z]}>
          <planeGeometry args={[2500, 3]} />
          <meshBasicMaterial color="#7ab8d8" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ============================================
// 지상 도로 (고가도로 아래)
// ============================================
const GroundRoad: React.FC = () => {
  const curve = useMemo(() => createHighwayCurve(), []);

  // 지상 도로는 고가도로 아래에 직선으로
  return (
    <group>
      {/* 메인 지상 도로 - 고가도로를 따라 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -50]}>
        <planeGeometry args={[40, 400]} />
        <meshToonMaterial
          color="#505050"
          gradientMap={toonGradient3}
        />
      </mesh>
      {/* 중앙선 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, -50]}>
        <planeGeometry args={[0.5, 400]} />
        <meshBasicMaterial color="#d4a030" />
      </mesh>
      {/* 가로 도로들 */}
      {[-150, -50, 50].map((z, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, z]}>
            <planeGeometry args={[200, 20]} />
            <meshToonMaterial color="#505050" gradientMap={toonGradient3} />
          </mesh>
          {/* 횡단보도 */}
          {[-8, -4, 0, 4, 8].map((offset, j) => (
            <mesh key={j} rotation={[-Math.PI / 2, 0, 0]} position={[25, 0.08, z + offset]}>
              <planeGeometry args={[4, 1.5]} />
              <meshBasicMaterial color="#f0f0f0" />
            </mesh>
          ))}
        </group>
      ))}
      {/* 인도 (보도) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, 0.1, -50]}>
        <planeGeometry args={[8, 400]} />
        <meshToonMaterial color="#c0b8a8" gradientMap={toonGradient3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, 0.1, -50]}>
        <planeGeometry args={[8, 400]} />
        <meshToonMaterial color="#c0b8a8" gradientMap={toonGradient3} />
      </mesh>
    </group>
  );
};

// ============================================
// 신호등 (emissive + Bloom으로 glow 처리)
// ============================================
const TrafficLight: React.FC<{ position: [number, number, number]; timeOfDay?: number }> = ({ position, timeOfDay = 0 }) => {
  const isNight = timeOfDay > 0.3;

  return (
    <group position={position}>
      {/* 기둥 */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 6, 8]} />
        <meshToonMaterial color="#2a2a2a" gradientMap={toonGradient3} />
      </mesh>
      {/* 가로 암 */}
      <mesh position={[2, 5.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
        <meshToonMaterial color="#2a2a2a" gradientMap={toonGradient3} />
      </mesh>
      {/* 신호등 박스 */}
      <mesh position={[3.5, 5.5, 0]}>
        <boxGeometry args={[0.8, 2.5, 0.8]} />
        <meshToonMaterial color="#1a1a1a" gradientMap={toonGradient3} />
      </mesh>
      {/* 빨간 불 - emissive로 Bloom 처리 */}
      <mesh position={[3.5, 6.2, 0.45]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial
          color="#ff3030"
          emissive="#ff2020"
          emissiveIntensity={isNight ? 2.5 : 0.3}
          toneMapped={false}
        />
      </mesh>
      {/* 노란 불 */}
      <mesh position={[3.5, 5.5, 0.45]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshToonMaterial color="#504010" gradientMap={toonGradient3} />
      </mesh>
      {/* 초록 불 */}
      <mesh position={[3.5, 4.8, 0.45]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshToonMaterial color="#104010" gradientMap={toonGradient3} />
      </mesh>
    </group>
  );
};

// ============================================
// 가로등 (emissive + Bloom으로 glow 처리)
// ============================================
const StreetLamp: React.FC<{ position: [number, number, number]; timeOfDay?: number }> = ({ position, timeOfDay = 0 }) => {
  const isNight = timeOfDay > 0.3;

  return (
    <group position={position}>
      {/* 기둥 */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 8, 6]} />
        <meshToonMaterial color="#3a3a3a" gradientMap={toonGradient3} />
      </mesh>
      {/* 램프 헤드 - emissive로 Bloom 처리 */}
      <mesh position={[0, 8.2, 0]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial
          color={isNight ? "#ffe8a0" : "#605040"}
          emissive={isNight ? "#ffdd80" : "#000000"}
          emissiveIntensity={isNight ? timeOfDay * 2.5 : 0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// ============================================
// 사람 (간단한 실루엣)
// ============================================
const Pedestrian: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  return (
    <group position={position}>
      {/* 머리 */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshToonMaterial color="#e8c8a8" gradientMap={toonGradient3} />
      </mesh>
      {/* 몸통 */}
      <mesh position={[0, 1.0, 0]}>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
        <meshToonMaterial color={color} gradientMap={toonGradient3} />
      </mesh>
      {/* 다리 */}
      <mesh position={[-0.1, 0.35, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshToonMaterial color="#3a3a50" gradientMap={toonGradient3} />
      </mesh>
      <mesh position={[0.1, 0.35, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshToonMaterial color="#3a3a50" gradientMap={toonGradient3} />
      </mesh>
    </group>
  );
};

// ============================================
// 거리 요소들 (신호등 + 가로등 + 사람들)
// ============================================
const StreetElements: React.FC<{ timeOfDay?: number }> = ({ timeOfDay = 0 }) => {
  const pedestrianColors = ['#c85050', '#5080c8', '#50a868', '#c8a050', '#8060a0', '#e8e8e8'];

  return (
    <group>
      {/* 신호등들 */}
      <TrafficLight position={[22, 0, -150]} timeOfDay={timeOfDay} />
      <TrafficLight position={[-22, 0, -150]} timeOfDay={timeOfDay} />
      <TrafficLight position={[22, 0, -50]} timeOfDay={timeOfDay} />
      <TrafficLight position={[-22, 0, -50]} timeOfDay={timeOfDay} />
      <TrafficLight position={[22, 0, 50]} timeOfDay={timeOfDay} />
      <TrafficLight position={[-22, 0, 50]} timeOfDay={timeOfDay} />

      {/* 가로등들 - 도로 양쪽 */}
      {[
        [-28, 0, -180], [-28, 0, -120], [-28, 0, -60], [-28, 0, 0], [-28, 0, 60], [-28, 0, 120],
        [28, 0, -150], [28, 0, -90], [28, 0, -30], [28, 0, 30], [28, 0, 90],
      ].map((pos, i) => (
        <StreetLamp key={`lamp-${i}`} position={pos as [number, number, number]} timeOfDay={timeOfDay} />
      ))}

      {/* 사람들 - 인도에 배치 (밤에는 안보이게) */}
      {timeOfDay < 0.5 && [
        [-26, 0.1, -140], [-24, 0.1, -120], [-27, 0.1, -80], [-25, 0.1, -30],
        [-26, 0.1, 10], [-24, 0.1, 60], [-27, 0.1, 100],
        [26, 0.1, -160], [24, 0.1, -100], [27, 0.1, -60], [25, 0.1, -20],
        [26, 0.1, 40], [24, 0.1, 80], [27, 0.1, 120],
        [28, 0.1, -148], [30, 0.1, -150], [32, 0.1, -152],
        [28, 0.1, -48], [30, 0.1, -52],
      ].map((pos, i) => (
        <Pedestrian
          key={i}
          position={pos as [number, number, number]}
          color={pedestrianColors[i % pedestrianColors.length]}
        />
      ))}
    </group>
  );
};

// ============================================
// 지상 건물들 (작은 상점들)
// ============================================
const GroundBuildings: React.FC<{ timeOfDay?: number }> = ({ timeOfDay = 0 }) => {
  const colorArray = Object.values(BUILDING_COLORS);

  const buildings = useMemo(() => {
    const positions: Array<{ x: number; z: number; w: number; h: number; d: number }> = [];

    // 도로 양쪽에 작은 상점 건물들
    for (let i = 0; i < 20; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -200 + (i * 20);
      positions.push({
        x: side * 35,
        z,
        w: 6 + seededRandom(i * 100) * 4,
        h: 8 + seededRandom(i * 101) * 8,
        d: 8 + seededRandom(i * 102) * 4,
      });
    }

    return positions;
  }, []);

  const windowColor = timeOfDay > 0.3 ? '#d8b845' : '#3a5570';
  const windowEmissive = timeOfDay > 0.3 ? timeOfDay * 0.6 : 0; // 발광 줄임

  return (
    <group>
      {buildings.map((p, i) => {
        const isLit = seededRandom(i * 500) > 0.3; // 더 많은 창문 켜짐
        return (
          <group key={`ground-building-${i}`} position={[p.x, 0, p.z]}>
            <mesh position={[0, p.h / 2, 0]}>
              <boxGeometry args={[p.w, p.h, p.d]} />
              <meshToonMaterial
                color={colorArray[i % colorArray.length]}
                gradientMap={toonGradient5}
                polygonOffset={true}
                polygonOffsetFactor={4}
                polygonOffsetUnits={4}
              />
            </mesh>
            {/* 간판/처마 */}
            <mesh position={[0, p.h * 0.7, p.d / 2 + 0.3]}>
              <boxGeometry args={[p.w + 0.5, 1.5, 0.5]} />
              <meshToonMaterial color="#2a2a2a" gradientMap={toonGradient3} />
            </mesh>
            {/* 상점 창문 (밤에 발광) */}
            <mesh position={[0, p.h * 0.4, p.d / 2 + 0.2]}>
              <boxGeometry args={[p.w * 0.7, p.h * 0.35, 0.1]} />
              <meshToonMaterial
                color={isLit ? windowColor : '#1a2a3a'}
                emissive={isLit && timeOfDay > 0.3 ? '#ffdd55' : '#000000'}
                emissiveIntensity={isLit ? windowEmissive : 0}
                gradientMap={toonGradient3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ============================================
// 현실적인 하늘 (drei Sky 사용) - 낮/밤 전환
// ============================================
const RealisticSky: React.FC<{ timeOfDay: number }> = ({ timeOfDay }) => {
  // 태양 위치 - 낮에는 위, 밤에는 지평선 아래
  const sunY = 0.3 - timeOfDay * 0.8; // 0.3 → -0.5
  const sunPosition: [number, number, number] = [-1, sunY, -0.5];

  // 밤에는 더 어두운 하늘
  const turbidity = 8 + timeOfDay * 2;
  const rayleigh = 0.5 - timeOfDay * 0.4;

  return (
    <Sky
      distance={450000}
      sunPosition={sunPosition}
      inclination={0.5 - timeOfDay * 0.3}
      azimuth={0.25}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
      rayleigh={Math.max(0.1, rayleigh)}
      turbidity={turbidity}
    />
  );
};

// ============================================
// 지면 - 녹색 잔디
// ============================================
const Terrain: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[800, 800]} />
      <meshToonMaterial
        color="#6a8a60"
        gradientMap={toonGradient3}
        polygonOffset={true}
        polygonOffsetFactor={4}
        polygonOffsetUnits={4}
      />
    </mesh>
  );
};

// ============================================
// 밤하늘 별들
// ============================================
const Stars: React.FC<{ opacity: number }> = ({ opacity }) => {
  const stars = useMemo(() => {
    const positions: Array<{ pos: [number, number, number]; size: number }> = [];
    // 200 → 50개로 축소 (성능 최적화)
    for (let i = 0; i < 50; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 400;
      positions.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) + 50,
          r * Math.sin(phi) * Math.sin(theta) - 200,
        ],
        size: 0.6 + Math.random() * 0.8, // 약간 더 크게 (적은 수 보완)
      });
    }
    return positions;
  }, []);

  if (opacity < 0.1) return null;

  return (
    <group>
      {stars.map((star, i) => (
        <mesh key={i} position={star.pos}>
          <sphereGeometry args={[star.size, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
        </mesh>
      ))}
      {/* 달 - emissive로 Bloom 처리 */}
      <mesh position={[100, 150, -300]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshStandardMaterial
          color="#fffde8"
          emissive="#fffde8"
          emissiveIntensity={opacity * 2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// ============================================
// 완성된 도시 시스템
// ============================================
interface RoadSystemProps {
  timeOfDay?: number;
}

const RoadSystem: React.FC<RoadSystemProps> = ({ timeOfDay = 0 }) => {
  return (
    <group>
      {/* 물리적으로 현실적인 하늘 (drei Sky) */}
      <RealisticSky timeOfDay={timeOfDay} />
      {/* 밤하늘 별들 */}
      <Stars opacity={timeOfDay} />
      {/* 바다 - 지평선까지 확장, 질감 강화 */}
      <Ocean />
      {/* 지면 */}
      <Terrain />
      {/* 지상 도로 (고가도로 아래) */}
      <GroundRoad />
      {/* 지상 건물들 (상점) - 밤에 창문 발광 */}
      <GroundBuildings timeOfDay={timeOfDay} />
      {/* 거리 요소들 (신호등 + 가로등 + 사람들) */}
      <StreetElements timeOfDay={timeOfDay} />
      {/* 고가도로 */}
      <CurvedHighway />
      {/* 도시 건물들 - 도로 회피, 밤에 창문 발광 */}
      <CityBackground timeOfDay={timeOfDay} />
    </group>
  );
};

export default RoadSystem;
export { CurvedHighway, CityBackground };
