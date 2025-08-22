// @ts-check
import { computeStrawSPD, computeCupSPD, computeTotalSPD, computeTotalSipsPerDrink } from '../rules/economy.js';

// Helper function to get configuration with proper fallbacks
/**
 * @returns {{ upgrades: any; config: any }}
 */
function getConfig() {
    // Try to get from App.data.upgrades first (from upgrades.json)
    const upgrades = (typeof window !== 'undefined' && window.App?.data?.upgrades) || {};
    // Fallback to GAME_CONFIG (from config.js)
    const config = (typeof window !== 'undefined' && window.GAME_CONFIG?.BALANCE) || {};
    
    return { upgrades, config };
}

// Centralized production recalculation
// All inputs are numbers; outputs are numbers for easy wrapping in Decimal by callers
// base and multipliers are optional; when omitted, values are sourced from App.data.upgrades or GAME_CONFIG
/**
 * Centralized production recalculation.
 * @param {{
 *  straws: number;
 *  cups: number;
 *  widerStraws: number;
 *  betterCups: number;
 *  base?: { strawBaseSPD?: number; cupBaseSPD?: number; baseSipsPerDrink?: number };
 *  multipliers?: { widerStrawsPerLevel?: number; betterCupsPerLevel?: number };
 * }} params
 * @returns {{ strawSPD: number; cupSPD: number; sipsPerDrink: number }}
 */
export function recalcProduction({
    straws,
    cups,
    widerStraws,
    betterCups,
    base = {},
    multipliers = {},
}) {
    const { upgrades, config } = getConfig();

    const strawBaseSPD = base.strawBaseSPD ?? upgrades?.straws?.baseSPD ?? config.STRAW_BASE_SPD ?? 0.6;
    const cupBaseSPD = base.cupBaseSPD ?? upgrades?.cups?.baseSPD ?? config.CUP_BASE_SPD ?? 1.2;
    const baseSipsPerDrink = base.baseSipsPerDrink ?? config.BASE_SIPS_PER_DRINK ?? 1;

    const widerStrawsPerLevel = multipliers.widerStrawsPerLevel ?? upgrades?.widerStraws?.multiplierPerLevel ?? config.WIDER_STRAWS_MULTIPLIER ?? 0.5;
    const betterCupsPerLevel = multipliers.betterCupsPerLevel ?? upgrades?.betterCups?.multiplierPerLevel ?? config.BETTER_CUPS_MULTIPLIER ?? 0.4;

    const strawSPD = computeStrawSPD(straws, strawBaseSPD, widerStraws, widerStrawsPerLevel);
    const cupSPD = computeCupSPD(cups, cupBaseSPD, betterCups, betterCupsPerLevel);
    const totalSPD = computeTotalSPD(straws, strawSPD, cups, cupSPD);
    const sipsPerDrink = computeTotalSipsPerDrink(baseSipsPerDrink, totalSPD);
    return { strawSPD, cupSPD, sipsPerDrink };
}


