import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PALETTE } from '../types';

// Create the main curved highway path
// Curves from bottom-right to top-left (matching reference)
export const createHighwayCurve = () => {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(25, 0, 60),      // Start: right side, close to camera
    new THREE.Vector3(15, 0, 40),      // Curve begins
    new THREE.Vector3(5, 0, 20),       // Middle section
    new THREE.Vector3(-5, 0, 0),       // Center
    new THREE.Vector3(-15, 0, -25),    // Curving left
    new THREE.Vector3(-25, 0, -50),    // Far left
    new THREE.Vector3(-35, 0, -80),    // Vanishing point direction
  ], false, 'catmullrom', 0.5);
};

// Curved Highway using the curve path
const CurvedHighway: React.FC = () => {
  const curve = useMemo(() => createHighwayCurve(), []);
  const roadWidth = 40;
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

      // Road gets narrower with perspective (simulating depth)
      const perspectiveScale = 1 - t * 0.6; // Wider at front, narrower at back
      const width = roadWidth * perspectiveScale;

      const left = point.clone().add(normal.clone().multiplyScalar(-width / 2));
      const right = point.clone().add(normal.clone().multiplyScalar(width / 2));

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

  // Lane markings following the curve
  const laneMarkings = useMemo(() => {
    const markings: JSX.Element[] = [];
    const lanes = 6;

    // Create dashed lines for each lane
    for (let lane = 1; lane < lanes; lane++) {
      const laneOffset = (lane / lanes - 0.5) * roadWidth;

      for (let i = 0; i < segments; i += 4) {
        const t = i / segments;
        const t2 = Math.min((i + 2) / segments, 1);

        const point1 = curve.getPointAt(t);
        const point2 = curve.getPointAt(t2);
        const tangent = curve.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const perspectiveScale = 1 - t * 0.6;
        const offset = laneOffset * perspectiveScale;

        const pos1 = point1.clone().add(normal.clone().multiplyScalar(offset));
        const pos2 = point2.clone().add(normal.clone().multiplyScalar(offset));

        const midPoint = pos1.clone().add(pos2).multiplyScalar(0.5);
        const length = pos1.distanceTo(pos2);
        const angle = Math.atan2(pos2.x - pos1.x, pos2.z - pos1.z);

        const isCenterLine = lane === 3;
        const lineWidth = (isCenterLine ? 0.4 : 0.2) * perspectiveScale;

        markings.push(
          <mesh
            key={`lane-${lane}-${i}`}
            position={[midPoint.x, 0.02, midPoint.z]}
            rotation={[-Math.PI / 2, 0, -angle]}
          >
            <planeGeometry args={[lineWidth, length * 0.6]} />
            <meshBasicMaterial
              color={isCenterLine ? '#f0e8d0' : '#d0c8b8'}
              transparent
              opacity={0.9 - t * 0.5}
            />
          </mesh>
        );
      }
    }

    return markings;
  }, [curve, segments, roadWidth]);

  // Road edge lines
  const edgeLines = useMemo(() => {
    const edges: JSX.Element[] = [];

    [-1, 1].forEach((side, sideIdx) => {
      for (let i = 0; i < segments; i += 2) {
        const t = i / segments;
        const t2 = Math.min((i + 2) / segments, 1);

        const point1 = curve.getPointAt(t);
        const point2 = curve.getPointAt(t2);
        const tangent = curve.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const perspectiveScale = 1 - t * 0.6;
        const offset = (roadWidth / 2 - 0.5) * perspectiveScale * side;

        const pos1 = point1.clone().add(normal.clone().multiplyScalar(offset));
        const pos2 = point2.clone().add(normal.clone().multiplyScalar(offset));

        const midPoint = pos1.clone().add(pos2).multiplyScalar(0.5);
        const length = pos1.distanceTo(pos2);
        const angle = Math.atan2(pos2.x - pos1.x, pos2.z - pos1.z);

        edges.push(
          <mesh
            key={`edge-${sideIdx}-${i}`}
            position={[midPoint.x, 0.02, midPoint.z]}
            rotation={[-Math.PI / 2, 0, -angle]}
          >
            <planeGeometry args={[0.3 * perspectiveScale, length]} />
            <meshBasicMaterial color="#f0e8d0" transparent opacity={0.8 - t * 0.4} />
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

      {/* Lane markings */}
      {laneMarkings}

      {/* Edge lines */}
      {edgeLines}
    </group>
  );
};

// Elevated overpass - adjusted angle to match reference
const Overpass: React.FC = () => {
  return (
    <group position={[-10, 10, -40]}>
      {/* Main deck - angled from left to right */}
      <mesh rotation={[0, Math.PI * 0.25, 0]}>
        <boxGeometry args={[70, 0.8, 12]} />
        <meshStandardMaterial color="#a89a8a" roughness={0.8} />
      </mesh>

      {/* Support pillars */}
      {[-25, 0, 25].map((x, i) => (
        <group key={i} position={[x * Math.cos(Math.PI * 0.25), -5, x * Math.sin(Math.PI * 0.25)]}>
          <mesh>
            <boxGeometry args={[2.5, 10, 2.5]} />
            <meshStandardMaterial color="#8a7b6a" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Guard rails */}
      <mesh position={[0, 0.8, -5.5]} rotation={[0, Math.PI * 0.25, 0]}>
        <boxGeometry args={[72, 0.6, 0.3]} />
        <meshStandardMaterial color="#7a6b5a" />
      </mesh>
      <mesh position={[0, 0.8, 5.5]} rotation={[0, Math.PI * 0.25, 0]}>
        <boxGeometry args={[72, 0.6, 0.3]} />
        <meshStandardMaterial color="#7a6b5a" />
      </mesh>
    </group>
  );
};

// Second overpass - higher, different angle
const Overpass2: React.FC = () => {
  return (
    <group position={[5, 14, -50]} rotation={[0, -Math.PI * 0.15, 0]}>
      {/* Main deck */}
      <mesh>
        <boxGeometry args={[55, 0.8, 10]} />
        <meshStandardMaterial color="#b8a898" roughness={0.8} />
      </mesh>

      {/* Support pillars */}
      {[-20, 0, 20].map((x, i) => (
        <mesh key={i} position={[x, -7, 0]}>
          <boxGeometry args={[2, 14, 2]} />
          <meshStandardMaterial color="#9a8b7a" roughness={0.9} />
        </mesh>
      ))}

      {/* Guard rails */}
      <mesh position={[0, 0.7, -4.5]}>
        <boxGeometry args={[57, 0.5, 0.25]} />
        <meshStandardMaterial color="#8a7b6a" />
      </mesh>
    </group>
  );
};

// Background city silhouette
const CityBackground: React.FC = () => {
  const buildings = useMemo(() => {
    const builds: JSX.Element[] = [];
    // Buildings positioned towards the left (where vanishing point is)
    const positions = [
      { x: -50, z: -70, w: 18, h: 45, d: 18 },
      { x: -35, z: -80, w: 14, h: 60, d: 14 },
      { x: -20, z: -75, w: 20, h: 40, d: 20 },
      { x: -60, z: -90, w: 16, h: 70, d: 16 },
      { x: -5, z: -85, w: 12, h: 35, d: 12 },
      { x: 15, z: -80, w: 15, h: 50, d: 15 },
      { x: -75, z: -85, w: 22, h: 55, d: 18 },
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
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#9a9080" roughness={1} />
      </mesh>

      {/* Road shoulders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#8a8070" roughness={1} transparent opacity={0.5} />
      </mesh>
    </>
  );
};

// Complete road system
const RoadSystem: React.FC = () => {
  return (
    <group>
      <Terrain />
      <CurvedHighway />
      <Overpass />
      <Overpass2 />
      <CityBackground />
    </group>
  );
};

export default RoadSystem;
export { CurvedHighway, Overpass, CityBackground };
