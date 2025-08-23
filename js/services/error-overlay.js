// @ts-nocheck
(function attachErrorOverlay() {
	const w = /** @type {any} */ (window);
	if (w.__ERROR_OVERLAY_ATTACHED__) return;
	w.__ERROR_OVERLAY_ATTACHED__ = true;

	const overlay = document.createElement('div');
	overlay.id = 'error-overlay';
	overlay.style.position = 'fixed';
	overlay.style.right = '8px';
	overlay.style.bottom = '8px';
	overlay.style.maxWidth = '38vw';
	overlay.style.maxHeight = '40vh';
	overlay.style.overflow = 'auto';
	overlay.style.background = 'rgba(220, 50, 47, 0.95)';
	overlay.style.color = '#fff';
	overlay.style.font = '12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
	overlay.style.padding = '8px 10px';
	overlay.style.borderRadius = '6px';
	overlay.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
	overlay.style.zIndex = '99999';
	overlay.style.display = 'none';

	const header = document.createElement('div');
	header.textContent = 'Runtime Errors';
	header.style.fontWeight = '700';
	header.style.marginBottom = '6px';

	const list = document.createElement('div');
	list.setAttribute('role', 'log');

	overlay.appendChild(header);
	overlay.appendChild(list);
	document.body.appendChild(overlay);

	function show(msg) {
		overlay.style.display = 'block';
		const item = document.createElement('div');
		item.style.margin = '6px 0';
		item.style.whiteSpace = 'pre-wrap';
		item.textContent = msg;
		list.appendChild(item);
	}

	window.addEventListener('error', (e) => {
		try {
			const src = e.filename ? `\n@ ${e.filename}:${e.lineno}:${e.colno}` : '';
			show(`Error: ${e.message || e.error?.message || 'Unknown error'}${src}`);
		} catch {}
	});

	window.addEventListener('unhandledrejection', (e) => {
		try {
			const reason = e.reason;
			const msg = typeof reason === 'string' ? reason : (reason?.message || JSON.stringify(reason));
			show(`Unhandled Promise rejection: ${msg}`);
		} catch {}
	});

	// Click to collapse/hide
	overlay.addEventListener('click', () => {
		overlay.style.display = 'none';
		list.innerHTML = '';
	});
})();
