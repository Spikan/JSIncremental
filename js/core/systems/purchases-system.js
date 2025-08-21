import { nextStrawCost, nextCupCost } from '../rules/purchases.js';
import { recalcProduction } from './resources.js';

export function purchaseStraw({ sips, straws, cups, widerStraws, betterCups }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};

    const baseCost = up?.straws?.baseCost ?? config.STRAW_BASE_COST;
    const scaling = up?.straws?.scaling ?? config.STRAW_SCALING;
    const cost = nextStrawCost(straws, baseCost, scaling);
    if (sips < cost) return null;

    const newStraws = straws + 1;
    const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
        straws: newStraws,
        cups,
        widerStraws,
        betterCups,
    });

    return { spent: cost, straws: newStraws, strawSPD, cupSPD, sipsPerDrink };
}

export function purchaseCup({ sips, straws, cups, widerStraws, betterCups }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};

    const baseCost = up?.cups?.baseCost ?? config.CUP_BASE_COST;
    const scaling = up?.cups?.scaling ?? config.CUP_SCALING;
    const cost = nextCupCost(cups, baseCost, scaling);
    if (sips < cost) return null;

    const newCups = cups + 1;
    const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
        straws,
        cups: newCups,
        widerStraws,
        betterCups,
    });

    return { spent: cost, cups: newCups, strawSPD, cupSPD, sipsPerDrink };
}


