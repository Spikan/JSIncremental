# Soda Clicker Pro - Complete Codebase Architecture

## 🎯 Project Overview

**Soda Clicker Pro** is an incremental/idle game built with vanilla JavaScript, featuring a modular architecture designed for maintainability and AI agent traversability. The game simulates a soda business where players click to earn "sips" and purchase upgrades to automate production.

## 🏗️ Architecture Principles

1. **Single State Container**: Centralized state management with pure mutations
2. **Event-Driven Architecture**: Decoupled systems via pub/sub event bus
3. **Data-Driven Design**: Game mechanics defined in JSON configuration files
4. **Pure Functions**: Business logic extracted into testable, pure functions
5. **Runtime Validation**: Zod schemas ensure data integrity
6. **Progressive Enhancement**: Graceful degradation for different browser capabilities
7. **No Duplicate Functions**: All duplicate code eliminated through modular architecture

## 🔄 Recent Refactoring (Duplicate Function Elimination)

### **Problem Solved**
The codebase had significant duplicate functions across `main.js`, UI modules, and core systems. This created maintenance issues and code bloat.

### **Solution Implemented**
- **Removed 15+ duplicate functions** from `main.js` (~2,500+ lines of duplicate code)
- **Updated 20+ function calls** to use modular versions
- **Consolidated functionality** into proper UI and core system modules
- **Maintained backward compatibility** through proper App object structure

-### **Functions Moved**
- **UI Functions**: `checkUpgradeAffordability`, `updateButtonState`, `updateCostDisplay`, `updateAllStats`, etc. → `App.ui.*`
- **Core Systems**: `saveOptions`, `loadOptions`, `performSaveSnapshot` → `App.systems.*`
- **Display Functions**: `updateTopSipsPerDrink`, `updateDrinkProgress`, etc. → `App.ui.*`

## 🔧 2025 Architecture Updates (State-Driven UI + TypeScript)

Recent work completed a full UI decoupling and established TypeScript infrastructure while keeping the codebase in JavaScript via JSDoc typing.

- **Single source of truth**: All UI modules read from `App.state` only. Legacy `window.*` UI reads have been eliminated.
- **Centralized UI events**: Inline `onclick` handlers were removed from `index.html`. Buttons now use `data-action` attributes with a centralized dispatcher in `js/ui/buttons.ts`.
- **Configuration access**: Added `js/core/systems/config-accessor.ts` to consistently read upgrades and balance data (`App.data.upgrades` → `GAME_CONFIG.BALANCE`).
- **Event names**: `EVENT_NAMES` exported from `js/core/constants.ts` and attached in `js/index.js` to `App.EVENT_NAMES` (and mirrored to `window.EVENT_NAMES`).
 - **Storage**: Validation functions are imported directly from `js/core/validation/schemas.ts`. The typed storage facade `AppStorage` lives in `js/services/storage.ts` and is attached to `window.storage` during bootstrap.
- **State bridge**: `js/core/state/bridge.ts` seeds and syncs legacy globals into `App.state` during initialization while we complete migration.
- **TypeScript infra**: Added `tsconfig.json` with `allowJs` + `checkJs`, a `types/global.d.ts` for ambient globals, and pervasive `@ts-check`/JSDoc annotations across core systems and rules. New script: `npm run typecheck`.

### New/Updated Files
- `js/core/systems/config-accessor.ts` — central config access
- `js/ui/buttons.ts` — event delegation via `data-action`
- `types/global.d.ts` — ambient global types (`App`, `GameState`, etc.)
- `tsconfig.json` — JS-with-types configuration
- TypeScript conversions with extensionless imports:
  - `js/core/rules/*.ts` (`clicks`, `economy`, `purchases`)
  - `js/core/systems/resources.ts`, `purchases-system.ts`, `save-system.ts`, `loop-system.ts`, `drink-system.ts`, `clicks-system.ts`, `options-system.ts`, `autosave.ts`, `button-audio.ts`, `game-init.ts`
  - `js/core/validation/schemas.ts`
  - `js/services/event-bus.ts`, `js/services/storage.ts`
  - `js/feature-unlocks.ts`

