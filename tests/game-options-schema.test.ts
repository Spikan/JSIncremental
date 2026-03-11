import { describe, expect, it } from 'vitest';

import { defaultState } from '../ts/core/state/shape';
import { GameOptionsSchema } from '../ts/core/validation/schemas';

describe('GameOptionsSchema', () => {
  it('accepts default options from state shape', () => {
    const parsed = GameOptionsSchema.parse(defaultState.options);
    expect(parsed).toEqual(defaultState.options);
  });
});
