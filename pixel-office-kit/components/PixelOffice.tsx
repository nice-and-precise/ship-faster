'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AgentSprite, { type AgentStatus, type CharacterType } from './AgentSprite';
import AgentProfileCard from './AgentProfileCard';
import { CRTOverlay, PixelOfficeHUD } from './RetroPolish';
import TileMapRenderer, { DISPATCH_CONSOLE_TILE, mockTiledJson } from './TileMapRenderer';
import EnvelopeSprite from './EnvelopeSprite';
import ChronoTracker from './ChronoTracker';
import RPGDialogueBox, { type DialogueLine } from './RPGDialogueBox';
import LiveTicker from './LiveTicker';
import AgentBuilderModal from './AgentBuilderModal';
import MarioKartTrack, { type PipelineRun } from './MarioKartTrack';
import { projectMissionEvents, type MissionEvent } from '@/lib/event-mapping';
import {
  buildMainframeDispatchRequest,
  getMainframeConfigBlockReason,
  toMainframeStatusLabel,
  transitionMainframeDispatchState,
  type MainframeDispatchState,
} from '@/lib/mainframe-dispatch';
import { deriveTelemetryMode, latestEventTimestampMs, type TelemetryMode } from '@/lib/telemetry-reliability';

type JsonRecord = Record<string, unknown>;

type MissionRun = {
  id: string;
  name: string;
  status: string;
};

export type AgentProfile = {
  agent_id: string;
  name: string;
  model: string;
  thinking_level: string;
  persona: string;
  sprite_config: {
    characterType?: CharacterType;
    character_type?: CharacterType;
    desk?: DeskPosition;
    desk_position?: DeskPosition;
  };
  created_at: string;
  updated_at: string;
};

type DeskPosition = {
  x: number;
  y: number;
};

type CanvasMetrics = {
  left: number;
  top: number;
  scale: number;
};

type HoverTooltip = {
  text: string;
  x: number;
  y: number;
};

type AnimationEvent = {
  id: string;
  kind: 'envelope';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

const POLL_MS = 2000;
const TELEMETRY_STALE_AFTER_MS = 15000;
const TELEMETRY_OFFLINE_AFTER_MS = 45000;
const MAP_PIXEL_WIDTH = mockTiledJson.width * mockTiledJson.tilewidth;
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');
const EVENTS_URL = `${API_BASE_URL}/api/v1/events`;
const EVENTS_STREAM_URL = `${API_BASE_URL}/api/v1/events/stream`;
const AGENTS_URL = `${API_BASE_URL}/api/v1/agents`;
const MAINFRAME_DISPATCH_TOKEN = process.env.NEXT_PUBLIC_MAINFRAME_DISPATCH_TOKEN;

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const maybe = value as JsonRecord;
    if (Array.isArray(maybe.runs)) return maybe.runs;
    if (Array.isArray(maybe.data)) return maybe.data;
    if (Array.isArray(maybe.items)) return maybe.items;
  }
  return [];
}

function getDeskPositions(): DeskPosition[] {
  const desks: DeskPosition[] = [];

  for (const layer of mockTiledJson.layers) {
    if (!layer.visible || layer.type !== 'tilelayer') continue;
    layer.data.forEach((gid, index) => {
      if (gid !== 3) return;
      const x = (index % layer.width) * mockTiledJson.tilewidth;
      const y = Math.floor(index / layer.width) * mockTiledJson.tileheight;
      desks.push({ x, y });
    });
  }

  return desks;
}

function toSpriteStatus(status: string): AgentStatus {
  if (['running', 'in_progress', 'processing'].includes(status)) return 'running';
  if (['completed', 'success', 'succeeded', 'done'].includes(status)) return 'completed';
  if (['failed', 'error', 'crashed', 'rejected', 'canceled'].includes(status)) return 'error';
  if (['queued', 'pending', 'waiting'].includes(status)) return 'idle';
  return 'idle';
}