## 📁 Complete File Structure

```
soda-clicker-pro/
├── 📄 index.html                 # Main HTML entry point (31KB, 713 lines)
├── 📄 package.json               # Node.js dependencies and scripts
├── 📄 vite.config.js             # Vite build configuration
├── 📄 vitest.config.ts           # Vitest testing configuration
├── 📄 .eslintrc.json             # ESLint configuration
├── 📄 .prettierrc                # Prettier formatting rules
├── 📄 ARCHITECTURE.md            # This comprehensive architecture guide
├── 📄 BALANCE_CHANGES.md         # Game balance documentation
├── 📄 README.md                  # Project overview
├── 📄 RULES.md                   # Development rules and guidelines
│
├── 📁 js/                        # JavaScript source code
│   ├── 📄 index.js               # Main entry point, bootstraps App global
│   ├── 📄 main.js                # Legacy game logic (refactoring in progress)
│   ├── 📄 config.js              # Game configuration and constants
│   ├── 📄 feature-unlocks.ts     # Feature unlock management system
│   ├── 📄 god.js                 # God mode functionality
│   ├── 📄 dom-cache.js           # DOM element caching system
│   │
│   ├── 📁 core/                  # Core game systems
│   │   ├── 📄 constants.ts       # Event names and game constants
│   │   │
│   │   ├── 📁 state/             # State management
│   │   │   ├── 📄 index.ts       # State store implementation
│   │   │   ├── 📄 shape.ts       # Default state structure
│   │   │   └── 📄 bridge.ts      # Legacy state bridge
│   │   │
│   │   ├── 📁 rules/             # Pure business logic
│   │   │   ├── 📄 clicks.ts      # Click calculations and mechanics
│   │   │   ├── 📄 purchases.ts   # Purchase cost calculations
│   │   │   └── 📄 economy.ts     # Economy calculations (SPD, SPS)
│   │   │
│   │   ├── 📁 systems/           # Game systems
│   │   │   ├── 📄 resources.ts   # Resource production calculations
│   │   │   ├── 📄 purchases-system.ts # Purchase logic for all upgrades
│   │   │   ├── 📄 clicks-system.ts # Click handling and feedback
│   │   │   ├── 📄 drink-system.ts # Drink processing and timing
│   │   │   ├── 📄 autosave.ts    # Autosave counter and timing logic
│   │   │   ├── 📄 save-system.ts # Save/load operations with validation
│   │   │   ├── 📄 options-system.ts # Game options and preferences
│   │   │   ├── 📄 loop-system.ts # Game loop and timing management
│   │   │   ├── 📄 button-audio.ts # Sound effects and audio preferences
│   │   │   └── 📄 game-init.ts   # Game initialization system
│   │   │
│   │   └── 📁 validation/        # Data validation schemas
│   │       └── 📄 schemas.ts     # Zod validation schemas
│   │
│   ├── 📁 services/              # Service layer
│   │   ├── 📄 storage.ts         # Abstracted localStorage operations
│   │   ├── 📄 event-bus.ts       # Event bus implementation
│   │   └── 📄 error-overlay.ts   # Error handling and display
│   │
│   └── 📁 ui/                    # User interface system
│       ├── 📄 index.ts           # UI system coordinator (switchTab lives here)
│       ├── 📄 displays.ts        # Display update functions
│       ├── 📄 stats.ts           # Statistics display management
│       ├── 📄 feedback.ts        # Visual feedback system
│       ├── 📄 affordability.ts   # Upgrade affordability checking
│       ├── 📄 labels.ts          # Text label management
│       ├── 📄 buttons.ts         # Unified button dispatcher (data-action)
│       └── 📄 utils.ts           # UI utility functions
│
├── 📁 data/                      # Game data files
│   ├── 📄 unlocks.json           # Feature unlock conditions
│   └── 📄 upgrades.json          # Upgrade definitions and costs
│
├── 📁 css/                       # Stylesheets
├── 📁 images/                    # Game assets
├── 📁 fonts/                     # Typography
├── 📁 res/                       # Additional resources
├── 📁 tests/                     # Test files
└── 📁 .github/                   # GitHub workflows and templates
```

