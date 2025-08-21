// UI Labels helpers: small, reusable text setters for common UI labels

// Update the Click Sounds toggle label and style
export function updateClickSoundsToggleText(enabled) {
	const toggle = document.getElementById('clickSoundsToggle');
	if (!toggle) return;
	const onText = '🔊 Click Sounds ON';
	const offText = '🔇 Click Sounds OFF';
	toggle.textContent = enabled ? onText : offText;
	toggle.classList.toggle('sounds-off', !enabled);
}

// Update the drink countdown label (accepts seconds as number)
export function updateCountdownText(secondsRemaining) {
	const countdown = window.DOM_CACHE?.drinkCountdown || document.getElementById('drinkCountdown');
	if (!countdown) return;
	const seconds = Math.max(0, Number(secondsRemaining) || 0);
	countdown.textContent = seconds.toFixed(1) + 's';
}

// Generic music status label setter
export function setMusicStatusText(text) {
	const status = window.DOM_CACHE?.musicStatus || document.getElementById('musicStatus');
	if (!status) return;
	status.textContent = String(text);
}


