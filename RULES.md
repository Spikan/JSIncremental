# Development Rules

## Rule: No Fallback Systems Without Root Cause Analysis

**What this means:**
- Do NOT add "hacky" fallback code to work around errors
- Do NOT implement multiple fallback calculations without understanding why the primary system failed
- Do NOT add try-catch blocks that silently fail and fall back to hardcoded values

**What to do instead:**
1. **Investigate the root cause** - Why is the primary system failing?
2. **Check dependencies** - Are required objects/functions loaded in the right order?
3. **Verify initialization** - Is the system properly initialized before use?
4. **Fix the actual problem** - Don't work around it, fix it at the source

**Examples of what NOT to do:**
```javascript
// ❌ BAD: Multiple fallback calculations without understanding why
function calculateSomething() {
    if (window.primarySystem?.calculate) {
        return window.primarySystem.calculate();
    } else if (window.fallbackSystem?.calculate) {
        return window.fallbackSystem.calculate();
    } else {
        // Hardcoded fallback - this is a hack!
        return 100;
    }
}

// ❌ BAD: Silent fallbacks that hide real problems
try {
    return window.App.systems.purchases.buy();
} catch {
    // Silently fall back to manual logic - this hides the real issue!
    return manualPurchaseLogic();
}
```

**Examples of what TO do:**
```javascript
// ✅ GOOD: Check if system is properly initialized
if (!window.App?.systems?.purchases) {
    console.error('Purchase system not initialized. Check script loading order.');
    return false;
}
return window.App.systems.purchases.buy();

// ✅ GOOD: Fix the root cause (e.g., script loading order)
// In index.html: Ensure dependencies load before main.js
<script type="module" src="js/index.js"></script>  <!-- Initialize App -->
<script src="js/main.js"></script>                 <!-- Use App -->
```

**Why this matters:**
- Fallback systems create technical debt
- They hide real problems that will resurface later
- They confuse future developers (including AI agents)
- They make debugging harder
- They often don't actually solve the underlying issue

**When fallbacks ARE acceptable:**
- After thorough root cause analysis
- When the fallback is a legitimate alternative (not a workaround)
- When documented clearly with the reason for the fallback
- When the fallback is temporary and there's a plan to fix the root cause

**Remember:** It's better to spend time fixing the real problem than to add layers of complexity to work around it.

---

## Rule: No Global Reads in UI (Use App.state)

**What this means:**
- UI modules must read from `App.state` exclusively
- Do not read or write `window.*` in UI code

**Do this:**
```javascript
// ✅ GOOD
const state = App.state.getState();
elements.totalClicks.textContent = String(state.totalClicks);
```

**Not this:**
```javascript
// ❌ BAD
elements.totalClicks.textContent = String(window.totalClicks);
```

---

## Rule: No Inline Handlers (Use data-action + Central Dispatcher)

**What this means:**
- Remove `onclick`/inline handlers from HTML
- Use `data-action` attributes and dispatch in `js/ui/buttons.js`

**Pattern:**
```html
<button data-action="buy-straw"></button>
```

```javascript
// in js/ui/buttons.js
document.body.addEventListener('click', (e) => {
  const action = e.target?.closest('[data-action]')?.dataset?.action;
  if (!action) return;
  // route to App.systems / App.ui implementations
});
```

---

## Rule: Configuration via Accessor

**Use** `js/core/systems/config-accessor.js` to read upgrades and balance.
Avoid duplicating logic or reading config directly in multiple places.