## 🔧 Core Systems Deep Dive

### 1. **State Management System** (`js/core/state/`)

**Purpose**: Centralized state container with subscription support

**Key Components**:
- `createStore()`: Factory function for creating observable stores
- `defaultState`: Centralized state shape definition
- `selectors`: Lightweight helper functions for state access

**State Structure**:
```javascript
{
  // Core resources
  sips: 0,                    // Primary currency
  straws: 0,                  // Basic production unit
  cups: 0,                    // Advanced production unit
  suctions: 0,                // Click multiplier
  widerStraws: 0,             // Straw efficiency upgrade
  betterCups: 0,              // Cup efficiency upgrade
  fasterDrinks: 0,            // Speed upgrade
  criticalClicks: 0,          // Critical hit system
  level: 1,                   // Player level
  
  // Production stats
  sps: 0,                     // Sips per second
  strawSPD: 0,                // Straws per drink
  cupSPD: 0,                  // Cups per drink
  
  // Drink system
  drinkRate: 0,                // Time between drinks
  drinkProgress: 0,            // Current drink progress
  lastDrinkTime: 0,           // Timestamp of last drink
  
  // Options
  options: {
    autosaveEnabled: true,
    autosaveInterval: 30,
    clickSoundsEnabled: true,
    musicEnabled: true,
    musicStreamPreferences: { preferred: 'local' }
  }
}
```

**Usage**:
```javascript
const store = App.state;
store.subscribe((newState, oldState) => {
  // React to state changes
});
store.setState({ sips: newValue });
const currentState = store.getState();
```

### 2. **Event System** (`js/services/event-bus.ts`)

**Purpose**: Decoupled communication between systems via pub/sub pattern

**Event Categories**:
```javascript
EVENT_NAMES = {
  GAME: ['LOADED', 'SAVED', 'DELETED', 'TICK'],
  CLICK: ['SODA', 'CRITICAL'],
  ECONOMY: ['SIPS_GAINED', 'PURCHASE', 'UPGRADE_PURCHASED'],
  FEATURE: ['UNLOCKED'],
  UI: ['TAB_SWITCHED', 'UPDATE_DISPLAY'],
  MUSIC: ['PLAY', 'PAUSE', 'MUTE', 'UNMUTE', 'STREAM_CHANGED'],
  OPTIONS: ['AUTOSAVE_TOGGLED', 'AUTOSAVE_INTERVAL_CHANGED', 'CLICK_SOUNDS_TOGGLED']
}
```

**Usage**:
```javascript
// Subscribe to events
App.events.on(App.EVENT_NAMES.CLICK.SODA, (data) => {
  // Handle soda click
});

// Emit events
App.events.emit(App.EVENT_NAMES.ECONOMY.PURCHASE, {
  item: 'straw',
  cost: 5
});
```

### 3. **Storage System** (`js/services/storage.ts`)

**Purpose**: Abstracted localStorage with validation and namespacing

**Features**:
- Namespaced keys (all prefixed with 'game_')
- JSON serialization/deserialization
- Boolean storage helpers
- Save game validation
- Error handling and fallbacks

**Key Methods**:
```javascript
App.storage.saveGame(gameState);           // Save with validation
App.storage.loadGame();                    // Load with validation
App.storage.setJSON('options', options);   // Store JSON data
App.storage.getBoolean('clickSounds', true); // Get boolean with default
```

### 4. **Validation System** (`js/core/validation/schemas.ts`)

**Purpose**: Runtime data validation using Zod schemas

**Schemas**:
- `UnlocksSchema`: Feature unlock conditions
- `UpgradesSchema`: Upgrade definitions and costs
- `GameSaveSchema`: Save file validation
- `GameOptionsSchema`: Options validation

**Usage**:
```javascript
const validatedUnlocks = validateUnlocks(unlocksData);
if (validatedUnlocks) {
  App.data.unlocks = validatedUnlocks;
} else {
  console.warn('Invalid unlocks data, using fallback');
}
```

