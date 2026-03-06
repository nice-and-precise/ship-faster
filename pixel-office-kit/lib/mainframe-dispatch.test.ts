import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMainframeDispatchRequest,
  getMainframeConfigBlockReason,
  transitionMainframeDispatchState,
} from './mainframe-dispatch.ts';

test('transitionMainframeDispatchState maps transitions deterministically', () => {
  assert.equal(transitionMainframeDispatchState('READY', { type: 'BEGIN' }), 'DISPATCHING');
  assert.equal(transitionMainframeDispatchState('DISPATCHING', { type: 'SUCCESS' }), 'DISPATCHED');
  assert.equal(transitionMainframeDispatchState('DISPATCHING', { type: 'FAIL' }), 'FAILED');
  assert.equal(transitionMainframeDispatchState('READY', { type: 'BLOCKED_CONFIG' }), 'BLOCKED_CONFIG');
  assert.equal(transitionMainframeDispatchState('FAILED', { type: 'RESET' }), 'READY');
});

test('getMainframeConfigBlockReason returns a reason when token missing', () => {
  const reason = getMainframeConfigBlockReason({ apiBaseUrl: 'http://localhost:8080', dispatchToken: '' });
  assert.match(reason ?? '', /token missing/i);
});

test('buildMainframeDispatchRequest uses existing runs endpoint with expected payload shape', () => {
  const req = buildMainframeDispatchRequest(
    {
      apiBaseUrl: 'http://localhost:8080/',
      dispatchToken: 'abc123',
      pipelineName: 'attack-plan.lobster',
    },
    { targetUrl: 'https://example.com' },
  );

  assert.equal(req.endpoint, 'http://localhost:8080/api/v1/runs');
  assert.deepEqual(req.payload, {
    name: 'attack-plan.lobster',
    input: { target_url: 'https://example.com' },
    source: 'pixel-office-mainframe',
  });
});

import { parseMainframeDispatchResponse } from './mainframe-dispatch.ts';

test('parseMainframeDispatchResponse handles success JSON', async () => {
  const res = new Response(JSON.stringify({ id: 'run_123', status: 'ok' }), { status: 200 });
  const result = await parseMainframeDispatchResponse(res);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.runId, 'run_123');
    assert.equal(result.data.status, 'ok');
  }
});

test('parseMainframeDispatchResponse handles 502 Gateway Error', async () => {
  const res = new Response('<html>nginx 502 bad gateway</html>', { status: 502 });
  const result = await parseMainframeDispatchResponse(res);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Gateway Error \(502\)/);
  }
});

test('parseMainframeDispatchResponse handles JSON error payload', async () => {
  const res = new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  const result = await parseMainframeDispatchResponse(res);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Dispatch failed \(401\): Invalid token/);
  }
});
