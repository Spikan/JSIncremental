// Pointer Tracker Service
// Stores the most recent pointer coordinates for use by systems that cannot access the DOM event directly

export type PointerPosition = {
  x: number;
  y: number;
  t: number; // timestamp
  kind?: 'mouse' | 'touch' | 'pen';
};

let lastPointerPosition: PointerPosition | null = null;

export function setLastPointerPosition(
  x: number,
  y: number,
  kind?: 'mouse' | 'touch' | 'pen'
): void {
  // Guard against NaN
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const base = { x, y, t: Date.now() };
  lastPointerPosition = (kind ? { ...base, kind } : base) as PointerPosition;
}

export function getLastPointerPosition(maxAgeMs: number = 1500): PointerPosition | null {
  if (!lastPointerPosition) return null;
  if (Date.now() - lastPointerPosition.t > maxAgeMs) return null;
  return lastPointerPosition;
}
