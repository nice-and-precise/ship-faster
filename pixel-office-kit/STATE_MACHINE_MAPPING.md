# STATE MACHINE MAPPING

## Frontend Animation Queue (Phase D)

### States
- `idle`: no queued animation events
- `animating`: one or more `AnimationEvent` entries mounted and transitioning
- `completed`: event calls `onComplete`, then removed from queue

### Event Type
```ts
type AnimationEvent = {
  id: string;
  kind: 'envelope';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};
```

### Transition Flow
1. UI action (`Test Envelope`) pushes an `AnimationEvent` into `animations`.
2. Queue render mounts `EnvelopeSprite`.
3. `EnvelopeSprite` runs CSS transition (start -> end) for ~1500ms.
4. `onTransitionEnd` (or timeout fallback) fires `onComplete(id)`.
5. Parent removes event from `animations` queue.
