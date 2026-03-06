import React, { useMemo } from 'react';

export type AgentStatus = 'idle' | 'running' | 'error' | 'completed';
export type CharacterType = 'mario' | 'luigi' | 'toad' | 'peach' | 'yoshi';

interface AgentSpriteProps {
  x: number;
  y: number;
  name: string;
  status: AgentStatus;
  characterType: CharacterType;
}

type PixelDef = { x: number; y: number; color: string };

type Palette = {
  skin: string;
  hat: string;
  shirt: string;
  overalls: string;
  hair: string;
  accent: string;
};

function buildMarioLikeSprite(p: Palette): PixelDef[] {
  return [
    // Hat
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 0, color: p.hat })),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((x) => ({ x, y: 1, color: p.hat })),

    // Face + hair
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 2, color: p.skin })),
    { x: 0, y: 2, color: p.hair },
    { x: 7, y: 2, color: p.hair },
    ...[2, 3, 4, 5].map((x) => ({ x, y: 3, color: p.skin })),
    { x: 1, y: 3, color: p.hair },
    { x: 6, y: 3, color: p.hair },

    // Shirt / overalls torso
    ...[1, 2, 5, 6].map((x) => ({ x, y: 4, color: p.shirt })),
    ...[3, 4].map((x) => ({ x, y: 4, color: p.overalls })),
    ...[0, 1, 6, 7].map((x) => ({ x, y: 5, color: p.shirt })),
    ...[2, 3, 4, 5].map((x) => ({ x, y: 5, color: p.overalls })),
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 6, color: p.overalls })),

    // Legs + shoes
    ...[2, 3, 4, 5].map((x) => ({ x, y: 7, color: p.overalls })),
    ...[2, 3].map((x) => ({ x, y: 8, color: p.hair })),
    ...[4, 5].map((x) => ({ x, y: 8, color: p.accent })),
    ...[2, 3, 4, 5].map((x) => ({ x, y: 9, color: p.hair })),
  ];
}

function buildToadSprite(): PixelDef[] {
  const red = '#e03b3b';
  const white = '#ffffff';
  const blue = '#2e57ff';
  const skin = '#f1c89b';
  const dark = '#2d1d12';

  return [
    // Mushroom cap
    ...[1, 2, 5, 6].map((x) => ({ x, y: 0, color: red })),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((x) => ({ x, y: 1, color: white })),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((x) => ({ x, y: 2, color: white })),
    ...[1, 2, 5, 6].map((x) => ({ x, y: 2, color: red })),

    // Face
    ...[2, 3, 4, 5].map((x) => ({ x, y: 3, color: skin })),
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 4, color: skin })),
    { x: 2, y: 4, color: dark },
    { x: 5, y: 4, color: dark },

    // Vest + body
    ...[1, 6].map((x) => ({ x, y: 5, color: blue })),
    ...[2, 3, 4, 5].map((x) => ({ x, y: 5, color: white })),
    ...[1, 2, 5, 6].map((x) => ({ x, y: 6, color: blue })),
    ...[3, 4].map((x) => ({ x, y: 6, color: white })),

    // Legs
    ...[2, 3, 4, 5].map((x) => ({ x, y: 7, color: dark })),
    ...[2, 3, 4, 5].map((x) => ({ x, y: 8, color: dark })),
  ];
}

function buildPeachSprite(): PixelDef[] {
  const hair = '#f2c14a';
  const skin = '#f7d0b0';
  const pink = '#ff6ea9';
  const pinkDark = '#e24f8c';
  const accent = '#5aa7ff';

  return [
    // Hair + crown
    ...[2, 3, 4, 5].map((x) => ({ x, y: 0, color: hair })),
    { x: 3, y: 0, color: accent },
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 1, color: hair })),

    // Face
    ...[2, 3, 4, 5].map((x) => ({ x, y: 2, color: skin })),
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 3, color: skin })),

    // Dress
    ...[2, 3, 4, 5].map((x) => ({ x, y: 4, color: pink })),
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 5, color: pink })),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((x) => ({ x, y: 6, color: pinkDark })),
    ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 7, color: pink })),

    // Feet
    ...[2, 3].map((x) => ({ x, y: 8, color: '#874f2f' })),
    ...[4, 5].map((x) => ({ x, y: 8, color: '#874f2f' })),
  ];
}

