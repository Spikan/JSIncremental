// Pure mutation helpers for Decimal-like values

/**
 * @param {any} value
 */
function toDecimal(value) {
    const DecimalCtor = window.Decimal;
    if (DecimalCtor) return new DecimalCtor(value);
    // Fallback shim
    return { _v: Number(value),
        /** @param {any} x */ plus(x){ return toDecimal(this._v + Number(x._v ?? x)); },
        /** @param {any} x */ minus(x){ return toDecimal(this._v - Number(x._v ?? x)); },
        /** @param {any} x */ times(x){ return toDecimal(this._v * Number(x._v ?? x)); },
        /** @param {any} x */ gte(x){ return this._v >= Number(x._v ?? x); },
        toString(){ return String(this._v); }
    };
}

/** @param {any} currentSips @param {any} amount */
export function addSips(currentSips, amount) {
    const dec = toDecimal(currentSips);
    const res = dec && dec.plus ? dec.plus(amount) : toDecimal(Number(currentSips) + Number(amount));
    return (res && typeof res.toString === 'function') ? res.toString() : String(res);
}

/** @param {any} currentSips @param {any} amount */
export function subtractSips(currentSips, amount) {
    const dec = toDecimal(currentSips);
    const res = dec && dec.minus ? dec.minus(amount) : toDecimal(Number(currentSips) - Number(amount));
    return (res && typeof res.toString === 'function') ? res.toString() : String(res);
}

/** @param {any} currentCount @param {number} [by=1] */
export function incrementCount(currentCount, by = 1) {
    const dec = toDecimal(currentCount);
    const res = dec && dec.plus ? dec.plus(by) : toDecimal(Number(currentCount) + Number(by));
    return (res && typeof res.toString === 'function') ? res.toString() : String(res);
}


