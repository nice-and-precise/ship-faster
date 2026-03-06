export type TelemetryMode = 'LIVE' | 'DEGRADED' | 'OFFLINE';

export type TelemetryInputs = {
  nowMs: number;
  sseConnected: boolean;
  fallbackPollingActive: boolean;
  lastSuccessfulDataAtMs: number | null;
  lastSuccessfulPollAtMs: number | null;
  latestEventAtMs: number | null;
  staleAfterMs: number;
  offlineAfterMs: number;
};

export function latestEventTimestampMs(events: Array<{ occurred_at?: string }>): number | null {
  let latest: number | null = null;

  for (const event of events) {
    const raw = event.occurred_at;
    if (!raw) continue;
    const parsed = Date.parse(raw);
    if (Number.isNaN(parsed)) continue;
    if (latest === null || parsed > latest) latest = parsed;
  }

  return latest;
}

export function deriveTelemetryMode(inputs: TelemetryInputs): TelemetryMode {
  const {
    nowMs,
    sseConnected,
    fallbackPollingActive,
    lastSuccessfulDataAtMs,
    lastSuccessfulPollAtMs,
    latestEventAtMs,
    staleAfterMs,
    offlineAfterMs,
  } = inputs;

  const lastPathSuccessAtMs = Math.max(lastSuccessfulDataAtMs ?? 0, lastSuccessfulPollAtMs ?? 0) || null;
  if (lastPathSuccessAtMs === null) return 'OFFLINE';

  if (nowMs - lastPathSuccessAtMs > offlineAfterMs) return 'OFFLINE';

  const freshnessAnchorMs = latestEventAtMs ?? lastSuccessfulPollAtMs ?? lastPathSuccessAtMs;
  const isFresh = nowMs - freshnessAnchorMs <= staleAfterMs;

  if (sseConnected && isFresh && !fallbackPollingActive) return 'LIVE';
  return 'DEGRADED';
}
