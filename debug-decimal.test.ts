import { describe, it, expect } from 'vitest';
import { Decimal } from './ts/core/numbers/decimal';

describe('Debug Decimal', () => {
  it('should check decimal methods', () => {
    console.log('Decimal available:', typeof Decimal);
    const d = new Decimal(25);
    console.log('Decimal instance:', d);
    console.log('div method:', typeof d.div);
    const divided = d.div(10);
    console.log('After div(10):', divided);
    console.log('floor method on result:', typeof divided.floor);

    try {
      const floored = divided.floor();
      console.log('floor() result:', floored);
    } catch (error) {
      console.log('floor() error:', error);
    }
  });
});
