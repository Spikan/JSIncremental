// Local model-viewer compatibility element for offline/corporate-restricted environments.
// Provides the subset of behavior this app relies on (custom element registration and load/error events).

class ModelViewerCompatElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['src', 'alt'];
  }

  private mount!: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.mount = document.createElement('div');
    this.mount.style.width = '100%';
    this.mount.style.height = '100%';
    this.mount.style.display = 'grid';
    this.mount.style.placeItems = 'center';
    this.mount.style.borderRadius = '12px';
    this.mount.style.background = 'radial-gradient(circle at 30% 30%, #7ec8ff, #2a4365)';
    this.mount.style.color = 'white';
    this.mount.style.fontFamily = 'sans-serif';
    this.mount.style.fontSize = '12px';
    this.mount.textContent = '3D Soda';
    shadow.appendChild(this.mount);
  }

  connectedCallback(): void {
    this.style.display = this.style.display || 'block';
    void this.tryLoadSource();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'src') {
      void this.tryLoadSource();
    }
  }

  private async tryLoadSource(): Promise<void> {
    const src = this.getAttribute('src');
    if (!src) return;

    try {
      const response = await fetch(src, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to load model: ${response.status}`);
      }
      this.dispatchEvent(new Event('load'));
    } catch {
      this.dispatchEvent(new Event('error'));
    }
  }
}

if (!customElements.get('model-viewer')) {
  customElements.define('model-viewer', ModelViewerCompatElement);
}

export {};
