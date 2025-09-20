// Shared pointer metadata storage using WeakMap

type Meta = {
  lastPointerTs?: number;
};

const elementMeta = new WeakMap<Element, Meta>();

export function markPointerHandled(element: Element): void {
  const meta = elementMeta.get(element) || {};
  meta.lastPointerTs = Date.now();
  elementMeta.set(element, meta);
}

export function shouldSuppressClick(element: Element, suppressMs = 300): boolean {
  const ts = elementMeta.get(element)?.lastPointerTs;
  if (!ts) return false;
  return Date.now() - ts < suppressMs;
}
