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
