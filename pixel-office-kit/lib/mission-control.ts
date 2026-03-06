'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AGENTS } from './agents';
import type { AgentCommand } from '@/components/OfficeRoom/OfficeRoom';

type JsonRecord = Record<string, unknown>;

type TelemetryOptions = {
  enabled?: boolean;
  pollMs?: number;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');
const RUNS_URL = `${API_BASE_URL}/api/v1/runs`;
const APPROVALS_URL = `${API_BASE_URL}/api/v1/approvals`;

function toArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const obj = value as JsonRecord;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.runs)) return obj.runs as T[];
    if (Array.isArray(obj.approvals)) return obj.approvals as T[];
  }
  return [];
}

function readString(obj: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}

function hashToIndex(input: string, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0) % max;
}

function pickAgentIdForRun(run: JsonRecord): string {
  const explicitAgentId = readString(run, ['agentId', 'agent_id', 'agent', 'owner', 'worker']);
  if (explicitAgentId && AGENTS.some(a => a.id === explicitAgentId)) return explicitAgentId;

  const key =
    readString(run, ['id', 'runId', 'run_id', 'name']) ??
    JSON.stringify(run).slice(0, 64);

  return AGENTS[hashToIndex(key, AGENTS.length)]?.id ?? AGENTS[0].id;
}

function isPendingApproval(approval: JsonRecord): boolean {
  const status = readString(approval, ['status', 'state'])?.toLowerCase();
  return status === 'pending' || status === 'open' || status === 'waiting';
}

function approvalRunId(approval: JsonRecord): string | null {
  return readString(approval, ['runId', 'run_id', 'run', 'id']);
}

function mapRunToCommand(run: JsonRecord, approvalRunIds: Set<string>): AgentCommand | null {
  const status = readString(run, ['status', 'state'])?.toLowerCase();
  if (!status) return null;

  const runId = readString(run, ['id', 'runId', 'run_id']);
  const agentId = pickAgentIdForRun(run);

  if (status === 'running') {
    return {
      agentId,
      action: 'work',
      message: 'Running live workflow...',
    };
  }

  if (status === 'paused') {
    const needsReview = runId ? approvalRunIds.has(runId) : false;
    return {
      agentId,
      action: needsReview ? 'talk' : 'work',
      message: needsReview ? 'Approval needed — please review.' : 'Paused — waiting for review.',
    };
  }

  if (status === 'completed') {
    return {
      agentId,
      action: 'celebrate',
      message: 'Run completed! 🎉',
    };
  }

  return null;
}

export function useLiveTelemetry(options: TelemetryOptions = {}): AgentCommand[] {
  const { enabled = true, pollMs = 4000 } = options;
  const [commands, setCommands] = useState<AgentCommand[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safePollMs = useMemo(() => Math.max(3000, pollMs), [pollMs]);

  useEffect(() => {
    if (!enabled) {
      setCommands([]);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const poll = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      try {
        const [runsRes, approvalsRes] = await Promise.all([
          fetch(RUNS_URL, { signal: controller.signal, cache: 'no-store' }),
          fetch(APPROVALS_URL, { signal: controller.signal, cache: 'no-store' }),
        ]);

        const runsJson = runsRes.ok ? await runsRes.json() : [];
        const approvalsJson = approvalsRes.ok ? await approvalsRes.json() : [];

        const runs = toArray<JsonRecord>(runsJson);
        const approvals = toArray<JsonRecord>(approvalsJson);

        const approvalRunIds = new Set(
          approvals
            .filter(isPendingApproval)
            .map(approvalRunId)
            .filter((id): id is string => Boolean(id)),
        );

        const mapped = runs
          .map(run => mapRunToCommand(run, approvalRunIds))
          .filter((cmd): cmd is AgentCommand => Boolean(cmd));

        if (!cancelled) {
          setCommands(mapped.length > 0 ? [mapped[0]] : []);
        }
      } catch {
        if (!cancelled) setCommands([]);
      } finally {
        clearTimeout(timeout);
        if (!cancelled) {
          timerRef.current = setTimeout(poll, safePollMs);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, safePollMs]);

  return commands;
}
