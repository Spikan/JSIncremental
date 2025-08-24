# Development Patterns & Guidelines

## 🎯 Current Development Practices

The codebase follows modern TypeScript development patterns with full type safety and modular architecture.

### Adding New UI Components

1. **Add HTML element** with `data-action="actionName"` attribute
2. **Handle in button dispatcher** (`ts/ui/buttons.ts`)
3. **Use modular functions** via `App.systems.*` or `App.ui.*` patterns

### Configuration Access

- Use `ts/core/systems/config-accessor.ts` to read upgrade/config data
- It prefers `App.data.upgrades` and falls back to `GAME_CONFIG.BALANCE`

### Function Organization

| Function Type | Location | Access Pattern |
|---------------|----------|----------------|
| Display Updates | `ts/ui/displays.ts` | `App.ui.functionName()` |
| Stats Management | `ts/ui/stats.ts` | `App.ui.functionName()` |
| Button Logic | `ts/ui/buttons.ts` | `App.ui.functionName()` |
| Game Mechanics | `ts/core/rules/` | `App.rules.functionName()` |
| Storage Operations | `ts/services/storage.ts` | `App.storage.functionName()` |
| System Operations | `ts/core/systems/` | `App.systems.systemName.functionName()` |

---

## 🏗️ Architecture Patterns

### State Management
- **Use Zustand selectors** for optimized re-renders
- **Subscribe to specific state** rather than entire store
- **Test environment bypass** available for testing

### Error Handling
- **Enterprise-grade error reporting** with 4 severity levels
- **Automatic recovery mechanisms** for common issues
- **Circuit breakers** for service protection

### Performance Optimization
- **Intelligent code splitting** for bundle optimization
- **Memoized computed selectors** for derived state
- **Granular subscriptions** to minimize re-renders

---