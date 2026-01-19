import { useState, useEffect, useRef, useCallback } from 'react';

export interface ScrollProgress {
  // 히어로가 위로 사라지는 진행률 (0 = 완전 노출, 1 = 완전 숨김)
  heroExit: number;
  // 매거진이 올라오는 진행률 (0 = 아직 아래, 1 = 완전히 덮음)
  magazineEntry: number;
  // 페이지 끝에서 히어로가 다시 나타나는 진행률 (0 = 숨김, 1 = 완전 노출)
  heroReveal: number;
  // 스크롤 방향
  direction: 'up' | 'down';
  // 현재 스크롤 중인지
  isScrolling: boolean;
  // 현재 스크롤 위치 (픽셀)
  scrollY: number;
}

// Easing function for smoother animations
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const useScrollProgress = (): ScrollProgress => {
  const [progress, setProgress] = useState<ScrollProgress>({
    heroExit: 0,
    magazineEntry: 0,
    heroReveal: 0,
    direction: 'down',
    isScrolling: false,
    scrollY: 0,
  });

  const prevScrollRef = useRef(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const rafRef = useRef<number>();

  const calculateProgress = useCallback(() => {
    const hero = document.querySelector('[data-hero]') as HTMLElement;
    const magazineWrapper = document.querySelector('[data-magazine-wrapper]') as HTMLElement;

    if (!hero) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const heroHeight = hero.offsetHeight;

    // 문서 전체 높이
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - viewportHeight;

    // === 1. Hero Exit Progress ===
    // 스크롤이 시작되면 바로 진행 시작
    // 히어로 높이의 70% 스크롤하면 완전히 덮임
    const heroExitStart = 0;
    const heroExitEnd = heroHeight * 0.7;
    const heroExitRaw = Math.max(0, Math.min(1,
      (scrollY - heroExitStart) / (heroExitEnd - heroExitStart)
    ));
    const heroExit = easeOutCubic(heroExitRaw);

    // === 2. Magazine Entry Progress ===
    // 약간의 딜레이 후 매거진이 올라오기 시작
    const magazineEntryStart = heroHeight * 0.1;
    const magazineEntryEnd = heroHeight * 0.8;
    const magazineEntryRaw = Math.max(0, Math.min(1,
      (scrollY - magazineEntryStart) / (magazineEntryEnd - magazineEntryStart)
    ));
    const magazineEntry = easeOutCubic(magazineEntryRaw);

    // === 3. Hero Reveal Progress (페이지 끝에서) ===
    // 마지막 100vh 구간에서 히어로가 다시 나타남
    const revealStart = maxScroll - viewportHeight;
    const revealEnd = maxScroll;
    const heroRevealRaw = Math.max(0, Math.min(1,
      (scrollY - revealStart) / (revealEnd - revealStart)
    ));
    const heroReveal = easeOutCubic(heroRevealRaw);

    // === 방향 감지 ===
    const direction = scrollY > prevScrollRef.current ? 'down' : 'up';
    prevScrollRef.current = scrollY;

    // === 스크롤 상태 업데이트 ===
    setProgress({
      heroExit,
      magazineEntry,
      heroReveal,
      direction,
      isScrolling: true,
      scrollY,
    });

    // 스크롤 종료 감지
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setProgress(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // RAF로 throttle
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(calculateProgress);
    };

    // 초기 계산
    calculateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [calculateProgress]);

  return progress;
};

export default useScrollProgress;
