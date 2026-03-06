import test from 'node:test';
import assert from 'node:assert/strict';

import { projectPaperclipTasks } from './paperclip-mapping.ts';

test('projects PROPOSED/APPROVED paperclip tasks with role lanes', () => {
  const projection = projectPaperclipTasks([
    {
      event_type: 'approval.lifecycle',
      source: 'paperclip-service',
      status: 'proposed',
      actor: 'product_manager',
      occurred_at: '2026-03-05T20:00:00.000Z',
      payload: {
        approval_id: 'appr-1',
        proposal_status: 'proposed',
        paperclip_event_type: 'task.proposed',
        task: {
          task_id: 'task-1',
          title: 'Draft mission brief',
        },
      },
    },
    {
      event_type: 'approval.lifecycle',
      source: 'paperclip-service',
      status: 'approved',
      actor: 'engineering_manager',
      occurred_at: '2026-03-05T20:01:00.000Z',
      payload: {
        approval_id: 'appr-2',
        proposal_status: 'approved',
        paperclip_event_type: 'task.approved',
        task: {
          task_id: 'task-2',
          title: 'Ship telemetry panel',
        },
      },
    },
    {
      event_type: 'approval.lifecycle',
      source: 'paperclip-service',
      status: 'proposed',
      actor: 'qa_reviewer',
      occurred_at: '2026-03-05T20:02:00.000Z',
      payload: {
        approval_id: 'appr-3',
        proposal_status: 'proposed',
        task: {
          task_id: 'task-3',
          title: 'Validate edge cases',
        },
      },
    },
    {
      event_type: 'approval.lifecycle',
      source: 'paperclip-service',
      status: 'proposed',
      actor: 'ops_strategy_lead',
      occurred_at: '2026-03-05T20:03:00.000Z',
      payload: {
        approval_id: 'appr-4',
        proposal_status: 'proposed',
        task: {
          task_id: 'task-4',
          title: 'Stage launch checklist',
        },
      },
    },
  ]);

  assert.equal(projection.hasPaperclipEvents, true);
  assert.equal(projection.proposedCount, 3);
  assert.equal(projection.approvedCount, 1);

  const byId = new Map(projection.tasks.map((task) => [task.id, task]));
  assert.equal(byId.get('appr-1')?.role, 'Toad');
  assert.equal(byId.get('appr-2')?.role, 'Mario');
  assert.equal(byId.get('appr-3')?.role, 'Luigi');
  assert.equal(byId.get('appr-4')?.role, 'Peach');
});

test('upgrades matching task state from PROPOSED to APPROVED', () => {
  const projection = projectPaperclipTasks([
    {
      event_type: 'approval.lifecycle',
      source: 'paperclip-service',
      status: 'proposed',
      occurred_at: '2026-03-05T20:00:00.000Z',
      payload: {
        approval_id: 'appr-5',
        proposal_status: 'proposed',
        task: {
          task_id: 'task-5',
          title: 'Prepare launch deck',
        },
      },
    },
    {
      event_type: 'approval.lifecycle',
      source: 'paperclip-service',
      status: 'approved',
      occurred_at: '2026-03-05T20:05:00.000Z',
      payload: {
        approval_id: 'appr-5',
        proposal_status: 'approved',
        decision: 'approved',
        task: {
          task_id: 'task-5',
          title: 'Prepare launch deck',
        },
      },
    },
  ]);

  assert.equal(projection.tasks.length, 1);
  assert.equal(projection.tasks[0]?.state, 'APPROVED');
  assert.equal(projection.proposedCount, 0);
  assert.equal(projection.approvedCount, 1);
});

test('gracefully handles empty telemetry and non-paperclip events', () => {
  const emptyProjection = projectPaperclipTasks([]);
  assert.equal(emptyProjection.hasPaperclipEvents, false);
  assert.equal(emptyProjection.tasks.length, 0);
  assert.equal(emptyProjection.proposedCount, 0);
  assert.equal(emptyProjection.approvedCount, 0);

  const noStateProjection = projectPaperclipTasks([
    {
      event_type: 'approval.lifecycle',
      source: 'paperclip-service',
      occurred_at: '2026-03-05T20:10:00.000Z',
      payload: {
        approval_id: 'appr-6',
        proposal_status: 'needs_review',
      },
    },
    {
      event_type: 'run.lifecycle',
      payload: { transition: 'started' },
      correlation: { run_id: 'run-1' },
    },
  ]);

  assert.equal(noStateProjection.hasPaperclipEvents, true);
  assert.equal(noStateProjection.tasks.length, 0);
  assert.equal(noStateProjection.proposedCount, 0);
  assert.equal(noStateProjection.approvedCount, 0);
});
