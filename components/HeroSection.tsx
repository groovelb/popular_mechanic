import React from 'react';
import { Canvas } from '@react-three/fiber';
import IllustrationScene from './Scene';
import MagazineCoverOverlay from './MagazineCoverOverlay';
import { AnimationState } from '../types';

interface HeroSectionProps {
  mode: AnimationState;
  onToggleMode: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ mode, onToggleMode }) => {
  return (
    <section className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#7fbfb5' }}>
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <IllustrationScene mode={mode} />
        </Canvas>
      </div>

      {/* DOM Overlay - Magazine UI */}
      <MagazineCoverOverlay mode={mode} onToggleMode={onToggleMode} />
    </section>
  );
};

export default HeroSection;
