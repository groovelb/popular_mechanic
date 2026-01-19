# PRD: Popular Mechanics 1959 Reimagined
**Version:** 1.0  
**Date:** 2023-10-27  
**Status:** In Development (Prototype Phase)

---

## 1. Project Overview (프로젝트 개요)
이 프로젝트는 1959년 1월호 'Popular Mechanics' 잡지 표지를 현대적인 3D 웹 기술을 사용하여 인터랙티브하게 재해석하는 것을 목표로 합니다. 단순한 3D 모델링을 넘어, **NPR(Non-Photorealistic Rendering)** 기법을 통해 빈티지 인쇄물의 질감(Halftone, Ink Outline)을 유지하면서 정적인 표지에 생동감을 불어넣는 예술적 기술 데모입니다.

## 2. Goals & Objectives (목표)
*   **Visual Fidelity:** 1950년대 잡지 일러스트레이션 특유의 색감, 질감, 조명을 3D 환경에서 완벽하게 재현합니다.
*   **Interaction:** 사용자가 수동적인 관찰자에서 능동적인 탐험가로 전환될 수 있는 인터랙션(Camera Transition)을 제공합니다.
*   **Performance:** React Three Fiber를 활용하여 웹상에서 부드러운 60fps 애니메이션을 구현합니다.

---

## 3. Design Specifications (디자인 명세)

### 3.1. Visual Style (Art Direction)
*   **Rendering Style:** 실사(Realistic) 렌더링을 배제하고 **Cel-shading**과 **Halftone Pattern**을 결합한 커스텀 셰이더를 사용합니다.
*   **Color Palette:**
    *   Shadow: Deep Blue Ink (`#1a1a40`)
    *   Highlight: Warm Paper White (`#fffaee`)
    *   Accents: Cadillac Red (`#c23b22`), Taxi Yellow (`#f2a900`), Cyan (`#0077be`)
*   **Texture:** 화면 전체에 'Cream Paper Grain' 오버레이를 적용하여 낡은 종이 질감을 구현합니다.

### 3.2. Assets
*   **Cars:** 1959년형 캐딜락 엘도라도 스타일의 거대한 테일 핀(Tail Fin)이 강조된 로우 폴리곤 절차적(Procedural) 모델.
*   **Environment:** 얽히고설킨 고속도로 인터체인지(Interchange)와 추상화된 도시 배경.

### 3.3. Typography & UI
*   **Fonts:** 
    *   Title: `Playfair Display` (Serif, Heavy) - 클래식한 잡지 제호 느낌.
    *   Subtitles: `Oswald` (Sans-serif) - 견고한 산업적 느낌.
*   **Layout:** 잡지 표지 레이아웃을 HTML/CSS로 오버레이하여 구현하되, 3D 씬과 깊이감을 분리합니다.

---

## 4. Technical Specifications (기술 스펙)

*   **Framework:** React 18+
*   **3D Engine:** Three.js (r150+)
*   **Renderer Wrapper:** React Three Fiber (R3F)
*   **Styling:** Tailwind CSS (UI Layer)
*   **Shading Language:** GLSL (Custom Fragment/Vertex Shaders)
*   **Curve Interpolation:** `THREE.CatmullRomCurve3` for smooth paths.

---

## 5. Functional Requirements (기능 요구사항)

### 5.1. Scene & Animation
*   **Car Movement:** 자동차들은 정의된 곡선 경로(Spline)를 따라 무한 루프로 주행해야 합니다.
*   **Road System:** 곡선 데이터를 기반으로 도로 지오메트리(`TubeGeometry`)가 동적으로 생성되어야 합니다.

### 5.2. Camera Modes
*   **Mode A (Cover):** 고정된 아이소메트릭 시점. 마우스 움직임에 따른 미세한 Parallax(시차) 효과 적용. UI 표시됨.
*   **Mode B (Explore):** 3D 공간을 자유롭게 비행하거나 선회하는 시점. UI 숨김 처리.

---

## 6. Current Progress Report (현재 작업 현황 요약)

현재까지 구현된 주요 기능 및 컴포넌트 현황입니다.

### 6.1. Core Infrastructure (`index.html`, `index.tsx`)
*   [x] Tailwind CSS 및 Google Fonts(`Oswald`, `Playfair Display`) 연동 완료.
*   [x] 전체 화면 빈티지 종이 질감 오버레이 (`.paper-grain`) CSS 구현 완료.
*   [x] React 어플리케이션 마운트 구조 설정 완료.

### 6.2. Custom Shaders (`shaders/IllustrationShader.ts`)
*   [x] **Halftone Shader 구현:** 빛의 세기(`diff`)에 따라 4단계(Highlight, Midtone, Halftone Shadow, Deep Shadow)로 구분되는 로직 완성.
*   [x] **Ink Outline:** 뷰 벡터(View Vector)와 노멀(Normal)의 내적을 이용한 외곽선 검출 로직 구현.
*   [x] Uniforms 설정 (Light Position, Resolution, Scale 등) 완료.

### 6.3. 3D Components
*   [x] **VintageCar.tsx:**
    *   BoxGeometry들을 조합하여 1959년형 자동차(테일핀, 범퍼, 바퀴 등)를 절차적으로 모델링.
    *   `curve.getPointAt()`을 이용한 경로 추적 및 `lookAt`을 이용한 방향 전환 애니메이션 구현.
*   [x] **RoadSystem.tsx:**
    *   `TubeGeometry`를 사용하여 곡선 기반 도로 생성.
    *   `BackSide` 렌더링 기법을 활용한 도로 외곽선(Outline) 효과 추가.
*   [x] **Scene.tsx:**
    *   복잡한 교차로를 표현하기 위한 3개의 주요 `CatmullRomCurve3` 경로 정의.
    *   조명(Ambient, Directional) 배치 완료.
    *   배경 빌딩 블록 배치.

### 6.4. Interaction & UI (`App.tsx`)
*   [x] **UI Layout:** 잡지 표지 타이포그래피, 가격표, 헤드라인 텍스트 HTML/CSS 구현.
*   [x] **State Management:** `COVER` <-> `EXPLORE` 모드 전환 상태 관리(`useState`).
*   [x] **Camera Rig:** 상태에 따라 고정 시점(Parallax 포함)과 비행 시점(Sin/Cos 궤도)을 부드럽게 전환하는 `lerp` 로직 구현.

---

## 7. Future Tasks (향후 계획)
*   **Shadows:** 도로 위에 떨어지는 자동차 그림자(Drop Shadow)를 셰이더 기반으로 더 명확하게 표현.
*   **Environment Details:** 가로등, 표지판 등 도로 주변 장식 요소 추가.
*   **Sound:** 빈티지 재즈 배경음악 및 자동차 주행 효과음 추가 고려.
