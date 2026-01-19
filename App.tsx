import React, { useState } from 'react';
import { AnimationState } from './types';
import HeroSection from './components/HeroSection';
import {
  TableOfContents,
  ArticleSection,
  AdvertisementSection,
  EditorialColumn,
} from './components/editorial';

function App() {
  const [mode, setMode] = useState<AnimationState>('COVER');

  const toggleMode = () => {
    setMode((prev) => (prev === 'COVER' ? 'EXPLORE' : 'COVER'));
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* ============================================ */}
      {/* HERO SECTION - 3D Magazine Cover */}
      {/* ============================================ */}
      <HeroSection mode={mode} onToggleMode={toggleMode} />

      {/* ============================================ */}
      {/* EDITORIAL SECTIONS - Magazine Pages */}
      {/* ============================================ */}

      {/* Advertisement Spread */}
      <AdvertisementSection layout="split" />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Featured Article */}
      <ArticleSection articleId="heroic-years" />

      {/* Full Page Ad */}
      <AdvertisementSection layout="full" />

      {/* Editorial Column */}
      <EditorialColumn />

      {/* Second Article */}
      <ArticleSection articleId="car-stylists" />

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer
        className="py-12 text-center"
        style={{ backgroundColor: '#2a2018' }}
      >
        <p
          className="text-sm uppercase tracking-widest mb-2"
          style={{ color: '#c0a878', fontFamily: "Georgia, serif" }}
        >
          Popular Mechanics Magazine
        </p>
        <p
          className="text-xs"
          style={{ color: '#8a7a60', fontFamily: "Arial, sans-serif" }}
        >
          January 1959 • Volume 111, Number 1
        </p>
        <p
          className="text-xs mt-4"
          style={{ color: '#6a6050', fontFamily: "Arial, sans-serif" }}
        >
          A tribute to the golden age of American automotive design
        </p>
        <p
          className="text-xs mt-2"
          style={{ color: '#5a5040', fontFamily: "Arial, sans-serif" }}
        >
          Recreated with Three.js & React Three Fiber
        </p>
      </footer>
    </div>
  );
}

export default App;
