// Pure helpers for click outcomes (TypeScript)

type DecimalLike = { toString(): string; plus(_x: any): any; times(_x: any): any };

export function computeClick({
  baseClick,
  suctionBonus,
  criticalChance,
  criticalMultiplier,
}: {
  baseClick: number | string;
  suctionBonus: number | string;
  criticalChance: number;
  criticalMultiplier: number | string;
}): { gained: string; critical: boolean } {
  const DecimalCtor: new (_v: any) => DecimalLike =
    (globalThis as any).Decimal ||
    (function () {
      return class LocalDecimal {
        private _v: number;
        constructor(_v: any) {
          this._v = Number(_v) || 0;
        }
        toString() {
          return String(this._v);
        }
        plus(_x: any) {
          return new LocalDecimal(this._v + Number(_x && _x.toString ? _x.toString() : _x));
        }
        times(_x: any) {
          return new LocalDecimal(this._v * Number(_x && _x.toString ? _x.toString() : _x));
        }
      } as any;
    })();

  const base = new DecimalCtor(baseClick);
  const bonus = new DecimalCtor(suctionBonus);
  const mult = new DecimalCtor(criticalMultiplier);
  const isCritical = Math.random() < criticalChance;
  const gained = (base as any).plus(bonus).times(isCritical ? mult : new DecimalCtor(1));
  return { gained: (gained as any).toString(), critical: isCritical };
}
