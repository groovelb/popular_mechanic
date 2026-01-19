import React, { useMemo, forwardRef } from 'react';
import { useThree, extend } from '@react-three/fiber';
import { EffectComposer, Noise, Vignette, HueSaturation, BrightnessContrast } from '@react-three/postprocessing';
import { Effect, BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// ============================================
// Kuwahara Filter Effect
// 구아슈/유화 페인팅 효과를 위한 커스텀 포스트프로세싱
// ============================================

// Kuwahara 필터 - 고정 radius 3 (WebGL 호환)
// radius 3 = 4x4 사분면 = 16 샘플
const kuwaharaFragmentShader = `
uniform vec2 resolution;

#define RADIUS 3
#define SAMPLES 16.0

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 texelSize = 1.0 / resolution;

  // 4개 사분면의 평균(m)과 제곱합(s)
  vec3 m0 = vec3(0.0), m1 = vec3(0.0), m2 = vec3(0.0), m3 = vec3(0.0);
  vec3 s0 = vec3(0.0), s1 = vec3(0.0), s2 = vec3(0.0), s3 = vec3(0.0);

  // 사분면 0: 좌하 (-3,-3) to (0,0)
  for (int j = -RADIUS; j <= 0; j++) {
    for (int i = -RADIUS; i <= 0; i++) {
      vec3 c = texture2D(inputBuffer, uv + vec2(float(i), float(j)) * texelSize).rgb;
      m0 += c;
      s0 += c * c;
    }
  }

  // 사분면 1: 우하 (0,-3) to (3,0)
  for (int j = -RADIUS; j <= 0; j++) {
    for (int i = 0; i <= RADIUS; i++) {
      vec3 c = texture2D(inputBuffer, uv + vec2(float(i), float(j)) * texelSize).rgb;
      m1 += c;
      s1 += c * c;
    }
  }

  // 사분면 2: 우상 (0,0) to (3,3)
  for (int j = 0; j <= RADIUS; j++) {
    for (int i = 0; i <= RADIUS; i++) {
      vec3 c = texture2D(inputBuffer, uv + vec2(float(i), float(j)) * texelSize).rgb;
      m2 += c;
      s2 += c * c;
    }
  }

  // 사분면 3: 좌상 (-3,0) to (0,3)
  for (int j = 0; j <= RADIUS; j++) {
    for (int i = -RADIUS; i <= 0; i++) {
      vec3 c = texture2D(inputBuffer, uv + vec2(float(i), float(j)) * texelSize).rgb;
      m3 += c;
      s3 += c * c;
    }
  }

  // 평균 및 분산 계산
  m0 /= SAMPLES; s0 = abs(s0 / SAMPLES - m0 * m0);
  m1 /= SAMPLES; s1 = abs(s1 / SAMPLES - m1 * m1);
  m2 /= SAMPLES; s2 = abs(s2 / SAMPLES - m2 * m2);
  m3 /= SAMPLES; s3 = abs(s3 / SAMPLES - m3 * m3);

  float v0 = s0.r + s0.g + s0.b;
  float v1 = s1.r + s1.g + s1.b;
  float v2 = s2.r + s2.g + s2.b;
  float v3 = s3.r + s3.g + s3.b;

  // 최소 분산 영역 선택
  vec3 result = m0;
  float minVar = v0;

  if (v1 < minVar) { result = m1; minVar = v1; }
  if (v2 < minVar) { result = m2; minVar = v2; }
  if (v3 < minVar) { result = m3; }

  outputColor = vec4(result, inputColor.a);
}
`;

// Kuwahara Effect 클래스 (고정 radius 3)
class KuwaharaEffect extends Effect {
  constructor({ resolution = new THREE.Vector2(1, 1) } = {}) {
    super('KuwaharaEffect', kuwaharaFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['resolution', new THREE.Uniform(resolution)],
      ]),
    });
  }

  setResolution(width: number, height: number) {
    this.uniforms.get('resolution')!.value.set(width, height);
  }
}

