'use client';

import { useEffect, useMemo, useState } from 'react';

type DummyJob = {
  id: string;
  label: string;
  intervalSec: number;
  offsetSec: number;
};

type CountdownState = {
  label: string;
  remainingSec: number;
};

const DUMMY_JOBS: DummyJob[] = [
  { id: 'scout', label: 'SCOUT DISPATCH', intervalSec: 5 * 60, offsetSec: 45 },
  { id: 'digest', label: 'WAR ROOM DIGEST', intervalSec: 12 * 60, offsetSec: 120 },
  { id: 'sweep', label: 'OUTPOST STATUS SWEEP', intervalSec: 20 * 60, offsetSec: 360 },
];

function pad2(v: number): string {
  return String(v).padStart(2, '0');
}

function formatClock(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function formatCalendar(date: Date): string {
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function formatCountdown(totalSec: number): string {
  const sec = Math.max(0, totalSec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function getNextCountdown(nowSec: number): CountdownState {
  const candidates = DUMMY_JOBS.map((job) => {
    const phase = (nowSec + job.offsetSec) % job.intervalSec;
    const remainingSec = (job.intervalSec - phase) % job.intervalSec;
    return { label: job.label, remainingSec };
  }).sort((a, b) => a.remainingSec - b.remainingSec);

  return candidates[0] ?? { label: 'NO JOB SCHEDULED', remainingSec: 0 };
}

export default function ChronoTracker() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => getNextCountdown(Math.floor(now.getTime() / 1000)), [now]);

  return (
    <aside
      className="nes-container is-dark"
      style={{
        position: 'fixed',
        top: 14,
        right: 14,
        zIndex: 280,
        width: 'min(420px, calc(100vw - 24px))',
        padding: '10px 12px',
        borderWidth: '3px',
        boxShadow: '3px 3px 0 #0b0b0b',
        fontFamily: "'Press Start 2P', monospace",
      }}
      aria-label="Chrono tracker"
    >
      <div style={{ display: 'grid', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            fontSize: '8px',
            color: '#9ad0ff',
          }}
        >
          <span>[CHRONO-TRACKER]</span>
          <span>{formatCalendar(now)}</span>
        </div>

        <div style={{ fontSize: '15px', letterSpacing: '1px', color: '#fffdf0' }}>{formatClock(now)}</div>

        <div style={{ fontSize: '8px', lineHeight: 1.6, color: '#7dff90' }}>
          {`[T-MINUS ${formatCountdown(countdown.remainingSec)}] ${countdown.label}`}
        </div>
      </div>
    </aside>
  );
}
