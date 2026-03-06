'use client';

import { useEffect, useMemo, useState } from 'react';

type LiveTickerProps = {
  events: string[];
};

export default function LiveTicker({ events }: LiveTickerProps) {
  const normalized = useMemo(() => (events.length ? events : ['SYSTEM: Standing by']), [events]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [normalized]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % normalized.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [normalized]);

  return (
    <div
      className="nes-container is-dark"
      style={{
        position: 'fixed',
        left: 10,
        right: 10,
        bottom: 10,
        zIndex: 240,
        padding: '8px 10px',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px',
        color: '#7dff90',
      }}
      aria-live="polite"
    >
      <span>{`[TACTICAL FEED] ${normalized[idx]}`}</span>
    </div>
  );
}
