'use client';

import React from 'react';

export type AgentRole = 'TOAD' | 'MARIO' | 'LUIGI' | 'PEACH';
export type AgentStatus = 'idle' | 'working' | 'error' | 'offline';

export interface AgentTask {
  id: string;
  title: string;
  progress: number;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

export interface AgentHistoryItem {
  timestamp: string;
  action: string;
  result: 'success' | 'failure' | 'info';
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTask?: AgentTask;
  history: AgentHistoryItem[];
  stats: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: string;
  };
}

interface AgentCardProps {
  agent?: Agent;
  onViewDetails?: (agent: Agent) => void;
  onAssignTask?: (agent: Agent) => void;
}

const AGENT_CONFIG: Record<AgentRole, { 
  sprite: string; 
  kart: string;
  color: string; 
  description: string;
  emoji: string;
}> = {
  MARIO: {
    sprite: '/sprites/mario/mario-stand.svg',
    kart: '/sprites/karts/mario-kart.svg',
    color: '#ff0000',
    description: 'Lead Engineer - Full Stack',
    emoji: '🧢',
  },
  LUIGI: {
    sprite: '/sprites/luigi/luigi-stand.svg',
    kart: '/sprites/karts/luigi-kart.svg',
    color: '#00aa00',
    description: 'QA Auditor - Testing & Review',
    emoji: '🔍',
  },
  TOAD: {
    sprite: '/sprites/toad/toad-stand.svg',
    kart: '/sprites/karts/toad-kart.svg',
    color: '#0066cc',
    description: 'Product Manager - Planning',
    emoji: '🍄',
  },
  PEACH: {
    sprite: '/sprites/peach/peach-stand.svg',
    kart: '/sprites/karts/peach-kart.svg',
    color: '#ff69b4',
    description: 'Operations - Deployment',
    emoji: '👑',
  },
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: string }> = {
  idle: { label: 'Idle', color: '#95a5a6', icon: '💤' },
  working: { label: 'Working', color: '#3498db', icon: '⚙️' },
  error: { label: 'Error', color: '#e74c3c', icon: '❌' },
  offline: { label: 'Offline', color: '#7f8c8d', icon: '🔌' },
};

const DEMO_AGENT: Agent = {
  id: 'mario-1',
  name: 'Mario',
  role: 'MARIO',
  status: 'working',
  currentTask: {
    id: 'task-1',
    title: 'Implement authentication API',
    progress: 65,
    status: 'active',
  },
  history: [
    { timestamp: '2m ago', action: 'Started task: API design', result: 'success' },
    { timestamp: '15m ago', action: 'Completed: Database setup', result: 'success' },
    { timestamp: '1h ago', action: 'Assigned to project', result: 'info' },
  ],
  stats: {
    tasksCompleted: 47,
    successRate: 94,
    avgResponseTime: '1.2s',
  },
};

