import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import IllustrationScene from './Scene';
import MagazineCoverOverlay from './MagazineCoverOverlay';
import { AnimationState } from '../types';

interface HeroSectionProps {
  mode: AnimationState;
  onToggleMode: () => void;
}

// 모바일 감지 훅
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const HeroSection: React.FC<HeroSectionProps> = ({ mode, onToggleMode }) => {
  const [offsetY, setOffsetY] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState(0); // 0 = 낮, 1 = 밤
  const isMobile = useIsMobile();
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // RAF 쓰로틀링이 적용된 스크롤 핸들러
    const handleScroll = () => {
      lastScrollY.current = window.scrollY;

      if (rafRef.current !== null) return; // 이미 RAF가 예약되어 있으면 스킵

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = lastScrollY.current;
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

        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // 모바일/데스크톱에 따른 DPR 설정
  const dprRange: [number, number] = useMemo(() => {
    if (isMobile) {
      return [1, 1.5]; // 모바일: 낮은 해상도
    }
    return [1, 2]; // 데스크톱: 높은 해상도
  }, [isMobile]);

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
        <Canvas
          shadows={!isMobile} // 모바일에서 그림자 비활성화
          dpr={dprRange}
          gl={{
            antialias: !isMobile, // 모바일에서 안티앨리어싱 비활성화
            powerPreference: isMobile ? 'low-power' : 'high-performance',
          }}
          performance={{ min: 0.5 }} // 성능 저하 시 자동 품질 감소
        >
          <IllustrationScene mode={mode} timeOfDay={timeOfDay} />
        </Canvas>
      </div>

      {/* DOM Overlay - Magazine UI */}
      <MagazineCoverOverlay mode={mode} onToggleMode={onToggleMode} timeOfDay={timeOfDay} />
    </section>
  );
};

export default HeroSection;
