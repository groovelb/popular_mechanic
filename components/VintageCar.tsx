import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from '../types';

interface CarProps {
  curve: THREE.CatmullRomCurve3;
  laneOffset: number;     // -1 to 1 (left to right across road)
  startT: number;         // 0 to 1 position along curve (0=멀리, 1=카메라 근처)
  speed?: number;
  color?: string;
  carType?: 'sedan' | 'convertible' | 'coupe';
  scale?: number;
}

// 1959 style car - long hood, big tail fins, chrome details
const VintageCar: React.FC<CarProps> = ({
  curve,
  laneOffset = 0,
  startT = 0,
  speed = 1,
  color = PALETTE.coralRed,
  carType = 'sedan',
  scale = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(startT);

  const roadWidth = 36;

  // Materials
  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.3,
      metalness: 0.4,
    }),
    [color]
  );

  const chromeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: PALETTE.chrome,
      roughness: 0.1,
      metalness: 0.9,
    }),
    []
  );

  const glassMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#a8c8d8',
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7,
    }),
    []
  );

  const tireMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: PALETTE.black,
      roughness: 0.8,
    }),
    []
  );

  const whitewallMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: PALETTE.whitewall,
      roughness: 0.5,
    }),
    []
  );

  // Animation - 차가 카메라 쪽으로 다가옴 (t 증가)
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // t가 증가하면 카메라에 가까워짐 (우상→우하)
    progress.current += speed * delta * 0.015;
    if (progress.current > 1) {
      progress.current = 0; // 다시 멀리서 시작
    }

    const t = progress.current;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // Calculate perpendicular for lane offset
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const offset = laneOffset * (roadWidth / 2) * 0.8;

    const position = point.clone().add(normal.clone().multiplyScalar(offset));
    position.y = 0.6;

    groupRef.current.position.copy(position);
    groupRef.current.scale.setScalar(scale);

    // 차가 진행 방향을 바라봄
    // lookAt은 -Z를 타겟으로 향하게 하므로, 차의 앞면(+Z)이 진행방향을 향하려면
    // tangent 반대 방향을 lookAt해야 함
    const lookTarget = point.clone().sub(tangent.clone().multiplyScalar(10));
    lookTarget.y = 0.6;
    groupRef.current.lookAt(lookTarget);
  });

  const isConvertible = carType === 'convertible';

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* === MAIN BODY === */}

      {/* Lower body - long and low */}
      <mesh material={bodyMaterial} position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2.2, 0.6, 5.5]} />
      </mesh>

      {/* Hood (front) - long 50s style - 앞쪽(+Z) */}
      <mesh material={bodyMaterial} position={[0, 0.5, 1.8]} castShadow>
        <boxGeometry args={[2.0, 0.3, 2.2]} />
      </mesh>

      {/* Hood slope */}
      <mesh material={bodyMaterial} position={[0, 0.7, 1.2]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.9, 0.2, 1.0]} />
      </mesh>

      {/* Trunk (rear) - 뒤쪽(-Z) */}
      <mesh material={bodyMaterial} position={[0, 0.5, -1.8]} castShadow>
        <boxGeometry args={[2.0, 0.4, 1.5]} />
      </mesh>

      {/* === CABIN === */}
      {!isConvertible ? (
        <>
          {/* Cabin base */}
          <mesh material={bodyMaterial} position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[1.9, 0.5, 2.2]} />
          </mesh>

          {/* Roof */}
          <mesh material={bodyMaterial} position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[1.7, 0.2, 1.8]} />
          </mesh>

          {/* Windows - front (앞 유리) */}
          <mesh material={glassMaterial} position={[0, 1.0, 0.95]} rotation={[0.3, 0, 0]}>
            <planeGeometry args={[1.5, 0.5]} />
          </mesh>

          {/* Windows - rear (뒷 유리) */}
          <mesh material={glassMaterial} position={[0, 1.0, -0.95]} rotation={[-0.3, Math.PI, 0]}>
            <planeGeometry args={[1.4, 0.45]} />
          </mesh>

          {/* Side windows */}
          <mesh material={glassMaterial} position={[0.95, 1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.8, 0.45]} />
          </mesh>
          <mesh material={glassMaterial} position={[-0.95, 1.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.8, 0.45]} />
          </mesh>
        </>
      ) : (
        <>
          {/* Convertible - open top with windshield */}
          <mesh material={bodyMaterial} position={[0, 0.8, 0.2]} castShadow>
            <boxGeometry args={[1.9, 0.3, 1.8]} />
          </mesh>

          {/* Windshield frame (앞 유리) */}
          <mesh material={glassMaterial} position={[0, 1.1, 0.9]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[1.8, 0.5, 0.08]} />
          </mesh>

          {/* Interior seats */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[1.5, 0.25, 1.4]} />
            <meshStandardMaterial color="#f0e8d8" />
          </mesh>
        </>
      )}

      {/* === ICONIC 1959 TAIL FINS (뒤쪽, -Z) === */}

      {/* Right tail fin */}
      <group position={[0.85, 0.9, -2.3]}>
        <mesh material={bodyMaterial} castShadow>
          <boxGeometry args={[0.15, 0.6, 0.8]} />
        </mesh>
        <mesh material={bodyMaterial} position={[0, 0.35, -0.2]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.3, 0.5]} />
        </mesh>
        {/* Tail light */}
        <mesh position={[0.05, 0, -0.35]}>
          <boxGeometry args={[0.1, 0.3, 0.15]} />
          <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Left tail fin */}
      <group position={[-0.85, 0.9, -2.3]}>
        <mesh material={bodyMaterial} castShadow>
          <boxGeometry args={[0.15, 0.6, 0.8]} />
        </mesh>
        <mesh material={bodyMaterial} position={[0, 0.35, -0.2]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.3, 0.5]} />
        </mesh>
        <mesh position={[-0.05, 0, -0.35]}>
          <boxGeometry args={[0.1, 0.3, 0.15]} />
          <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* === CHROME DETAILS === */}

      {/* Front bumper (앞 범퍼, +Z) */}
      <mesh material={chromeMaterial} position={[0, 0.25, 2.85]} castShadow>
        <boxGeometry args={[2.3, 0.25, 0.15]} />
      </mesh>

      {/* Front grille */}
      <mesh material={chromeMaterial} position={[0, 0.4, 2.8]}>
        <boxGeometry args={[1.6, 0.35, 0.1]} />
      </mesh>

      {/* Headlights (앞쪽) */}
      <mesh position={[0.7, 0.45, 2.78]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#ffffee" emissive="#ffffaa" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.7, 0.45, 2.78]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#ffffee" emissive="#ffffaa" emissiveIntensity={0.5} />
      </mesh>

      {/* Rear bumper (뒷 범퍼, -Z) */}
      <mesh material={chromeMaterial} position={[0, 0.25, -2.7]} castShadow>
        <boxGeometry args={[2.2, 0.2, 0.12]} />
      </mesh>

      {/* Side chrome strip */}
      <mesh material={chromeMaterial} position={[1.12, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.08, 4.5]} />
      </mesh>
      <mesh material={chromeMaterial} position={[-1.12, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.08, 4.5]} />
      </mesh>

      {/* === WHEELS with WHITEWALLS === */}

      {/* Front Right */}
      <group position={[1.0, 0.35, 1.5]}>
        <mesh material={tireMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.25, 24]} />
        </mesh>
        <mesh material={whitewallMaterial} rotation={[0, 0, Math.PI / 2]} position={[0.13, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 8, 24]} />
        </mesh>
        <mesh material={chromeMaterial} rotation={[0, 0, Math.PI / 2]} position={[0.14, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        </mesh>
      </group>

      {/* Front Left */}
      <group position={[-1.0, 0.35, 1.5]}>
        <mesh material={tireMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.25, 24]} />
        </mesh>
        <mesh material={whitewallMaterial} rotation={[0, 0, Math.PI / 2]} position={[-0.13, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 8, 24]} />
        </mesh>
        <mesh material={chromeMaterial} rotation={[0, 0, Math.PI / 2]} position={[-0.14, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        </mesh>
      </group>

      {/* Rear Right */}
      <group position={[1.0, 0.35, -1.6]}>
        <mesh material={tireMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.25, 24]} />
        </mesh>
        <mesh material={whitewallMaterial} rotation={[0, 0, Math.PI / 2]} position={[0.13, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 8, 24]} />
        </mesh>
        <mesh material={chromeMaterial} rotation={[0, 0, Math.PI / 2]} position={[0.14, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        </mesh>
      </group>

      {/* Rear Left */}
      <group position={[-1.0, 0.35, -1.6]}>
        <mesh material={tireMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.25, 24]} />
        </mesh>
        <mesh material={whitewallMaterial} rotation={[0, 0, Math.PI / 2]} position={[-0.13, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 8, 24]} />
        </mesh>
        <mesh material={chromeMaterial} rotation={[0, 0, Math.PI / 2]} position={[-0.14, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        </mesh>
      </group>

      {/* === SHADOW === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[2.5, 6]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

export default VintageCar;
