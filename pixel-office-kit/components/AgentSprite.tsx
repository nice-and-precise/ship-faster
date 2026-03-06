import React from 'react';

export type AgentStatus = 'idle' | 'running' | 'error' | 'completed';
export type CharacterType = 'mario' | 'luigi' | 'toad' | 'peach' | 'yoshi';

interface AgentSpriteProps {
  x: number;
  y: number;
  name: string;
  status: AgentStatus;
  characterType: CharacterType;
}

const SPRITE_PATHS: Record<CharacterType, string> = {
  mario: '/sprites/mario/mario-stand.png',
  luigi: '/sprites/luigi/luigi-stand.png',
  toad: '/sprites/toad/toad-stand.png',
  peach: '/sprites/peach/peach-stand.png',
  yoshi: '/sprites/mario/mario-stand.png', // fallback
};

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: '#7dff90',
  running: '#ffdb4d',
  error: '#ff4d4d',
  completed: '#33ff33',
};

export function AgentSprite({ x, y, name, status, characterType }: AgentSpriteProps) {
  const spritePath = SPRITE_PATHS[characterType] || SPRITE_PATHS.mario;
  const statusColor = STATUS_COLORS[status];
  
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px',
        color: '#fff',
        textShadow: '1px 1px 0 #000',
        zIndex: 100,
      }}
    >
      <img
        src={spritePath}
        alt={characterType}
        width={32}
        height={32}
        style={{
          imageRendering: 'pixelated',
          border: `2px solid ${statusColor}`,
          borderRadius: '4px',
          backgroundColor: '#000',
        }}
      />
      <div style={{ 
        marginTop: '4px', 
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '2px 4px',
        borderRadius: '2px',
        maxWidth: '60px',
        textAlign: 'center',
        wordWrap: 'break-word',
      }}>
        {name}
      </div>
      <div style={{ 
        fontSize: '6px', 
        color: statusColor,
        marginTop: '2px',
        textTransform: 'uppercase',
      }}>
        {status}
      </div>
    </div>
  );
}

export default AgentSprite;

