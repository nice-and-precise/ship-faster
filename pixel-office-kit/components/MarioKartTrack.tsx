'use client';

import { useEffect, useMemo, useState, useRef } from 'react';

export interface PipelineRun {
  id: string;
  name: string;
  stage: string;
  speed?: number;
  color?: string;
}

interface MarioKartTrackProps {
  activeRuns?: PipelineRun[];
  idleRuns?: PipelineRun[];
}

const demoActiveRuns: PipelineRun[] = [
  { id: 'run-1', name: 'Crawler A', stage: 'Bypassing WAF', speed: 0.75, color: '#ff4d4d' },
  { id: 'run-2', name: 'Crawler B', stage: 'Extracting HTML', speed: 0.58, color: '#47d16f' },
];

const demoIdleRuns: PipelineRun[] = [
  { id: 'run-3', name: 'Crawler C', stage: 'Idle / Cooldown', color: '#f8d24b' },
];

function KartSprite({ color = '#ff4d4d' }: { color?: string }) {
  return (
    <svg viewBox="0 0 54 28" width={54} height={28} role="img" aria-label="pipeline kart">
      <rect x="2" y="10" width="50" height="9" rx="3" fill="#222" />
      <rect x="9" y="4" width="24" height="9" rx="2" fill={color} />
      <rect x="22" y="4" width="11" height="9" rx="2" fill="#ffffff" opacity="0.2" />
      <rect x="34" y="6" width="14" height="7" rx="2" fill="#b9c1c9" />
      <circle cx="13" cy="22" r="5" fill="#111" />
      <circle cx="13" cy="22" r="2" fill="#777" />
      <circle cx="40" cy="22" r="5" fill="#111" />
      <circle cx="40" cy="22" r="2" fill="#777" />
    </svg>
  );
}

export function MarioKartTrack({ activeRuns, idleRuns }: MarioKartTrackProps) {
  const [tick, setTick] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  // Fix 3: Pause Mario Kart when off-screen
  useEffect(() => {
    if (!trackRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => setTick((prev) => prev + 0.03), 50);
    return () => clearInterval(interval);
  }, [isVisible]);

  const racingRuns = activeRuns?.length ? activeRuns : demoActiveRuns;
  const parkedRuns = idleRuns?.length ? idleRuns : demoIdleRuns;

  const orbitPoints = useMemo(() => {
    const centerX = 420;
    const centerY = 250;
    const radiusX = 300;
    const radiusY = 160;

    return racingRuns.map((run, index) => {
      const speed = run.speed ?? 0.6;
      const baseAngle = (index / Math.max(racingRuns.length, 1)) * Math.PI * 2;
      const angle = tick * speed + baseAngle;
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      const rotation = (Math.atan2(Math.sin(angle) * radiusY, Math.cos(angle) * radiusX) * 180) / Math.PI;

      return { run, x, y, rotation };
    });
  }, [racingRuns, tick]);

  return (
    <section
      ref={trackRef}
      style={{
        width: '100%',
        minHeight: 560,
        borderRadius: 12,
        border: '4px solid #202124',
        background: 'linear-gradient(180deg, #2f8f46 0%, #226839 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: 16,
      }}
    >
      <div style={{ color: '#fff', fontSize: 12, marginBottom: 8, fontFamily: "'Press Start 2P', monospace" }}>
        WAR ROOM // MARIO KART PIPELINE TRACK
      </div>

      <div
        style={{
          position: 'relative',
          width: 860,
          maxWidth: '100%',
          height: 500,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '28px 170px 30px 24px',
            borderRadius: '50%',
            background: '#4f565e',
            boxShadow: 'inset 0 0 0 6px #2e3339, inset 0 0 0 24px #787f87',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '92px 238px 94px 92px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #2f8f46 0%, #24703b 100%)',
            border: '4px solid rgba(255,255,255,0.25)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: 16,
            top: 54,
            width: 140,
            height: 350,
            borderRadius: 8,
            background: '#7f868f',
            border: '4px solid #30343a',
            padding: 10,
          }}
        >
          <div style={{ color: '#f5f7fa', fontSize: 10, marginBottom: 8, fontFamily: "'Press Start 2P', monospace" }}>
            PIT LANE
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {parkedRuns.map((run) => (
              <div
                key={run.id}
                style={{
                  border: '2px dashed #23262a',
                  borderRadius: 6,
                  padding: '5px 6px',
                  background: '#a6adb7',
                }}
              >
                <KartSprite color={run.color} />
                <div style={{ fontSize: 10, color: '#111', marginTop: 3 }}>{run.name}</div>
                <div style={{ fontSize: 9, color: '#333' }}>{run.stage}</div>
              </div>
            ))}
          </div>
        </div>

        {orbitPoints.map(({ run, x, y, rotation }) => (
          <div
            key={run.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: -34,
                transform: 'translateX(-50%)',
                fontSize: 10,
                whiteSpace: 'nowrap',
                background: '#111827',
                border: '1px solid #fff',
                color: '#fff',
                borderRadius: 5,
                padding: '2px 6px',
              }}
            >
              {run.stage}
            </div>
            <KartSprite color={run.color} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default MarioKartTrack;
