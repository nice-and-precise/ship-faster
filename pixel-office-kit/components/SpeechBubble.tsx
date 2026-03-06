import type { ReactNode } from 'react';

type SpeechBubbleProps = {
  x: number;
  y: number;
  children: ReactNode;
  align?: 'left' | 'right';
  color?: string;
  borderColor?: string;
  textColor?: string;
  maxWidth?: number;
};

export default function SpeechBubble({
  x,
  y,
  children,
  align = 'left',
  color = '#fff8dc',
  borderColor = '#111',
  textColor = '#111',
  maxWidth = 180,
}: SpeechBubbleProps) {
  const isLeft = align === 'left';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${isLeft ? '-4px' : '-96%'}, -110%)`,
        pointerEvents: 'none',
        zIndex: 145,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '7px',
        lineHeight: 1.55,
        color: textColor,
        background: color,
        border: `2px solid ${borderColor}`,
        boxShadow: `2px 2px 0 ${borderColor}`,
        padding: '5px 7px',
        maxWidth,
        whiteSpace: 'normal',
      }}
      role="note"
      aria-label="Agent speech"
    >
      {children}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          bottom: -8,
          left: isLeft ? 10 : 'auto',
          right: isLeft ? 'auto' : 10,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${borderColor}`,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          bottom: -6,
          left: isLeft ? 11 : 'auto',
          right: isLeft ? 'auto' : 11,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `7px solid ${color}`,
        }}
      />
    </div>
  );
}
