// Pure helpers for click outcomes (TypeScript)

type DecimalLike = { toString(): string; plus(x: any): any; times(x: any): any };

export function computeClick({
  baseClick,
  suctionBonus,
  criticalChance,
  criticalMultiplier
}: {
  baseClick: number | string;
  suctionBonus: number | string;
  criticalChance: number;
  criticalMultiplier: number | string;
}): { gained: string; critical: boolean } {
  const DecimalCtor: new (v: any) => DecimalLike =
    (globalThis as any).Decimal ||
    (function () {
      return class LocalDecimal {
        private _v: number;
        constructor(v: any) { this._v = Number(v) || 0; }
        toString() { return String(this._v); }
        plus(x: any) { return new LocalDecimal(this._v + Number((x && x.toString) ? x.toString() : x)); }
        times(x: any) { return new LocalDecimal(this._v * Number((x && x.toString) ? x.toString() : x)); }
      } as any;
    })();

  const base = new DecimalCtor(baseClick);
  const bonus = new DecimalCtor(suctionBonus);
  const mult = new DecimalCtor(criticalMultiplier);
  const isCritical = Math.random() < criticalChance;
  const gained = (base as any).plus(bonus).times(isCritical ? mult : new DecimalCtor(1));
  return { gained: (gained as any).toString(), critical: isCritical };
}


