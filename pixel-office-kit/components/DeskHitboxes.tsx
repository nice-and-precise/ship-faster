import { type MouseEvent } from 'react';
import { deskHitboxStyle, type CanvasMetrics, type DeskPosition } from '@/lib/tile-metrics';

type OccupiedDeskAgent = {
  name: string;
  status?: string;
};

type DeskHitboxesProps = {
  deskPositions: DeskPosition[];
  occupiedDeskKeys: Map<string, OccupiedDeskAgent>;
  metrics: CanvasMetrics;
  onHoverText: (text: string, event: MouseEvent<HTMLButtonElement>) => void;
  onHoverEnd: () => void;
  onDeskClick: (desk: DeskPosition) => void;
};

export default function DeskHitboxes({
  deskPositions,
  occupiedDeskKeys,
  metrics,
  onHoverText,
  onHoverEnd,
  onDeskClick,
}: DeskHitboxesProps) {
  return (
    <>
      {deskPositions.map((desk) => {
        const key = `${desk.x},${desk.y}`;
        const isOccupied = occupiedDeskKeys.has(key);
        const hitbox = deskHitboxStyle(metrics, desk);
        const tooltipText = isOccupied
          ? `${occupiedDeskKeys.get(key)!.name} [${occupiedDeskKeys.get(key)!.status || 'IDLE'}]`
          : 'Vacant desk';

        return (
          <button
            key={key}
            type="button"
            aria-label={isOccupied ? `View agent at ${key}` : `Vacant desk at ${key}`}
            className="nes-btn"
            onMouseEnter={(event) => onHoverText(tooltipText, event)}
            onMouseMove={(event) => onHoverText(tooltipText, event)}
            onMouseLeave={onHoverEnd}
            onClick={() => onDeskClick(desk)}
            style={{
              position: 'absolute',
              left: hitbox.left,
              top: hitbox.top,
              width: hitbox.width,
              height: hitbox.height,
              opacity: 0,
              cursor: isOccupied ? 'help' : 'default',
              pointerEvents: 'auto',
            }}
          />
        );
      })}
    </>
  );
}
