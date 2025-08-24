// Pure mutation helpers for Decimal-like values (TypeScript)

// Type definitions for Decimal compatibility
interface DecimalLike {
  _v?: number;
  plus?(x: DecimalValue): DecimalLike;
  minus?(x: DecimalValue): DecimalLike;
  times?(x: DecimalValue): DecimalLike;
  gte?(x: DecimalValue): boolean;
  toString(): string;
}

type DecimalValue = number | string | DecimalLike;

interface DecimalConstructor {
  new (value: DecimalValue): DecimalLike & {
    plus(x: DecimalValue): DecimalLike;
    minus(x: DecimalValue): DecimalLike;
    times(x: DecimalValue): DecimalLike;
    gte(x: DecimalValue): boolean;
  };
}

function toDecimal(value: DecimalValue): DecimalLike {
  // Check if Decimal.js is available
  const DecimalCtor = typeof window !== 'undefined' && (window as any).Decimal as DecimalConstructor;
  if (DecimalCtor) {
    try {
      return new DecimalCtor(value);
    } catch {
      // Fall back to plain object if Decimal constructor fails
    }
  }

  // Fallback implementation
  const numericValue = Number(
    typeof value === 'object' && value._v !== undefined ? value._v : value
  );

  return {
    _v: numericValue,
    plus(x: DecimalValue) {
      const otherValue = Number(typeof x === 'object' && x._v !== undefined ? x._v : x);
      return toDecimal(this._v! + otherValue);
    },
    minus(x: DecimalValue) {
      const otherValue = Number(typeof x === 'object' && x._v !== undefined ? x._v : x);
      return toDecimal(this._v! - otherValue);
    },
    times(x: DecimalValue) {
      const otherValue = Number(typeof x === 'object' && x._v !== undefined ? x._v : x);
      return toDecimal(this._v! * otherValue);
    },
    gte(x: DecimalValue) {
      const otherValue = Number(typeof x === 'object' && x._v !== undefined ? x._v : x);
      return this._v! >= otherValue;
    },
    toString() {
      return String(this._v!);
    },
  };
}

export function addSips(currentSips: DecimalValue, amount: DecimalValue): string {
  const dec = toDecimal(currentSips);
  const res = dec.plus ? dec.plus(amount) : toDecimal(Number(currentSips) + Number(amount));
  return res.toString();
}

export function subtractSips(currentSips: DecimalValue, amount: DecimalValue): string {
  const dec = toDecimal(currentSips);
  const res = dec.minus ? dec.minus(amount) : toDecimal(Number(currentSips) - Number(amount));
  return res.toString();
}

export function incrementCount(currentCount: DecimalValue, by: number = 1): string {
  const dec = toDecimal(currentCount);
  const res = dec.plus ? dec.plus(by) : toDecimal(Number(currentCount) + by);
  return res.toString();
}

export {};
