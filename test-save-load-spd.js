// Test script to verify SPD values are saved and loaded correctly
// Run this in the browser console after loading the game

console.log('🧪 Testing SPD save/load with extreme values...');

// Test 1: Set extreme SPD values
console.log('Setting extreme SPD values...');
const extremeSPD = new Decimal('1e500');
const extremeStrawSPD = new Decimal('1e750');
const extremeCupSPD = new Decimal('1e1000');

// Set values in the game state
if (window.App && window.App.state) {
  window.App.state.setState({
    spd: extremeSPD,
    strawSPD: extremeStrawSPD,
    cupSPD: extremeCupSPD,
  });
  console.log('✅ Set extreme SPD values in state');
} else {
  console.error('❌ App.state not available');
}

// Test 2: Save the game
console.log('Saving game with extreme SPD values...');
if (window.App && window.App.systems && window.App.systems.save) {
  const saveResult = window.App.systems.save.performSaveSnapshot();
  console.log('Save result:', saveResult);
  console.log('✅ Game saved with SPD values:', {
    spd: saveResult.spd,
    strawSPD: saveResult.strawSPD,
    cupSPD: saveResult.cupSPD,
  });
} else {
  console.error('❌ Save system not available');
}

// Test 3: Reset state to simulate loading
console.log('Resetting state to simulate loading...');
if (window.App && window.App.state) {
  window.App.state.setState({
    spd: new Decimal(0),
    strawSPD: new Decimal(0),
    cupSPD: new Decimal(0),
  });
  console.log('✅ State reset');
}

// Test 4: Load the game
console.log('Loading game...');
if (window.App && window.App.storage) {
  const loadedData = window.App.storage.loadGame();
  console.log('Loaded data:', loadedData);

  if (loadedData && loadedData.spd) {
    console.log('✅ SPD values loaded:', {
      spd: loadedData.spd,
      strawSPD: loadedData.strawSPD,
      cupSPD: loadedData.cupSPD,
    });

    // Test 5: Apply loaded values to state
    if (window.App.systems && window.App.systems.saveGameLoader) {
      window.App.systems.saveGameLoader.loadGameState(loadedData);
      console.log('✅ Game state loaded from save data');

      // Check final state
      const finalState = window.App.state.getState();
      console.log('Final state SPD values:', {
        spd: finalState.spd?.toString(),
        strawSPD: finalState.strawSPD?.toString(),
        cupSPD: finalState.cupSPD?.toString(),
      });
    }
  } else {
    console.error('❌ No SPD values found in loaded data');
  }
} else {
  console.error('❌ Storage system not available');
}

console.log('🧪 SPD save/load test complete!');
