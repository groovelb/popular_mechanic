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

      {/* Magazine UI Overlay */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ${mode === 'EXPLORE' ? 'opacity-0' : 'opacity-100'}`}>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 text-center py-2" style={{ backgroundColor: '#8b4513' }}>
          <span
            className="text-xs tracking-[0.3em] uppercase font-bold"
            style={{ color: '#f5e6c8', fontFamily: "'Oswald', sans-serif" }}
          >
            50 Pages About Cars &bull; Plus All Regular Features
          </span>
        </div>

        {/* Main Title Block */}
        <div className="absolute top-8 left-0 right-0 flex flex-col items-center">
          {/* Title Background */}
          <div className="relative px-8 py-4" style={{ backgroundColor: '#c23b22' }}>
            <h1
              className="text-[80px] md:text-[100px] lg:text-[120px] leading-[0.85] font-black text-center tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#fff8e7',
                textShadow: '3px 3px 0 rgba(0,0,0,0.2)'
              }}
            >
              POPULAR<br />MECHANICS
            </h1>
          </div>

          {/* Magazine Subtitle */}
          <div className="mt-1 px-6 py-1" style={{ backgroundColor: '#c23b22' }}>
            <h2
              className="text-xl md:text-2xl tracking-[0.5em] uppercase font-bold"
              style={{ fontFamily: "'Oswald', sans-serif", color: '#fff8e7' }}
            >
              Magazine
            </h2>
          </div>

          {/* Slogan */}
          <p
            className="mt-2 text-xs tracking-[0.2em] uppercase font-medium"
            style={{ color: '#2a2a2a' }}
          >
            Written So You Can Understand It
          </p>
        </div>

        {/* Date/Price Box - Vintage Yellow Label */}
        <div
          className="absolute top-48 left-4 md:left-8 px-4 py-3 shadow-lg transform -rotate-1"
          style={{
            backgroundColor: '#e9c46a',
            border: '3px solid #fff',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)'
          }}
        >
          <div className="text-center" style={{ fontFamily: "'Oswald', sans-serif" }}>
            <div className="text-sm uppercase tracking-wider font-bold" style={{ color: '#2a2a2a' }}>
              January 1959
            </div>
            <div className="text-2xl md:text-3xl font-black mt-1" style={{ color: '#2a2a2a' }}>
              35 CENTS
            </div>
          </div>
        </div>

        {/* Headlines - Left Side */}
        <div className="absolute bottom-16 md:bottom-20 left-4 md:left-8 max-w-xs">
          <div style={{ fontFamily: "'Oswald', sans-serif" }}>
            <h3
              className="text-2xl md:text-3xl font-black uppercase leading-tight mb-1"
              style={{ color: '#1a1a1a' }}
            >
              Heroic Years<br />of the Automobile
            </h3>
            <p
              className="text-base md:text-lg italic mb-3"
              style={{ color: '#2a2a2a', fontFamily: "'Playfair Display', serif" }}
            >
              &mdash;A Color Album
            </p>

            <div className="w-12 h-1 mb-3" style={{ backgroundColor: '#c23b22' }}></div>

            <h4
              className="text-sm md:text-base uppercase font-bold tracking-wide mb-1"
              style={{ color: '#1a1a1a' }}
            >
              How to Check Your Ignition
            </h4>

            <h4
              className="text-lg md:text-xl uppercase font-bold leading-tight"
              style={{ color: '#1a1a1a' }}
            >
              Car Stylists Talk Back
            </h4>

            <p
              className="text-xs md:text-sm mt-2"
              style={{ color: '#3a3a3a' }}
            >
              How Good Are the Gadgets?<br />
              <span className="italic">An Engineer Discusses the Accessories</span>
            </p>
          </div>
        </div>

        {/* REG. U.S. PAT. OFF. - Top Right Corner */}
        <div
          className="absolute top-12 right-4 text-xs"
          style={{ color: '#4a4a4a', fontFamily: "'Oswald', sans-serif" }}
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

    </div>
  );
}

export default App;
