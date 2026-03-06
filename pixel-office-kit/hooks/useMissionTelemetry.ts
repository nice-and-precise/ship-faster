import { useEffect, useState } from 'react';

import { projectMissionEvents, type MissionEvent } from '@/lib/event-mapping';

type JsonRecord = Record<string, unknown>;

export type MissionRun = {
  id: string;
  name: string;
  status: string;
};

type UseMissionTelemetryOptions = {
  eventsUrl: string;
  streamUrl: string;
  pollMs: number;
  asArray: (value: unknown) => unknown[];
  latestEventTimestampMs: (events: MissionEvent[]) => number | null;
};

export function useMissionTelemetry(options: UseMissionTelemetryOptions) {
  const { eventsUrl, streamUrl, pollMs, asArray, latestEventTimestampMs } = options;

  const [runs, setRuns] = useState<MissionRun[]>([]);
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [activeTrackRuns, setActiveTrackRuns] = useState(() => [] as ReturnType<typeof projectMissionEvents>['activeRuns']);
  const [idleTrackRuns, setIdleTrackRuns] = useState(() => [] as ReturnType<typeof projectMissionEvents>['idleRuns']);
  const [error, setError] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [fallbackPollingActive, setFallbackPollingActive] = useState(false);
  const [lastSuccessfulDataAtMs, setLastSuccessfulDataAtMs] = useState<number | null>(null);
  const [lastSuccessfulPollAtMs, setLastSuccessfulPollAtMs] = useState<number | null>(null);
  const [latestEventAtMs, setLatestEventAtMs] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let sseLive = false;

    const applyProjection = (events: MissionEvent[]) => {
      const projection = projectMissionEvents(events);
      if (!active) return;
      setEvents(events.slice(-200));
      setRuns(projection.runs);
      setActiveTrackRuns(projection.activeRuns);
      setIdleTrackRuns(projection.idleRuns);
    };

    const syncFreshness = (events: MissionEvent[]) => {
      const latest = latestEventTimestampMs(events);
      setLatestEventAtMs(latest);
    };

    const bootstrap = async (origin: 'bootstrap' | 'stream' | 'poll') => {
      try {
        const response = await fetch(eventsUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Events failed (${response.status})`);
        const json = await response.json();
        const events = asArray(json) as MissionEvent[];
        applyProjection(events);
        syncFreshness(events);
        const now = Date.now();
        setLastSuccessfulDataAtMs(now);
        if (origin === 'poll') setLastSuccessfulPollAtMs(now);
        setError(null);
      } catch {
        if (active) {
          setError('Mission Control events offline');
        }
      }
    };

    const stopFallbackPolling = () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      setFallbackPollingActive(false);
    };

    const runFallbackPoll = async () => {
      if (!active || sseLive) return;
      setFallbackPollingActive(true);
      await bootstrap('poll');
      if (active && !sseLive) {
        fallbackTimer = setTimeout(runFallbackPoll, pollMs);
      }
    };

    const connectStream = () => {
      source?.close();
      source = new EventSource(streamUrl);

      source.onopen = () => {
        if (!active) return;
        sseLive = true;
        setSseConnected(true);
        stopFallbackPolling();
      };

      source.onmessage = async () => {
        await bootstrap('stream');
      };

      source.onerror = () => {
        source?.close();
        if (active) {
          sseLive = false;
          setSseConnected(false);
          setFallbackPollingActive(true);
          void runFallbackPoll();
          reconnectTimer = setTimeout(connectStream, pollMs);
        }
      };
    };

    void bootstrap('bootstrap');
    connectStream();

    return () => {
      active = false;
      source?.close();
      setSseConnected(false);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [asArray, eventsUrl, latestEventTimestampMs, pollMs, streamUrl]);

  return {
    runs,
    events,
    activeTrackRuns,
    idleTrackRuns,
    error,
    sseConnected,
    fallbackPollingActive,
    lastSuccessfulDataAtMs,
    lastSuccessfulPollAtMs,
    latestEventAtMs,
  };
}

export function telemetryAsArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const maybe = value as JsonRecord;
    if (Array.isArray(maybe.runs)) return maybe.runs;
    if (Array.isArray(maybe.data)) return maybe.data;
    if (Array.isArray(maybe.items)) return maybe.items;
  }
  return [];
}
