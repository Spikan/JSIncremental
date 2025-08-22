// @ts-check
// Pure helpers for click outcomes

/**
 * Compute click outcome.
 * @param {{ baseClick: number|string; suctionBonus: number|string; criticalChance: number; criticalMultiplier: number|string }} params
 * @returns {{ gained: string, critical: boolean }}
 */
export function computeClick({ baseClick, suctionBonus, criticalChance, criticalMultiplier }) {
    /** @type {new (v:any)=>{ toString(): string; plus:(x:any)=>any; times:(x:any)=>any }} */
    const Decimal = window.Decimal || class {
        /** @param {any} v */
        constructor(v) { this._v = Number(v) || 0; }
        toString() { return String(this._v); }
        /** @param {any} x */ plus(x) { return new Decimal(this._v + Number((x && x.toString) ? x.toString() : x)); }
        /** @param {any} x */ times(x) { return new Decimal(this._v * Number((x && x.toString) ? x.toString() : x)); }
    };
    const base = new Decimal(baseClick);
    const bonus = new Decimal(suctionBonus);
    const mult = new Decimal(criticalMultiplier);
    const isCritical = Math.random() < criticalChance;
    const gained = base.plus(bonus).times(isCritical ? mult : new Decimal(1));
    return { gained: gained.toString(), critical: isCritical };
}


