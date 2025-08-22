// @ts-check
import { computeClick } from '../rules/clicks.js';

/**
 * @param {{ baseClick: number|string; suctionBonus: number|string; criticalChance: number; criticalMultiplier: number|string }} args
 */
export function performClick({ baseClick, suctionBonus, criticalChance, criticalMultiplier }) {
	return computeClick({ baseClick, suctionBonus, criticalChance, criticalMultiplier });
}


