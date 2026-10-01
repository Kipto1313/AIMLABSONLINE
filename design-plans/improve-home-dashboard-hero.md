# Reframe the Home Dashboard Hero

## Context
- Audited surface: Sightline home dashboard, the `view === 'play'` branch rendered by `App`.
- User-selected finding: Make the home UI feel like an aim trainer rather than a marketing-style website; leave the actual training sandbox unchanged.
- Current commit: `ca3b6d8` (`The core gameplay Works right now`).
- Why this change is selected: The hero is the first dashboard surface users see and is the clearest direct contradiction with the requested operational aim-trainer tone.

## Evidence
- Contract: The user explicitly requested that the interface not look like a website because it is an aim trainer, while preserving the sandbox. This is a presentation and copy constraint for the home dashboard only.
- Runtime path: `App` renders the home branch when `view === 'play'`; its hero currently renders the editorial heading `Good aim is earned.`, the motivational paragraph `One clean rep at a time. Pick a drill and get to work.`, a local-date stamp, the recommended-drill control, and decorative range art. See `src/App.tsx` around the home page heading and `feature-run` composition.
- Deterministic interface consequence: The first viewport presents motivational/editorial framing before the user reaches the operational drill controls, so the dashboard reads as a promotional landing surface instead of a focused training console.
- Source files and symbols: `src/App.tsx` home `view === 'play'` branch; `src/index.css` `.page-heading`, `.feature-run`, `.feature-copy`, `.feature-art`, and responsive dashboard rules.

## Existing Owners
- Reusable token, primitive, variant, or exemplar: Existing dashboard vocabulary and controls: `YOUR TRAINING FLOOR`, `RECOMMENDED DRILL`, `PICK YOUR FOCUS`, `DRILL LIBRARY`, `START TRAINING`, and the existing `Space Grotesk` / `DM Mono` typography tokens in `src/index.css`.
- Current consumers: The home hero, drill library, duration selector, and start-training button already use these owners.
- Why the existing owner should be reused: The change is a tone and hierarchy correction within the existing dashboard language; it does not require a new component, token, font, or visual system.

## Implementation Steps
1. In the home `view === 'play'` branch of `src/App.tsx`, replace the editorial H1 and motivational supporting copy with concise, operational copy centered on selecting a drill and starting a timed training run. Use the existing dashboard vocabulary as the copy exemplar; avoid motivational slogans, lifestyle language, and landing-page language.
2. Keep the existing `date-stamp` behavior, `feature-run` structure, selected-drill metadata, duration selector, and `START TRAINING` action unchanged unless a copy-only adjustment is required to keep the revised heading from duplicating nearby labels.
3. Do not change `TrainingRange.tsx`, canvas rendering, pointer lock, target behavior, scoring, session completion, or any training-sandbox styling.
4. Preserve the existing desktop, tablet, and mobile branches in `src/index.css`; do not replace the dashboard with a marketing hero, image-led landing page, or new design system.

## Validation
- Focused source check: Confirm the home hero contains no motivational or promotional slogan and still renders the selected drill, duration controls, and `START TRAINING` action.
- Responsive check: Verify the unchanged `.page-heading`, `.feature-run`, `.feature-copy`, and `.feature-art` branches remain valid at the existing `1250px`, `900px`, and `600px` breakpoints.
- Regression check: Run `npm run build`; confirm `TrainingRange.tsx` has no diff and the active dashboard still enters the same training route through `startDrill`.

## Scope
- Files to change: `src/App.tsx`; only update `src/index.css` if the revised copy creates a verified wrapping or spacing regression in the existing hero layout.
- Files explicitly out of scope: `src/TrainingRange.tsx`, all canvas and sandbox styles, `src/EnvironmentSettings.tsx`, drill behavior, session state, statistics calculations, settings screens, and unrelated documentation.
- Expected user-visible result: The home screen reads as a focused aim-training console immediately on entry, with direct drill-selection language and the existing start workflow still prominent.

## Status
Approved for implementation
