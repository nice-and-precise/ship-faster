'use client';

import { useEffect, useRef, useState } from 'react';

type EnvelopeSpriteProps = {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete: (id: string) => void;
  durationMs?: number;
};

export default function EnvelopeSprite({
  id,
  startX,
  startY,
  endX,
  endY,
  onComplete,
  durationMs = 1500,
}: EnvelopeSpriteProps) {
  const [launched, setLaunched] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setLaunched(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onComplete(id);
    }, durationMs + 100);

    return () => window.clearTimeout(timer);
  }, [durationMs, id, onComplete]);

  return (
    <div
      className={`envelope-sprite ${launched ? 'is-flying' : ''}`}
      style={{
        left: startX,
        top: startY,
        transform: launched
          ? `translate(${endX - startX}px, ${endY - startY}px)`
          : 'translate(0px, 0px)',
        transitionDuration: `${durationMs}ms`,
      }}
      onTransitionEnd={() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        onComplete(id);
      }}
      aria-hidden
    >
      <span className="envelope-sprite__paper" />
      <span className="envelope-sprite__stamp" />
    </div>
  );
}
