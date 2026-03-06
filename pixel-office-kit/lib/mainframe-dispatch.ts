export type MainframeDispatchState = 'READY' | 'DISPATCHING' | 'DISPATCHED' | 'BLOCKED_CONFIG' | 'FAILED';

export type MainframeDispatchConfig = {
  apiBaseUrl?: string;
  dispatchToken?: string;
  pipelineName?: string;
};

export type MainframeDispatchInput = {
  targetUrl: string;
};

export type MainframeDispatchTransition =
  | { type: 'BEGIN' }
  | { type: 'BLOCKED_CONFIG' }
  | { type: 'SUCCESS' }
  | { type: 'FAIL' }
  | { type: 'RESET' };

export function transitionMainframeDispatchState(
  _current: MainframeDispatchState,
  transition: MainframeDispatchTransition,
): MainframeDispatchState {
  if (transition.type === 'BEGIN') return 'DISPATCHING';
  if (transition.type === 'BLOCKED_CONFIG') return 'BLOCKED_CONFIG';
  if (transition.type === 'SUCCESS') return 'DISPATCHED';
  if (transition.type === 'FAIL') return 'FAILED';
  return 'READY';
}

export function getMainframeConfigBlockReason(config: MainframeDispatchConfig): string | null {
  if (!config.apiBaseUrl?.trim()) {
    return 'Runtime config missing: NEXT_PUBLIC_API_URL is not set.';
  }
  if (!config.dispatchToken?.trim()) {
    return 'Runtime token missing: set NEXT_PUBLIC_MAINFRAME_DISPATCH_TOKEN to enable dispatch.';
  }
  return null;
}

export function buildMainframeDispatchRequest(config: MainframeDispatchConfig, input: MainframeDispatchInput) {
  const apiBaseUrl = (config.apiBaseUrl ?? '').replace(/\/+$/, '');
  const endpoint = `${apiBaseUrl}/api/v1/runs`;
  const payload = {
    name: config.pipelineName ?? 'attack-plan.lobster',
    input: {
      target_url: input.targetUrl,
    },
    source: 'pixel-office-mainframe',
  };

  return {
    endpoint,
    payload,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.dispatchToken ?? ''}`,
    } as HeadersInit,
  };
}

export function toMainframeStatusLabel(state: MainframeDispatchState, detail?: string | null): string {
  if (state === 'READY') return 'MAINFRAME: READY';
  if (state === 'DISPATCHING') return 'MAINFRAME: DISPATCHING…';
  if (state === 'DISPATCHED') return 'MAINFRAME: DISPATCHED';
  if (state === 'BLOCKED_CONFIG') return detail ? `MAINFRAME: BLOCKED_CONFIG — ${detail}` : 'MAINFRAME: BLOCKED_CONFIG';
  return detail ? `MAINFRAME: FAILED — ${detail}` : 'MAINFRAME: FAILED';
}