### 5. **Business Logic Rules** (`js/core/rules/`)

**Purpose**: Pure functions for game calculations

**Economy Rules** (`economy.ts`):
```javascript
computeStrawSPD(straws, baseSPD, widerStrawsCount, multiplier)
computeCupSPD(cups, baseSPD, betterCupsCount, multiplier)
computeTotalSPD(straws, strawSPD, cups, cupSPD)
computeTotalSipsPerDrink(baseSips, totalSPD)
```

**Click Rules** (`clicks.ts`):
- Click value calculations
- Critical hit mechanics
- Click streak tracking

**Purchase Rules** (`purchases.ts`):
- Cost scaling formulas
- Affordability checking
- Purchase validation

### 6. **Game Systems** (`js/core/systems/`)

**Resources System** (`resources.ts`):
- Centralized production recalculation
- Configuration fallbacks (JSON → config.js → defaults)
- Pure calculation functions

**Purchases System** (`purchases-system.ts`):
- Upgrade purchase logic
- Cost calculations
- Purchase validation

**Clicks System** (`clicks-system.ts`):
- Click handling and feedback
- Critical hit system
- Click statistics

**Drink System** (`drink-system.ts`):
- Centralized drink processing
- Syncs `lastDrinkTime`, `drinkProgress`, and `sips`
- Integrated with loop system when available

**Save System** (`save-system.ts`):
- Game state persistence
- Save validation
- Auto-save functionality

**Options System** (`options-system.js`):
- Game preferences management
- Option persistence
- Default value handling

**Loop System** (`loop-system.ts`):
- Game loop management
- Performance optimization
- Frame rate control

**Audio System** (`button-audio.ts`):
- Sound effect management
- Audio preferences
- Volume control

### 7. **UI System** (`js/ui/`)

**Purpose**: Coordinated UI updates and user interaction

**Components**:
- **Displays** (`displays.js`): Update game statistics and counters
- **Stats** (`stats.js`): Statistics panel management
- **Feedback** (`feedback.js`): Visual feedback for actions
- **Affordability** (`affordability.js`): Upgrade button states
- **Labels** (`labels.js`): Text label management
- **Utils** (`utils.js`): Common UI operations

**Event-Driven Updates**:
```javascript
// UI automatically updates based on game events
App.events.on(App.EVENT_NAMES.CLICK.SODA, () => {
  App.ui.updateTopSipsPerDrink();
  App.ui.updateTopSipsPerSecond();
  App.ui.updateTopSipCounter();
  App.ui.checkUpgradeAffordability();
});
```

**Duplicate Function Elimination**:
All duplicate functions have been removed from `main.js` and consolidated into the modular UI and core systems. Functions are now accessed via:
- **UI Functions**: `App.ui.functionName()`
- **Core Systems**: `App.systems.systemName.functionName()`
- **Storage**: `App.storage.functionName()`

## 📊 Data Flow Architecture

### 1. **Game Initialization Flow**
```
index.html → index.js → loadDataFiles() → validateData() → initializeUI() → gameInit.initOnDomReady()
```

### 2. **Click Processing Flow**
```
User Click → main.js → App.events.emit(CLICK.SODA) → UI System → Update Displays
                ↓
            State Update → App.state.setState() → Subscribers Notified
```

### 3. **Purchase Flow**
```
User Purchase → main.js → App.events.emit(ECONOMY.PURCHASE) → UI System → Update Affordability
                   ↓
               State Update → Save Game → Update Displays
```

### 4. **Save/Load Flow**
```
Auto-save Timer → save-system.ts → validateGameSave() → storage.saveGame() → App.events.emit(GAME.SAVED)
Load Game → storage.loadGame() → validateGameSave() → App.state.setState() → App.events.emit(GAME.LOADED)
```

## 🎮 Game Mechanics

### **Core Resources**
- **Sips**: Primary currency earned by clicking
- **Straws**: Basic production unit (0.6 sips per drink)
- **Cups**: Advanced production unit (1.2 sips per drink)
- **Suctions**: Click multiplier (+0.3 sips per click)
- **Critical Clicks**: Random bonus clicks (5x multiplier)

