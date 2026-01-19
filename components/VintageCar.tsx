import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE } from '../types';

interface CarProps {
  curve: THREE.CatmullRomCurve3;
  laneOffset: number;
  startT: number;
  speed?: number;
  color?: string;
  carType?: 'cadillac' | 'impala' | 'fury' | 'fairlane';
  scale?: number;
  useGLTFModel?: boolean;
  timeOfDay?: number; // 0 = 낮, 1 = 밤
}

// Plymouth Fury 1958 모델 (모든 차종에 사용, 색상으로 구분)
// Credit: imagineburner (Sketchfab) - CC-BY 4.0
const FURY_MODEL_PATH = '/models/plymouth-fury.glb';

const WHEEL_RADIUS = 0.4;

// ============================================
// 50년대 일러스트 스타일 셰이더 (Three.js 라이팅 통합)
// ============================================

// 버텍스 셰이더 - Three.js 라이팅과 호환
const illustrationVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 프래그먼트 셰이더 - 반사/굴절 표현이 강화된 툰 셰이딩
const illustrationFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uShadowColor;
  uniform vec3 uHighlightColor;
  uniform float uShadowSmooth;
  uniform float uHighlightSmooth;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // 다중 라이트
    vec3 lightDir1 = normalize(vec3(0.5, 0.8, 0.3));
    vec3 lightDir2 = normalize(vec3(-0.3, 0.5, -0.5));

    // 디퓨즈 라이팅 (3단계 툰 셰이딩)
    float NdotL = dot(normal, lightDir1);
    float toonShade = smoothstep(-0.1, 0.1, NdotL) * 0.5 +
                      smoothstep(0.3, 0.5, NdotL) * 0.3 +
                      smoothstep(0.7, 0.9, NdotL) * 0.2;

    // 스페큘러 반사 (광택 표현)
    vec3 halfDir = normalize(lightDir1 + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    float toonSpec = smoothstep(0.4, 0.6, spec);

    // 프레넬 반사 (가장자리 광택)
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
    float toonFresnel = smoothstep(0.3, 0.7, fresnel);

    // 색상 믹싱 - 명도 낮춤
    vec3 shadowTint = uColor * uShadowColor * 0.6;
    vec3 midTone = uColor * 0.85;
    vec3 highlightTint = mix(uColor, uHighlightColor, 0.25);

    // 3단계 툰 셰이딩
    vec3 finalColor = shadowTint;
    finalColor = mix(finalColor, midTone, smoothstep(0.2, 0.25, toonShade));
    finalColor = mix(finalColor, highlightTint, smoothstep(0.6, 0.65, toonShade));

    // 스페큘러 하이라이트 (반사)
    finalColor = mix(finalColor, uHighlightColor, toonSpec * 0.5);

    // 림 라이팅 (윤곽 광택) - 약하게
    finalColor += toonFresnel * uHighlightColor * 0.12;

    // 상단면 반사 - 약하게
    float topReflect = smoothstep(0.7, 0.9, normal.y);
    finalColor = mix(finalColor, highlightTint, topReflect * 0.15);

    // 환경광 - 어둡게
    vec3 ambient = uColor * vec3(0.3, 0.28, 0.25);
    finalColor = max(finalColor, ambient);

    // 채도 유지 (자연스럽게)
    float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
    finalColor = mix(vec3(gray), finalColor, 1.2);

    // 전체 명도 살짝 낮춤
    finalColor *= 0.92;

    // 클리핑 방지
    finalColor = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// 50년대 일러스트 머티리얼 생성
function createIllustrationMaterial(color: string, options?: {
  shadowColor?: THREE.Color;
  highlightColor?: THREE.Color;
  shadowSmooth?: number;
  highlightSmooth?: number;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uShadowColor: { value: options?.shadowColor || new THREE.Color('#b08060') },
      uHighlightColor: { value: options?.highlightColor || new THREE.Color('#fff8e8') },
      uShadowSmooth: { value: options?.shadowSmooth ?? 0.3 },
      uHighlightSmooth: { value: options?.highlightSmooth ?? 0.85 },
    },
    vertexShader: illustrationVertexShader,
    fragmentShader: illustrationFragmentShader,
  });
}

