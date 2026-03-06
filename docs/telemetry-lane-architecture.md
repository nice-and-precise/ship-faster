# Telemetry Lane Architecture

## Overview
The telemetry lane provides reliable agent state monitoring and action dispatching. It focuses on stability, clear error messaging, and defensive parsing.

## Key Components
- **Mainframe Dispatch**: Handles robust pipeline triggering. Includes error boundaries for 502/503 gateway errors and gracefully degrades on invalid JSON.
- **Agent Profiles**: Monitored via a polling mechanism with abort controllers to prevent race conditions during rapid re-fetches.
- **z-index Strategy**: Briefing balloons and toolbars maintain isolated stacking contexts to prevent overlaps with pixel office stage elements.

## Design Decisions
1. **Defensive Parsing**: Responses from external gateways are wrapped in `parseMainframeDispatchResponse` to extract actionable messages without crashing the client on HTML error pages.
2. **Standardized Scripts**: `npm test` acts as an alias for telemetry tests to ensure CI compatibility.
