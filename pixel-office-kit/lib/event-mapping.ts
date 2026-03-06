import type { PipelineRun } from '@/components/MarioKartTrack';

type JsonRecord = Record<string, unknown>;

export type MissionEvent = {
  event_id?: string;
  event_type?: string;
  occurred_at?: string;
  correlation?: {
    run_id?: string | null;
    stage_id?: string | null;
  };
  payload?: JsonRecord;
};

type EnvelopeState =
  | 'AT_MAINFRAME'
  | 'IN_TRANSIT_MAINFRAME_TO_CRUSTY'
  | 'AT_CRUSTY'
  | 'IN_TRANSIT_CRUSTY_TO_SCOUT'
  | 'AT_SCOUT'
  | 'IN_TRANSIT_CRUSTY_TO_QA'
  | 'AT_QA'
  | 'IN_TRANSIT_TO_FILING_CABINET'
  | 'AT_FILING_CABINET'
  | 'FAILED_AT_CRUSTY';

type RunEnvelope = {
  id: string;
  name: string;
  state: EnvelopeState;
  transition?: string;
  stageId?: string;
  qaResult?: 'pass' | 'fail';
  filedCount: number;
  terminalLock: boolean;
};

export type EventProjection = {
  activeRuns: PipelineRun[];
  idleRuns: PipelineRun[];
  runs: { id: string; name: string; status: string }[];
};

const SCOUT_STAGES = new Set([
  'generate',
  'prepare_config',
  'capture_target_screenshot',
  'capture_competitor_screenshot',
  'run_audit',
  'generate_pdf',
]);

const TERMINAL_TRANSITIONS = new Set(['failed', 'timed_out', 'canceled']);

function asRecord(value: unknown): JsonRecord {
  if (value && typeof value === 'object') return value as JsonRecord;
  return {};
}

function readString(record: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return null;
}

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  const palette = ['#ff4d4d', '#47d16f', '#4da3ff', '#f8d24b', '#c16bff'];
  return palette[Math.abs(hash) % palette.length]!;
}

function getRunId(event: MissionEvent): string | null {
  const payload = asRecord(event.payload);
  const correlation = asRecord(event.correlation);
  return readString(correlation, ['run_id']) ?? readString(payload, ['run_id']);
}

function getStageId(event: MissionEvent): string | null {
  const payload = asRecord(event.payload);
  const correlation = asRecord(event.correlation);
  return readString(payload, ['stage_id']) ?? readString(correlation, ['stage_id']);
}

function getRunTransition(event: MissionEvent): string | null {
  const payload = asRecord(event.payload);
  const raw = readString(payload, ['transition', 'state', 'status']);
  return raw ? raw.toLowerCase() : null;
}

function getTrackStageLabel(envelope: RunEnvelope): string {
  const qaSuffix = envelope.qaResult === 'fail' ? ' • QA FAIL' : '';

  if (envelope.transition === 'failed') return `FAILED_AT_CRUSTY • CRUSTY crash${qaSuffix}`;
  if (envelope.transition === 'timed_out') return `FAILED_AT_CRUSTY • CRUSTY timeout${qaSuffix}`;
  if (envelope.transition === 'canceled') return `AT_CRUSTY • run canceled${qaSuffix}`;

  switch (envelope.state) {
    case 'AT_MAINFRAME':
      return `AT_MAINFRAME • MAINFRAME queue${qaSuffix}`;
    case 'IN_TRANSIT_MAINFRAME_TO_CRUSTY':
      return `IN_TRANSIT_MAINFRAME_TO_CRUSTY • MAINFRAME → CRUSTY lane${qaSuffix}`;
    case 'AT_CRUSTY':
      return `AT_CRUSTY • waiting at CRUSTY${qaSuffix}`;
    case 'IN_TRANSIT_CRUSTY_TO_SCOUT':
      return `IN_TRANSIT_CRUSTY_TO_SCOUT • CRUSTY → SCOUT lane${qaSuffix}`;
    case 'AT_SCOUT':
      return `AT_SCOUT • CRUSTY → SCOUT lane${qaSuffix}`;
    case 'IN_TRANSIT_CRUSTY_TO_QA':
      return `IN_TRANSIT_CRUSTY_TO_QA • QA gate${qaSuffix}`;
    case 'AT_QA':
      return `AT_QA • QA gate${qaSuffix}`;
    case 'IN_TRANSIT_TO_FILING_CABINET':
      return `IN_TRANSIT_TO_FILING_CABINET • filing lane${qaSuffix}`;
    case 'AT_FILING_CABINET':
      return `AT_FILING_CABINET • Filing Cabinet terminal${qaSuffix}`;
    case 'FAILED_AT_CRUSTY':
      return `FAILED_AT_CRUSTY • CRUSTY terminal${qaSuffix}`;
    default:
      return `${envelope.state}${qaSuffix}`;
  }
}

