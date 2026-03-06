export type DeskPosition = {
  x: number;
  y: number;
};

export type CanvasMetrics = {
  left: number;
  top: number;
  scale: number;
};

export function computeCanvasMetrics(params: {
  frameRect: Pick<DOMRect, 'left' | 'top'>;
  canvasRect: Pick<DOMRect, 'left' | 'top'>;
  borderLeftWidth: number;
  borderTopWidth: number;
  canvasClientWidth: number;
  mapPixelWidth: number;
}): CanvasMetrics {
  const scale = params.canvasClientWidth / params.mapPixelWidth || 1;

  return {
    left: params.canvasRect.left - params.frameRect.left + params.borderLeftWidth,
    top: params.canvasRect.top - params.frameRect.top + params.borderTopWidth,
    scale,
  };
}

export function deskHitboxStyle(metrics: CanvasMetrics, desk: DeskPosition) {
  const size = Math.max(16, 16 * metrics.scale);

  return {
    left: Math.round(metrics.left + desk.x * metrics.scale),
    top: Math.round(metrics.top + desk.y * metrics.scale),
    width: Math.round(size),
    height: Math.round(size),
  };
}
