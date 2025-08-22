// @ts-check
// Central accessor for upgrades data and balance config

/**
 * @returns {{ upgrades: any; config: any }}
 */
export function getUpgradesAndConfig() {
	const upgrades = (typeof window !== 'undefined' && /** @type {any} */(window).App?.data?.upgrades) || {};
	const config = (typeof window !== 'undefined' && /** @type {any} */(window).GAME_CONFIG?.BALANCE) || {};
	return { upgrades, config };
}


