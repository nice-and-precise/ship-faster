import { useState } from 'react';
import { type PaperclipProjection, type PaperclipRole, type PaperclipTask } from '@/lib/paperclip-mapping';

type PaperclipOrgChartPanelProps = {
  projection: PaperclipProjection;
  token?: string;
};

// Character sprites for each role
const ROLE_SPRITES: Record<PaperclipRole, string> = {
  Toad: '/sprites/toad/toad-stand.svg',
  Mario: '/sprites/mario/mario-stand.svg',
  Luigi: '/sprites/luigi/luigi-stand.svg',
  Peach: '/sprites/peach/peach-stand.svg',
};

const ROLE_COLORS: Record<PaperclipRole, string> = {
  Toad: '#0066cc',
  Mario: '#ff0000',
  Luigi: '#00aa00',
  Peach: '#ff69b4',
};

const ORG_ROLES: ReadonlyArray<{ id: PaperclipRole; subtitle: string }> = [
  { id: 'Toad', subtitle: 'Product Manager' },
  { id: 'Mario', subtitle: 'Engineering Manager' },
  { id: 'Luigi', subtitle: 'QA Auditor' },
  { id: 'Peach', subtitle: 'Ops + Strategy' },
] as const;

function formatStateLabel(state: 'PROPOSED' | 'APPROVED') {
  return state === 'APPROVED' ? 'APPROVED' : 'PROPOSED';
}

function groupTasksByRole(tasks: PaperclipTask[]): Record<PaperclipRole, PaperclipTask[]> {
  const grouped: Record<PaperclipRole, PaperclipTask[]> = {
    Toad: [],
    Mario: [],
    Luigi: [],
    Peach: [],
  };

  for (const task of tasks) {
    grouped[task.role].push(task);
  }

  return grouped;
}

async function approveTask(task: PaperclipTask, token: string): Promise<boolean> {
  try {
    const runId = `pc_run_${task.taskId}`;
    const stageId = "paperclip.proposal";
    const response = await fetch('/api/v1/actions/approval.approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        approval_id: task.id,
        run_id: runId,
        stage_id: stageId,
        reason: 'Approved via Paperclip UI',
        requested_by: 'paperclip-ui',
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to approve task:', error);
    return false;
  }
}

async function rejectTask(task: PaperclipTask, token: string): Promise<boolean> {
  try {
    const runId = `pc_run_${task.taskId}`;
    const stageId = "paperclip.proposal";
    const response = await fetch('/api/v1/actions/approval.reject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        approval_id: task.id,
        run_id: runId,
        stage_id: stageId,
        reason: 'Rejected via Paperclip UI',
        requested_by: 'paperclip-ui',
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to reject task:', error);
    return false;
  }
}

export default function PaperclipOrgChartPanel({ projection, token }: PaperclipOrgChartPanelProps) {
  const [tasks, setTasks] = useState<PaperclipTask[]>(projection.tasks);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  // Sync with projection changes
  useState(() => {
    setTasks(projection.tasks);
  });

  const tasksByRole = groupTasksByRole(tasks);

  const handleApprove = async (task: PaperclipTask) => {
    if (!token || task.state !== 'PROPOSED') return;
    setIsProcessing((prev) => ({ ...prev, [task.id]: true }));
    const success = await approveTask(task, token);
    if (success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, state: 'APPROVED' } : t))
      );
    }
    setIsProcessing((prev) => ({ ...prev, [task.id]: false }));
  };

  const handleReject = async (task: PaperclipTask) => {
    if (!token || task.state !== 'PROPOSED') return;
    setIsProcessing((prev) => ({ ...prev, [task.id]: true }));
    const success = await rejectTask(task, token);
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
    setIsProcessing((prev) => ({ ...prev, [task.id]: false }));
  };

  const proposedCount = tasks.filter((t) => t.state === 'PROPOSED').length;
  const approvedCount = tasks.filter((t) => t.state === 'APPROVED').length;

  return (
    <section className="nes-container is-rounded with-title pixel-paperclip-panel" aria-label="Paperclip org chart panel">
      <p className="title">Paperclip Org Chart</p>

      <div className="pixel-paperclip-role-grid">
        {ORG_ROLES.map((role) => {
          const assigned = tasksByRole[role.id];
          return (
            <article key={role.id} className="pixel-paperclip-role-card">
              <div className="pixel-paperclip-role-heading">
                <img 
                  src={ROLE_SPRITES[role.id]} 
                  alt={role.id}
                  width="32"
                  height="32"
                  style={{ 
                    imageRendering: 'pixelated',
                    marginRight: '8px',
                  }} 
                />
                <span style={{ color: ROLE_COLORS[role.id] }}>{role.id}</span>
              </div>
              <p className="pixel-paperclip-role-subtitle">{role.subtitle}</p>
              <p className="pixel-paperclip-role-count">{assigned.length} tasks</p>

              {assigned.length === 0 ? (
                <p className="pixel-paperclip-role-empty">No assignments</p>
              ) : (
                <ul className="pixel-paperclip-role-lane" aria-label={`${role.id} role lane`}>
                  {assigned.slice(0, 3).map((task) => (
                    <li key={task.id} className="pixel-paperclip-role-task">
                      <span
                        className={`pixel-paperclip-task-state is-mini ${task.state === 'APPROVED' ? 'is-approved' : 'is-proposed'}`}
                        aria-label={`${task.state} state`}
                      >
                        {formatStateLabel(task.state)}
                      </span>
                      <span className="pixel-paperclip-role-task-title" title={task.title}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>

      <div className="pixel-paperclip-status-row" aria-label="Paperclip task state totals">
        <span className="pixel-paperclip-state-pill is-proposed">PROPOSED: {proposedCount}</span>
        <span className="pixel-paperclip-state-pill is-approved">APPROVED: {approvedCount}</span>
      </div>

      {!projection.hasPaperclipEvents ? (
        <div className="nes-container is-dark is-rounded pixel-paperclip-empty">
          No Paperclip events yet. Waiting for <code>/api/v1/ingest/paperclip</code> telemetry.
        </div>
      ) : tasks.length === 0 ? (
        <div className="nes-container is-dark is-rounded pixel-paperclip-empty">
          Paperclip events received, but no PROPOSED/APPROVED task states detected.
        </div>
      ) : (
        <ul className="pixel-paperclip-task-list" aria-label="Paperclip tasks">
          {tasks.slice(0, 8).map((task) => (
            <li key={task.id} className="pixel-paperclip-task-row">
              <span className={`pixel-paperclip-task-state ${task.state === 'APPROVED' ? 'is-approved' : 'is-proposed'}`}>
                {formatStateLabel(task.state)}
              </span>
              <div className="pixel-paperclip-task-copy">
                <strong>{task.title}</strong>
                <span>
                  {task.role} · {task.taskId}
                </span>
              </div>
              {token && task.state === 'PROPOSED' && (
                <div className="pixel-paperclip-task-actions">
                  <button
                    className="nes-btn is-success is-small"
                    onClick={() => handleApprove(task)}
                    disabled={isProcessing[task.id]}
                    aria-label={`Approve ${task.title}`}
                  >
                    {isProcessing[task.id] ? '...' : '✓'}
                  </button>
                  <button
                    className="nes-btn is-error is-small"
                    onClick={() => handleReject(task)}
                    disabled={isProcessing[task.id]}
                    aria-label={`Reject ${task.title}`}
                  >
                    {isProcessing[task.id] ? '...' : '✗'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
