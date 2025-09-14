// Test script to verify SDP theme system
// Paste this into browser console to test the theme system

console.log('🧪 Testing SDP Theme System...');

// Test theme application for different levels
function testThemeForLevel(level) {
  console.log(`\n🎨 Testing theme for level ${level}:`);
  
  // Get the theme data
  const themeFunction = window.App?.ui?.sodaDrinkerProThemes?.getThemeForLevel;
  if (!themeFunction) {
    console.error('❌ getThemeForLevel function not found');
    return;
  }
  
  const theme = themeFunction(level);
  console.log('Theme data:', theme);
  
  // Apply the theme
  const applyFunction = window.App?.ui?.sodaDrinkerProThemes?.applyThemeToBackground;
  if (!applyFunction) {
    console.error('❌ applyThemeToBackground function not found');
    return;
  }
  
  applyFunction(level);
  console.log('✅ Applied background:', theme.backgroundGradient);
  console.log('✅ Applied mood class:', theme.mood);
  console.log('✅ Body background:', document.body.style.background);
  console.log('✅ Body classes:', document.body.className);
}

// Test levels 1, 5, 15, and 25 to see progression
testThemeForLevel(1);
setTimeout(() => testThemeForLevel(5), 1000);
setTimeout(() => testThemeForLevel(15), 2000);
setTimeout(() => testThemeForLevel(25), 3000);

// Test flavor text
setTimeout(() => {
  console.log('\n🍃 Testing flavor text...');
  const flavorFunction = window.App?.ui?.sodaDrinkerProThemes?.showLocationFlavorText;
  if (flavorFunction) {
    flavorFunction(15);
    console.log('✅ Flavor text should appear at bottom of screen');
  } else {
    console.error('❌ showLocationFlavorText function not found');
  }
}, 4000);

// Test notification
setTimeout(() => {
  console.log('\n🔔 Testing absurd notification...');
  const notificationFunction = window.App?.ui?.sodaDrinkerProThemes?.showAbsurdNotification;
  if (notificationFunction) {
    notificationFunction();
    console.log('✅ Notification should appear in top-right corner');
  } else {
    console.error('❌ showAbsurdNotification function not found');
  }
}, 5000);

console.log('\n📋 Check the results above and watch for visual changes!');
console.log('Background should change colors, and elements should appear on screen.');
