// Temporary fix for stats.ts to avoid variable naming conflicts
// This will replace the problematic function

export function updateShopStatsFixed(): void {
  const shouldLog = Math.random() < 0.01; // Log 1% of the time for debugging
  if (shouldLog) console.log('🔧 updateShopStats called');

  if (typeof window === 'undefined') return;

  const state = (window as any).App?.state?.getState?.();
  if (!state) {
    if (shouldLog) console.log('❌ No state available');
    return;
  }

  // Helper function to format numbers
  const formatNumber = (value: any): string => {
    if (typeof value === 'object' && value?.toString) {
      return value.toString();
    }
    return String(value || 0);
  };

  // Use different variable naming pattern to avoid conflicts
  const domCache = (window as any).DOM_CACHE;
  if (!domCache) {
    if (shouldLog) console.log('❌ DOM_CACHE not available');
    return;
  }

  // Update straws purchased count
  const strawsElement = domCache.strawsPurchased;
  if (strawsElement) {
    const straws = state.straws || 0;
    const strawsValue = formatNumber(straws);
    strawsElement.textContent = strawsValue;
    if (shouldLog) console.log('✅ Updated straws:', strawsValue);
  }

  // Update cups purchased count
  const cupsElement = domCache.cupsPurchased;
  if (cupsElement) {
    const cups = state.cups || 0;
    const cupsValue = formatNumber(cups);
    cupsElement.textContent = cupsValue;
    if (shouldLog) console.log('✅ Updated cups:', cupsValue);
  }

  // Update suctions purchased count
  const suctionsElement = domCache.suctionsPurchased;
  if (suctionsElement) {
    const suctions = state.suctions || 0;
    const suctionsValue = formatNumber(suctions);
    suctionsElement.textContent = suctionsValue;
    if (shouldLog) console.log('✅ Updated suctions:', suctionsValue);
  }

  // Update critical clicks purchased count - using different variable name pattern
  const critClicksElement = domCache.criticalClicksPurchased;
  if (critClicksElement) {
    const critClicks = state.criticalClicks || 0;
    const critClicksValue = formatNumber(critClicks);
    critClicksElement.textContent = critClicksValue;
    if (shouldLog) console.log('✅ Updated criticalClicks:', critClicksValue);
  }

  if (shouldLog) console.log('🎉 updateShopStats completed');
}
