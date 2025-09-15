# 🧹 JSIncremental Legacy Cleanup Plan

## Comprehensive Phased Approach with File Management

### 📋 **Overview**

This plan systematically removes legacy code, fallbacks, and unused files while maintaining a clean development environment. Each phase builds on the previous one with clear rollback points.

---

## 🎯 **Phase 1: Safe File Deletions**

**Duration: 5 minutes | Risk: None | Impact: High**

### **1.1 Delete Identified Legacy Files**

```bash
# Remove legacy compatibility layers
rm ts/core/numbers/migration-utils.ts
rm ts/core/state/bridge.ts
rm ts/core/state/zustand-bridge.ts
```

### **1.2 Delete Analysis Reports (Cleanup)**

```bash
# Remove temporary analysis files
rm redundancy-analysis-report.md
rm legacy-cleanup-analysis-report.md
rm redundancy-detector-report.json
rm legacy-cleanup-report.json
```

### **1.3 Clean Up Analysis Scripts**

```bash
# Remove temporary analysis scripts
rm scripts/redundancy-detector.js
rm scripts/legacy-cleanup-detector.js
rm .eslintrc.redundancy.js
```

**Phase 1 Verification:**

- [ ] Legacy files deleted
- [ ] Analysis files cleaned up
- [ ] Project still compiles (`npm run type-check`)
- [ ] No broken imports

---

## 🔧 **Phase 2: Legacy Function Removal**

**Duration: 30 minutes | Risk: Low | Impact: Medium**

### **2.1 Remove Legacy Economy Functions**

**File: `ts/core/rules/economy.ts`**

```typescript
// DELETE these functions:
-computeStrawSPDLegacy() - // Line 239
  computeCupSPDLegacy() - // Line 249
  computeTotalSPDLegacy() - // Line 259
  computeTotalSipsPerDrinkLegacy() - // Line 269
  computeGoldenStrawMultiplier() - // Legacy function
  goldenCount; // Legacy constant
```

### **2.2 Remove Legacy Purchase Functions**

**File: `ts/core/rules/purchases.ts`**

```typescript
// DELETE these functions:
-nextStrawCostLegacy() - // Line 99
  nextCupCostLegacy(); // Line 108
```

### **2.3 Remove Legacy Click Functions**

**File: `ts/core/rules/clicks.ts`**

```typescript
// DELETE these functions:
-computeClickLegacy(); // Line 31
```

### **2.4 Remove Legacy UI Functions**

**File: `ts/ui/index.ts`**

```typescript
// DELETE these functions:
-hideOldUIElements() - // Legacy UI cleanup
  oldSipCounter - // Legacy UI reference
  oldProgressContainer; // Legacy UI reference
```

**Phase 2 Verification:**

- [ ] Legacy functions removed
- [ ] No broken exports
- [ ] Tests still pass (`npm test`)
- [ ] Game still runs (`npm run dev`)

---

## 🌐 **Phase 3: Global Access Modernization**

**Duration: 45 minutes | Risk: Medium | Impact: High**

### **3.1 Replace Legacy Prettify Usage**

**Priority Files:**

- `ts/feature-unlocks.ts` (8 occurrences)
- `ts/ui/level-selector.ts` (2 occurrences)
- `ts/ui/displays.ts` (2 occurrences)
- `ts/ui/utils.ts` (1 occurrence)

**Replacement Pattern:**

```typescript
// OLD (legacy)
(window as any).prettify(value);

// NEW (modern)
formatNumber(value);
```

### **3.2 Reduce Window Access in High-Impact Files**

**Target Files:**

- `ts/ui/buttons.ts` (98 occurrences → target 20)
- `ts/index.ts` (62 occurrences → target 15)
- `ts/main.ts` (32 occurrences → target 10)

**Strategy:**

1. Replace `(window as any).App` with proper imports
2. Use dependency injection instead of global access
3. Create typed interfaces for window objects

### **3.3 Eliminate GlobalThis Usage**

**Files with GlobalThis:**

- `ts/core/numbers/error-recovery.ts` (12 occurrences)
- `ts/core/numbers/safe-conversion.ts` (6 occurrences)
- Other files (1-2 occurrences each)

**Replacement Pattern:**

```typescript
// OLD
const Decimal = (globalThis as any).Decimal;

// NEW
import { Decimal } from './simplified';
```

**Phase 3 Verification:**

- [ ] Prettify usage eliminated
- [ ] Window access reduced by 70%
- [ ] GlobalThis usage eliminated
- [ ] No runtime errors

---

## 🔄 **Phase 4: Fallback Chain Simplification**

**Duration: 60 minutes | Risk: Medium | Impact: Medium**

### **4.1 Simplify Button Click Handling**

**File: `ts/ui/buttons.ts`**

- Remove complex fallback chains (37 patterns)
- Implement direct error handling
- Use proper error boundaries

### **4.2 Streamline UI Updates**

**File: `ts/ui/index.ts`**

