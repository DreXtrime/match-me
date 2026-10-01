import { useEffect, useRef } from 'react';

/**
 * Subtle mouse parallax on a background-position.
 * Attach the returned ref to any element that has a background-image.
 * The dot grid will drift slightly as the mouse moves — barely noticeable
 * but adds a layer of craft.
 */
export function useNavParallax() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!el) return;
        const { innerWidth, innerHeight } = window;
        // normalise to -1 → +1
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;
        // shift the dot grid by at most ±6px
        el.style.backgroundPosition = `${x * -6}px ${y * -6}px`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
