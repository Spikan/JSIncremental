// Global ambient declarations to enable TypeScript checking over JS files

// Minimal Decimal-like interface compatible with production and test stubs
interface DecimalLike {
	toNumber(): number;
	toString(): string;
	plus(value: number | string | DecimalLike): DecimalLike;
	minus?(value: number | string | DecimalLike): DecimalLike;
	times(value: number | string | DecimalLike): DecimalLike;
	div?(value: number | string | DecimalLike): DecimalLike;
	gte?(value: number | string | DecimalLike): boolean;
	gt?(value: number | string | DecimalLike): boolean;
	lte?(value: number | string | DecimalLike): boolean;
	lt?(value: number | string | DecimalLike): boolean;
}

interface DecimalCtor {
	new (value: number | string | DecimalLike): DecimalLike;
}

type EventHandler<T = any> = (payload: T) => void;

interface EventBusGeneric {
	on(event: string, handler: EventHandler): () => void;
	off(event: string, handler: EventHandler): void;
	emit(event: string, payload?: any): void;
}

interface GameOptions {
	autosaveEnabled: boolean;
	autosaveInterval: number; // seconds
	clickSoundsEnabled: boolean;
	musicEnabled: boolean;
	musicStreamPreferences?: Record<string, boolean> | { preferred?: string; fallbacks?: string[] };
}

interface GameState {
	sips: number;
	straws: number;
	cups: number;
	suctions: number;
	widerStraws: number;
	betterCups: number;
	fasterDrinks: number;
	criticalClicks: number;
	level: number;
	sps: number;
	strawSPD: number;
	cupSPD: number;
	drinkRate: number;
	drinkProgress: number;
	lastDrinkTime: number;
	// newly centralized
	criticalClickChance: number;
	criticalClickMultiplier: number;
	suctionClickBonus: number;
	fasterDrinksUpCounter: number;
	criticalClickUpCounter: number;
	lastSaveTime: number;
	sessionStartTime: number;
	totalSipsEarned: number;
	totalClicks: number;
	highestSipsPerSecond: number;
	totalPlayTime: number;
	options: GameOptions;
}

interface Store<T> {
	getState(): T;
	setState(partial: Partial<T>): void;
	subscribe(listener: (state: T) => void): () => void;
}

interface AppNamespace {
	state: Store<GameState>;
	storage: any;
	events: EventBusGeneric;
	EVENT_NAMES: any;
	rules: Record<string, any>;
	systems: Record<string, any>;
	ui: Record<string, any>;
	data: Record<string, any>;
	stateBridge?: Record<string, any>;
}

interface GameConfig {
	BALANCE: Record<string, number> & {
		STRAW_BASE_SPD: number;
		CUP_BASE_SPD: number;
		BASE_SIPS_PER_DRINK: number;
		SUCTION_CLICK_BONUS: number;
	};
	TIMING: Record<string, number>;
	LIMITS: Record<string, number>;
}

declare global {
	interface Window {
		App: AppNamespace;
		GAME_CONFIG: GameConfig;
		Decimal: DecimalCtor;
		DOM_CACHE: any;
		FEATURE_UNLOCKS: any;
		validateGameSave?: (data: any) => any;
		validateGameOptions?: (data: any) => any;
	}
}

export {};


