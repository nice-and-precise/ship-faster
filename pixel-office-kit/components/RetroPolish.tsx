import React from 'react';

/**
 * --- PIXEL OFFICE HUD ---
 * A top-of-screen status bar that repurposes the classic Nintendo layout.
 */

interface HUDProps {
  tasksCount: number;      // "USER" Score
  tokenBudget: number;     // "COINS" Count
  roomName: string;        // "WORLD" Label
  uptime: number;          // "TIME" Counter
}

export const PixelOfficeHUD: React.FC<HUDProps> = ({ 
  tasksCount = 0, 
  tokenBudget = 0, 
  roomName = '1-1 OFFICE', 
  uptime = 400 
}) => {
  // Helper to pad numbers (e.g., 000450)
  const pad = (num: number, size: number) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  return (
    <div className="pixel-office-hud" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      padding: '10px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      fontFamily: "'Press Start 2P', monospace",
      color: '#fff',
      zIndex: 1000,
      textShadow: '2px 2px #000',
      pointerEvents: 'none', // Allow clicks to pass through
    }}>
      {/* 1. Tasks Completed (User Score) */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>USER</div>
        <div style={{ fontSize: '12px' }}>{pad(tasksCount, 6)}</div>
      </div>

      {/* 2. Tokens Used (Coin Count) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div className="coin-icon" style={{
          width: '10px',
          height: '12px',
          backgroundColor: '#ffdb4d',
          border: '1px solid #000',
          boxShadow: '1px 1px 0 #000',
          animation: 'blink 2s infinite'
        }} />
        <div style={{ fontSize: '12px' }}>x{pad(tokenBudget, 2)}</div>
      </div>

      {/* 3. Room Location (World) */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>ROOM</div>
        <div style={{ fontSize: '12px' }}>{roomName.toUpperCase()}</div>
      </div>

      {/* 4. Session Time (Countdown/Uptime) */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>TIME</div>
        <div style={{ fontSize: '12px' }}>{pad(uptime, 3)}</div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { filter: brightness(1.2); }
          50% { filter: brightness(0.8); }
        }
      `}</style>
    </div>
  );
};

/**
 * --- CRT OVERLAY ---
 * A low-code visual filter that adds scanlines, vignette, and screen curvature.
 */

export const CRTOverlay: React.FC = () => {
  return (
    <div className="crt-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* 1. Scanlines Filter */}
      <div className="scanlines" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 4px, 3px 100%',
        opacity: 0.15
      }} />

      {/* 2. Vignette & Curvature Mask */}
      <div className="vignette" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
      }} />

      {/* 3. Screen Flicker Animation */}
      <style>{`
        .crt-container::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: rgba(18, 16, 16, 0.1);
          opacity: 0;
          z-index: 2;
          pointer-events: none;
          animation: flicker 2s infinite;
        }

        @keyframes flicker {
          0% { opacity: 0.27861; }
          5% { opacity: 0.34769; }
          10% { opacity: 0.23604; }
          15% { opacity: 0.90626; }
          20% { opacity: 0.18128; }
          25% { opacity: 0.83891; }
          30% { opacity: 0.65583; }
          35% { opacity: 0.57807; }
          40% { opacity: 0.26559; }
          45% { opacity: 0.84693; }
          50% { opacity: 0.96019; }
          55% { opacity: 0.08594; }
          60% { opacity: 0.20313; }
          65% { opacity: 0.41988; }
          70% { opacity: 0.53455; }
          75% { opacity: 0.37288; }
          80% { opacity: 0.71428; }
          85% { opacity: 0.70419; }
          90% { opacity: 0.7003; }
          95% { opacity: 0.36108; }
          100% { opacity: 0.24387; }
        }

        @media (prefers-reduced-motion: reduce) {
          .crt-container::before { animation: none; opacity: 0.02; }
        }
      `}</style>
    </div>
  );
};