// 크롬/메탈 머티리얼 - 반사 느낌
function createChromeMaterial(): THREE.ShaderMaterial {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewDir);
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.3));

      // 스페큘러 하이라이트
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 60.0);

      // 프레넬 반사
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.0);

      // 기본 크롬 색상
      vec3 baseColor = vec3(0.85, 0.83, 0.80);
      vec3 finalColor = baseColor + spec * 0.5 + fresnel * 0.2;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
  });
}

// 그라디언트 텍스처 (타이어용)
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

// ============================================
// 50년대 일러스트 스타일 차량 모델
// ============================================
interface RealisticCarModelProps {
  color: string;
  carType: string;
}

function RealisticCarModel({ color, carType }: RealisticCarModelProps) {
  const { scene } = useGLTF(FURY_MODEL_PATH);

  // 모델 복제 및 머티리얼 적용
  const processedScene = useMemo(() => {
    const cloned = scene.clone();

    // 전시판/받침대 제거할 메쉬 목록
    const meshesToRemove: THREE.Object3D[] = [];

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // 전시판/받침대/바닥판 제거
        if (name.includes('plate') || name.includes('stand') ||
            name.includes('base') || name.includes('floor') ||
            name.includes('ground') || name.includes('platform') ||
            name.includes('pedestal') || name.includes('display')) {
          meshesToRemove.push(mesh);
          return;
        }

        if (mesh.material) {
          // 크롬/메탈 파츠 (범퍼, 그릴, 트림) - 밝은 톤 쉐이딩
          if (name.includes('chrome') || name.includes('bumper') ||
              name.includes('grill') || name.includes('trim') ||
              name.includes('metal') || name.includes('handle')) {
            mesh.material = new THREE.MeshToonMaterial({
              color: 0xe8e4dc,
              gradientMap: toonGradient5,
            });
          }
          // 유리/창문 - 반투명 톤
          else if (name.includes('glass') || name.includes('window') ||
                   name.includes('windshield')) {
            mesh.material = new THREE.MeshToonMaterial({
              color: 0x99ccdd,
              gradientMap: toonGradient3,
              transparent: true,
              opacity: 0.5,
            });
          }
          // 타이어 - 어두운 톤
          else if (name.includes('tire') || name.includes('tyre')) {
            mesh.material = new THREE.MeshToonMaterial({
              color: 0x2a2a2a,
              gradientMap: toonGradient3,
            });
          }
          // 휠/휠캡 - 크롬 톤
          else if (name.includes('wheel') || name.includes('hub') ||
                   name.includes('rim')) {
            mesh.material = new THREE.MeshToonMaterial({
              color: 0xd8d4cc,
              gradientMap: toonGradient5,
            });
          }
          // 헤드라이트
          else if (name.includes('headlight') || name.includes('light_front')) {
            mesh.material = new THREE.MeshToonMaterial({
              color: 0xffffee,
              emissive: 0xffffcc,
              emissiveIntensity: 0.5,
              gradientMap: toonGradient3,
            });
          }
          // 테일라이트
          else if (name.includes('taillight') || name.includes('light_rear') ||
                   name.includes('brake')) {
            mesh.material = new THREE.MeshToonMaterial({
              color: 0xff4444,
              emissive: 0xff2222,
              emissiveIntensity: 0.5,
              gradientMap: toonGradient3,
            });
          }
          // 차체 (바디) - 사용자 지정 색상 + 톤 쉐이딩
          else {
            mesh.material = new THREE.MeshToonMaterial({
              color: new THREE.Color(color),
              gradientMap: toonGradient5,
            });
          }

          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });

    // 전시판 메쉬 제거
    meshesToRemove.forEach((mesh) => {
      mesh.removeFromParent();
    });

    return cloned;
  }, [scene, color]);

  // 차종별 스케일 조정 (동일 모델, 다른 크기)
  const scaleMultiplier = useMemo(() => {
    switch (carType) {
      case 'cadillac': return 1.15; // 가장 큼
      case 'impala': return 1.05;
      case 'fury': return 1.0;
      case 'fairlane': return 0.95;
      default: return 1.0;
    }
  }, [carType]);

  return (
    <primitive
      object={processedScene}
      scale={[1.8 * scaleMultiplier, 1.8 * scaleMultiplier, 1.8 * scaleMultiplier]}
      rotation={[0, 0, 0]}
      position={[0, -0.15, 0]}
    />
  );
}

