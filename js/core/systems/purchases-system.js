// @ts-check
import { nextStrawCost, nextCupCost } from '../rules/purchases.js';
import { recalcProduction } from './resources.js';
import { getUpgradesAndConfig } from './config-accessor.js';

// Helper function to get configuration with proper fallbacks
function getConfig() { return getUpgradesAndConfig(); }

/**
 * Ensures returned config is typed as any to satisfy property access in JS.
 * @returns {{ upgrades: any; config: any }}
 */
function getTypedConfig() {
    const { upgrades, config } = getConfig();
    return { upgrades, config: /** @type {any} */(config) };
}

/**
 * @param {{ sips: number; straws: number; cups: number; widerStraws: number; betterCups: number }} args
 */
export function purchaseStraw({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getTypedConfig();

    const baseCost = upgrades?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5;
    const scaling = upgrades?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08;
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

/**
 * @param {{ sips: number; straws: number; cups: number; widerStraws: number; betterCups: number }} args
 */
export function purchaseCup({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getTypedConfig();

    const baseCost = upgrades?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15;
    const scaling = upgrades?.cups?.scaling ?? config.CUP_SCALING ?? 1.15;
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

/**
 * @param {{ sips: number; straws: number; cups: number; widerStraws: number; betterCups: number }} args
 */
export function purchaseWiderStraws({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getTypedConfig();

    const baseCost = upgrades?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150;
    const cost = Math.floor(baseCost * (Number(widerStraws) + 1));
    if (sips < cost) return null;

    const newWiderStraws = Number(widerStraws) + 1;
    const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
        straws,
        cups,
        widerStraws: newWiderStraws,
        betterCups,
    });

    return { spent: cost, widerStraws: newWiderStraws, strawSPD, cupSPD, sipsPerDrink };
}

/**
 * @param {{ sips: number; straws: number; cups: number; widerStraws: number; betterCups: number }} args
 */
export function purchaseBetterCups({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getTypedConfig();

    const baseCost = upgrades?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400;
    const cost = Math.floor(baseCost * (Number(betterCups) + 1));
    if (sips < cost) return null;

    const newBetterCups = Number(betterCups) + 1;
    const { strawSPD, cupSPD, sipsPerDrink } = recalcProduction({
        straws,
        cups,
        widerStraws,
        betterCups: newBetterCups,
    });

    return { spent: cost, betterCups: newBetterCups, strawSPD, cupSPD, sipsPerDrink };
}

/**
 * @param {{ sips: number; suctions: number }} args
 */
export function purchaseSuction({ sips, suctions }) {
    const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || /** @type {any} */({});
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};

    const baseCost = up?.suction?.baseCost ?? config.SUCTION_BASE_COST;
    const scaling = up?.suction?.scaling ?? config.SUCTION_SCALING;
    const cost = Math.floor(baseCost * Math.pow(scaling, Number(suctions)));
    if (sips < cost) return null;

    const newSuctions = Number(suctions) + 1;
    const suctionClickBonus = (config.SUCTION_CLICK_BONUS ?? 0) * newSuctions;
    return { spent: cost, suctions: newSuctions, suctionClickBonus };
}

/**
 * @param {{ sips: number; suctionUpCounter: number }} args
 */
export function upgradeSuction({ sips, suctionUpCounter }) {
    const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || /** @type {any} */({});
    const cost = (config.SUCTION_UPGRADE_BASE_COST ?? 0) * Number(suctionUpCounter);
    if (sips < cost) return null;
    const newCounter = Number(suctionUpCounter) + 1;
    const suctionClickBonus = (config.SUCTION_CLICK_BONUS ?? 0) * newCounter;
    return { spent: cost, suctionUpCounter: newCounter, suctionClickBonus };
}

/**
 * @param {{ sips: number; fasterDrinks: number }} args
 */
export function purchaseFasterDrinks({ sips, fasterDrinks }) {
    const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || /** @type {any} */({});
    const up = (typeof window !== 'undefined' && (/** @type {any} */(window)).App?.data?.upgrades) || {};
    const baseCost = up?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST;
    const scaling = up?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING;
    const cost = Math.floor(baseCost * Math.pow(scaling, Number(fasterDrinks)));
    
    console.log('🔧 Purchase system Faster Drinks cost calculation:', {
        baseCost,
        scaling,
        count: Number(fasterDrinks),
        calculatedCost: cost,
        dataUp: up?.fasterDrinks,
        config: config.FASTER_DRINKS_BASE_COST
    });
    
    if (sips < cost) return null;
    const newFasterDrinks = Number(fasterDrinks) + 1;
    return { spent: cost, fasterDrinks: newFasterDrinks };
}

/**
 * @param {{ sips: number; fasterDrinksUpCounter: number }} args
 */
export function upgradeFasterDrinks({ sips, fasterDrinksUpCounter }) {
    const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || /** @type {any} */({});
    const up = (typeof window !== 'undefined' && (/** @type {any} */(window)).App?.data?.upgrades) || {};
    const base = up?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 0;
    const cost = base * Number(fasterDrinksUpCounter);
    if (sips < cost) return null;
    const newCounter = Number(fasterDrinksUpCounter) + 1;
    return { spent: cost, fasterDrinksUpCounter: newCounter };
}

/**
 * @param {{ sips: number; criticalClicks: number; criticalClickChance: number }} args
 */
export function purchaseCriticalClick({ sips, criticalClicks, criticalClickChance }) {
    const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || /** @type {any} */({});
    const up = (typeof window !== 'undefined' && (/** @type {any} */(window)).App?.data?.upgrades) || {};
    const baseCost = up?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST;
    const scaling = up?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING;
    const cost = Math.floor(baseCost * Math.pow(scaling, Number(criticalClicks)));
    if (sips < cost) return null;
    const newCriticalClicks = Number(criticalClicks) + 1;
    const newChance = Number(criticalClickChance ?? 0) + (config.CRITICAL_CLICK_CHANCE_INCREMENT ?? 0);
    return { spent: cost, criticalClicks: newCriticalClicks, criticalClickChance: newChance };
}

/**
 * @param {{ sips: number; criticalClickUpCounter: number; criticalClickMultiplier: number }} args
 */
export function upgradeCriticalClick({ sips, criticalClickUpCounter, criticalClickMultiplier }) {
    const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || /** @type {any} */({});
    const cost = (config.CRITICAL_CLICK_UPGRADE_BASE_COST ?? 0) * Number(criticalClickUpCounter);
    if (sips < cost) return null;
    const newCounter = Number(criticalClickUpCounter) + 1;
    const newMultiplier = Number(criticalClickMultiplier ?? 0) + (config.CRITICAL_CLICK_MULTIPLIER_INCREMENT ?? 0);
    return { spent: cost, criticalClickUpCounter: newCounter, criticalClickMultiplier: newMultiplier };
}

/**
 * @param {{ sips: number; level: number; sipsPerDrink: number }} args
 */
export function levelUp({ sips, level, sipsPerDrink }) {
    const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || /** @type {any} */({});
    const base = config.LEVEL_UP_BASE_COST ?? 0;
    const scaling = config.LEVEL_UP_SCALING ?? 1;
    const cost = base * Math.pow(scaling, Number(level));
    if (sips < cost) return null;
    const newLevel = Number(level) + 1;
    const sipsGained = (config.LEVEL_UP_SIPS_MULTIPLIER ?? 1) * Number(sipsPerDrink ?? 0);
    const sipsDelta = -cost + sipsGained;
    return { spent: cost, level: newLevel, sipsDelta, sipsGained };
}


