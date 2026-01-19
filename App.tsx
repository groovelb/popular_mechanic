import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import IllustrationScene from './components/Scene';
import { AnimationState } from './types';

function App() {
  const [mode, setMode] = useState<AnimationState>('COVER');

  const toggleMode = () => {
    setMode((prev) => (prev === 'COVER' ? 'EXPLORE' : 'COVER'));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#7fbfb5' }}>

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <IllustrationScene mode={mode} />
        </Canvas>
      </div>

      {/* Magazine UI Overlay - 레퍼런스 정확히 복제 */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ${mode === 'EXPLORE' ? 'opacity-0' : 'opacity-100'}`}>

        {/* Top Bar - 갈색/검정 바 */}
        <div className="absolute top-0 left-0 right-0 text-center py-2" style={{ backgroundColor: '#2a2018' }}>
          <span
            className="text-[11px] tracking-[0.3em] uppercase"
            style={{ color: '#c0a878', fontFamily: "Georgia, serif", fontWeight: 500 }}
          >
            50 Pages About Cars • Plus All Regular Features
          </span>
        </div>

        {/* Main Title Block - 흰배경 + 빨간글씨 */}
        <div className="absolute top-8 left-0 right-0 flex flex-col items-center">
          <div
            className="relative px-12 pt-4 pb-2"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {/* POPULAR */}
            <h1
              className="text-[80px] md:text-[100px] lg:text-[120px] leading-[0.9] font-black text-center"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#cc2222',
                letterSpacing: '-0.02em',
                fontWeight: 900
              }}
            >
              POPULAR
            </h1>
            {/* MECHANICS */}
            <h1
              className="text-[80px] md:text-[100px] lg:text-[120px] leading-[0.85] font-black text-center"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#cc2222',
                letterSpacing: '-0.02em',
                fontWeight: 900
              }}
            >
              MECHANICS
            </h1>
            {/* MAGAZINE - 노란/금색 이탤릭 */}
            <h2
              className="text-[22px] md:text-[26px] tracking-[0.5em] text-center mt-2"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#c8a030',
                fontStyle: 'italic',
                fontWeight: 400
              }}
            >
              MAGAZINE
            </h2>
            {/* Slogan */}
            <p
              className="text-[9px] tracking-[0.12em] uppercase text-center mt-2 pb-1"
              style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 400 }}
            >
              WRITTEN SO YOU CAN UNDERSTAND IT
            </p>
          </div>
        </div>

        {/* Date/Price Box - 노란 라벨 + 검정 테두리 */}
        <div
          className="absolute top-[260px] md:top-[300px] left-2 md:left-4"
          style={{
            backgroundColor: '#d8b830',
            border: '3px solid #1a1a1a',
            padding: '8px 14px'
          }}
        >
          <div className="text-center">
            <div
              className="text-[13px] uppercase tracking-wide"
              style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 700 }}
            >
              JANUARY 1959
            </div>
            <div
              className="text-[22px] font-black"
              style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 900 }}
            >
              35 CENTS
            </div>
          </div>
        </div>

        {/* Headlines - Left Side 하단 */}
        <div className="absolute bottom-8 md:bottom-12 left-2 md:left-4 max-w-[220px]">
          {/* HEROIC YEARS 섹션 */}
          <div className="mb-3">
            <p
              className="text-[10px] uppercase tracking-wide"
              style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
            >
              HEROIC YEARS
            </p>
            <h3
              className="text-[20px] md:text-[24px] uppercase leading-tight"
              style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 700 }}
            >
              THE AUTOMOBILE
            </h3>
            <p
              className="text-[14px] italic"
              style={{ color: '#1a1a1a', fontFamily: "Georgia, serif" }}
            >
              —A Color Album
            </p>
          </div>

          {/* HOW TO CHECK */}
          <p
            className="text-[10px] uppercase font-bold tracking-wide mb-2"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
          >
            HOW TO CHECK YOUR IGNITION
          </p>

          {/* CAR STYLISTS */}
          <h4
            className="text-[16px] md:text-[18px] uppercase font-bold leading-tight mb-2"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
          >
            CAR STYLISTS TALK BACK
          </h4>

          {/* HOW GOOD */}
          <p
            className="text-[10px] uppercase font-bold"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
          >
            HOW GOOD ARE THE GADGETS?
          </p>
          <p
            className="text-[10px] italic"
            style={{ color: '#1a1a1a', fontFamily: "Georgia, serif" }}
          >
            an Engineer Discusses the Accessories
          </p>
        </div>

        {/* REG. U.S. PAT. OFF. - 오른쪽 상단 */}
        <div
          className="absolute top-[270px] md:top-[310px] right-2 md:right-4 text-[8px]"
          style={{ color: '#2a2a2a', fontFamily: "Arial, sans-serif" }}
        >
          REG. U.S. PAT. OFF.
        </div>
      </div>

      {/* Interaction Button */}
      <div className="absolute bottom-6 right-6 z-50 pointer-events-auto">
        <button
          onClick={toggleMode}
          className="font-bold py-3 px-6 md:px-8 rounded-full shadow-xl hover:scale-105 transition-all uppercase tracking-wider text-sm md:text-base"
          style={{
            backgroundColor: '#c23b22',
            color: '#fff8e7',
            border: '3px solid #fff',
            fontFamily: "'Oswald', sans-serif",
            boxShadow: '4px 4px 0 rgba(0,0,0,0.3)'
          }}
        >
          {mode === 'COVER' ? 'Enter Scene' : 'Back to Cover'}
        </button>
      </div>

      {/* 3D Model Credit - CC-BY Attribution */}
      <div className="absolute bottom-2 left-2 z-50 text-xs opacity-60" style={{ color: '#2a2a2a' }}>
        <a
          href="https://sketchfab.com/3d-models/plymouth-fury-1958-233d9c8b297e48e4a5d22599a23cefe5"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline pointer-events-auto"
        >
          3D Model: "Plymouth Fury 1958" by imagineburner (CC-BY)
        </a>
      </div>

    </div>
  );
}

export default App;
