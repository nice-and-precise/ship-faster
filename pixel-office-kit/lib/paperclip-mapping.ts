import type { MissionEvent } from './event-mapping';

type JsonRecord = Record<string, unknown>;

export type PaperclipTaskState = 'PROPOSED' | 'APPROVED';
export type PaperclipRole = 'Toad' | 'Mario' | 'Luigi' | 'Peach';

export type PaperclipTask = {
  id: string;
  taskId: string;
  title: string;
  role: PaperclipRole;
  state: PaperclipTaskState;
  occurredAt: string | null;
};

export type PaperclipProjection = {
  hasPaperclipEvents: boolean;
  tasks: PaperclipTask[];
  proposedCount: number;
  approvedCount: number;
};

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

function toLower(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function getCorrelationValue(event: MissionEvent, keys: string[]): string | null {
  const correlation = asRecord(event.correlation);
  return readString(correlation, keys);
}

function getPayloadValue(event: MissionEvent, keys: string[]): string | null {
  const payload = asRecord(event.payload);
  return readString(payload, keys);
}

function isPaperclipApprovalEvent(event: MissionEvent): boolean {
  if ((event.event_type ?? '').toLowerCase() !== 'approval.lifecycle') return false;

  const source = toLower(event.source);
  const actor = toLower(event.actor);
  const payload = asRecord(event.payload);
  const paperclipEventType = toLower(readString(payload, ['paperclip_event_type']));
  const proposalStatus = toLower(readString(payload, ['proposal_status']));
  const stageId = toLower(getPayloadValue(event, ['stage_id']) ?? getCorrelationValue(event, ['stage_id']));
  const runId = toLower(getPayloadValue(event, ['run_id']) ?? getCorrelationValue(event, ['run_id']));

  return (
    source.includes('paperclip') ||
    actor.includes('paperclip') ||
    paperclipEventType.startsWith('task.') ||
    proposalStatus === 'proposed' ||
    stageId === 'paperclip.proposal' ||
    runId.startsWith('pc_run_')
  );
}

function toTaskState(event: MissionEvent): PaperclipTaskState | null {
  const payload = asRecord(event.payload);
  const payloadStatus = toLower(readString(payload, ['status', 'proposal_status']));
  const decision = toLower(readString(payload, ['decision']));
  const eventStatus = toLower(event.status);

  if (payloadStatus === 'approved' || decision === 'approved') return 'APPROVED';

  if (
    eventStatus === 'proposed' ||
    payloadStatus === 'pending' ||
    payloadStatus === 'proposed' ||
    decision === 'requested'
  ) {
    return 'PROPOSED';
  }

  return null;
}

function toRole(event: MissionEvent): PaperclipRole {
  const payload = asRecord(event.payload);
  const roleSignals = [
    toLower(readString(payload, ['agent_role'])),
    toLower(readString(payload, ['requested_by', 'reviewed_by'])),
    toLower(event.actor),
  ].join(' ');

  if (roleSignals.includes('qa') || roleSignals.includes('review')) return 'Luigi';
  if (roleSignals.includes('ops') || roleSignals.includes('strategy') || roleSignals.includes('ceo')) return 'Peach';
  if (roleSignals.includes('engineering_manager') || roleSignals.includes('engineering-manager') || roleSignals.includes(' em')) {
    return 'Mario';
  }
  if (roleSignals.includes('product_manager') || roleSignals.includes('product-manager') || roleSignals.includes(' pm')) {
    return 'Toad';
  }

  const paperclipEventType = toLower(readString(payload, ['paperclip_event_type']));
  if (paperclipEventType === 'task.proposed') return 'Toad';
  if (paperclipEventType === 'task.approved') return 'Mario';

  return 'Toad';
}

function parseOccurredAtMs(value: string | undefined): number {
  if (!value) return 0;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

export function projectPaperclipTasks(events: MissionEvent[]): PaperclipProjection {
  const byTask = new Map<
    string,
    {
      projection: PaperclipTask;
      occurredAtMs: number;
    }
  >();

  let hasPaperclipEvents = false;

  for (const event of events) {
    if (!isPaperclipApprovalEvent(event)) continue;
    hasPaperclipEvents = true;

    const state = toTaskState(event);
    if (!state) continue;

    const payload = asRecord(event.payload);
    const task = asRecord(payload.task);
    const approvalId = readString(payload, ['approval_id']);
    const runId = readString(payload, ['run_id']) ?? getCorrelationValue(event, ['run_id']);
    const taskId =
      readString(task, ['task_id', 'id']) ??
      readString(payload, ['task_id']) ??
      approvalId ??
      runId ??
      event.event_id ??
      'paperclip-task';

    const mapKey = approvalId ?? taskId;
    const title = readString(task, ['title']) ?? readString(payload, ['title']) ?? taskId;
    const occurredAt = event.occurred_at ?? null;
    const occurredAtMs = parseOccurredAtMs(event.occurred_at);

    const nextTask: PaperclipTask = {
      id: mapKey,
      taskId,
      title,
      role: toRole(event),
      state,
      occurredAt,
    };

    const existing = byTask.get(mapKey);
    if (!existing) {
      byTask.set(mapKey, { projection: nextTask, occurredAtMs });
      continue;
    }

    const isNewer = occurredAtMs >= existing.occurredAtMs;
    const stateUpgraded = existing.projection.state === 'PROPOSED' && state === 'APPROVED';

    if (isNewer || stateUpgraded) {
      byTask.set(mapKey, {
        projection: {
          ...existing.projection,
          ...nextTask,
          title: title || existing.projection.title,
          taskId: nextTask.taskId || existing.projection.taskId,
          role: nextTask.role || existing.projection.role,
        },
        occurredAtMs: Math.max(existing.occurredAtMs, occurredAtMs),
      });
    }
  }

  const tasks = [...byTask.values()]
    .sort((a, b) => b.occurredAtMs - a.occurredAtMs)
    .map((entry) => entry.projection);

  const proposedCount = tasks.filter((task) => task.state === 'PROPOSED').length;
  const approvedCount = tasks.filter((task) => task.state === 'APPROVED').length;

  return {
    hasPaperclipEvents,
    tasks,
    proposedCount,
    approvedCount,
  };
}
