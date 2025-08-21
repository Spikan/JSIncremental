import { computeClick } from '../rules/clicks.js';

export function performClick({ baseClick, suctionBonus, criticalChance, criticalMultiplier }) {
	return computeClick({ baseClick, suctionBonus, criticalChance, criticalMultiplier });
}