### **Upgrade System**
- **Wider Straws**: Increase straw efficiency (+50% per level)
- **Better Cups**: Increase cup efficiency (+40% per level)
- **Faster Drinks**: Reduce time between drinks (-1% per level)
- **Critical Click Upgrades**: Increase chance and multiplier

### **Progression System**
- **Levels**: Unlock new features and increase earnings
- **Feature Unlocks**: Progressive feature availability
- **Offline Progress**: Calculate earnings while away

## 🔄 Migration Status

### **✅ Phase 1: Core Infrastructure (Complete)**
- State store implementation
- Event bus system
- Storage abstraction
- Basic rules and systems
- Data file loading

### **✅ Phase 2: Game Logic Extraction (Complete)**
- Business logic moved to pure functions
- Upgrade logic centralized
- Resource management extracted
- All major game systems modularized

### **🔄 Phase 3: UI Decoupling (In Progress)**
- UI system partially separated
- Event-driven updates implemented
- Component-based structure emerging

### **⏳ Phase 4: Advanced Features (Planned)**
- Save file versioning
- Plugin system
- Performance optimizations
- Advanced UI components

## 🧪 Testing & Development

### **Testing Framework**
- **Vitest**: Unit and integration testing
- **Test Files**: Located in `tests/` directory
- **Test Commands**:
  ```bash
  npm test              # Run all tests
  npm run test:watch    # Watch mode for development
  ```

### **Code Quality**
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Commands**:
  ```bash
  npm run lint          # ESLint
  npm run format        # Prettier
  ```

### **Development Server**
- **Vite**: Fast development server with HMR
- **Command**: `npm run dev`

## 🚀 Agent Navigation Guide

### **For Understanding Game Logic**
1. Start with `js/core/rules/` - Pure business logic
2. Examine `js/core/systems/` - Game system implementations
3. Check `js/config.js` - Game balance and constants

### **For Understanding State Management**
1. Review `js/core/state/shape.ts` - State structure
2. Examine `js/core/state/index.ts` - Store implementation
3. Check `js/index.js` - App bootstrap and state initialization

### **For Understanding UI Updates**
1. Start with `js/ui/index.js` - UI system coordinator
2. Examine individual UI modules in `js/ui/`
3. Check event listeners and update functions

### **For Understanding Data Flow**
1. Review `js/core/constants.ts` - Event definitions
2. Examine `js/services/event-bus.ts` - Event system
3. Check how systems emit and listen to events

### **For Understanding Game Configuration**
1. Check `data/upgrades.json` - Upgrade definitions
2. Check `data/unlocks.json` - Feature unlock conditions
3. Review `js/config.js` - Game constants and balance

### **For Understanding Legacy Code**
1. Examine `js/main.js` - Legacy game logic (being refactored)
2. Check `js/feature-unlocks.js` - Feature unlock system
3. Review `js/dom-cache.js` - DOM element management

## 🔍 Key Design Patterns

1. **Observer Pattern**: State store subscriptions
2. **Pub/Sub Pattern**: Event-driven communication
3. **Factory Pattern**: Store and event bus creation
4. **Strategy Pattern**: Different calculation methods
5. **Bridge Pattern**: Legacy code integration
6. **Module Pattern**: ES6 modules for organization

## 📈 Performance Considerations

- **RequestAnimationFrame**: Used for game loop and UI updates
- **Batch Updates**: UI updates batched for performance
- **Lazy Loading**: Only update visible elements
- **Event Debouncing**: Reduce update frequency for expensive operations
- **Memory Management**: Limited click history and cleanup

## 🛡️ Error Handling

- **Graceful Degradation**: Fallbacks for missing features
- **Validation Errors**: Data validation with fallbacks
- **Storage Errors**: LocalStorage error handling
- **Feature Detection**: Progressive enhancement
- **Console Logging**: Comprehensive error logging

This architecture provides a solid foundation for incremental game development while maintaining code clarity and AI agent traversability. The modular design allows for easy feature additions and modifications while preserving the existing game mechanics.


