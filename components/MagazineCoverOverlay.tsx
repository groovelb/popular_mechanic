import React from 'react';
import { AnimationState } from '../types';

interface MagazineCoverOverlayProps {
  mode: AnimationState;
  onToggleMode: () => void;
  timeOfDay?: number; // 0 = 낮 (풀 커버), 1 = 밤 (미니멀 푸터)
}

const MagazineCoverOverlay: React.FC<MagazineCoverOverlayProps> = ({ mode, onToggleMode, timeOfDay = 0 }) => {
  const isNight = timeOfDay > 0.5;

  // 밤 모드: 미니멀 푸터 스타일
  if (isNight) {
    return (
      <div
        className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end safe-area-inset"
        style={{ opacity: timeOfDay }}
      >
        {/* 미니멀 푸터 */}
        <div
          className="w-full py-6 sm:py-8 px-4 sm:px-6 text-center"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          }}
        >
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-2"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "Georgia, serif" }}
          >
            Popular Mechanics
          </p>
          <p
            className="text-[10px] sm:text-xs tracking-wider sm:tracking-widest"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "Arial, sans-serif" }}
          >
            JANUARY 1959 • A TRIBUTE TO THE GOLDEN AGE
          </p>

          {/* Back to Top 버튼 */}
          <div className="mt-4 sm:mt-6 pointer-events-auto">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-6 py-2 border rounded-full transition-all hover:bg-white hover:text-black active:scale-95"
              style={{
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.3)',
                fontFamily: "Arial, sans-serif",
              }}
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 낮 모드: 풀 매거진 커버
  return (
    <div
      className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 safe-area-inset ${mode === 'EXPLORE' ? 'opacity-0' : 'opacity-100'}`}
      style={{ opacity: 1 - timeOfDay }}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 text-center py-1.5 sm:py-2" style={{ backgroundColor: '#2a2018' }}>
        <span
          className="text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase px-2"
          style={{ color: '#c0a878', fontFamily: "Georgia, serif", fontWeight: 500 }}
        >
          50 Pages About Cars • Plus All Regular Features
        </span>
      </div>

      {/* Main Title Block */}
      <div className="absolute top-6 sm:top-8 left-0 right-0 flex flex-col items-center px-2">
        <div
          className="relative px-4 sm:px-8 md:px-12 pt-2 sm:pt-4 pb-1 sm:pb-2 max-w-full"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <h1
            className="text-[48px] sm:text-[65px] md:text-[100px] lg:text-[120px] leading-[0.9] font-black text-center"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: '#cc2222',
              letterSpacing: '-0.02em',
              fontWeight: 900
            }}
          >
            POPULAR
          </h1>
          <h1
            className="text-[48px] sm:text-[65px] md:text-[100px] lg:text-[120px] leading-[0.85] font-black text-center"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: '#cc2222',
              letterSpacing: '-0.02em',
              fontWeight: 900
            }}
          >
            MECHANICS
          </h1>
          <h2
            className="text-[14px] sm:text-[18px] md:text-[26px] tracking-[0.3em] sm:tracking-[0.5em] text-center mt-1 sm:mt-2"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: '#c8a030',
              fontStyle: 'italic',
              fontWeight: 400
            }}
          >
            MAGAZINE
          </h2>
          <p
            className="text-[7px] sm:text-[9px] tracking-[0.08em] sm:tracking-[0.12em] uppercase text-center mt-1 sm:mt-2 pb-1"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 400 }}
          >
            WRITTEN SO YOU CAN UNDERSTAND IT
          </p>
        </div>
      </div>

      {/* Date/Price Box */}
      <div
        className="absolute top-[180px] sm:top-[220px] md:top-[300px] left-1 sm:left-2 md:left-4"
        style={{
          backgroundColor: '#d8b830',
          border: '2px solid #1a1a1a',
          padding: '4px 8px'
        }}
      >
        <div className="text-center">
          <div
            className="text-[10px] sm:text-[13px] uppercase tracking-wide"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 700 }}
          >
            JANUARY 1959
          </div>
          <div
            className="text-[16px] sm:text-[22px] font-black"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 900 }}
          >
            35 CENTS
          </div>
        </div>
      </div>

      {/* Headlines - Left Side */}
      <div className="absolute bottom-16 sm:bottom-8 md:bottom-12 left-1 sm:left-2 md:left-4 max-w-[160px] sm:max-w-[200px] md:max-w-[220px]">
        <div className="mb-2 sm:mb-3">
          <p
            className="text-[8px] sm:text-[10px] uppercase tracking-wide"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
          >
            HEROIC YEARS
          </p>
          <h3
            className="text-[14px] sm:text-[18px] md:text-[24px] uppercase leading-tight"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif", fontWeight: 700 }}
          >
            THE AUTOMOBILE
          </h3>
          <p
            className="text-[11px] sm:text-[14px] italic"
            style={{ color: '#1a1a1a', fontFamily: "Georgia, serif" }}
          >
            —A Color Album
          </p>
        </div>

        <p
          className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wide mb-1 sm:mb-2 hidden sm:block"
          style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
        >
          HOW TO CHECK YOUR IGNITION
        </p>

        <h4
          className="text-[12px] sm:text-[14px] md:text-[18px] uppercase font-bold leading-tight mb-1 sm:mb-2"
          style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
        >
          CAR STYLISTS TALK BACK
        </h4>

        <div className="hidden sm:block">
          <p
            className="text-[8px] sm:text-[10px] uppercase font-bold"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
          >
            HOW GOOD ARE THE GADGETS?
          </p>
          <p
            className="text-[8px] sm:text-[10px] italic"
            style={{ color: '#1a1a1a', fontFamily: "Georgia, serif" }}
          >
            an Engineer Discusses the Accessories
          </p>
        </div>
      </div>

      {/* REG. U.S. PAT. OFF. */}
      <div
        className="absolute top-[185px] sm:top-[230px] md:top-[310px] right-1 sm:right-2 md:right-4 text-[6px] sm:text-[8px]"
        style={{ color: '#2a2a2a', fontFamily: "Arial, sans-serif" }}
      >
        REG. U.S. PAT. OFF.
      </div>

      {/* Interaction Button */}
      <div className="absolute bottom-4 sm:bottom-6 right-2 sm:right-4 md:right-6 pointer-events-auto">
        <button
          onClick={onToggleMode}
          className="font-bold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-wider text-xs sm:text-sm md:text-base"
          style={{
            backgroundColor: '#c23b22',
            color: '#fff8e7',
            border: '2px solid #fff',
            fontFamily: "'Oswald', sans-serif",
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}
        >
          {mode === 'COVER' ? 'Enter Scene' : 'Back to Cover'}
        </button>
      </div>

      {/* 3D Model Credit */}
      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 text-[9px] sm:text-xs opacity-60" style={{ color: '#2a2a2a' }}>
        <a
          href="https://sketchfab.com/3d-models/plymouth-fury-1958-233d9c8b297e48e4a5d22599a23cefe5"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline pointer-events-auto"
        >
          3D Model: Plymouth Fury 1958 (CC-BY)
        </a>
      </div>

      {/* Scroll Indicator - 모바일에서 숨김 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden sm:block">
        <div className="flex flex-col items-center animate-bounce">
          <span
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: '#1a1a1a', fontFamily: "Arial, sans-serif" }}
          >
            Scroll to Read
          </span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MagazineCoverOverlay;