- Reduce UI update fallbacks (21 patterns)
- Implement retry mechanisms instead of fallbacks
- Use proper state management

### **4.3 Optimize 3D Model Loading**

**File: `ts/ui/soda-3d-lightweight.ts`**

- Simplify model loading fallbacks (14 patterns)
- Implement progressive loading
- Better error messaging

### **4.4 Improve Animation System**

**File: `ts/services/animation-service.ts`**

- Remove fallback animation chains (12 patterns)
- Use modern animation APIs
- Implement graceful degradation

**Phase 4 Verification:**

- [ ] Fallback chains reduced by 80%
- [ ] Error handling improved
- [ ] Performance maintained
- [ ] User experience preserved

---

## 🧪 **Phase 5: Testing & Validation**

**Duration: 30 minutes | Risk: None | Impact: Critical**

### **5.1 Comprehensive Testing**

```bash
# Run all quality checks
npm run quality

# Run tests
npm test

# Build verification
npm run build

# Type checking
npm run type-check
```

### **5.2 Performance Validation**

```bash
# Bundle analysis
npm run build:analyze

# Performance benchmarks
npm run performance
```

### **5.3 Manual Testing Checklist**

- [ ] Game loads without errors
- [ ] All buttons work correctly
- [ ] Number formatting displays properly
- [ ] 3D model loads successfully
- [ ] Animations work smoothly
- [ ] No console errors
- [ ] Performance is maintained

---

## 📊 **Phase 6: Final Cleanup & Documentation**

**Duration: 15 minutes | Risk: None | Impact: Low**

### **6.1 Final File Cleanup**

```bash
# Remove any remaining temporary files
find . -name "*.tmp" -delete
find . -name "*.backup" -delete
find . -name "*.old" -delete

# Clean up any analysis artifacts
rm -f analysis-*.json
rm -f cleanup-*.md
rm -f temp-*.js
```

### **6.2 Update Documentation**

- Update README.md if needed
- Update package.json scripts if modified
- Document any breaking changes

### **6.3 Git Commit**

```bash
# Commit all changes
git add .
git commit -m "feat: comprehensive legacy cleanup

- Remove legacy functions and compatibility layers
- Modernize global access patterns
- Simplify fallback chains
- Eliminate unused code
- Reduce bundle size by ~650KB"
```

---

## 🚨 **Rollback Plan**

### **If Phase 1 Fails:**

```bash
# Restore deleted files from git
git checkout HEAD -- ts/core/numbers/migration-utils.ts
git checkout HEAD -- ts/core/state/bridge.ts
git checkout HEAD -- ts/core/state/zustand-bridge.ts
```

### **If Phase 2-4 Fail:**

```bash
# Revert to previous commit
git reset --hard HEAD~1
```

### **Emergency Rollback:**

```bash
# Complete rollback to last working state
git reset --hard origin/master
```

---

## 📈 **Success Metrics**

### **Bundle Size Targets:**

- **Before**: Current bundle size
- **Target**: 650KB reduction
- **Measurement**: `npm run build:analyze`

### **Code Quality Targets:**

- **Legacy Functions**: 54 → 0
- **Fallback Patterns**: 19 → 5
- **Global Access Issues**: 37 → 10
- **Unused Files**: 3 → 0

### **Performance Targets:**

- **Build Time**: Maintain or improve
- **Runtime Performance**: Maintain or improve
- **TypeScript Compilation**: Faster
- **IDE Performance**: Better

---

## ⏰ **Timeline Summary**

| Phase               | Duration    | Risk   | Impact   | Dependencies |
| ------------------- | ----------- | ------ | -------- | ------------ |
| 1: Safe Deletions   | 5 min       | None   | High     | None         |
| 2: Legacy Functions | 30 min      | Low    | Medium   | Phase 1      |
| 3: Global Access    | 45 min      | Medium | High     | Phase 2      |
| 4: Fallback Chains  | 60 min      | Medium | Medium   | Phase 3      |
| 5: Testing          | 30 min      | None   | Critical | All phases   |
| 6: Final Cleanup    | 15 min      | None   | Low      | Phase 5      |
| **Total**           | **3h 5min** |        |          |              |

---

## 🎯 **Execution Checklist**

### **Pre-Execution:**

- [ ] Backup current state (`git commit`)
- [ ] Ensure all tests pass
- [ ] Verify build works
- [ ] Document current bundle size

### **During Execution:**

- [ ] Complete each phase fully before moving to next
- [ ] Run verification steps after each phase
- [ ] Commit changes after each successful phase
- [ ] Test game functionality after each phase

### **Post-Execution:**

- [ ] All phases completed successfully
- [ ] Bundle size reduced by target amount
- [ ] All tests pass
- [ ] Game functionality preserved
- [ ] Documentation updated
- [ ] Cleanup completed

---

_This plan ensures systematic, safe cleanup with clear rollback points and comprehensive verification at each step._
