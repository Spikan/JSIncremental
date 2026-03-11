# `ts/` `.innerHTML =` Security Audit

Classification key:

- **Trusted/static**: assigned static markup or generated from fully internal constants.
- **Potentially untrusted**: includes interpolated/runtime values that may come from gameplay state, labels, names, or externalized data.
- **Benign clear/reset**: assignment to `''` to clear nodes.

## Findings

- `ts/god.ts:115` — Potentially untrusted (template interpolation in message UI).
- `ts/god.ts:258` — Potentially untrusted (template interpolation in message UI).
- `ts/ui/level-selector.ts:43` — Trusted/static (static header markup).
- `ts/ui/level-selector.ts:109` — Benign clear/reset.
- `ts/ui/fountain-progress.ts:160` — Benign clear/reset.
- `ts/ui/loading-screen.ts:120` — Potentially untrusted (`getHTML()` output assignment).
- `ts/ui/loading-screen.ts:734` — Potentially untrusted (step list joined into HTML).
- `ts/ui/loading-screen.ts:743` — Potentially untrusted (error list joined into HTML).
- `ts/ui/konami-code.ts:123` — Potentially untrusted (template interpolation in notification).
- `ts/ui/konami-code.ts:191` — Potentially untrusted (template interpolation in modal title).
- `ts/ui/displays.ts:143` — Potentially untrusted (formatted numeric output into HTML).
- `ts/ui/displays.ts:201` — Potentially untrusted (formatted numeric output into HTML).
- `ts/ui/displays.ts:522` — Potentially untrusted (level identifier string into HTML).
- `ts/ui/soda-3d-lightweight.ts:109` — Benign clear/reset.
- `ts/ui/offline-modal.ts:40` — Potentially untrusted (template interpolation in modal content).
- `ts/ui/offline-modal.ts:297` — Trusted/static (style tag content application).
- `ts/ui/offline-modal.ts:396` — Trusted/static (style injection authored in code).
- `ts/ui/utils.ts:310` — Potentially untrusted (formatted numeric string).
- `ts/ui/feedback.ts:353` — Potentially untrusted (purchase item label + cost interpolation) — **fixed**.
- `ts/ui/feedback.ts:435` — Potentially untrusted (bonus numeric string interpolation) — **fixed**.
- `ts/ui/feedback.ts:474` — Potentially untrusted (offline modal interpolation + inline onclick) — **fixed**.
- `ts/ui/enhanced-affordability.ts:163` — Potentially untrusted (tooltip HTML assignment).
- `ts/ui/buttons.ts:960` — Potentially untrusted (template interpolation in message).
- `ts/ui/buttons.ts:999` — Potentially untrusted (template interpolation in message).
- `ts/ui/buttons.ts:1395` — Benign clear/reset.
- `ts/ui/buttons.ts:1404` — Potentially untrusted (template interpolation in dropdown item).
- `ts/ui/soda-3d-three.ts:105` — Benign clear/reset.
- `ts/ui/soda-3d-three.ts:631` — Potentially untrusted (template interpolation in overlay).
- `ts/core/numbers/performance-tuning.ts:429` — Potentially untrusted (dashboard template interpolation).
- `ts/feature-unlocks.ts:160` — Potentially untrusted (notification interpolation).
- `ts/feature-unlocks.ts:480` — Potentially untrusted (grid template interpolation).
- `ts/feature-unlocks.ts:590` — Potentially untrusted (button interpolation).
- `ts/feature-unlocks.ts:621` — Potentially untrusted (button interpolation).
- `ts/feature-unlocks.ts:652` — Potentially untrusted (item interpolation).
- `ts/feature-unlocks.ts:683` — Potentially untrusted (item interpolation).
- `ts/feature-unlocks.ts:728` — Potentially untrusted (button interpolation).
- `ts/feature-unlocks.ts:786` — Potentially untrusted (cost element id interpolation).
- `ts/services/error-overlay.ts:479` — Benign clear/reset.
- `ts/services/soda-drinker-header-service.ts:472` — Potentially untrusted (requirements interpolation).
- `ts/services/soda-drinker-header-service.ts:487` — Potentially untrusted (requirements interpolation).
- `ts/services/soda-drinker-header-service.ts:495` — Potentially untrusted (requirements interpolation).
- `ts/services/soda-drinker-header-service.ts:568` — Benign clear/reset.
- `ts/services/soda-drinker-header-service.ts:583` — Potentially untrusted (level item interpolation).
- `ts/services/soda-drinker-header-service.ts:665` — Potentially untrusted (requirements interpolation).
- `ts/services/soda-drinker-header-service.ts:671` — Potentially untrusted (requirements interpolation).
- `ts/services/soda-drinker-header-service.ts:707` — Benign clear/reset.
- `ts/services/soda-drinker-header-service.ts:718` — Potentially untrusted (dropdown interpolation).
- `ts/services/animation-service.ts:306` — Potentially untrusted (celebration interpolation).

## Implemented in this patch

1. Replaced interpolated notification/card/modal rendering in `level-selector` and `feedback` with explicit DOM composition and `textContent` for variable text.
2. Replaced `updateCostDisplay` HTML assignment with `textContent`.
3. Added injection-focused tests for purchase/notification modal rendering.

## Remaining high-risk areas

Where rich markup is still used for dynamic content, either migrate to DOM composition/text nodes or apply vetted sanitizer + strict allowlist before assignment.
