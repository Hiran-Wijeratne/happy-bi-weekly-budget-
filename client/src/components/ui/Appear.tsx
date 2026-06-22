'use client';

import { useEffect, useRef, useState } from 'react';

interface AppearProps {
  children:   React.ReactNode;
  delay?:     number;
  duration?:  number;
  direction?: 'up' | 'none';
  className?: string;
  style?:     React.CSSProperties;
}

export function Appear({
  children,
  delay     = 0,
  duration  = 500,
  direction = 'up',
  className = '',
  style     = {},
}: AppearProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let obs: IntersectionObserver | undefined;
    let id2: number;

    // Double-rAF: guarantees the browser paints the initial opacity:0 frame
    // before the observer can fire, so there is always something to animate from.
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setTriggered(true);
              obs?.disconnect();
            }
          },
          { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
        );
        obs.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
      obs?.disconnect();
    };
  }, []);

  // Before trigger: invisible via inline style.
  // After trigger: CSS animation takes over (animations beat inline styles),
  // fill-mode:both keeps the element visible after the animation ends.
  const animStyle: React.CSSProperties = triggered
    ? {
        animation: direction === 'up'
          ? `appear-up ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both`
          : `appear-up ${duration}ms ease-out ${delay}ms both`,
        ...style,
      }
    : { opacity: 0, ...style };

  return (
    <div ref={ref} className={className} style={animStyle}>
      {children}
    </div>
  );
}
