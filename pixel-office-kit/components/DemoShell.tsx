'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Container, Header, Heading, Hr, Text } from 'nes-ui-react';
import type { NamedColor } from 'nes-ui-react';
import { OfficeRoom } from './OfficeRoom/OfficeRoom';
import { ControlPanel } from './ControlPanel';
import { AGENTS, WORK_MSGS, PERSONALITY_BANTER, COFFEE_MSGS, CELEBRATE_MSGS, LOUNGE_MSGS } from '@/lib/agents';
import { useLiveTelemetry } from '@/lib/mission-control';
import type { AgentCommand } from './OfficeRoom/OfficeRoom';
import { MissionBriefOverlay } from './MissionBriefOverlay';

function statusColorForAction(action: AgentCommand['action']): NamedColor {
  if (action === 'celebrate') return 'success';
  if (action === 'reflecting') return 'error';
  if (action === 'talk') return 'warning';
  if (action === 'work' || action === 'think') return 'primary';
  return 'disabled';
}

export function DemoShell() {
  const [autoMode, setAutoMode] = useState(true);
  const liveCommands = useLiveTelemetry({ enabled: autoMode, pollMs: 3500 });
  const [manualCommands, setManualCommands] = useState<AgentCommand[]>([]);
  const [activeCmd, setActiveCmd] = useState<{ agentId: string; action: string } | null>(null);
  const activeCmdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commands = autoMode ? liveCommands : manualCommands;

  const feedRows = useMemo(() => {
    if (!autoMode) return [{ key: 'manual', label: 'MANUAL MODE', detail: 'Operator commands routed to the mission floor.', color: 'warning' as NamedColor }];
    if (liveCommands.length === 0) {
      return [{ key: 'idle', label: 'STANDBY', detail: 'No active runs from Mission Control telemetry.', color: 'disabled' as NamedColor }];
    }

    return liveCommands.slice(0, 4).map((cmd, idx) => ({
      key: `${cmd.agentId}-${cmd.action}-${idx}`,
      label: `${cmd.agentId.toUpperCase()} :: ${cmd.action.toUpperCase()}`,
      detail: cmd.message ?? 'Live event received.',
      color: statusColorForAction(cmd.action),
    }));
  }, [autoMode, liveCommands]);

  const handleManualCommand = (cmd: AgentCommand) => {
    const manualCmd = { ...cmd, manual: true } as AgentCommand & { manual: boolean };
    setManualCommands((prev) => [...prev, manualCmd]);
    setActiveCmd({ agentId: cmd.agentId, action: cmd.action });
    if (activeCmdTimerRef.current) clearTimeout(activeCmdTimerRef.current);
    activeCmdTimerRef.current = setTimeout(() => {
      setActiveCmd(null);
      activeCmdTimerRef.current = null;
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (activeCmdTimerRef.current) clearTimeout(activeCmdTimerRef.current);
    };
  }, []);

  return (
    <main className="pixel-office-main">
      <section className="pixel-office-shell">
        <Container roundedCorners>
          <Header>
            <Heading size="small" dense>
              Pixel Office Mission Deck
            </Heading>
            <Badge backgroundColor="primary" text="8-BIT SHELL" />
          </Header>

          <div className="pixel-office-intro">
            <div className="pixel-office-title-row">
              <Text size="small">Retro command interface for live mission telemetry</Text>
              <Badge backgroundColor={autoMode ? 'success' : 'warning'} text={autoMode ? 'AUTO TELEMETRY' : 'MANUAL CONTROL'} />
            </div>
          </div>

          <Hr color="primary" />

          <div className="pixel-office-stage">
            <Container title="Mission Floor" roundedCorners>
              <div className="pixel-office-room-shell" style={{ position: 'relative' }}>
                <MissionBriefOverlay commands={liveCommands} autoMode={autoMode} />
                <OfficeRoom
                  agents={AGENTS}
                  isActive={true}
                  activityLevel={10}
                  agentCommands={commands}
                  workMsgs={WORK_MSGS}
                  personalityBanter={PERSONALITY_BANTER}
                  coffeeMsgs={COFFEE_MSGS}
                  celebrateMsgs={CELEBRATE_MSGS}
                  loungeMsgs={LOUNGE_MSGS}
                />
              </div>
            </Container>

            <div className="pixel-office-side-grid">
              <ControlPanel
                agents={AGENTS}
                autoMode={autoMode}
                onToggleAuto={() => setAutoMode((v) => !v)}
                onCommand={handleManualCommand}
                activeCmd={activeCmd}
              />

              <Container title="Telemetry Feed" roundedCorners>
                <div className="pixel-office-feed-list">
                  {feedRows.map((row) => (
                    <div key={row.key} className="pixel-office-feed-row">
                      <Badge backgroundColor={row.color} text={row.label} />
                      <Text size="small">{row.detail}</Text>
                    </div>
                  ))}
                </div>
              </Container>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