// ============================================
// Paper Texture Overlay Effect
// 종이/캔버스 텍스처 오버레이
// ============================================

const paperTextureFragmentShader = `
uniform float intensity;
uniform float scale;

// 프로시저럴 노이즈로 종이 텍스처 생성
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// FBM (Fractal Brownian Motion) for more natural texture
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // 종이 텍스처 노이즈
  float paperNoise = fbm(uv * scale);

  // 미세한 그레인 추가
  float grain = hash(uv * 500.0 + fract(time * 0.1)) * 0.02;

  // 텍스처 적용 (multiply blend)
  vec3 paper = vec3(0.95 + paperNoise * 0.1 + grain);
  vec3 result = inputColor.rgb * mix(vec3(1.0), paper, intensity);

  outputColor = vec4(result, inputColor.a);
}
`;

class PaperTextureEffect extends Effect {
  constructor({ intensity = 0.15, scale = 100.0 } = {}) {
    super('PaperTextureEffect', paperTextureFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['intensity', new THREE.Uniform(intensity)],
        ['scale', new THREE.Uniform(scale)],
      ]),
    });
  }
}

// ============================================
// Contour/Outline Effect (윤곽선 강조)
// ============================================

const contourFragmentShader = `
uniform float thickness;
uniform float darkness;
uniform vec2 resolution;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 texelSize = thickness / resolution;

  // 8방향 샘플링으로 엣지 검출
  vec3 TL = texture2D(inputBuffer, uv + vec2(-1.0, -1.0) * texelSize).rgb;
  vec3 T  = texture2D(inputBuffer, uv + vec2( 0.0, -1.0) * texelSize).rgb;
  vec3 TR = texture2D(inputBuffer, uv + vec2( 1.0, -1.0) * texelSize).rgb;
  vec3 L  = texture2D(inputBuffer, uv + vec2(-1.0,  0.0) * texelSize).rgb;
  vec3 C  = inputColor.rgb;
  vec3 R  = texture2D(inputBuffer, uv + vec2( 1.0,  0.0) * texelSize).rgb;
  vec3 BL = texture2D(inputBuffer, uv + vec2(-1.0,  1.0) * texelSize).rgb;
  vec3 B  = texture2D(inputBuffer, uv + vec2( 0.0,  1.0) * texelSize).rgb;
  vec3 BR = texture2D(inputBuffer, uv + vec2( 1.0,  1.0) * texelSize).rgb;

  // Sobel operators
  vec3 gx = -TL - 2.0*L - BL + TR + 2.0*R + BR;
  vec3 gy = -TL - 2.0*T - TR + BL + 2.0*B + BR;

  // 엣지 강도
  float edge = length(gx) + length(gy);
  edge = smoothstep(0.15, 0.4, edge);

  // 원래 색상의 어두운 버전으로 윤곽선 (같은 색조, 낮은 명도)
  vec3 darkerColor = inputColor.rgb * 0.3;  // 원래 색의 30%
  vec3 result = mix(inputColor.rgb, darkerColor, edge * darkness);

  outputColor = vec4(result, inputColor.a);
}
`;

class ContourEffect extends Effect {
  constructor({
    thickness = 1.5,
    darkness = 0.8,
    resolution = new THREE.Vector2(1, 1)
  } = {}) {
    super('ContourEffect', contourFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['thickness', new THREE.Uniform(thickness)],
        ['darkness', new THREE.Uniform(darkness)],
        ['resolution', new THREE.Uniform(resolution)],
      ]),
    });
  }

  setResolution(width: number, height: number) {
    this.uniforms.get('resolution')!.value.set(width, height);
  }
}

// ============================================
// Warm Vintage Color Grading
// 1950년대 인쇄물 색감
// ============================================

const vintageColorFragmentShader = `
uniform float warmth;
uniform float fadeAmount;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = inputColor.rgb;

  // 따뜻한 톤 시프트 (1950년대 인쇄물)
  color.r = color.r * (1.0 + warmth * 0.1);
  color.g = color.g * (1.0 + warmth * 0.02);
  color.b = color.b * (1.0 - warmth * 0.08);

  // 약간의 페이드 효과 (빈티지 느낌)
  color = mix(color, vec3(0.95, 0.92, 0.88), fadeAmount * 0.1);

  // 색상 클램핑
  color = clamp(color, 0.0, 1.0);

  outputColor = vec4(color, inputColor.a);
}
`;

