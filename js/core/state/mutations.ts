// Pure mutation helpers for Decimal-like values (TypeScript)

function toDecimal(value: any): any {
  const DecimalCtor = typeof window !== 'undefined' ? window.Decimal : undefined;
  if (DecimalCtor) return new DecimalCtor(value);
  return {
    _v: Number((value as any)?._v ?? value),
    plus(x: any) { return toDecimal(this._v + Number((x as any)?._v ?? x)); },
    minus(x: any) { return toDecimal(this._v - Number((x as any)?._v ?? x)); },
    times(x: any) { return toDecimal(this._v * Number((x as any)?._v ?? x)); },
    gte(x: any) { return this._v >= Number((x as any)?._v ?? x); },
    toString() { return String(this._v); }
  };
}

export function addSips(currentSips: any, amount: any): string {
  const dec = toDecimal(currentSips);
  const res = dec && dec.plus ? dec.plus(amount) : toDecimal(Number(currentSips) + Number(amount));
  return (res && typeof res.toString === 'function') ? res.toString() : String(res);
}

export function subtractSips(currentSips: any, amount: any): string {
  const dec = toDecimal(currentSips);
  const res = dec && dec.minus ? dec.minus(amount) : toDecimal(Number(currentSips) - Number(amount));
  return (res && typeof res.toString === 'function') ? res.toString() : String(res);
}

export function incrementCount(currentCount: any, by: number = 1): string {
  const dec = toDecimal(currentCount);
  const res = dec && dec.plus ? dec.plus(by) : toDecimal(Number(currentCount) + Number(by));
  return (res && typeof res.toString === 'function') ? res.toString() : String(res);
}

export {}


