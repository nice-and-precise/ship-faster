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

export type MainframeDispatchResult = 
  | { success: true; runId?: string; data?: Record<string, unknown> }
  | { success: false; error: string };

export async function parseMainframeDispatchResponse(response: Response): Promise<MainframeDispatchResult> {
  const status = response.status;
  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    // Ignore read errors
  }

  if (status === 502 || status === 503) {
    return { success: false, error: `Gateway Error (${status}): The dispatch server is currently unreachable. Please verify the backend is running.` };
  }

  if (!response.ok) {
    let errorMsg = `Dispatch failed (${status})`;
    if (bodyText) {
      try {
        const parsed = JSON.parse(bodyText);
        const msg = parsed.error || parsed.message || parsed.detail;
        if (typeof msg === 'string') {
          errorMsg += `: ${msg}`;
        } else {
          errorMsg += `: ${bodyText.slice(0, 140)}`;
        }
      } catch {
        errorMsg += `: ${bodyText.slice(0, 140)}`;
      }
    }
    return { success: false, error: errorMsg };
  }

  try {
    const data = bodyText ? JSON.parse(bodyText) : {};
    const runId = typeof data.id === 'string' ? data.id : typeof data.runId === 'string' ? data.runId : undefined;
    return { success: true, runId, data };
  } catch {
    return { success: false, error: `Invalid JSON response from server: ${bodyText.slice(0, 100)}` };
  }
}
