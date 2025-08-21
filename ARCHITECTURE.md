Architecture overview

- Entry: `index.html` loads scripts.
- Bootstrap: `js/index.js` exposes `window.App` with:
  - `store`: minimal observable store (`createStore`, `getState`, `setState`, `subscribe`).
  - `storage`: `loadGame`, `saveGame`, `deleteSave`, `getStorageMeta`.
- State: `js/core/state/index.js` contains the initial store abstraction.
- Persistence: `js/services/storage.js` wraps `localStorage` with versioned payloads.

Migration plan (phase 1)

1. Keep all gameplay logic in `js/main.js` for now.
2. New modules are loaded before `main.js` so legacy globals continue to work.
3. Future phases will:
   - Move save/load to `services/storage.js` and call from `main.js`.
   - Gradually relocate systems (upgrades, timers) into modular files under `js/core`.

Notes

- No behavioral changes introduced in this phase.
- `window.App` is a stable API for UI and dev tooling.


