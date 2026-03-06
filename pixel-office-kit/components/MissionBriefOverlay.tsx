import React from 'react';
import { Container, Text } from 'nes-ui-react';
import type { AgentCommand } from './OfficeRoom/OfficeRoom';

interface Props {
  commands: AgentCommand[];
  autoMode: boolean;
}

export function MissionBriefOverlay({ commands, autoMode }: Props) {
  if (!autoMode) {
    return (
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 50, maxWidth: '280px', pointerEvents: 'none' }}>
        <Container title="MISSION STATUS" roundedCorners>
          <Text size="small" style={{ color: '#f7d51d' }}>
            STATUS: STANDBY
          </Text>
          <Text size="small" style={{ marginTop: '8px' }}>
            Awaiting operator input. Auto-telemetry offline.
          </Text>
        </Container>
      </div>
    );
  }

  if (!commands || commands.length === 0) {
    return (
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 50, maxWidth: '280px', pointerEvents: 'none' }}>
        <Container title="MISSION STATUS" roundedCorners>
          <Text size="small" style={{ color: '#92cc41' }}>
            STATUS: SECURE
          </Text>
          <Text size="small" style={{ marginTop: '8px' }}>
            No active threats or tasks. Sector clear.
          </Text>
        </Container>
      </div>
    );
  }

  const currentMission = commands[0];

  return (
    <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 50, maxWidth: '280px', pointerEvents: 'none' }}>
      <Container title="MISSION BRIEF" roundedCorners>
        <Text size="small" style={{ color: '#209cee' }}>
          AGENT: {currentMission.agentId.toUpperCase()}
        </Text>
        <Text size="small" style={{ color: '#e76e55', marginTop: '4px' }}>
          STATE: {currentMission.action.toUpperCase()}
        </Text>
        <Text size="small" style={{ marginTop: '8px' }}>
          OBJECTIVE: {currentMission.message || 'Executing protocol...'}
        </Text>
      </Container>
    </div>
  );
}
