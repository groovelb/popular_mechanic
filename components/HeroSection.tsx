import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import IllustrationScene from './Scene';
import MagazineCoverOverlay from './MagazineCoverOverlay';
import { AnimationState } from '../types';

interface HeroSectionProps {
  mode: AnimationState;
  onToggleMode: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ mode, onToggleMode }) => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - viewportHeight;

      // 시작 부분: 첫 100vh 스크롤 시 위로 올라가는 효과
      if (scrollY < viewportHeight) {
        const progress = scrollY / viewportHeight;
        setOffsetY(-progress * 50); // 최대 50px 위로
      }
      // 끝 부분: 마지막 100vh 스크롤 시 다시 내려오는 효과
      else if (scrollY > maxScroll - viewportHeight) {
        const endProgress = (scrollY - (maxScroll - viewportHeight)) / viewportHeight;
        setOffsetY(-50 + endProgress * 50); // -50px에서 0으로
      }
      // 중간: 위로 올라간 상태 유지
      else {
        setOffsetY(-50);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      data-hero
      className="w-full h-screen overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#7fbfb5',
        transform: `translateY(${offsetY}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
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
