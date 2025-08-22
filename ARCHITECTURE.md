# Soda Clicker Pro - Architecture

## Overview

This document outlines the modular architecture for Soda Clicker Pro, designed to improve code readability, maintainability, and AI agent traversability.

## Core Principles

1. **Single State Container**: Plain object store with pure mutations and derived selectors
2. **Event Bus (Pub/Sub)**: Decoupled systems and UI via event-driven architecture  
3. **Declarative Gameplay**: Game definitions in JSON data files
4. **Pure Functions**: Business logic extracted into pure, testable functions
5. **Runtime Validation**: Zod schemas ensure data integrity

## Module Structure

```
js/
├── index.js                 # Main entry point, bootstraps App global
├── main.js                  # Legacy game logic (being refactored)
├── config.js                # Game configuration
├── feature-unlocks.js       # Feature unlock management
├── god.js                   # God mode functionality
├── dom-cache.js             # DOM element caching
├── core/
│   ├── state/
│   │   ├── index.js         # State store implementation
│   │   └── mutations.js     # Pure state mutation helpers
│   ├── rules/               # Pure business logic
│   │   ├── clicks.js        # Click calculations
│   │   ├── purchases.js     # Purchase cost calculations
│   │   └── economy.js       # Economy calculations (SPD, SPS)
│   ├── systems/             # Game systems
│   │   ├── resources.js     # Resource production calculations
│   │   ├── purchases-system.js # Purchase logic for all upgrades
│   │   ├── clicks-system.js # Click handling and feedback
│   │   ├── autosave.js      # Autosave counter and timing logic
│   │   ├── save-system.js   # Save/load operations with validation
│   │   ├── options-system.js # Game options and preferences management
│   │   ├── loop-system.js   # Game loop and timing management
│   │   └── button-audio.js  # Button click/purchase/critical sound effects and preferences
│   ├── constants.js         # Event names and constants
│   └── validation/          # Zod validation schemas
│       └── schemas.js       # Data validation schemas
├── services/
│   ├── storage.js           # Abstracted localStorage operations
│   └── event-bus.js         # Event bus implementation
└── data/                    # JSON data files
    ├── unlocks.json         # Feature unlock conditions
    └── upgrades.json        # Upgrade definitions and costs
```

## Key Components

### App Global Object

The `window.App` object provides a centralized API for all modularized functionality:

```javascript
window.App = {
    state: createStore(),           // State management
    storage,                        // Storage abstraction
    events: eventBus,              // Event system
    EVENT_NAMES,                   // Event constants
    rules: {                       // Business logic
        clicks, purchases, economy
    },
    systems: {                     // Game systems
        resources,                  # Resource production calculations
        purchases,                  # Purchase logic for all upgrades
        clicks,                     # Click handling and feedback
        autosave,                   # Autosave counter and timing logic
        save,                       # Save/load operations with validation
        options,                    # Game options and preferences management
        loop,                       # Game loop and timing management
        music                       # Music playback, sound effects, and audio context management
    },
    data: {                        // Game data
        unlocks, upgrades
    }
};
```

### State Management

Simple state store with subscription support:

```javascript
const store = createStore(initialState);
store.subscribe((newState, oldState) => {
    // React to state changes
});
store.set({ sips: newValue });
const currentState = store.get();
```

### Event System

Pub/sub event bus for loose coupling:

```javascript
App.events.on(App.EVENT_NAMES.CLICK.SODA, (data) => {
    // Handle soda click
});

App.events.emit(App.EVENT_NAMES.ECONOMY.PURCHASE, {
    item: 'straw',
    cost: 5
});
```

### Data Validation

Zod schemas ensure data integrity at runtime:

```javascript
// Validate unlocks data
const validatedUnlocks = validateUnlocks(unlocksData);
if (validatedUnlocks) {
    App.data.unlocks = validatedUnlocks;
} else {
    console.warn('Invalid unlocks data, using fallback');
}

// Validate game saves
const validatedSave = validateGameSave(saveData);
if (validatedSave) {
    // Load validated save
} else {
    // Handle invalid save gracefully
}
```

### Storage Abstraction

Namespaced localStorage with validation:

```javascript
// All keys prefixed with 'game_'
App.storage.setJSON('options', gameOptions);
App.storage.getBoolean('clickSoundsEnabled', true);
App.storage.saveGame(gameState);
```

## Data Files

### unlocks.json
Defines thresholds for feature unlocks:
```json
{
  "suction": { "sips": 25, "clicks": 8 },
  "straws": { "sips": 500, "clicks": 50 }
}
```

### upgrades.json  
Defines upgrade costs and effects:
```json
{
  "straws": {
    "baseCost": 5,
    "scaling": 1.15,
    "baseSPD": 0.6,
    "multiplierPerLevel": 0.2
  }
}
```

## Development Workflow

### Testing
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
```

### Code Quality
```bash
npm run lint          # ESLint
npm run format        # Prettier
```

### Development Server
```bash
npm run dev           # Vite dev server
```

## Migration Strategy

1. **Phase 1**: Core infrastructure (✅ Complete)
   - State store, event bus, storage abstraction
   - Basic rules and systems
   - Data file loading

2. **Phase 2**: Game logic extraction (✅ Complete)
   - Move calculations to pure functions
   - Extract upgrade logic
   - Centralize resource management
   - Extract all major game systems (purchases, clicks, autosave, save, options, loop, music)

3. **Phase 3**: UI decoupling (🔄 Next)
   - Separate UI logic from game logic
   - Event-driven UI updates
   - Component-based structure

4. **Phase 4**: Advanced features
   - Save file versioning
   - Plugin system
   - Performance optimizations

## Benefits

- **AI Agent Friendly**: Clear module boundaries and data flow
- **Maintainable**: Small, focused modules with single responsibilities
- **Testable**: Pure functions and isolated components
- **Debuggable**: Event tracing and validation errors
- **Extensible**: Easy to add new features and systems


