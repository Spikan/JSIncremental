// Pure mutation helpers for Decimal-like values

function toDecimal(value) {
    const DecimalCtor = window.Decimal;
    if (DecimalCtor) return new DecimalCtor(value);
    // Fallback shim
    return { _v: Number(value),
        plus(x){ return toDecimal(this._v + Number(x._v ?? x)); },
        minus(x){ return toDecimal(this._v - Number(x._v ?? x)); },
        times(x){ return toDecimal(this._v * Number(x._v ?? x)); },
        gte(x){ return this._v >= Number(x._v ?? x); },
        toString(){ return String(this._v); }
    };
}

export function addSips(currentSips, amount) {
    return toDecimal(currentSips).plus(amount).toString();
}

export function subtractSips(currentSips, amount) {
    return toDecimal(currentSips).minus(amount).toString();
}

export function incrementCount(currentCount, by = 1) {
    return toDecimal(currentCount).plus(by).toString();
}


