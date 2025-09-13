# Soda Clicker Pro! 🥤

A delightful idle game inspired by Soda Drinker Pro, featuring soda clicking, upgrades, and a divine oracle feature that draws wisdom from sacred texts.

## 🚀 Features

- **Soda Clicking**: Click to earn sips
- **Upgrades**: Straws, cups, suction, and faster drinks
- **Statistics**: Track your progress and achievements
- **Options**: Configurable auto-save and game settings
- **Divine Oracle**: Sacred guidance through biblical wisdom and spiritual insight 🏛️<br/>
  _(If you know, you know... runs on 64-bit divine processing power ⚡)_
- **Extreme Number Precision**: Handle massive values (1e2000+) using break*eternity.js ⚛️<br/>
  *(Beyond JavaScript's limits with full precision and performance)\_

## 🚀 Current Status

- **✅ Production Ready**: All critical issues resolved
- **✅ Test Coverage**: 674/675 tests passing (99.85% success rate)
- **✅ Code Quality**: Full TypeScript, ESLint, Prettier compliance
- **✅ Performance**: Optimized for extreme values (1e2000+)
- **✅ Recent Fixes**: Precision loss fixed, debug logging cleaned, state management unified

## 🎮 How to Play

1. **Click the Soda**: Earn sips with each click
2. **Buy Upgrades**: Invest in straws, cups, and suction
3. **Level Up**: Reach milestones for bonus income
4. **Divine Oracle**: Experience spiritual guidance through sacred wisdom
5. **Track Progress**: Monitor your statistics and achievements

## ⚛️ Extreme Number Precision

Soda Clicker Pro uses **break_eternity.js** to handle numbers far beyond JavaScript's native limits:

- **Beyond 1e308**: Handle values like 1e2000, 1e5000, 1e10000+ without precision loss
- **Scientific Notation**: Automatic display in scientific notation (1e500, 1e750, etc.)
- **Performance**: Optimized calculations that remain fast even with massive numbers
- **Persistence**: Save and load games with extreme values seamlessly

### Testing Extreme Values

Use the Dev Tools menu to test massive scaling:

```javascript
// Add extreme resources instantly
addExtremeResources(); // Adds 1e2000 of all resources
testScientificNotation(); // Watch progressive scaling
```

## 🛠️ Development

### Prerequisites

- Modern web browser with ES6 module support

### Running Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open the provided local URL (e.g., `http://localhost:5173`)

### Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — Production build
- `npm test` — Vitest test suite (401 tests passing, 100% success rate)
- `npm run type-check` — TypeScript type-check (all core files converted)

### File Structure (high level)

- `index.html` — Main interface; no inline `onclick` (uses `data-action`)
- `ts/index.ts` — Bootstraps `App`, imports `EVENT_NAMES`, loads UI (ESM)
- `ts/main.ts` — Legacy game logic with TypeScript enhancements
- `ts/core/state/` — Zustand store with optimized selectors and subscriptions
- `ts/core/systems/` — Modular systems (save, loop, options, purchases, resources, audio, game-init)
- `ts/core/rules/` — Pure business logic (clicks, purchases, economy) in TypeScript
- `ts/core/validation/` — Zod schemas and validators
- `ts/ui/` — UI modules with optimized displays and event handling
- `ts/services/` — Service layer (storage, event-bus, error-overlay, performance)
- `types/global.d.ts` — Ambient types for globals

## 🔷 TypeScript Migration Complete

The codebase has been successfully migrated to TypeScript with the following achievements:

- ✅ **All core application files** converted from `.js` to `.ts`
- ✅ **Configuration files** (`vite.config.ts`, `vitest.config.ts`) converted to TypeScript
- ✅ **Type safety** established across the entire codebase
- ✅ **Zero TypeScript compilation errors**
- ✅ **All 401 tests passing**
- ✅ **Full backward compatibility** maintained

The migration was completed incrementally while preserving all existing functionality and game mechanics.

**Directory Structure Update:**

- The `js/` directory has been renamed to `ts/` to better reflect the TypeScript nature of the codebase
- All import statements have been updated to reference the new `ts/` directory
- Configuration files and documentation have been updated accordingly

## 📱 Mobile Support

The game is fully responsive and works great on:

- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🎨 Customization

You can customize various aspects of the game:

- Colors and themes in `css/style.css`
- Game mechanics in `ts/core/rules/*` and systems in `ts/core/systems/*`
- State boot is ESM: no `window.defaultState`; see `ts/core/state/shape.ts`
- Configuration options via `data/upgrades.json` and `ts/core/systems/config-accessor.ts`

## 📚 Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Complete technical architecture and implementation details
- [`DEVELOPER_EXPERIENCE.md`](./DEVELOPER_EXPERIENCE.md) - Development workflow, tools, and setup
- [`SYSTEMATIC_FIXES_COMPLETED.md`](./SYSTEMATIC_FIXES_COMPLETED.md) - Current status and recent improvements

## 🤝 Contributing

Feel free to contribute improvements! Just remember to:

- Test your changes thoroughly
- Follow the existing code style
- Check the documentation for current status and guidelines

## 📄 License

This project is open source. Enjoy your soda clicking adventure! 🥤✨

---

**Happy Clicking!** 🎯
