# 1959 Popular Mechanics 3D 트리뷰트 만들기

## Phase 1: 3D 무대 세팅
- React Three Fiber로 3D 씬 구축
- CatmullRom 곡선으로 고가도로 생성
- 프로시저럴 빈티지 자동차 4종
- 시드 기반 랜덤 도시 건물 배치

## Phase 2: 레트로 일러스트 스타일링
- 1950년대 파스텔 컬러 팔레트
- 커스텀 툰 셰이더 (3단계 명암)
- Bloom + Contour + Vignette 후처리
- 종이 텍스처 오버레이

## Phase 3: 인터랙티브 매거진 경험
- 스크롤 → 낮/밤 전환
- 밤엔 창문 불빛 + 전조등 glow
- 마우스/터치로 카메라 패닝
- 매거진 커버 UI 오버레이

## Phase 4: 퍼포먼스 & 반응형
- 모바일: 그림자/AA 끄기, 낮은 DPR
- 터치 이벤트 + Safe Area 대응
- RAF 쓰로틀링으로 스크롤 최적화
- sm/md/lg 브레이크포인트 적용

---

**스택:** React + R3F + Drei + Tailwind + GLSL
