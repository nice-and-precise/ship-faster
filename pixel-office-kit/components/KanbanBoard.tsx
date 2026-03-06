'use client';

import React from 'react';

export type TaskStatus = 'pending' | 'active' | 'complete' | 'failed';
export type AgentRole = 'TOAD' | 'MARIO' | 'LUIGI' | 'PEACH';

export interface KanbanTask {
  id: string;
  title: string;
  agent: AgentRole;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

interface KanbanBoardProps {
  tasks?: KanbanTask[];
  onTaskClick?: (task: KanbanTask) => void;
  onAssignTask?: (column: AgentRole) => void;
}

const COLUMNS: { id: AgentRole; title: string; subtitle: string; sprite: string; color: string }[] = [
  { 
    id: 'TOAD', 
    title: 'TOAD', 
    subtitle: 'Product Manager',
    sprite: '/sprites/toad/toad-stand.svg',
    color: '#0066cc'
  },
  { 
    id: 'MARIO', 
    title: 'MARIO', 
    subtitle: 'Engineering',
    sprite: '/sprites/mario/mario-stand.svg',
    color: '#ff0000'
  },
  { 
    id: 'LUIGI', 
    title: 'LUIGI', 
    subtitle: 'QA Auditor',
    sprite: '/sprites/luigi/luigi-stand.svg',
    color: '#00aa00'
  },
  { 
    id: 'PEACH', 
    title: 'PEACH', 
    subtitle: 'Ops + Deploy',
    sprite: '/sprites/peach/peach-stand.svg',
    color: '#ff69b4'
  },
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: string; className: string }> = {
  pending: { label: 'Pending', icon: '⏳', className: 'is-pending' },
  active: { label: 'Active', icon: '⚙️', className: 'is-active' },
  complete: { label: 'Complete', icon: '✅', className: 'is-complete' },
  failed: { label: 'Failed', icon: '❌', className: 'is-failed' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'LOW', color: '#888' },
  medium: { label: 'MED', color: '#ffaa00' },
  high: { label: 'HIGH', color: '#ff6600' },
  critical: { label: 'CRIT', color: '#ff0000' },
};

const DEMO_TASKS: KanbanTask[] = [
  { id: '1', title: 'Design API schema', agent: 'TOAD', status: 'complete', priority: 'high', description: 'Define REST endpoints' },
  { id: '2', title: 'User authentication', agent: 'MARIO', status: 'active', priority: 'critical', description: 'Implement JWT auth' },
  { id: '3', title: 'Database migration', agent: 'MARIO', status: 'pending', priority: 'high', description: 'Create user tables' },
  { id: '4', title: 'Unit tests', agent: 'LUIGI', status: 'pending', priority: 'medium', description: 'Auth module coverage' },
  { id: '5', title: 'Deploy to staging', agent: 'PEACH', status: 'pending', priority: 'medium', description: 'Docker compose setup' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks = DEMO_TASKS, 
  onTaskClick,
  onAssignTask 
}) => {
  const getTasksForColumn = (columnId: AgentRole) => {
    return tasks.filter(task => task.agent === columnId);
  };

  return (
    <section className="kanban-board" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🎯 TASK BOARD</h2>
        <div style={styles.stats}>
          <span style={styles.stat}>Total: {tasks.length}</span>
          <span style={styles.stat}>Active: {tasks.filter(t => t.status === 'active').length}</span>
          <span style={styles.stat}>Complete: {tasks.filter(t => t.status === 'complete').length}</span>
        </div>
      </div>

      <div style={styles.columns}>
        {COLUMNS.map(column => {
          const columnTasks = getTasksForColumn(column.id);
          return (
            <div key={column.id} style={styles.column}>
              <div style={{ ...styles.columnHeader, borderColor: column.color }}>
                <img 
                  src={column.sprite} 
                  alt={column.title}
                  style={styles.columnSprite}
                />
                <div style={styles.columnTitle}>
                  <span style={{ ...styles.agentName, color: column.color }}>{column.title}</span>
                  <span style={styles.subtitle}>{column.subtitle}</span>
                </div>
                <span style={styles.taskCount}>{columnTasks.length}</span>
              </div>

              <div style={styles.taskList}>
                {columnTasks.map(task => {
                  const status = STATUS_CONFIG[task.status];
                  const priority = PRIORITY_CONFIG[task.priority];
                  return (
                    <div
                      key={task.id}
                      style={styles.taskCard}
                      className={`task-card ${status.className}`}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <div style={styles.taskHeader}>
                        <span style={{ ...styles.priority, backgroundColor: priority.color }}>
                          {priority.label}
                        </span>
                        <span style={{ ...styles.status, backgroundColor: getStatusColor(task.status) }}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <h4 style={styles.taskTitle}>{task.title}</h4>
                      {task.description && (
                        <p style={styles.taskDescription}>{task.description}</p>
                      )}
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div style={styles.emptyState}>
                    <span>No tasks</span>
                  </div>
                )}
              </div>

              <button
                style={{ ...styles.addButton, borderColor: column.color, color: column.color }}
                onClick={() => onAssignTask?.(column.id)}
                className="nes-btn"
              >
                + Assign Task
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .kanban-board .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .kanban-board .task-card.is-active {
          border-left: 4px solid #3498db;
        }
        .kanban-board .task-card.is-complete {
          border-left: 4px solid #2ecc71;
          opacity: 0.9;
        }
        .kanban-board .task-card.is-failed {
          border-left: 4px solid #e74c3c;
        }
      `}</style>
    </section>
  );
};

function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'pending': return '#95a5a6';
    case 'active': return '#3498db';
    case 'complete': return '#2ecc71';
    case 'failed': return '#e74c3c';
    default: return '#95a5a6';
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    border: '4px solid #16213e',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #0f3460',
  },
  title: {
    margin: 0,
    fontFamily: "Press Start 2P, monospace",
    fontSize: '14px',
    color: '#fff',
  },
  stats: {
    display: 'flex',
    gap: '20px',
  },
  stat: {
    fontFamily: "Press Start 2P, monospace",
    fontSize: '10px',
    color: '#aaa',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
  },
  column: {
    backgroundColor: '#0f3460',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '300px',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '12px',
    borderBottom: '3px solid',
    marginBottom: '12px',
  },
  columnSprite: {
    width: '32px',
    height: '32px',
    imageRendering: 'pixelated',
  },
  columnTitle: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  agentName: {
    fontFamily: "Press Start 2P, monospace",
    fontSize: '10px',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '9px',
    color: '#888',
    fontFamily: "Press Start 2P, monospace",
  },
  taskCount: {
    fontFamily: "Press Start 2P, monospace",
    fontSize: '12px',
    color: '#fff',
    backgroundColor: '#16213e',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#16213e',
    borderRadius: '6px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderLeft: '4px solid #e94560',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  priority: {
    fontSize: '8px',
    fontFamily: "Press Start 2P, monospace",
    padding: '2px 6px',
    borderRadius: '3px',
    color: '#fff',
  },
  status: {
    fontSize: '8px',
    fontFamily: "Press Start 2P, monospace",
    padding: '2px 6px',
    borderRadius: '3px',
    color: '#fff',
  },
  taskTitle: {
    margin: 0,
    fontSize: '11px',
    fontFamily: "Press Start 2P, monospace",
    color: '#fff',
    lineHeight: 1.4,
  },
  taskDescription: {
    margin: '6px 0 0',
    fontSize: '9px',
    color: '#888',
    fontFamily: "Press Start 2P, monospace",
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 10px',
    color: '#555',
    fontSize: '10px',
    fontFamily: "Press Start 2P, monospace",
  },
  addButton: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '2px dashed',
    borderRadius: '6px',
    fontFamily: "Press Start 2P, monospace",
    fontSize: '9px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default KanbanBoard;