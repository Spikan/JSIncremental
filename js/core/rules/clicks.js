// Pure helpers for click outcomes

/**
 * Compute click outcome.
 * @param {object} params
 * @param {string|number} params.baseClick - base click amount
 * @param {string|number} params.suctionBonus - additive bonus per click
 * @param {number} params.criticalChance - probability 0..1
 * @param {string|number} params.criticalMultiplier - multiplier applied when critical
 * @returns {{ gained: string, critical: boolean }}
 */
export function computeClick({ baseClick, suctionBonus, criticalChance, criticalMultiplier }) {
    const Decimal = window.Decimal || (v => ({ toString: () => String(v) }));
    const base = new Decimal(baseClick);
    const bonus = new Decimal(suctionBonus);
    const mult = new Decimal(criticalMultiplier);
    const isCritical = Math.random() < criticalChance;
    const gained = base.plus(bonus).times(isCritical ? mult : new Decimal(1));
    return { gained: gained.toString(), critical: isCritical };
}


