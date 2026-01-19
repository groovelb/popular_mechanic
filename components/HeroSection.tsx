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
  const [timeOfDay, setTimeOfDay] = useState(0); // 0 = 낮, 1 = 밤

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - viewportHeight;

      // 시작 부분: 첫 100vh 스크롤 시 위로 올라가는 효과
      if (scrollY < viewportHeight) {
        const progress = scrollY / viewportHeight;
        setOffsetY(-progress * 50);
        setTimeOfDay(0); // 낮
      }
      // 끝 부분: 마지막 100vh 스크롤 시 다시 내려오는 효과
      else if (scrollY > maxScroll - viewportHeight) {
        const endProgress = (scrollY - (maxScroll - viewportHeight)) / viewportHeight;
        setOffsetY(-50 + endProgress * 50);
        setTimeOfDay(endProgress); // 0에서 1로 (낮→밤)
      }
      // 중간: 위로 올라간 상태 유지
      else {
        setOffsetY(-50);
        setTimeOfDay(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 배경색 보간 (낮: 청록, 밤: 어두운 보라/남색)
  const lerpColor = (t: number): string => {
    const dayColor = { r: 0x7f, g: 0xbf, b: 0xb5 }; // #7fbfb5
    const nightColor = { r: 0x06, g: 0x04, b: 0x10 }; // #060410 (어두운 보라)
    const r = Math.round(dayColor.r + (nightColor.r - dayColor.r) * t);
    const g = Math.round(dayColor.g + (nightColor.g - dayColor.g) * t);
    const b = Math.round(dayColor.b + (nightColor.b - dayColor.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

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
        backgroundColor: lerpColor(timeOfDay),
        transform: `translateY(${offsetY}px)`,
        transition: 'transform 0.1s ease-out, background-color 0.3s ease-out',
      }}
    >
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <IllustrationScene mode={mode} timeOfDay={timeOfDay} />
        </Canvas>
      </div>

      {/* DOM Overlay - Magazine UI */}
      <MagazineCoverOverlay mode={mode} onToggleMode={onToggleMode} timeOfDay={timeOfDay} />
    </section>
  );
};

export default HeroSection;