export function PixelOffice() {
  const mapFrameRef = useRef<HTMLDivElement>(null);
  const [runs, setRuns] = useState<MissionRun[]>([]);
  const [activeTrackRuns, setActiveTrackRuns] = useState<PipelineRun[]>([]);
  const [idleTrackRuns, setIdleTrackRuns] = useState<PipelineRun[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [fallbackPollingActive, setFallbackPollingActive] = useState(false);
  const [lastSuccessfulDataAtMs, setLastSuccessfulDataAtMs] = useState<number | null>(null);
  const [lastSuccessfulPollAtMs, setLastSuccessfulPollAtMs] = useState<number | null>(null);
  const [latestEventAtMs, setLatestEventAtMs] = useState<number | null>(null);
  const [telemetryNowMs, setTelemetryNowMs] = useState(() => Date.now());
  const [profileCardOpen, setProfileCardOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<DeskPosition | null>(null);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [tooltip, setTooltip] = useState<HoverTooltip | null>(null);
  const [animations, setAnimations] = useState<AnimationEvent[]>([]);
  const [mainframeDispatchState, setMainframeDispatchState] = useState<MainframeDispatchState>('READY');
  const [mainframeDispatchDetail, setMainframeDispatchDetail] = useState<string | null>(null);
  const [uptime, setUptime] = useState(400);
  const [metrics, setMetrics] = useState<CanvasMetrics>({ left: 0, top: 0, scale: 3 });

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let sseLive = false;

    const applyProjection = (events: MissionEvent[]) => {
      const projection = projectMissionEvents(events);
      if (!active) return;
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
        const response = await fetch(EVENTS_URL, { cache: 'no-store' });
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
        fallbackTimer = setTimeout(runFallbackPoll, POLL_MS);
      }
    };

    const connectStream = () => {
      source?.close();
      source = new EventSource(EVENTS_STREAM_URL);

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
          reconnectTimer = setTimeout(connectStream, POLL_MS);
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
  }, []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    const poll = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch(AGENTS_URL, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`Agents failed (${response.status})`);
        const json = await response.json();
        if (active) {
          setAgents(asArray(json) as AgentProfile[]);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error(err);
        }
      } finally {
        if (active) {
          timer = setTimeout(poll, POLL_MS);
        }
      }
    };

    poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      controller?.abort();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUptime((prev) => Math.max(0, prev - 1));
      setTelemetryNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

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
      const scale = canvas.clientWidth / MAP_PIXEL_WIDTH || 1;

      setMetrics({
        left: canvasRect.left - frameRect.left + borderLeft,
        top: canvasRect.top - frameRect.top + borderTop,
        scale,
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [runs.length, agents.length]);

  const deskPositions = useMemo(() => getDeskPositions(), []);

  const sprites = useMemo(() => {
    return agents
      .filter((a) => a.sprite_config?.desk || a.sprite_config?.desk_position)
      .map((agent, index) => {
        const desk = agent.sprite_config.desk ?? agent.sprite_config.desk_position!;
        const spriteOffsetX = -4;
        const spriteOffsetY = -12;
        const isBusy = index < runs.filter((r) => toSpriteStatus(r.status) === 'running').length;

        return {
          id: agent.agent_id,
          name: agent.name,
          status: (isBusy ? 'running' : 'idle') as AgentStatus,
          characterType: agent.sprite_config.characterType || agent.sprite_config.character_type || 'mario',
          deskX: desk.x,
          deskY: desk.y,
          x: Math.round(metrics.left + (desk.x + spriteOffsetX) * metrics.scale),
          y: Math.round(metrics.top + (desk.y + spriteOffsetY) * metrics.scale),
          agent,
        };
      });
  }, [agents, metrics, runs]);

  const occupiedDeskKeys = useMemo(
    () => new Map(sprites.map((sprite) => [`${sprite.deskX},${sprite.deskY}`, { ...sprite.agent, status: sprite.status }])),
    [sprites],
  );

  const activeAgentPositions = useMemo(
    () => sprites.filter((sprite) => sprite.status === 'running').map((sprite) => ({ x: sprite.deskX, y: sprite.deskY })),
    [sprites],
  );

  const runningCount = useMemo(() => runs.filter((run) => toSpriteStatus(run.status) === 'running').length, [runs]);
  const completedCount = useMemo(() => runs.filter((run) => toSpriteStatus(run.status) === 'completed').length, [runs]);

  const telemetryMode = useMemo<TelemetryMode>(
    () =>
      deriveTelemetryMode({
        nowMs: telemetryNowMs,
        sseConnected,
        fallbackPollingActive,
        lastSuccessfulDataAtMs,
        lastSuccessfulPollAtMs,
        latestEventAtMs,
        staleAfterMs: TELEMETRY_STALE_AFTER_MS,
        offlineAfterMs: TELEMETRY_OFFLINE_AFTER_MS,
      }),
    [fallbackPollingActive, lastSuccessfulDataAtMs, lastSuccessfulPollAtMs, latestEventAtMs, sseConnected, telemetryNowMs],
  );

  const telemetryLabel = useMemo(() => {
    if (telemetryMode === 'LIVE') return 'LIVE • stream connected + fresh telemetry';
    if (telemetryMode === 'DEGRADED') {
      return fallbackPollingActive ? 'DEGRADED • stream down, poll fallback active' : 'DEGRADED • telemetry stale';
    }
    return 'OFFLINE • no successful data path';
  }, [fallbackPollingActive, telemetryMode]);

  const telemetryClass = useMemo(() => {
    if (telemetryMode === 'LIVE') return 'is-success';
    if (telemetryMode === 'DEGRADED') return 'is-warning';
    return 'is-error';
  }, [telemetryMode]);

  const mainframeStatusClass = useMemo(() => {
    if (mainframeDispatchState === 'DISPATCHED') return 'is-success';
    if (mainframeDispatchState === 'FAILED' || mainframeDispatchState === 'BLOCKED_CONFIG') return 'is-error';
    if (mainframeDispatchState === 'DISPATCHING') return 'is-warning';
    return '';
  }, [mainframeDispatchState]);

  const mainframeStatusLabel = useMemo(
    () => toMainframeStatusLabel(mainframeDispatchState, mainframeDispatchDetail),
    [mainframeDispatchDetail, mainframeDispatchState],
  );

  const mainframeDialogue = useMemo<DialogueLine[]>(
    () => [
      {
        id: 'mainframe-online',
        speaker: 'MAINFRAME',
        portrait: '🖥️',
        text: 'Commander. Link established.',
      },
      {
        id: 'target-url',
        speaker: 'MAINFRAME',
        portrait: '🦞',
        text: 'Commander. Enter target URL:',
        requiresInput: true,
        inputPlaceholder: 'https://example.com',
        submitLabel: 'Transmit',
      },
    ],
    [],
  );

  const tickerEvents = useMemo(() => {
    const runEvents = runs.slice(0, 6).map((run) => `RUN ${run.name}: ${run.status.toUpperCase()}`);
    const modeLine = `TELEMETRY: ${telemetryMode}`;

    if (telemetryMode === 'OFFLINE') {
      return [modeLine, 'SYSTEM: Mission Control telemetry offline'];
    }

    if (runEvents.length === 0) {
      return [modeLine, `SYSTEM: No active runs (agents ${agents.length})`];
    }

    return [modeLine, ...runEvents, `SYSTEM: Active agents ${agents.length}`];
  }, [agents.length, runs, telemetryMode]);

  const dispatchConsoleRect = useMemo(
    () => ({
      left: Math.round(metrics.left + DISPATCH_CONSOLE_TILE.x * metrics.scale),
      top: Math.round(metrics.top + DISPATCH_CONSOLE_TILE.y * metrics.scale),
      width: Math.round(Math.max(16, 16 * metrics.scale)),
      height: Math.round(Math.max(16, 16 * metrics.scale)),
    }),
    [metrics],
  );

  const mainframePoint = useMemo(
    () => ({
      x: Math.round(metrics.left + (DISPATCH_CONSOLE_TILE.x + 0.5) * 16 * metrics.scale),
      y: Math.round(metrics.top + (DISPATCH_CONSOLE_TILE.y + 0.5) * 16 * metrics.scale),
    }),
    [metrics],
  );

  const crustyDeskPoint = useMemo(() => {
    const crustyDeskTile = { x: 11, y: 7 };
    return {
      x: Math.round(metrics.left + (crustyDeskTile.x + 0.5) * 16 * metrics.scale),
      y: Math.round(metrics.top + (crustyDeskTile.y + 0.5) * 16 * metrics.scale),
    };
  }, [metrics]);

  const launchEnvelopeToCrusty = () => {
    const id = `env-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setAnimations((prev) => [
      ...prev,
      {
        id,
        kind: 'envelope',
        startX: mainframePoint.x,
        startY: mainframePoint.y,
        endX: crustyDeskPoint.x,
        endY: crustyDeskPoint.y,
      },
    ]);
  };

  const spawnTestEnvelope = () => {
    launchEnvelopeToCrusty();
  };

  const handleAnimationComplete = (id: string) => {
    setAnimations((prev) => prev.filter((event) => event.id !== id));
  };

  const showTooltip = (text: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const frame = mapFrameRef.current;
    if (!frame) return;
    const frameRect = frame.getBoundingClientRect();
    setTooltip({
      text,
      x: event.clientX - frameRect.left + 8,
      y: event.clientY - frameRect.top - 16,
    });
  };

  const hideTooltip = () => setTooltip(null);

  const handleDeskClick = (desk: DeskPosition) => {
    const key = `${desk.x},${desk.y}`;
    const occupant = occupiedDeskKeys.get(key);

    if (occupant) {
      setSelectedAgent(occupant);
      setProfileCardOpen(true);
      return;
    }

    setSelectedDesk(desk);
    setBuilderOpen(true);
  };

  const closePanels = () => {
    setProfileCardOpen(false);
    setSelectedAgent(null);
    setBuilderOpen(false);
    setSelectedDesk(null);
    setTooltip(null);
  };

  const handleMainframeDispatch = async (targetUrl: string) => {
    setDialogueOpen(false);
    setTooltip(null);

    const cleanTarget = targetUrl.trim();
    if (!cleanTarget) {
      setMainframeDispatchState(transitionMainframeDispatchState(mainframeDispatchState, { type: 'FAIL' }));
      setMainframeDispatchDetail('Target URL is required.');
      return;
    }

    const blockedReason = getMainframeConfigBlockReason({
      apiBaseUrl: API_BASE_URL,
      dispatchToken: MAINFRAME_DISPATCH_TOKEN,
    });

    if (blockedReason) {
      setMainframeDispatchState(transitionMainframeDispatchState(mainframeDispatchState, { type: 'BLOCKED_CONFIG' }));
      setMainframeDispatchDetail(blockedReason);
      return;
    }

    setMainframeDispatchState(transitionMainframeDispatchState(mainframeDispatchState, { type: 'BEGIN' }));
    setMainframeDispatchDetail(null);

    const request = buildMainframeDispatchRequest(
      {
        apiBaseUrl: API_BASE_URL,
        dispatchToken: MAINFRAME_DISPATCH_TOKEN,
        pipelineName: 'attack-plan.lobster',
      },
      { targetUrl: cleanTarget },
    );

    try {
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(request.payload),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Dispatch failed (${response.status})${body ? `: ${body.slice(0, 140)}` : ''}`);
      }

      setMainframeDispatchState(transitionMainframeDispatchState(mainframeDispatchState, { type: 'SUCCESS' }));
      setMainframeDispatchDetail(`Pipeline attack-plan.lobster dispatched for ${cleanTarget}`);
      launchEnvelopeToCrusty();
    } catch (err) {
      setMainframeDispatchState(transitionMainframeDispatchState(mainframeDispatchState, { type: 'FAIL' }));
      setMainframeDispatchDetail(err instanceof Error ? err.message : 'Dispatch request failed');
    }
  };

  const handleCreateAgent = async (payload: Record<string, unknown>, authToken?: string) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(AGENTS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Agent create failed (${response.status})${body ? `: ${body.slice(0, 150)}` : ''}`);
    }

    const json = await response.json();
    const created = (json?.data ?? json) as AgentProfile;
    setAgents((prev) => [created, ...prev.filter((a) => a.agent_id !== created.agent_id)]);
  };

  return (
    <>
      <ChronoTracker />
      <PixelOfficeHUD tasksCount={completedCount} tokenBudget={runningCount} roomName="Mission Control" uptime={uptime} />

      <main className="pixel-office-main">
        <section className="nes-container is-rounded with-title pixel-office-shell">
          <p className="title">Mission Control Pixel Office</p>
          <div className="nes-container is-dark is-rounded pixel-office-intro" style={{ marginBottom: '20px' }}>
            <p>
              Live telemetry bridge: events from <code>{EVENTS_URL}</code> + stream <code>{EVENTS_STREAM_URL}</code>.
            </p>
            <p style={{ color: '#33ff33' }}>Total Roster: {agents.length} Agents</p>
            <p className={`nes-text ${telemetryClass}`} style={{ marginTop: 8 }}>
              Telemetry Status: {telemetryLabel}
            </p>
            <button type="button" className="nes-btn is-success" onClick={spawnTestEnvelope}>
              Test Envelope
            </button>
            {error && <p className="nes-text is-error">{error}</p>}
          </div>

          <div className="nes-container is-rounded pixel-office-stage" ref={mapFrameRef}>
            <TileMapRenderer mapData={mockTiledJson} activeAgentPositions={activeAgentPositions} />

            <div
              aria-hidden={profileCardOpen || builderOpen || dialogueOpen}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'auto',
                zIndex: 90,
              }}
            >
              {deskPositions.map((desk) => {
                const key = `${desk.x},${desk.y}`;
                const isOccupied = occupiedDeskKeys.has(key);
                const size = Math.max(16, 16 * metrics.scale);
                const tooltipText = isOccupied
                  ? `${occupiedDeskKeys.get(key)!.name} [${occupiedDeskKeys.get(key)!.status || 'IDLE'}]`
                  : 'Vacant desk';

                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={isOccupied ? `View agent at ${key}` : `Vacant desk at ${key}`}
                    className="nes-btn"
                    onMouseEnter={(event) => showTooltip(tooltipText, event)}
                    onMouseMove={(event) => showTooltip(tooltipText, event)}
                    onMouseLeave={hideTooltip}
                    onClick={() => handleDeskClick(desk)}
                    style={{
                      position: 'absolute',
                      left: Math.round(metrics.left + desk.x * metrics.scale),
                      top: Math.round(metrics.top + desk.y * metrics.scale),
                      width: Math.round(size),
                      height: Math.round(size),
                      opacity: 0,
                      cursor: isOccupied ? 'help' : 'default',
                      pointerEvents: 'auto',
                    }}
                  />
                );
              })}

              <button
                type="button"
                className="nes-btn is-primary"
                aria-label="Open mainframe dialogue"
                onMouseEnter={(event) => showTooltip('Mainframe Console', event)}
                onMouseMove={(event) => showTooltip('Mainframe Console', event)}
                onMouseLeave={hideTooltip}
                onClick={() => setDialogueOpen(true)}
                style={{
                  position: 'absolute',
                  left: dispatchConsoleRect.left,
                  top: dispatchConsoleRect.top,
                  width: dispatchConsoleRect.width,
                  height: dispatchConsoleRect.height,
                  opacity: 0,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              />

              <p
                className={`nes-text ${mainframeStatusClass}`}
                style={{
                  position: 'absolute',
                  left: dispatchConsoleRect.left,
                  top: Math.max(4, dispatchConsoleRect.top - 14),
                  margin: 0,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  lineHeight: 1.2,
                  background: 'rgba(17, 17, 17, 0.85)',
                  color: '#fff8dc',
                  border: '1px solid #3a3a3a',
                  padding: '2px 4px',
                  maxWidth: 260,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  pointerEvents: 'none',
                }}
                title={mainframeStatusLabel}
              >
                {mainframeStatusLabel}
              </p>
            </div>

            {tooltip && (
              <div
                className="nes-balloon from-left"
                style={{
                  position: 'absolute',
                  left: tooltip.x,
                  top: tooltip.y,
                  zIndex: 140,
                  pointerEvents: 'none',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  padding: '4px 6px',
                  background: '#fff8dc',
                  border: '2px solid #111',
                  boxShadow: '2px 2px 0 #111',
                }}
              >
                {tooltip.text}
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              {sprites.map((sprite) => (
                <AgentSprite
                  key={sprite.id}
                  x={sprite.x}
                  y={sprite.y}
                  name={sprite.name}
                  status={sprite.status}
                  characterType={sprite.characterType}
                />
              ))}

              {animations.map((event) => (
                <EnvelopeSprite
                  key={event.id}
                  id={event.id}
                  startX={event.startX}
                  startY={event.startY}
                  endX={event.endX}
                  endY={event.endY}
                  onComplete={handleAnimationComplete}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <MarioKartTrack activeRuns={activeTrackRuns} idleRuns={idleTrackRuns} />
          </div>
        </section>
      </main>

      <AgentProfileCard isOpen={profileCardOpen} onClose={closePanels} agent={selectedAgent} />
      <AgentBuilderModal isOpen={builderOpen} desk={selectedDesk} onClose={closePanels} onSubmit={handleCreateAgent} />

      <RPGDialogueBox
        isOpen={dialogueOpen}
        lines={mainframeDialogue}
        onClose={() => setDialogueOpen(false)}
        onInputSubmit={handleMainframeDispatch}
      />

      <LiveTicker events={tickerEvents} />
      <CRTOverlay />
    </>
  );
}

export default PixelOffice;
