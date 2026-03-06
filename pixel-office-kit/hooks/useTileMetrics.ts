import { useEffect, useState, type RefObject } from 'react';

import { computeCanvasMetrics, type CanvasMetrics } from '@/lib/tile-metrics';

type UseTileMetricsOptions = {
  mapFrameRef: RefObject<HTMLDivElement | null>;
  mapPixelWidth: number;
  dependencies?: unknown[];
};

export function useTileMetrics({ mapFrameRef, mapPixelWidth, dependencies = [] }: UseTileMetricsOptions) {
  const [metrics, setMetrics] = useState<CanvasMetrics>({ left: 0, top: 0, scale: 3 });

  useEffect(() => {
    const update = () => {
      const frame = mapFrameRef.current;
      if (!frame) return;
      const canvas = frame.querySelector('canvas');
      if (!canvas) return;

      const frameRect = frame.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      const borderLeft = parseFloat(style.borderLeftWidth) || 0;
      const borderTop = parseFloat(style.borderTopWidth) || 0;

      setMetrics(
        computeCanvasMetrics({
          frameRect,
          canvasRect,
          borderLeftWidth: borderLeft,
          borderTopWidth: borderTop,
          canvasClientWidth: canvas.clientWidth,
          mapPixelWidth,
        }),
      );
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [mapFrameRef, mapPixelWidth, ...dependencies]);

  return metrics;
}
