import { type PaperclipProjection, type PaperclipRole, type PaperclipTask } from '@/lib/paperclip-mapping';

type PaperclipOrgChartPanelProps = {
  projection: PaperclipProjection;
};

const ORG_ROLES: ReadonlyArray<{ id: PaperclipRole; icon: string; subtitle: string }> = [
  { id: 'Toad', icon: '🍄', subtitle: 'Product Manager' },
  { id: 'Mario', icon: '🧢', subtitle: 'Engineering Manager' },
  { id: 'Luigi', icon: '🔍', subtitle: 'QA Auditor' },
  { id: 'Peach', icon: '👑', subtitle: 'Ops + Strategy' },
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

export default function PaperclipOrgChartPanel({ projection }: PaperclipOrgChartPanelProps) {
  const tasksByRole = groupTasksByRole(projection.tasks);

  return (
    <section className="nes-container is-rounded with-title pixel-paperclip-panel" aria-label="Paperclip org chart panel">
      <p className="title">Paperclip Org Chart</p>

      <div className="pixel-paperclip-role-grid">
        {ORG_ROLES.map((role) => {
          const assigned = tasksByRole[role.id];
          return (
            <article key={role.id} className="pixel-paperclip-role-card">
              <p className="pixel-paperclip-role-heading">
                <span aria-hidden>{role.icon}</span> {role.id}
              </p>
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
        <span className="pixel-paperclip-state-pill is-proposed">PROPOSED: {projection.proposedCount}</span>
        <span className="pixel-paperclip-state-pill is-approved">APPROVED: {projection.approvedCount}</span>
      </div>

      {!projection.hasPaperclipEvents ? (
        <div className="nes-container is-dark is-rounded pixel-paperclip-empty">
          No Paperclip events yet. Waiting for <code>/api/v1/ingest/paperclip</code> telemetry.
        </div>
      ) : projection.tasks.length === 0 ? (
        <div className="nes-container is-dark is-rounded pixel-paperclip-empty">
          Paperclip events received, but no PROPOSED/APPROVED task states detected.
        </div>
      ) : (
        <ul className="pixel-paperclip-task-list" aria-label="Paperclip tasks">
          {projection.tasks.slice(0, 8).map((task) => (
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
