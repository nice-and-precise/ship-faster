# Pixel Office Kit (Mission Control Integration)

Retro-styled Next.js UI for visualizing Mission Control runs as pixel agents.

## Current Capabilities
- Canvas map rendering (`TileMapRenderer`)
- Run-driven sprite overlay (`AgentSprite`)
- Telemetry polling from Mission Control (`GET /api/v1/runs`)
- Retro support components available via `RetroPolish.tsx` (`PixelOfficeHUD`, `CRTOverlay`)
- Agent builder modal component available (`AgentBuilderModal`)

## Project Structure
- App entry: `app/page.tsx`
- Active board: `components/PixelOffice.tsx`
- Core UI components:
  - `components/TileMapRenderer.tsx`
  - `components/AgentSprite.tsx`
  - `components/RetroPolish.tsx`
  - `components/AgentBuilderModal.tsx`

## Requirements
- Node.js 20+
- Mission Control API running at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080` if unset)

## Run

```bash
cd _tmp/ship-faster/pixel-office-kit
npm install
npm run dev
```

Open `http://localhost:3000`.

## Mission Control API Expectations
- Required now:
  - `GET /api/v1/runs`
- Available for next integration slice:
  - `POST /api/v1/agents`
  - `GET /api/v1/agents`

## Notes
- The UI currently treats run telemetry as read-only.
- Agent creation flow exists as UI component but must be explicitly wired to desk interaction and API submit.