// 모델 프리로드
useGLTF.preload(FURY_MODEL_PATH);

// ============================================
// 프로시저럴 (박스 기반) 차량 모델 - 폴백용
// ============================================
interface ProceduralCarModelProps {
  color: string;
  carType: 'cadillac' | 'impala' | 'fury' | 'fairlane';
  wheelFRRef: React.RefObject<THREE.Group | null>;
  wheelFLRef: React.RefObject<THREE.Group | null>;
  wheelRRRef: React.RefObject<THREE.Group | null>;
  wheelRLRef: React.RefObject<THREE.Group | null>;
}

const ProceduralCarModel: React.FC<ProceduralCarModelProps> = ({
  color,
  carType,
  wheelFRRef,
  wheelFLRef,
  wheelRRRef,
  wheelRLRef,
}) => {
  // 50년대 일러스트 스타일 머티리얼
  const bodyMaterial = useMemo(
    () => createIllustrationMaterial(color, {
      shadowColor: new THREE.Color('#a07050'),
      highlightColor: new THREE.Color('#fff8e8'),
      shadowSmooth: 0.25,
      highlightSmooth: 0.8,
    }),
    [color]
  );

  const chromeMaterial = useMemo(
    () => createChromeMaterial(),
    []
  );

  const glassMaterial = useMemo(
    () => createIllustrationMaterial('#7090a8', {
      shadowColor: new THREE.Color('#506070'),
      highlightColor: new THREE.Color('#c0d8e8'),
      shadowSmooth: 0.2,
      highlightSmooth: 0.9,
    }),
    []
  );

  const tireMaterial = useMemo(
    () => createIllustrationMaterial('#2a2a2a', {
      shadowColor: new THREE.Color('#1a1a1a'),
      highlightColor: new THREE.Color('#3a3a3a'),
      shadowSmooth: 0.3,
      highlightSmooth: 0.9,
    }),
    []
  );

  const tailLightMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#cc3333' }),
    []
  );

  const headLightMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffdd' }),
    []
  );

  // 차종별 파라미터
  const carParams = useMemo(() => {
    switch (carType) {
      case 'cadillac':
        return {
          bodyLength: 6.0, bodyWidth: 2.2, hoodLength: 2.5, trunkLength: 1.8,
          finHeight: 0.8, finStyle: 'sharp', wheelBase: 3.4,
        };
      case 'impala':
        return {
          bodyLength: 5.6, bodyWidth: 2.15, hoodLength: 2.2, trunkLength: 1.5,
          finHeight: 0.4, finStyle: 'batwing', wheelBase: 3.2,
        };
      case 'fury':
        return {
          bodyLength: 5.5, bodyWidth: 2.0, hoodLength: 2.0, trunkLength: 1.6,
          finHeight: 0.7, finStyle: 'tower', wheelBase: 3.1,
        };
      case 'fairlane':
      default:
        return {
          bodyLength: 5.4, bodyWidth: 2.1, hoodLength: 2.0, trunkLength: 1.4,
          finHeight: 0.35, finStyle: 'subtle', wheelBase: 3.0,
        };
    }
  }, [carType]);

  const p = carParams;
  const isConvertible = carType === 'cadillac';

  // 테일핀 렌더링
  const renderTailFins = () => {
    const finZ = -p.bodyLength / 2 + 0.3;

    switch (p.finStyle) {
      case 'sharp':
        return (
          <>
            {[-1, 1].map(side => (
              <group key={`fin-${side}`} position={[side * (p.bodyWidth / 2 - 0.1), 0.5, finZ]}>
                <mesh material={bodyMaterial} castShadow>
                  <boxGeometry args={[0.08, p.finHeight, 1.0]} />
                </mesh>
                <mesh material={bodyMaterial} position={[0, p.finHeight / 2 + 0.15, -0.3]} rotation={[0.4, 0, 0]} castShadow>
                  <boxGeometry args={[0.06, 0.35, 0.5]} />
                </mesh>
                <mesh material={tailLightMaterial} position={[side * 0.02, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.12, 0.08, 0.2, 12]} />
                </mesh>
                <mesh material={tailLightMaterial} position={[side * 0.02, -0.25, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.1, 0.06, 0.18, 12]} />
                </mesh>
              </group>
            ))}
          </>
        );
      case 'batwing':
        return (
          <>
            {[-1, 1].map(side => (
              <group key={`fin-${side}`} position={[side * (p.bodyWidth / 2 - 0.15), 0.35, finZ]}>
                <mesh material={bodyMaterial} rotation={[0, 0, side * 0.3]} castShadow>
                  <boxGeometry args={[0.5, 0.15, 0.9]} />
                </mesh>
                <mesh material={tailLightMaterial} position={[side * 0.15, -0.05, -0.5]}>
                  <sphereGeometry args={[0.12, 12, 8]} />
                </mesh>
              </group>
            ))}
          </>
        );
      case 'tower':
        return (
          <>
            {[-1, 1].map(side => (
              <group key={`fin-${side}`} position={[side * (p.bodyWidth / 2 - 0.12), 0.45, finZ]}>
                <mesh material={bodyMaterial} castShadow>
                  <boxGeometry args={[0.1, p.finHeight, 0.85]} />
                </mesh>
                <mesh material={bodyMaterial} position={[0, p.finHeight / 2, -0.2]} castShadow>
                  <boxGeometry args={[0.08, 0.2, 0.4]} />
                </mesh>
                <mesh material={tailLightMaterial} position={[side * 0.03, 0, -0.5]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.25, 12]} />
                </mesh>
              </group>
            ))}
          </>
        );
      case 'subtle':
      default:
        return (
          <>
            {[-1, 1].map(side => (
              <group key={`fin-${side}`} position={[side * (p.bodyWidth / 2 - 0.15), 0.4, finZ]}>
                <mesh material={bodyMaterial} rotation={[0.15, 0, side * 0.1]} castShadow>
                  <boxGeometry args={[0.12, p.finHeight, 0.75]} />
                </mesh>
                <mesh material={tailLightMaterial} position={[side * 0.04, -0.1, -0.45]}>
                  <sphereGeometry args={[0.1, 12, 8]} />
                </mesh>
              </group>
            ))}
          </>
        );
    }
  };

  return (
    <>
      {/* === MAIN BODY === */}
      <mesh material={bodyMaterial} position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[p.bodyWidth, 0.5, p.bodyLength]} />
      </mesh>
      <mesh material={bodyMaterial} position={[0, 0.45, p.bodyLength / 2 - p.hoodLength / 2]} castShadow>
        <boxGeometry args={[p.bodyWidth - 0.1, 0.25, p.hoodLength]} />
      </mesh>
      <mesh material={bodyMaterial} position={[0, 0.6, p.bodyLength / 2 - p.hoodLength + 0.3]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[p.bodyWidth - 0.2, 0.15, 0.8]} />
      </mesh>
      <mesh material={bodyMaterial} position={[0, 0.4, -p.bodyLength / 2 + p.trunkLength / 2]} castShadow>
        <boxGeometry args={[p.bodyWidth - 0.15, 0.35, p.trunkLength]} />
      </mesh>

      {/* === CABIN === */}
      {!isConvertible ? (
        <>
          <mesh material={bodyMaterial} position={[0, 0.75, 0.2]} castShadow>
            <boxGeometry args={[p.bodyWidth - 0.3, 0.45, 2.0]} />
          </mesh>
          <mesh material={bodyMaterial} position={[0, 1.1, 0.15]} castShadow>
            <boxGeometry args={[p.bodyWidth - 0.5, 0.18, 1.6]} />
          </mesh>
          <mesh material={glassMaterial} position={[0, 0.95, 1.1]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[p.bodyWidth - 0.5, 0.5, 0.05]} />
          </mesh>
          <mesh material={glassMaterial} position={[0, 0.95, -0.7]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[p.bodyWidth - 0.6, 0.4, 0.05]} />
          </mesh>
          {[-1, 1].map(side => (
            <mesh key={`side-glass-${side}`} material={glassMaterial} position={[side * (p.bodyWidth / 2 - 0.12), 0.95, 0.2]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[1.5, 0.4, 0.05]} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh material={bodyMaterial} position={[0, 0.65, 0.3]} castShadow>
            <boxGeometry args={[p.bodyWidth - 0.3, 0.25, 1.8]} />
          </mesh>
          <mesh material={chromeMaterial} position={[0, 0.95, 1.15]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[p.bodyWidth - 0.4, 0.55, 0.06]} />
          </mesh>
          <mesh material={glassMaterial} position={[0, 0.95, 1.12]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[p.bodyWidth - 0.5, 0.5, 0.03]} />
          </mesh>
          <mesh position={[0, 0.58, 0.3]}>
            <boxGeometry args={[p.bodyWidth - 0.5, 0.2, 1.4]} />
            <meshToonMaterial color="#e8dcc8" gradientMap={toonGradient3} />
          </mesh>
          <mesh position={[0.35, 0.75, 0.8]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[0.12, 0.02, 8, 16]} />
            <meshToonMaterial color="#2a2a2a" gradientMap={toonGradient3} />
          </mesh>
        </>
      )}

      {/* === TAIL FINS === */}
      {renderTailFins()}

      {/* === CHROME DETAILS === */}
      <mesh material={chromeMaterial} position={[0, 0.18, p.bodyLength / 2 + 0.1]} castShadow>
        <boxGeometry args={[p.bodyWidth + 0.15, 0.2, 0.12]} />
      </mesh>
      {carType === 'cadillac' && [-1, 1].map(side => (
        <mesh key={`dagmar-${side}`} material={chromeMaterial} position={[side * 0.7, 0.22, p.bodyLength / 2 + 0.18]}>
          <sphereGeometry args={[0.08, 12, 8]} />
        </mesh>
      ))}
      <mesh material={chromeMaterial} position={[0, 0.35, p.bodyLength / 2 + 0.05]}>
        <boxGeometry args={[p.bodyWidth - 0.4, 0.3, 0.08]} />
      </mesh>
      {[-1, 1].map(side => (
        <group key={`headlights-${side}`}>
          <mesh material={headLightMaterial} position={[side * 0.65, 0.4, p.bodyLength / 2 + 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          </mesh>
          <mesh material={headLightMaterial} position={[side * 0.9, 0.4, p.bodyLength / 2 + 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          </mesh>
          <mesh material={chromeMaterial} position={[side * 0.65, 0.4, p.bodyLength / 2 + 0.02]}>
            <torusGeometry args={[0.13, 0.02, 8, 16]} />
          </mesh>
          <mesh material={chromeMaterial} position={[side * 0.9, 0.4, p.bodyLength / 2 + 0.02]}>
            <torusGeometry args={[0.11, 0.02, 8, 16]} />
          </mesh>
        </group>
      ))}
      <mesh material={chromeMaterial} position={[0, 0.18, -p.bodyLength / 2 - 0.05]} castShadow>
        <boxGeometry args={[p.bodyWidth, 0.18, 0.1]} />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={`side-chrome-${side}`} material={chromeMaterial} position={[side * (p.bodyWidth / 2 + 0.02), 0.3, 0]}>
          <boxGeometry args={[0.04, 0.06, p.bodyLength - 0.5]} />
        </mesh>
      ))}
      {carType === 'cadillac' && (
        <mesh material={chromeMaterial} position={[0, 0.72, p.bodyLength / 2 - 0.3]}>
          <coneGeometry args={[0.04, 0.2, 8]} />
        </mesh>
      )}

      {/* === WHEELS === */}
      {[
        { ref: wheelFRRef, pos: [1.05, 0, p.wheelBase / 2], side: 1 },
        { ref: wheelFLRef, pos: [-1.05, 0, p.wheelBase / 2], side: -1 },
        { ref: wheelRRRef, pos: [1.05, 0, -p.wheelBase / 2], side: 1 },
        { ref: wheelRLRef, pos: [-1.05, 0, -p.wheelBase / 2], side: -1 },
      ].map(({ ref, pos, side }, idx) => (
        <group key={idx} position={pos as [number, number, number]}>
          <group ref={ref}>
            {/* 타이어 */}
            <mesh material={tireMaterial} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.22, 32]} />
            </mesh>
            {/* 휠캡 */}
            <mesh material={chromeMaterial} rotation={[0, 0, Math.PI / 2]} position={[side * 0.12, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
            </mesh>
          </group>
        </group>
      ))}

{/* 그림자 제거됨 */}
    </>
  );
};

// ============================================
// 메인 VintageCar 컴포넌트
// ============================================
const VintageCar: React.FC<CarProps> = ({
  curve,
  laneOffset = 0,
  startT = 0,
  speed = 1,
  color = PALETTE.coralRed,
  carType = 'cadillac',
  scale = 1,
  useGLTFModel = false,  // 프로시저럴 모델 사용 (부품별 색상 구분)
  timeOfDay = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(startT);
  const distanceTraveled = useRef(0);

  // 프로시저럴 모델용 휠 레퍼런스
  const wheelFRRef = useRef<THREE.Group>(null);
  const wheelFLRef = useRef<THREE.Group>(null);
  const wheelRRRef = useRef<THREE.Group>(null);
  const wheelRLRef = useRef<THREE.Group>(null);

  const roadWidth = 36;
  const curveLength = useMemo(() => curve.getLength(), [curve]);

  // 애니메이션 - 곡선 따라가기 + 바퀴 회전
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const prevT = progress.current;
    progress.current += speed * delta * 0.06;
    if (progress.current > 1) progress.current = 0;

    const t = progress.current;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // 바퀴 회전 계산
    const deltaT = t > prevT ? t - prevT : (1 - prevT) + t;
    const deltaDist = deltaT * curveLength;
    distanceTraveled.current += deltaDist;
    const wheelRotation = distanceTraveled.current / WHEEL_RADIUS;

    // 프로시저럴 모델 바퀴 회전
    [wheelFRRef, wheelFLRef, wheelRRRef, wheelRLRef].forEach(ref => {
      if (ref.current) ref.current.rotation.x = wheelRotation;
    });

    // 차량 위치 계산 (레인 오프셋 적용)
    const binormal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const offset = laneOffset * (roadWidth / 2) * 0.8;
    const position = point.clone().add(binormal.clone().multiplyScalar(offset));
    // 곡선의 Y 좌표 사용 (고가도로) + 바퀴 높이
    position.y = point.y + WHEEL_RADIUS;

    groupRef.current.position.copy(position);
    groupRef.current.scale.setScalar(scale);

    // 차량 방향 (탄젠트 방향으로 회전)
    const angle = Math.atan2(tangent.x, tangent.z);
    groupRef.current.rotation.set(0, angle, 0);
  });

  // 프로시저럴 폴백 컴포넌트
  const ProceduralFallback = (
    <ProceduralCarModel
      color={color}
      carType={carType}
      wheelFRRef={wheelFRRef}
      wheelFLRef={wheelFLRef}
      wheelRRRef={wheelRRRef}
      wheelRLRef={wheelRLRef}
    />
  );

  // 헤드라이트 강도 (밤에 밝아짐)
  const headlightIntensity = timeOfDay * 15;
  const taillightIntensity = timeOfDay * 5;

  return (
    <group ref={groupRef}>
      {useGLTFModel ? (
        <Suspense fallback={ProceduralFallback}>
          <RealisticCarModel color={color} carType={carType} />
        </Suspense>
      ) : (
        ProceduralFallback
      )}

      {/* 헤드라이트 (밤에 활성화) */}
      {timeOfDay > 0.1 && (
        <>
          {/* 왼쪽 헤드라이트 */}
          <pointLight
            position={[-0.65, 0.4, 2.2]}
            color="#fffde0"
            intensity={headlightIntensity}
            distance={30}
            decay={2}
          />
          <mesh position={[-0.65, 0.4, 2.25]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#fffde0" transparent opacity={timeOfDay * 0.9} />
          </mesh>

          {/* 오른쪽 헤드라이트 */}
          <pointLight
            position={[0.65, 0.4, 2.2]}
            color="#fffde0"
            intensity={headlightIntensity}
            distance={30}
            decay={2}
          />
          <mesh position={[0.65, 0.4, 2.25]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#fffde0" transparent opacity={timeOfDay * 0.9} />
          </mesh>

          {/* 테일라이트 */}
          <pointLight
            position={[0, 0.4, -2.5]}
            color="#ff3030"
            intensity={taillightIntensity}
            distance={10}
            decay={2}
          />
        </>
      )}
    </group>
  );
};

export default VintageCar;