export const AgentCard: React.FC<AgentCardProps> = ({ 
  agent = DEMO_AGENT,
  onViewDetails,
  onAssignTask,
}) => {
  const config = AGENT_CONFIG[agent.role];
  const status = STATUS_CONFIG[agent.status];

  return (
    <div style={styles.card}>
      <div style={{ ...styles.header, backgroundColor: config.color }}>
        <div style={styles.spriteContainer}>
          <img 
            src={config.sprite} 
            alt={agent.name}
            style={styles.sprite}
          />
          <div style={{ ...styles.statusBadge, backgroundColor: status.color }}>
            {status.icon}
          </div>
        </div>
        <div style={styles.headerInfo}>
          <h3 style={styles.name}>{config.emoji} {agent.name}</h3>
          <span style={styles.role}>{config.description}</span>
        </div>
        <img 
          src={config.kart} 
          alt="Kart"
          style={styles.kart}
        />
      </div>

      <div style={styles.body}>
        {agent.currentTask && (
          <div style={styles.taskSection}>
            <div style={styles.taskHeader}>
              <span style={styles.taskLabel}>Current Task</span>
              <span style={{ ...styles.taskStatus, color: getTaskStatusColor(agent.currentTask.status) }}>
                {getTaskStatusLabel(agent.currentTask.status)}
              </span>
            </div>
            <h4 style={styles.taskTitle}>{agent.currentTask.title}</h4>
            <div style={styles.progressBar}>
              <div 
                style={{ 
                  ...styles.progressFill, 
                  width: `${agent.currentTask.progress}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>
            <span style={styles.progressText}>{agent.currentTask.progress}% complete</span>
          </div>
        )}

        <div style={styles.statsSection}>
          <div style={styles.stat}>
            <span style={styles.statValue}>{agent.stats.tasksCompleted}</span>
            <span style={styles.statLabel}>Tasks Done</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>{agent.stats.successRate}%</span>
            <span style={styles.statLabel}>Success</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>{agent.stats.avgResponseTime}</span>
            <span style={styles.statLabel}>Avg Response</span>
          </div>
        </div>

        <div style={styles.historySection}>
          <h5 style={styles.historyTitle}>Recent Activity</h5>
          <div style={styles.historyList}>
            {agent.history.slice(0, 3).map((item, index) => (
              <div key={index} style={styles.historyItem}>
                <span style={{ ...styles.historyDot, backgroundColor: getResultColor(item.result) }} />
                <span style={styles.historyTime}>{item.timestamp}</span>
                <span style={styles.historyAction}>{item.action}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.actions}>
          <button 
            style={{ ...styles.button, backgroundColor: config.color }}
            onClick={() => onViewDetails?.(agent)}
            className="nes-btn is-primary"
          >
            View Details
          </button>
          <button 
            style={{ ...styles.buttonOutline, borderColor: config.color, color: config.color }}
            onClick={() => onAssignTask?.(agent)}
            className="nes-btn"
          >
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
};

function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'active': return '#3498db';
    case 'complete': return '#2ecc71';
    case 'failed': return '#e74c3c';
    default: return '#95a5a6';
  }
}

function getTaskStatusLabel(status: string): string {
  switch (status) {
    case 'active': return '● Active';
    case 'complete': return '✓ Complete';
    case 'failed': return '✗ Failed';
    default: return '○ Pending';
  }
}

function getResultColor(result: string): string {
  switch (result) {
    case 'success': return '#2ecc71';
    case 'failure': return '#e74c3c';
    default: return '#3498db';
  }
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#16213e',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '3px solid #0f3460',
    maxWidth: '380px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    gap: '12px',
  },
  spriteContainer: {
    position: 'relative',
  },
  sprite: {
    width: '48px',
    height: '48px',
    imageRendering: 'pixelated',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    padding: '4px',
  },
  statusBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    border: '2px solid #16213e',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    margin: 0,
    fontFamily: "Press Start 2P, monospace",
    fontSize: '12px',
    color: '#fff',
  },
  role: {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.8)',
    fontFamily: "Press Start 2P, monospace",
  },
  kart: {
    width: '72px',
    height: '36px',
    imageRendering: 'pixelated',
  },
  body: {
    padding: '16px',
  },
  taskSection: {
    backgroundColor: '#0f3460',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  taskLabel: {
    fontSize: '9px',
    color: '#888',
    fontFamily: "Press Start 2P, monospace",
  },
  taskStatus: {
    fontSize: '9px',
    fontFamily: "Press Start 2P, monospace",
  },
  taskTitle: {
    margin: '0 0 12px',
    fontSize: '11px',
    color: '#fff',
    fontFamily: "'Press Start 2P', monospace",
    lineHeight: 1.4,
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#1a1a2e',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '8px',
    color: '#888',
    fontFamily: "'Press Start 2P', monospace",
  },
  statsSection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  stat: {
    flex: 1,
    backgroundColor: '#0f3460',
    borderRadius: '6px',
    padding: '10px',
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    fontSize: '14px',
    fontFamily: "Press Start 2P, monospace",
    color: '#fff',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '8px',
    color: '#888',
    fontFamily: "'Press Start 2P', monospace",
  },
  historySection: {
    marginBottom: '16px',
  },
  historyTitle: {
    margin: '0 0 10px',
    fontSize: '10px',
    color: '#888',
    fontFamily: "'Press Start 2P', monospace",
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '9px',
    fontFamily: "'Press Start 2P', monospace",
  },
  historyDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  historyTime: {
    color: '#666',
    minWidth: '50px',
  },
  historyAction: {
    color: '#aaa',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    fontFamily: "Press Start 2P, monospace",
    fontSize: '9px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  buttonOutline: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '2px solid',
    borderRadius: '6px',
    fontFamily: "Press Start 2P, monospace",
    fontSize: '9px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default AgentCard;