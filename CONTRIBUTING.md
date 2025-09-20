# Contributing

Thanks for your interest! Keep contributions small and focused.

## Workflow

1. Create a branch
2. Run checks locally
3. Open a PR

## Commands to run

- `npm run quality` (lint + format check + type-check)
- `npm test` (or `npm run test:watch`)
- `npm run build` (ensure it compiles)

## Coding style

- TypeScript, strict typing
- Pure functions in `ts/core/rules/`; orchestration in `ts/core/systems/`
- No `any`; add/extend interfaces as needed
- Keep functions short and readable
- Use event names from `ts/core/constants.ts`

## Commit messages

Follow Conventional Commits:

- `feat`: new feature
- `fix`: bug fix
- `docs`: docs changes
- `refactor`: no behavior change
- `test`: test-related
- `chore`: tooling/infra

Examples:
- `feat(clicks): add critical hit multiplier`
- `fix(save): handle invalid JSON gracefully`

## Files of interest

- Entry: `ts/index.ts`
- Init: `ts/core/systems/game-init.ts`
- Loop: `ts/core/systems/loop-system.ts`
- Events: `ts/services/event-bus.ts`
- State: `ts/core/state/`
- Rules: `ts/core/rules/`
