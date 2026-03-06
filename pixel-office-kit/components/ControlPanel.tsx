'use client';

import { Badge, Button, Container, Text } from 'nes-ui-react';
import type { NamedColor } from 'nes-ui-react';
import type { AgentDef } from '@/lib/agents';
import type { AgentCommand } from './OfficeRoom/OfficeRoom';
import type { OfficeAgentState } from './OfficeRoom/engine/types';

const ACTIONS: { label: string; action: OfficeAgentState; message: string; color: NamedColor }[] = [
  { label: 'Work', action: 'work', message: 'Focused work...', color: 'primary' },
  { label: 'Coffee', action: 'coffee', message: 'Coffee break!', color: 'warning' },
  { label: 'Lounge', action: 'lounge', message: 'Quick break', color: 'disabled' },
  { label: 'Celebrate', action: 'celebrate', message: 'Woohoo!', color: 'success' },
];

interface ControlPanelProps {
  agents: AgentDef[];
  autoMode: boolean;
  onToggleAuto: () => void;
  onCommand: (cmd: AgentCommand) => void;
  activeCmd: { agentId: string; action: string } | null;
}

export function ControlPanel({ agents, autoMode, onToggleAuto, onCommand, activeCmd }: ControlPanelProps) {
  return (
    <Container title="Control Deck" roundedCorners>
      <div className="pixel-office-mode-row">
        <div className="pixel-office-mode-actions">
          <Text size="small">Simulator</Text>
          <Badge backgroundColor={autoMode ? 'success' : 'warning'} text={autoMode ? 'AUTO' : 'MANUAL'} />
        </div>

        <Button color={autoMode ? 'warning' : 'primary'} onClick={onToggleAuto}>
          {autoMode ? 'Switch To Manual' : 'Switch To Auto'}
        </Button>
      </div>

      {!autoMode && (
        <div className="pixel-office-manual-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="pixel-office-agent-card">
              <div className="pixel-office-agent-meta">
                <span className="pixel-office-agent-dot" style={{ backgroundColor: agent.color }} aria-hidden />
                <Text size="small">{agent.name}</Text>
              </div>

              <div className="pixel-office-action-row">
                {ACTIONS.map((act) => {
                  const isActive = activeCmd?.agentId === agent.id && activeCmd?.action === act.action;
                  return (
                    <Button
                      key={act.action}
                      color={isActive ? 'success' : act.color}
                      size="small"
                      borderInverted={isActive}
                      onClick={() =>
                        onCommand({
                          agentId: agent.id,
                          action: act.action,
                          message: act.message,
                        })
                      }
                    >
                      {act.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
