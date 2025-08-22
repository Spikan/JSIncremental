import { nextStrawCost, nextCupCost } from '../rules/purchases.js';
import { recalcProduction } from './resources.js';

// Helper function to get configuration with proper fallbacks
function getConfig() {
    // Try to get from App.data.upgrades first (from upgrades.json)
    const upgrades = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};
    // Fallback to GAME_CONFIG (from config.js)
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    
    return { upgrades, config };
}

export function purchaseStraw({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getConfig();

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

export function purchaseCup({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getConfig();

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

export function purchaseWiderStraws({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getConfig();

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

export function purchaseBetterCups({ sips, straws, cups, widerStraws, betterCups }) {
    const { upgrades, config } = getConfig();

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

export function purchaseSuction({ sips, suctions }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};

    const baseCost = up?.suction?.baseCost ?? config.SUCTION_BASE_COST;
    const scaling = up?.suction?.scaling ?? config.SUCTION_SCALING;
    const cost = Math.floor(baseCost * Math.pow(scaling, Number(suctions)));
    if (sips < cost) return null;

    const newSuctions = Number(suctions) + 1;
    const suctionClickBonus = (config.SUCTION_CLICK_BONUS ?? 0) * newSuctions;
    return { spent: cost, suctions: newSuctions, suctionClickBonus };
}

export function upgradeSuction({ sips, suctionUpCounter }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const cost = (config.SUCTION_UPGRADE_BASE_COST ?? 0) * Number(suctionUpCounter);
    if (sips < cost) return null;
    const newCounter = Number(suctionUpCounter) + 1;
    const suctionClickBonus = (config.SUCTION_CLICK_BONUS ?? 0) * newCounter;
    return { spent: cost, suctionUpCounter: newCounter, suctionClickBonus };
}

export function purchaseFasterDrinks({ sips, fasterDrinks }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};
    const baseCost = up?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST;
    const scaling = up?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING;
    const cost = Math.floor(baseCost * Math.pow(scaling, Number(fasterDrinks)));
    if (sips < cost) return null;
    const newFasterDrinks = Number(fasterDrinks) + 1;
    return { spent: cost, fasterDrinks: newFasterDrinks };
}

export function upgradeFasterDrinks({ sips, fasterDrinksUpCounter }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};
    const base = up?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 0;
    const cost = base * Number(fasterDrinksUpCounter);
    if (sips < cost) return null;
    const newCounter = Number(fasterDrinksUpCounter) + 1;
    return { spent: cost, fasterDrinksUpCounter: newCounter };
}

export function purchaseCriticalClick({ sips, criticalClicks, criticalClickChance }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const up = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};
    const baseCost = up?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST;
    const scaling = up?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING;
    const cost = Math.floor(baseCost * Math.pow(scaling, Number(criticalClicks)));
    if (sips < cost) return null;
    const newCriticalClicks = Number(criticalClicks) + 1;
    const newChance = Number(criticalClickChance ?? 0) + (config.CRITICAL_CLICK_CHANCE_INCREMENT ?? 0);
    return { spent: cost, criticalClicks: newCriticalClicks, criticalClickChance: newChance };
}

export function upgradeCriticalClick({ sips, criticalClickUpCounter, criticalClickMultiplier }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const cost = (config.CRITICAL_CLICK_UPGRADE_BASE_COST ?? 0) * Number(criticalClickUpCounter);
    if (sips < cost) return null;
    const newCounter = Number(criticalClickUpCounter) + 1;
    const newMultiplier = Number(criticalClickMultiplier ?? 0) + (config.CRITICAL_CLICK_MULTIPLIER_INCREMENT ?? 0);
    return { spent: cost, criticalClickUpCounter: newCounter, criticalClickMultiplier: newMultiplier };
}

export function levelUp({ sips, level, sipsPerDrink }) {
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    const base = config.LEVEL_UP_BASE_COST ?? 0;
    const scaling = config.LEVEL_UP_SCALING ?? 1;
    const cost = base * Math.pow(scaling, Number(level));
    if (sips < cost) return null;
    const newLevel = Number(level) + 1;
    const sipsGained = (config.LEVEL_UP_SIPS_MULTIPLIER ?? 1) * Number(sipsPerDrink ?? 0);
    const sipsDelta = -cost + sipsGained;
    return { spent: cost, level: newLevel, sipsDelta, sipsGained };
}


