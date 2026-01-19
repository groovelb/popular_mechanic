import * as THREE from 'three';

export const IllustrationShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#ff0000') },
    uLightPos: { value: new THREE.Vector3(10, 10, 10) },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uScale: { value: 4.0 }, // Size of halftone dots
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uLightPos;
    uniform vec2 uResolution;
    uniform float uScale;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;

    // Vintage Palette
    const vec3 SHADOW_COLOR = vec3(0.1, 0.1, 0.25); // Deep blue-ish ink for shadows
    const vec3 HIGHLIGHT_COLOR = vec3(1.0, 0.98, 0.9); // Paper white

    void main() {
      // 1. Basic Lighting (Lambert + Ambient)
      vec3 lightDir = normalize(uLightPos - vWorldPos);
      float diff = max(dot(vNormal, lightDir), 0.0);
      
      // 2. Halftone Pattern Generation
      // Calculate screen space coordinates for the pattern
      vec2 screenUV = gl_FragCoord.xy / uResolution.y * uScale;
      vec2 grid = fract(screenUV) - 0.5;
      float dist = length(grid);
      
      // 3. Toon/Cel Shading Steps
      // We map the light intensity to dot sizes
      float patternIntensity = 0.0;
      
      float step1 = 0.4; // Shadow threshold
      float step2 = 0.7; // Midtone threshold
      float step3 = 0.95; // Highlight threshold

      vec3 finalColor = uColor;

      if (diff > step3) {
        // High Highlight
        finalColor = mix(uColor, HIGHLIGHT_COLOR, 0.5);
      } else if (diff > step2) {
         // Midtone - slight hatch or clean
         finalColor = uColor;
      } else if (diff > step1) {
         // Halftone Shadow Area
         // If distance to center of grid is less than radius defined by inv-light, it's ink
         float radius = 0.6 * (1.0 - diff); 
         if (dist < radius) {
            finalColor = mix(uColor, SHADOW_COLOR, 0.8);
         }
      } else {
         // Deep Shadow
         finalColor = SHADOW_COLOR;
      }

      // 4. Rim Light / Paper Edge
      float viewDot = dot(vNormal, normalize(-vWorldPos)); // Simplified view dir
      if (viewDot < 0.25 && viewDot > 0.0) {
         finalColor = vec3(0.05, 0.05, 0.05); // Ink Outline
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Material Helper
export const createIllustrationMaterial = (color: string) => {
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(IllustrationShader.uniforms),
    vertexShader: IllustrationShader.vertexShader,
    fragmentShader: IllustrationShader.fragmentShader,
  });
  mat.uniforms.uColor.value = new THREE.Color(color);
  return mat;
};
