# Game Direction

## Core Fantasy

Soda Clicker Pro should not feel like a generic incremental with soda art pasted on top.

It should feel like:

**A surreal incremental about becoming the ultimate soda drinker across increasingly absurd realities.**

The player fantasy is not just "make number go up."
The fantasy is:

- You are building a weird personal soda ritual.
- Every level is a new place with its own soda logic.
- Your run becomes a style: frantic tapping, passive sipping, crit-chasing, or strange experimental builds.
- Progress feels like entering deeper and deeper soda madness.

If we keep that fantasy in focus, the game has a reason to exist beyond being another clicker.

## What Makes This Game Different

Most incrementals compete on:

- bigger numbers
- more upgrades
- more tabs
- more automation

That is the dredge.

This game should compete on:

- surreal tone
- authored level identity
- unusual but readable mechanics
- short-term player expression
- strong "what the hell is this?" energy

The weird Soda Drinker Pro DNA is the asset. We should lean into it hard.

## Three Progression Paths

The game needs clearer playstyles. Right now too many upgrades are just variations of "buy more production."

### 1. Active Path: The Chug Build

This is for players who want taps to matter.

Themes:

- speed
- rhythm
- streaks
- overdrive

Example upgrade ideas:

- `Turbo Sip`: adds flat click power
- `Quick Chug`: shortens drink cycle
- `Sugar Rush`: temporary click frenzy after a streak
- `Second Wind`: every 20th click gives a burst
- `Perfect Gulp`: bonus if clicks are timed with drink completion

What it feels like:

- noisy
- snappy
- reward-heavy
- high attention

### 2. Passive Path: The Straw Engine

This is for players who want the machine to build itself.

Themes:

- flow
- compounding production
- efficient setup

Example upgrade ideas:

- `Extra Straw`: adds baseline passive gain
- `Bigger Cup`: increases output per cycle
- `Wider Straws`: strengthens straw-focused production
- `Better Cups`: strengthens cup-focused production
- `Ice Reservoir`: stores overflow and releases it in bursts

What it feels like:

- steady
- satisfying
- strategic
- compounding

### 3. Weird Path: The Soda Ritual

This is the identity path and the one most likely to make the game memorable.

Themes:

- risk
- randomness
- strange level interactions
- mood-based bonuses

Example upgrade ideas:

- `Flat Soda`: passive gain up, click gain down
- `Carbonation Burst`: chance for explosive bonus taps
- `Warm Can`: terrible baseline, huge temporary spike
- `Mouthfeel`: bonuses tied to streak timing
- `Tab Collector`: unlock weird modifiers from completed levels

What it feels like:

- surprising
- funny
- slightly unstable
- replayable

## Level Design Direction

Levels should stop being mostly visual wrappers around multiplier changes.

Each level should add one simple rules twist.

Good level rules:

- easy to understand
- obvious in feel
- mechanically distinct
- cheap to implement

Examples:

- `The Beach`
  - combo clicks create wave bonuses
  - passive gain is stable and friendly

- `Weird Room`
  - every few clicks, one reward is duplicated or delayed
  - creates slight instability without confusion

- `in SPACE`
  - drink progress is slower, but click bonuses are stronger
  - emphasizes active play

- `Inside a Mouth`
  - passive sips arrive in "gulps" instead of smoothly
  - makes production feel alive

- `Dark Woods`
  - streak window is shorter, crit rewards are stronger
  - risk/reward level

The target is not "100 unique systems."
The target is "every few levels feel like a new joke with a new rule."

## Ten Mechanic Ideas That Fit This Game

These are ideas that feel specific to this project, not generic idle-game filler.

1. `Sugar Rush`
   - Rapid clicks fill a rush meter.
   - Full meter gives a 5-second click frenzy.

2. `Carbonation`
   - Passive system builds carbonation over time.
   - Clicking releases it for burst rewards.

3. `Overfill`
   - If you wait too long at 100% drink progress, you lose some value or spill.
   - Makes timing matter.

4. `Perfect Sip`
   - Clicking exactly as a drink completes gives a multiplier.
   - Adds rhythm without requiring complex input systems.