function toPipelineRun(envelope: RunEnvelope): PipelineRun {
  const speed = envelope.state.startsWith('IN_TRANSIT') ? 0.8 : envelope.state === 'AT_SCOUT' ? 0.62 : 0.5;
  return {
    id: envelope.id,
    name: envelope.name,
    stage: getTrackStageLabel(envelope),
    speed,
    color: envelope.qaResult === 'fail' ? '#ff7a7a' : hashColor(envelope.id),
  };
}

function toStatus(envelope: RunEnvelope): string {
  if (envelope.state === 'FAILED_AT_CRUSTY' || envelope.transition === 'failed' || envelope.transition === 'timed_out') {
    return 'failed';
  }
  if (envelope.transition === 'canceled') return 'canceled';
  if (envelope.state === 'AT_FILING_CABINET' || envelope.transition === 'completed') return 'completed';
  if (envelope.state === 'AT_MAINFRAME') return 'queued';
  return 'running';
}

export function projectMissionEvents(events: MissionEvent[]): EventProjection {
  const envelopes = new Map<string, RunEnvelope>();

  for (const event of events) {
    const eventType = (event.event_type ?? '').toLowerCase();
    const runId = getRunId(event);
    if (!runId) continue;

    const existing =
      envelopes.get(runId) ??
      ({
        id: runId,
        name: runId,
        state: 'AT_MAINFRAME',
        filedCount: 0,
        terminalLock: false,
      } as RunEnvelope);

    if (eventType === 'run.lifecycle') {
      const transition = getRunTransition(event);
      if (!transition) {
        envelopes.set(runId, existing);
        continue;
      }

      if (transition === 'queued') {
        existing.state = 'IN_TRANSIT_MAINFRAME_TO_CRUSTY';
      } else if (transition === 'started' || transition === 'resumed' || transition === 'paused') {
        existing.state = 'AT_CRUSTY';
        existing.terminalLock = false;
      } else if (transition === 'failed' || transition === 'timed_out') {
        existing.state = 'FAILED_AT_CRUSTY';
        existing.terminalLock = true;
      } else if (transition === 'canceled') {
        existing.state = 'AT_CRUSTY';
        existing.terminalLock = true;
      } else if (transition === 'completed') {
        existing.state = existing.state === 'AT_MAINFRAME' ? 'AT_CRUSTY' : existing.state;
      }

      existing.transition = transition;
      existing.name = existing.name || runId;
    }

    if (eventType === 'stage.lifecycle') {
      const stageId = (getStageId(event) ?? '').toLowerCase();
      const auditEvent = readString(asRecord(event.payload), ['audit_event'])?.toLowerCase();
      if (!existing.terminalLock && (SCOUT_STAGES.has(stageId) || auditEvent === 'action.requested')) {
        existing.stageId = stageId || existing.stageId;
        existing.state = 'IN_TRANSIT_CRUSTY_TO_SCOUT';
      }
    }

    if (eventType === 'qa.gate.result') {
      if (!existing.terminalLock) {
        existing.state = 'IN_TRANSIT_CRUSTY_TO_QA';
      }
      const result = readString(asRecord(event.payload), ['result'])?.toLowerCase();
      if (result === 'pass' || result === 'fail') existing.qaResult = result;
    }

    if (eventType === 'artifact.produced') {
      existing.filedCount += 1;
      existing.state = 'IN_TRANSIT_TO_FILING_CABINET';
      existing.terminalLock = false;
    }

    if (existing.state === 'IN_TRANSIT_MAINFRAME_TO_CRUSTY') existing.state = 'AT_CRUSTY';
    if (existing.state === 'IN_TRANSIT_CRUSTY_TO_SCOUT') existing.state = 'AT_SCOUT';
    if (existing.state === 'IN_TRANSIT_CRUSTY_TO_QA') existing.state = 'AT_QA';
    if (existing.state === 'IN_TRANSIT_TO_FILING_CABINET') existing.state = 'AT_FILING_CABINET';

    if (TERMINAL_TRANSITIONS.has(existing.transition ?? '') && !['started', 'resumed'].includes(getRunTransition(event) ?? '')) {
      existing.terminalLock = true;
    }

    envelopes.set(runId, existing);
  }

  const allRuns = [...envelopes.values()];

  const activeRuns = allRuns
    .filter((run) => ['AT_CRUSTY', 'AT_SCOUT', 'AT_QA'].includes(run.state) && !run.terminalLock)
    .map(toPipelineRun);

  const idleRuns = allRuns
    .filter((run) => !activeRuns.some((active) => active.id === run.id))
    .map(toPipelineRun);

  const runs = allRuns.map((run) => ({ id: run.id, name: run.name, status: toStatus(run) }));

  return { activeRuns, idleRuns, runs };
}
