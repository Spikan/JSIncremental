# Soda Clicker Pro! 🥤

A delightful idle game inspired by Soda Drinker Pro, featuring soda clicking, upgrades, and a divine oracle feature that draws wisdom from sacred texts.

## 🚀 Features

- **Soda Clicking**: Click to earn sips
- **Upgrades**: Straws, cups, suction, and faster drinks
- **Statistics**: Track your progress and achievements
- **Options**: Configurable auto-save and game settings
- **Divine Oracle**: Sacred guidance through biblical wisdom and spiritual insight 🏛️<br/>
  *(If you know, you know... runs on 64-bit divine processing power ⚡)*

## 🎮 How to Play

1. **Click the Soda**: Earn sips with each click
2. **Buy Upgrades**: Invest in straws, cups, and suction
3. **Level Up**: Reach milestones for bonus income
4. **Divine Oracle**: Experience spiritual guidance through sacred wisdom
5. **Track Progress**: Monitor your statistics and achievements

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
- `npm test` — Vitest test suite
- `npm run typecheck` — TypeScript type-check (JS + .ts, no emit)

### File Structure (high level)
- `index.html` — Main interface; no inline `onclick` (uses `data-action`)
- `js/index.ts` — Bootstraps `App`, imports `EVENT_NAMES`, loads UI (ESM)
- `js/core/state/` — Central `App.state` store (`index.ts`, `shape.ts`) and bridge
- `js/ui/` — Displays, stats, buttons (event delegation), utils (TypeScript)
- `js/core/systems/` — Save, loop, options, purchases, resources, audio, game-init (TypeScript)
- `js/core/rules/` — Pure business logic (clicks, purchases, economy) in `.ts`
- `js/core/validation/` — Zod schemas and validators (`schemas.ts`)
- `types/global.d.ts` — Ambient types for globals

## 📱 Mobile Support

The game is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🎨 Customization

You can customize various aspects of the game:
- Colors and themes in `css/style.css`
- Game mechanics in `js/core/rules/*` and systems in `js/core/systems/*`
- State boot is ESM: no `window.defaultState`; see `js/core/state/shape.ts`
- Configuration options via `data/upgrades.json` and `js/config.js` (access with `config-accessor.ts`)

## 🤝 Contributing

Feel free to contribute improvements! Just remember to:
- Test your changes thoroughly
- Follow the existing code style

## 📄 License

This project is open source. Enjoy your soda clicking adventure! 🥤✨

---

**Happy Clicking!** 🎯