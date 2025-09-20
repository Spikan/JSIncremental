# Soda Clicker Pro

A TypeScript + Vite incremental game. This README focuses on what you need to run, test, and build.

## Quick start

- Prerequisites: Node 18+
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Run tests: `npm test`
- Type-check: `npm run type-check`
- Lint & format check: `npm run quality`
- Build production: `npm run build`

## Scripts

- `dev`: Vite dev server
- `build`: Production build (outputs to `dist/`)
- `preview`: Preview the production build
- `test`, `test:watch`, `test:coverage`, `test:ui`: Vitest
- `type-check`: tsc noEmit
- `lint`, `lint:fix`: ESLint
- `format`, `format:check`: Prettier
- `quality`: Lint + format check + type-check
- `css:optimize`, `css:analyze`: CSS utilities

## Project structure (high level)

- `index.html`: App shell
- `ts/`: TypeScript sources
  - `core/`: rules, systems, state, validation
  - `services/`: storage, events, audio, perf, PWA
  - `ui/`: displays, inputs, navigation, feedback
- `data/`: `upgrades.json`, `unlocks.json`
- `css/`, `images/`, `fonts/`, `res/`: assets
- `tests/`: Vitest suite

## Development notes

- Extreme numbers handled via `break_eternity.js` (use `.toString()` for display)
- State managed via a centralized store in `ts/core/state/`
- Events via `ts/services/event-bus.ts`

## License

Open source. Have fun. 🥤