class VintageColorEffect extends Effect {
  constructor({ warmth = 0.5, fadeAmount = 0.3 } = {}) {
    super('VintageColorEffect', vintageColorFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['warmth', new THREE.Uniform(warmth)],
        ['fadeAmount', new THREE.Uniform(fadeAmount)],
      ]),
    });
  }
}

// ============================================
// React 컴포넌트 래퍼들
// ============================================

const Kuwahara = forwardRef<KuwaharaEffect, object>((_, ref) => {
  const { size } = useThree();

  const effect = useMemo(() => {
    const e = new KuwaharaEffect({
      resolution: new THREE.Vector2(size.width, size.height),
    });
    return e;
  }, [size.width, size.height]);

  React.useImperativeHandle(ref, () => effect, [effect]);

  return <primitive object={effect} dispose={null} />;
});

interface PaperTextureProps {
  intensity?: number;
  scale?: number;
}

const PaperTexture = forwardRef<PaperTextureEffect, PaperTextureProps>(
  ({ intensity = 0.15, scale = 100.0 }, ref) => {
    const effect = useMemo(
      () => new PaperTextureEffect({ intensity, scale }),
      [intensity, scale]
    );

    React.useImperativeHandle(ref, () => effect, [effect]);

    return <primitive object={effect} dispose={null} />;
  }
);

interface ContourProps {
  thickness?: number;
  darkness?: number;
}

const Contour = forwardRef<ContourEffect, ContourProps>(
  ({ thickness = 1.5, darkness = 0.8 }, ref) => {
    const { size } = useThree();

    const effect = useMemo(() => {
      const e = new ContourEffect({
        thickness,
        darkness,
        resolution: new THREE.Vector2(size.width, size.height),
      });
      return e;
    }, [thickness, darkness, size.width, size.height]);

    React.useImperativeHandle(ref, () => effect, [effect]);

    return <primitive object={effect} dispose={null} />;
  }
);

interface VintageColorProps {
  warmth?: number;
  fadeAmount?: number;
}

const VintageColor = forwardRef<VintageColorEffect, VintageColorProps>(
  ({ warmth = 0.5, fadeAmount = 0.3 }, ref) => {
    const effect = useMemo(
      () => new VintageColorEffect({ warmth, fadeAmount }),
      [warmth, fadeAmount]
    );

    React.useImperativeHandle(ref, () => effect, [effect]);

    return <primitive object={effect} dispose={null} />;
  }
);

// ============================================
// 메인 PostEffects 컴포넌트
// 1950년대 구아슈/일러스트 스타일 포스트프로세싱
// ============================================
const PostEffects: React.FC = () => {
  return (
    <EffectComposer>
      {/* 1. Kuwahara Filter - 페인팅 효과 */}
      <Kuwahara />

      {/* 2. Contour - 윤곽선 강조 (얇지만 진하게) */}
      <Contour thickness={1.0} darkness={0.9} />

      {/* 3. Paper Texture - 종이 텍스처 */}
      <PaperTexture intensity={0.08} scale={60.0} />

      {/* 4. Vintage Color - 따뜻한 톤 */}
      <VintageColor warmth={0.4} fadeAmount={0.1} />

      {/* 5. 채도 높임 - 선명한 색상 */}
      <HueSaturation
        blendFunction={BlendFunction.NORMAL}
        hue={0.0}
        saturation={0.35}
      />

      {/* 6. 밝기/대비 강화 */}
      <BrightnessContrast
        brightness={0.05}
        contrast={0.15}
      />

      {/* 7. 미세 노이즈 */}
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.12}
      />

      {/* 8. 비네트 */}
      <Vignette
        offset={0.4}
        darkness={0.25}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
};

export default PostEffects;
