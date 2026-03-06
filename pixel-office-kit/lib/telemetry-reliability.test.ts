import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveTelemetryMode, latestEventTimestampMs } from './telemetry-reliability.ts';

test('latestEventTimestampMs picks the newest parseable occurred_at', () => {
  const latest = latestEventTimestampMs([
    { occurred_at: '2026-03-05T18:00:00.000Z' },
    { occurred_at: 'invalid' },
    { occurred_at: '2026-03-05T18:00:04.000Z' },
  ]);

  assert.equal(latest, Date.parse('2026-03-05T18:00:04.000Z'));
});

test('deriveTelemetryMode returns LIVE only when sse is connected and data is fresh', () => {
  const mode = deriveTelemetryMode({
    nowMs: 10_000,
    sseConnected: true,
    fallbackPollingActive: false,
    lastSuccessfulDataAtMs: 9_000,
    lastSuccessfulPollAtMs: null,
    latestEventAtMs: 9_500,
    staleAfterMs: 5_000,
    offlineAfterMs: 30_000,
  });

  assert.equal(mode, 'LIVE');
});

test('deriveTelemetryMode returns DEGRADED when fallback poll is active', () => {
  const mode = deriveTelemetryMode({
    nowMs: 10_000,
    sseConnected: false,
    fallbackPollingActive: true,
    lastSuccessfulDataAtMs: 9_500,
    lastSuccessfulPollAtMs: 9_800,
    latestEventAtMs: 9_800,
    staleAfterMs: 5_000,
    offlineAfterMs: 30_000,
  });

  assert.equal(mode, 'DEGRADED');
});

test('deriveTelemetryMode returns DEGRADED when stream connected but events are stale', () => {
  const mode = deriveTelemetryMode({
    nowMs: 30_000,
    sseConnected: true,
    fallbackPollingActive: false,
    lastSuccessfulDataAtMs: 29_000,
    lastSuccessfulPollAtMs: null,
    latestEventAtMs: 10_000,
    staleAfterMs: 5_000,
    offlineAfterMs: 60_000,
  });

  assert.equal(mode, 'DEGRADED');
});

test('deriveTelemetryMode returns OFFLINE when there has never been a successful path', () => {
  const mode = deriveTelemetryMode({
    nowMs: 10_000,
    sseConnected: false,
    fallbackPollingActive: false,
    lastSuccessfulDataAtMs: null,
    lastSuccessfulPollAtMs: null,
    latestEventAtMs: null,
    staleAfterMs: 5_000,
    offlineAfterMs: 30_000,
  });

  assert.equal(mode, 'OFFLINE');
});

test('deriveTelemetryMode returns OFFLINE when success signal ages past offline threshold', () => {
  const mode = deriveTelemetryMode({
    nowMs: 100_000,
    sseConnected: false,
    fallbackPollingActive: true,
    lastSuccessfulDataAtMs: 50_000,
    lastSuccessfulPollAtMs: 50_000,
    latestEventAtMs: 50_000,
    staleAfterMs: 10_000,
    offlineAfterMs: 30_000,
  });

  assert.equal(mode, 'OFFLINE');
});
