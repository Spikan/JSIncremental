// Main Game Logic - Legacy game logic being refactored into modular architecture (TypeScript)
// Thin shim that preserves runtime behavior while migration continues.

// Re-export nothing; this file sets up globals used by HTML and other modules

// Bring over the JS file contents verbatim with minimal edits for TS compatibility
// We import the existing JS via a triple-slash reference to keep order under Vite
// but here we inline the logic from js/main.js, adapted for TS types.

// For maintainability, we simply import the JS version so behavior stays identical during stepwise migration.
// Once fully migrated, we will remove this bridge and keep only TypeScript.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import './main.js';


