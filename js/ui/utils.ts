// UI Utilities - TypeScript version

export type DecimalLike = {
    toNumber?: () => number;
    toString?: () => string;
};

export function formatNumber(value: any): string {
    try {
        if (typeof (window as any)?.prettify === 'function') {
            try { return (window as any).prettify(value); } catch {}
        }
    } catch {}
    if (value == null) return '0';
    if (value && typeof (value as DecimalLike).toNumber === 'function') {
        try { value = (value as DecimalLike).toNumber!(); } catch {}
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    if (typeof value === 'string') return value;
    if (value && typeof value.toString === 'function') return value.toString();
    return String(value);
}

export function findElement(elementId: string): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    let element = document.getElementById(elementId);
    if (element) return element as HTMLElement;
    element = document.querySelector(`[data-element-id="${elementId}"]`);
    if (element) return element as HTMLElement;
    return null;
}

export function findButton(buttonId: string): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    let button: Element | null = null;
    button = document.getElementById(buttonId);
    if (button) return button as HTMLElement;
    button = document.querySelector(`[data-button-id="${buttonId}"]`);
    if (button) return button as HTMLElement;
    button = document.querySelector(`button[onclick*="${buttonId}"]`);
    if (button) return button as HTMLElement;
    if (buttonId.startsWith('buy')) {
        const costElementId = buttonId.replace('buy', '') + 'Cost';
        const costElement = document.getElementById(costElementId);
        if (costElement) {
            const parentButton = costElement.closest('button');
            if (parentButton) return parentButton as HTMLElement;
        }
    } else if (buttonId.startsWith('upgrade')) {
        const costElementId = buttonId.replace('upgrade', '') + 'UpCost';
        const costElement = document.getElementById(costElementId);
        if (costElement) {
            const parentButton = costElement.closest('button');
            if (parentButton) return parentButton as HTMLElement;
        }
    }
    return null;
}

export function updateButtonState(buttonId: string, isAffordable: boolean, cost?: number): void {
    if (typeof window === 'undefined') return;
    const button = findButton(buttonId);
    if (!button || !(button as any).classList) return;
    (button as HTMLButtonElement).disabled = !isAffordable;
    try {
        (button as any).classList.toggle('affordable', isAffordable);
        (button as any).classList.toggle('unaffordable', !isAffordable);
        (button as any).classList.toggle('disabled', !isAffordable);
    } catch {}
    try {
        const costSpan = (button as HTMLElement).querySelector('.cost') as HTMLElement | null;
        if (costSpan != null && typeof cost !== 'undefined') {
            costSpan.textContent = formatNumber(cost);
        }
    } catch {}
    const formattedCost = formatNumber(cost as any);
    let currentSips = '0';
    try {
        const st = (window as any).App?.state?.getState?.();
        const sipsNum = Number(st?.sips || 0);
        currentSips = formatNumber(sipsNum);
    } catch {}
    (button as any).title = isAffordable
        ? `Click to purchase for ${formattedCost} Sips`
        : `Costs ${formattedCost} Sips (You have ${currentSips})`;
    updateCompactButtonVariants(buttonId, isAffordable);
}

function updateCompactButtonVariants(buttonId: string, isAffordable: boolean): void {
    let compactSelector: string | null = null;
    if (buttonId === 'buySuction' || buttonId === 'upgradeSuction') {
        compactSelector = '.clicking-upgrade-btn[onclick*="buySuction"], .clicking-upgrade-btn[onclick*="upgradeSuction"]';
    } else if (buttonId === 'buyCriticalClick' || buttonId === 'upgradeCriticalClick') {
        compactSelector = '.clicking-upgrade-btn[onclick*="buyCriticalClick"], .clicking-upgrade-btn[onclick*="upgradeCriticalClick"]';
    } else if (buttonId === 'buyFasterDrinks' || buttonId === 'upgradeFasterDrinks') {
        compactSelector = '.drink-speed-upgrade-btn[onclick*="buyFasterDrinks"], .drink-speed-upgrade-btn[onclick*="upgradeFasterDrinks"]';
    }
    if (!compactSelector) return;
    try {
        const compactButtons = document.querySelectorAll(compactSelector);
        compactButtons.forEach((button) => {
            const el = button as HTMLElement;
            el.classList.toggle('affordable', isAffordable);
            el.classList.toggle('unaffordable', !isAffordable);
            el.classList.toggle('disabled', !isAffordable);
        });
    } catch {}
}

export function updateCostDisplay(elementId: string, cost: number, isAffordable: boolean): void {
    if (typeof window === 'undefined') return;
    const element = findElement(elementId) as HTMLElement | null;
    if (!element || !(element as any).classList) return;
    element.innerHTML = formatNumber(cost);
    try {
        element.classList.toggle('affordable', isAffordable);
        element.classList.toggle('unaffordable', !isAffordable);
    } catch {}
}

export const GameState = {
    get sips(): number {
        if (typeof window === 'undefined') return 0;
        const st = (window as any).App?.state?.getState?.();
        return (st && typeof st.sips !== 'undefined') ? st.sips : (window as any).sips;
    },
    get level(): number {
        if (typeof window === 'undefined') return 1;
        const st = (window as any).App?.state?.getState?.();
        return (st && typeof st.level !== 'undefined') ? st.level : (window as any).level;
    },
    get sps(): number {
        if (typeof window === 'undefined') return 0;
        const st = (window as any).App?.state?.getState?.();
        return (st && typeof st.sps !== 'undefined') ? st.sps : (window as any).sps;
    },
    get drinkRate(): number {
        if (typeof window === 'undefined') return 0;
        const st = (window as any).App?.state?.getState?.();
        return (st && typeof st.drinkRate !== 'undefined') ? st.drinkRate : (window as any).drinkRate;
    }
};

export const safePrettify = formatNumber;
export const prettify = formatNumber;