function getSpritePixels(characterType: CharacterType): PixelDef[] {
  if (characterType === 'toad') return buildToadSprite();
  if (characterType === 'peach') return buildPeachSprite();
  if (characterType === 'luigi') {
    return buildMarioLikeSprite({
      skin: '#f3c9a1',
      hat: '#2ea24f',
      shirt: '#2ea24f',
      overalls: '#2f53c9',
      hair: '#3c2418',
      accent: '#8ddf8a',
    });
  }
  if (characterType === 'yoshi') {
    return [
      ...[2, 3, 4, 5].map((x) => ({ x, y: 0, color: '#4bbf4f' })),
      ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 1, color: '#4bbf4f' })),
      ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 2, color: '#4bbf4f' })),
      ...[2, 3, 4, 5].map((x) => ({ x, y: 3, color: '#f2f5f2' })),
      ...[2, 3, 4, 5].map((x) => ({ x, y: 4, color: '#f2f5f2' })),
      ...[1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 5, color: '#4bbf4f' })),
      ...[2, 3, 4, 5].map((x) => ({ x, y: 6, color: '#c24848' })),
      ...[2, 3, 4, 5].map((x) => ({ x, y: 7, color: '#3a2a1a' })),
    ];
  }

  // Mario default
  return buildMarioLikeSprite({
    skin: '#f3c9a1',
    hat: '#d33434',
    shirt: '#d33434',
    overalls: '#2f53c9',
    hair: '#3c2418',
    accent: '#f2d16c',
  });
}

export const AgentSprite: React.FC<AgentSpriteProps> = ({ x, y, name, status, characterType }) => {
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'running':
        return { label: 'running...', icon: '⚙️', bubbleClass: 'is-primary' };
      case 'error':
        return { label: 'ERROR!', icon: '❗', bubbleClass: 'is-error' };
      case 'completed':
        return { label: 'done!', icon: '✅', bubbleClass: 'is-success' };
      case 'idle':
      default:
        return { label: 'idle', icon: '💤', bubbleClass: '' };
    }
  }, [status]);

  const pixels = useMemo(() => getSpritePixels(characterType), [characterType]);

  return (
    <div
      className={`pixel-agent-container ${status === 'running' ? 'is-running' : ''}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transition: 'all 0.4s steps(4, end)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 100,
        width: '32px',
        height: '32px',
      }}
    >
      <div
        className={`status-bubble nes-balloon from-left ${statusConfig.bubbleClass}`}
        style={{
          position: 'absolute',
          bottom: '100%',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          padding: '4px 6px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '6px',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          animation: 'bubble-bob 2s infinite ease-in-out',
        }}
      >
        <span>{statusConfig.icon}</span>
        <span>{statusConfig.label}</span>
      </div>

      {status === 'running' && <div className="run-indicator">!</div>}

      <div className="agent-sprite-body" style={{ width: '24px', height: '24px' }}>
        <svg width="24" height="24" viewBox="0 0 8 10" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
          {pixels.map((pixel, index) => (
            <rect key={`${pixel.x}-${pixel.y}-${index}`} x={pixel.x} y={pixel.y} width="1" height="1" fill={pixel.color} />
          ))}
        </svg>
      </div>

      <div
        className="agent-nameplate"
        style={{
          marginTop: '2px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '5px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '1px 4px',
          borderRadius: '2px',
          textAlign: 'center',
        }}
      >
        {name}
      </div>

      <style>{`
        @keyframes bubble-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes run-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        @keyframes alert-pop {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.08); }
        }

        .pixel-agent-container {
          filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3));
        }

        .pixel-agent-container.is-running .agent-sprite-body {
          animation: run-bob 0.45s steps(2, end) infinite;
        }

        .run-indicator {
          position: absolute;
          top: -7px;
          right: -3px;
          width: 10px;
          height: 10px;
          display: grid;
          place-items: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          line-height: 1;
          color: #111;
          background: #ffec7a;
          border: 1px solid #111;
          box-shadow: 1px 1px 0 #111;
          animation: alert-pop 0.7s steps(2, end) infinite;
        }
      `}</style>
    </div>
  );
};

export default AgentSprite;
