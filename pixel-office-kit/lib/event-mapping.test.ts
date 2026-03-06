import test from 'node:test';
import assert from 'node:assert/strict';

import { projectMissionEvents } from './event-mapping.ts';

test('maps run lifecycle + stage + qa + artifact into active/idle track buckets', () => {
  const projection = projectMissionEvents([
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_1' },
      payload: { transition: 'queued' },
    },
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_1' },
      payload: { transition: 'started' },
    },
    {
      event_type: 'stage.lifecycle',
      correlation: { run_id: 'run_1', stage_id: 'generate' },
      payload: { stage_id: 'generate', transition: 'started' },
    },
    {
      event_type: 'qa.gate.result',
      correlation: { run_id: 'run_1', stage_id: 'run_audit' },
      payload: { stage_id: 'run_audit', gate_name: 'CWV_PASS', result: 'pass' },
    },
    {
      event_type: 'artifact.produced',
      correlation: { run_id: 'run_1', stage_id: 'run_audit' },
      payload: {
        stage_id: 'run_audit',
        artifact_id: 'attack_report_md',
        artifact_type: 'report_markdown',
        uri: 'a.md',
        mime_type: 'text/markdown',
        size_bytes: 10,
      },
    },
  ]);

  assert.equal(projection.activeRuns.length, 0);
  assert.equal(projection.idleRuns.length, 1);
  assert.equal(projection.idleRuns[0]?.stage, 'AT_FILING_CABINET • Filing Cabinet terminal');
  assert.equal(projection.runs[0]?.status, 'completed');
});

test('terminal lock keeps failed runs idle until resumed/started', () => {
  const projection = projectMissionEvents([
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_2' },
      payload: { transition: 'failed' },
    },
    {
      event_type: 'stage.lifecycle',
      correlation: { run_id: 'run_2', stage_id: 'generate' },
      payload: { stage_id: 'generate', transition: 'started' },
    },
  ]);

  assert.equal(projection.activeRuns.length, 0);
  assert.equal(projection.idleRuns.length, 1);
  assert.equal(projection.runs[0]?.status, 'failed');
});

test('projects active lane labels for scout + qa states with canonical literals', () => {
  const scoutProjection = projectMissionEvents([
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_4' },
      payload: { transition: 'started' },
    },
    {
      event_type: 'stage.lifecycle',
      correlation: { run_id: 'run_4', stage_id: 'generate' },
      payload: { stage_id: 'generate', transition: 'started' },
    },
  ]);

  assert.equal(scoutProjection.activeRuns.length, 1);
  assert.equal(scoutProjection.activeRuns[0]?.stage, 'AT_SCOUT • CRUSTY → SCOUT lane');

  const qaProjection = projectMissionEvents([
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_5' },
      payload: { transition: 'started' },
    },
    {
      event_type: 'qa.gate.result',
      correlation: { run_id: 'run_5', stage_id: 'run_audit' },
      payload: { stage_id: 'run_audit', gate_name: 'CWV_PASS', result: 'pass' },
    },
  ]);

  assert.equal(qaProjection.activeRuns.length, 1);
  assert.equal(qaProjection.activeRuns[0]?.stage, 'AT_QA • QA gate');
});

test('failed, timed_out, and canceled transitions get distinct idle terminal labels', () => {
  const projection = projectMissionEvents([
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_failed' },
      payload: { transition: 'failed' },
    },
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_timed_out' },
      payload: { transition: 'timed_out' },
    },
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_canceled' },
      payload: { transition: 'canceled' },
    },
  ]);

  assert.equal(projection.activeRuns.length, 0);
  assert.equal(projection.idleRuns.length, 3);

  const idleById = new Map(projection.idleRuns.map((run) => [run.id, run.stage]));
  assert.equal(idleById.get('run_failed'), 'FAILED_AT_CRUSTY • CRUSTY crash');
  assert.equal(idleById.get('run_timed_out'), 'FAILED_AT_CRUSTY • CRUSTY timeout');
  assert.equal(idleById.get('run_canceled'), 'AT_CRUSTY • run canceled');
});

test('unknown literals degrade safely without throwing', () => {
  const projection = projectMissionEvents([
    {
      event_type: 'run.lifecycle',
      correlation: { run_id: 'run_3' },
      payload: { transition: 'mystery_state' },
    },
    {
      event_type: 'unknown.event',
      correlation: { run_id: 'run_3' },
      payload: { any: 'value' },
    },
  ]);

  assert.equal(projection.runs.length, 1);
  assert.equal(projection.activeRuns.length, 0);
  assert.equal(projection.idleRuns.length, 1);
});
