import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCanvasMetrics, deskHitboxStyle } from './tile-metrics.ts';

test('computeCanvasMetrics applies frame offset, border, and scale', () => {
  const metrics = computeCanvasMetrics({
    frameRect: { left: 100, top: 200 },
    canvasRect: { left: 124, top: 236 },
    borderLeftWidth: 2,
    borderTopWidth: 3,
    canvasClientWidth: 768,
    mapPixelWidth: 256,
  });

  assert.deepEqual(metrics, {
    left: 26,
    top: 39,
    scale: 3,
  });
});

test('deskHitboxStyle returns rounded pixel coordinates with minimum 16px size', () => {
  const style = deskHitboxStyle(
    {
      left: 10,
      top: 20,
      scale: 0.5,
    },
    { x: 11, y: 7 },
  );

  assert.deepEqual(style, {
    left: 16,
    top: 24,
    width: 16,
    height: 16,
  });
});
