# Architecture Overview

This codebase is a modular TypeScript project built with Vite. It separates pure game logic, systems, UI, and services for clarity, testability, and performance.

## Layers

- Core rules (`ts/core/rules/`): Pure business logic (clicks, purchases, economy)
- Core state (`ts/core/state/`): Central store, shape, and mutations
- Core systems (`ts/core/systems/`): Orchestration of game features (loop, save, options, resources, clicks, drink)
- Validation (`ts/core/validation/`): Zod schemas for data and saves
- Numbers (`ts/core/numbers/`): Utilities for extreme values using `break_eternity.js`
- Services (`ts/services/`): Cross-cutting utilities (event bus, storage, audio, performance, PWA)
- UI (`ts/ui/`): Display updates, navigation, feedback, input helpers

## Data flow

- UI emits/handles user actions → systems apply rules → state updates → UI refreshes.
- Events are published via `ts/services/event-bus.ts` and consumed by systems/UI.
- Persistent data is validated and stored via `ts/services/storage.ts`.

## Key entry points

- `ts/index.ts`: App bootstrap and wiring
- `ts/core/systems/game-init.ts`: Initializes systems and loads data
- `ts/core/systems/loop-system.ts`: Frame/update loop

## Configuration & data

- `ts/config.ts`: constants/balance defaults
- `data/*.json`: `upgrades.json`, `unlocks.json` (validated at load time)

## Testing

- Vitest in `tests/`. Run `npm test` for the suite; `npm run test:coverage` for coverage.

## Conventions

- Use event names from `ts/core/constants.ts`
- Prefer pure functions in `rules/` and keep side effects in `systems/`
- Display extreme numbers via `.toString()` to preserve precision