5. `Flat Soda`
   - Idle too long and click value softens.
   - Rebuild fizz by clicking or buying specific upgrades.

6. `Strange Flavor Events`
   - Short random modifiers like "Cherry Hour" or "Diet Spiral."
   - Limited duration, strong theme, small implementation cost.

7. `Cup Specialization`
   - Player picks a cup type with different bonuses.
   - Example: giant novelty cup, sports bottle, haunted goblet.

8. `Level Relics`
   - Beating or unlocking a level gives a permanent weird modifier.
   - Lets level identity persist beyond cosmetics.

9. `Audience Reactions`
   - Some levels have a weird observer system that comments on your run.
   - Mostly tone, but can also attach bonuses.

10. `Combo Finishers`
    - Hitting streak thresholds fires an obvious special reward animation and bonus.
    - Gives the active path stronger payoff.

## Cheapest Prototypes To Build First

These are the fastest, highest-signal ideas to prototype in this codebase.

### Prototype 1: Click Combo / Sugar Rush

Why first:

- Uses existing click and streak tracking
- High feel improvement
- Very visible
- Low UI overhead

Likely files:

- `ts/core/systems/clicks-system.ts`
- `ts/core/state/zustand-store.ts`
- `ts/ui/displays.ts`
- `ts/ui/feedback.ts`

What to add:

- combo meter
- threshold bonuses
- brief rush state
- stronger feedback during rush

### Prototype 2: Level Rule Modifiers

Why second:

- Makes levels matter immediately
- Reuses existing hybrid level system
- Big identity gain

Likely files:

- `ts/core/systems/hybrid-level-system.ts`
- `ts/core/systems/drink-system.ts`
- `ts/core/systems/clicks-system.ts`

What to add:

- small per-level rule object
- modifier hooks for click and drink logic
- 3-5 unique early-level rules

### Prototype 3: Next Goal / Path Guidance

Why third:

- Already partly started
- Improves clarity fast
- Helps players understand builds

Likely files:

- `ts/ui/displays.ts`
- `index.html`
- `css/04-components.css`

What to add:

- "active path", "passive path", "weird path" recommendations
- stronger milestone language
- maybe a one-click highlighted recommendation

### Prototype 4: Carbonation Meter

Why fourth:

- Strong soda-specific identity
- Gives the main interaction a better fantasy
- Much better than a fancy cup graphic

Likely files:

- `ts/core/state/zustand-store.ts`
- `ts/core/systems/clicks-system.ts`
- `ts/core/systems/drink-system.ts`
- `ts/ui/displays.ts`

What to add:

- a meter that builds and releases
- bonus tied to timing or burst clicks
- visual indicator around the main button

## What To Stop Doing

These patterns make the game feel more generic or more confused.

- Stop treating visual novelty as a substitute for mechanic depth.
- Stop adding upgrades that are just mirrored versions of existing ones.
- Stop using levels mostly as skin swaps.
- Stop hiding important game actions behind mobile-specific navigation.
- Stop investing in the soda button metaphor until the loop around it is strong.

## Product Principles

Use these as a filter for future changes.

### 1. Every feature should support a playstyle

If a feature does not help active, passive, or weird play, it is probably filler.

### 2. Every level should change the feel of play

Not just the color palette.

### 3. The next good decision should always be visible

Players should know what they are trying to do in the next 30 seconds.

### 4. Weirdness should be intentional

The game should feel bizarre on purpose, not messy by accident.

### 5. Feedback matters more than ornament

A simple button with strong payoff beats a fancy control with weak feel.

## Recommended Next Build Order

If we want to improve the game in the most useful order:

1. Build `Sugar Rush` / combo prototype
2. Add 3 early level rule modifiers
3. Improve the next-goal system into path guidance
4. Add carbonation as a real resource or tempo mechanic
5. Revisit the main button once the loop deserves it

## Short Version

To stand out, Soda Clicker Pro should become:

- weirder
- more authored
- more mechanical
- less generic

The win condition is not "most polished idle UI."
The win condition is:

**Someone plays it for two minutes and immediately understands that this game has a point of view.**
