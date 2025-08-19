let sips = new Decimal(0);
let straws = new Decimal(0);
let cups = new Decimal(0);
let suctions = new Decimal(0);
let sps = new Decimal(0);
let strawSPS = new Decimal(0);
let cupSPS = new Decimal(0);
let suctionClickBonus = new Decimal(0);
let strawUpCounter = new Decimal(1);
let cupUpCounter = new Decimal(1);
let suctionUpCounter = new Decimal(1);
let level = new Decimal(1);
const autosave = "on";
let autosaveCounter = 0;

// Tick system variables
const DEFAULT_TICK_RATE = 5000; // 5 seconds in milliseconds
let tickRate = DEFAULT_TICK_RATE;
let tickProgress = 0;
let lastTickTime = Date.now();

// Faster Ticks upgrade variables
let fasterTicks = new Decimal(0);
let fasterTicksUpCounter = new Decimal(1);

// Splash screen functionality
function initSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    const gameContent = document.getElementById('gameContent');
    
    // Hide splash screen and show game content when clicked
    splashScreen.addEventListener('click', function() {
        splashScreen.style.opacity = '0';
        splashScreen.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(function() {
            splashScreen.style.display = 'none';
            gameContent.style.display = 'block';
            // Initialize the game after splash screen is hidden
            initGame();
        }, 500);
    });
    
    // Also allow keyboard input to start
    document.addEventListener('keydown', function(event) {
        if (splashScreen.style.display !== 'none') {
            splashScreen.click();
        }
    });
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event.target;
    clickedButton.classList.add('active');
}

// Check if upgrades are affordable and update UI accordingly
function checkUpgradeAffordability() {
    const strawCost = Math.floor(10 * Math.pow(1.1, straws.toNumber()));
    const cupCost = Math.floor(20 * Math.pow(1.2, cups.toNumber()));
    const suctionCost = Math.floor(50 * Math.pow(1.15, suctions.toNumber()));
    const fasterTicksCost = Math.floor(100 * Math.pow(1.12, fasterTicks.toNumber()));
    const strawUpCost = 200 * strawUpCounter.toNumber();
    const cupUpCost = 500 * cupUpCounter.toNumber();
    const suctionUpCost = 1000 * suctionUpCounter.toNumber();
    const fasterTicksUpCost = 2000 * fasterTicksUpCounter.toNumber();
    const levelUpCost = 5000 * level.toNumber();
    
    // Update button states based on affordability
    updateButtonState('buyStraw', sips.gte(strawCost), strawCost);
    updateButtonState('buyCup', sips.gte(cupCost), cupCost);
    updateButtonState('buySuction', sips.gte(suctionCost), suctionCost);
    updateButtonState('buyFasterTicks', sips.gte(fasterTicksCost), fasterTicksCost);
    updateButtonState('upgradeStraw', sips.gte(strawUpCost), strawUpCost);
    updateButtonState('upgradeCup', sips.gte(cupUpCost), cupUpCost);
    updateButtonState('upgradeSuction', sips.gte(suctionUpCost), suctionUpCost);
    updateButtonState('upgradeFasterTicks', sips.gte(fasterTicksUpCost), fasterTicksUpCost);
    updateButtonState('levelUp', sips.gte(levelUpCost), levelUpCost);
    
    // Update cost displays with affordability indicators
    updateCostDisplay('strawCost', strawCost, sips.gte(strawCost));
    updateCostDisplay('cupCost', cupCost, sips.gte(cupCost));
    updateCostDisplay('suctionCost', suctionCost, sips.gte(suctionCost));
    updateCostDisplay('fasterTicksCost', fasterTicksCost, sips.gte(fasterTicksCost));
    updateCostDisplay('strawUpCost', strawUpCost, sips.gte(strawUpCost));
    updateCostDisplay('cupUpCost', cupUpCost, sips.gte(cupUpCost));
    updateCostDisplay('suctionUpCost', suctionUpCost, sips.gte(suctionUpCost));
    updateCostDisplay('fasterTicksUpCost', fasterTicksUpCost, sips.gte(fasterTicksUpCost));
    updateCostDisplay('levelCost', levelUpCost, sips.gte(levelUpCost));
}

// Update button state based on affordability
function updateButtonState(buttonId, isAffordable, cost) {
    const button = document.querySelector(`button[onclick*="${buttonId}"]`);
    if (button) {
        if (isAffordable) {
            button.classList.remove('disabled');
            button.classList.add('affordable');
            button.title = `Click to purchase for ${prettify(cost)} Sips`;
        } else {
            button.classList.remove('affordable');
            button.classList.add('disabled');
            button.title = `Costs ${prettify(cost)} Sips (You have ${prettify(sips)})`;
        }
    }
}

// Update cost display with affordability indicators
function updateCostDisplay(elementId, cost, isAffordable) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isAffordable) {
            element.classList.remove('cost-too-high');
            element.classList.add('cost-affordable');
        } else {
            element.classList.remove('cost-affordable');
            element.classList.add('cost-too-high');
        }
    }
}

function initGame() {
    // Load saved game data
    let savegame = JSON.parse(localStorage.getItem("save"));
    
    if (savegame && typeof savegame.sips !== "undefined" && savegame.sips !== null) {
        sips = new Decimal(savegame.sips);
        straws = new Decimal(savegame.straws || 0);
        cups = new Decimal(savegame.cups || 0);
        suctions = new Decimal(savegame.suctions || 0);
        fasterTicks = new Decimal(savegame.fasterTicks || 0);
        sps = new Decimal(savegame.sps || 0);
        strawUpCounter = new Decimal(savegame.strawUpCounter || 1);
        cupUpCounter = new Decimal(savegame.cupUpCounter || 1);
        suctionUpCounter = new Decimal(savegame.suctionUpCounter || 1);
        fasterTicksUpCounter = new Decimal(savegame.fasterTicksUpCounter || 1);
        suctionClickBonus = new Decimal(savegame.suctionClickBonus || 0);
        level = new Decimal(savegame.level || 1);
    }
    
    strawSPS = new Decimal(0.4).times(strawUpCounter);
    cupSPS = new Decimal(cupUpCounter.toNumber());
    suctionClickBonus = new Decimal(0.2).times(suctionUpCounter);
    
    // Initialize tick rate based on upgrades
    updateTickRate();
    
    reload();
    
    // Start the game loop
    startGameLoop();
}

function startGameLoop() {
    // Update tick progress every 100ms for smooth animation
    window.setInterval(function() {
        updateTickProgress();
    }, 100);
    
    // Main tick interval for game logic
    window.setInterval(function() {
        processTick();
    }, 100); // Check every 100ms for precise tick timing
}

function updateTickProgress() {
    const currentTime = Date.now();
    const timeSinceLastTick = currentTime - lastTickTime;
    tickProgress = (timeSinceLastTick / tickRate) * 100;
    
    // Update progress bar
    const progressFill = document.getElementById('tickProgressFill');
    const countdown = document.getElementById('tickCountdown');
    
    if (progressFill && countdown) {
        progressFill.style.width = Math.min(tickProgress, 100) + '%';
        
        // Update countdown text
        const remainingTime = Math.max(0, (tickRate - timeSinceLastTick) / 1000);
        countdown.textContent = remainingTime.toFixed(1) + 's';
        
        // Update progress bar colors based on completion
        progressFill.classList.remove('nearly-complete', 'complete');
        if (tickProgress >= 100) {
            progressFill.classList.add('complete');
        } else if (tickProgress >= 75) {
            progressFill.classList.add('nearly-complete');
        }
    }
}

function processTick() {
    const currentTime = Date.now();
    if (currentTime - lastTickTime >= tickRate) {
        // Process the tick
        spsClick(sps);
        lastTickTime = currentTime;
        tickProgress = 0;
        
        // Update autosave counter
        if (autosave === "on") {
            autosaveCounter += 1;
            if (autosaveCounter >= 12) { // 12 ticks = 1 minute (5s * 12)
                save();
                autosaveCounter = 1;
            }
        }
    }
}

// Function to adjust tick rate (for future upgrades)
function setTickRate(newTickRate) {
    tickRate = newTickRate;
    // Reset progress when changing tick rate
    tickProgress = 0;
    lastTickTime = Date.now();
}

// Function to calculate and update tick rate based on upgrades
function updateTickRate() {
    // Each faster tick reduces time by 1%
    // Each upgrade increases the effectiveness
    let totalReduction = fasterTicks.times(fasterTicksUpCounter).times(0.01);
    let newTickRate = DEFAULT_TICK_RATE * (1 - totalReduction.toNumber());
    
    // Ensure tick rate doesn't go below 0.5 seconds
    newTickRate = Math.max(500, newTickRate);
    
    setTickRate(newTickRate);
}

// Function to get current tick rate in seconds
function getTickRateSeconds() {
    return tickRate / 1000;
}

// Function to update tick speed display
function updateTickSpeedDisplay() {
    const currentTickSpeed = document.getElementById('currentTickSpeed');
    const tickSpeedBonus = document.getElementById('tickSpeedBonus');
    
    if (currentTickSpeed && tickSpeedBonus) {
        // Show current tick time
        currentTickSpeed.textContent = getTickRateSeconds().toFixed(2) + 's';
        
        // Calculate and show speed bonus percentage
        let totalReduction = fasterTicks.times(fasterTicksUpCounter).times(0.01);
        let speedBonusPercent = totalReduction.times(100);
        tickSpeedBonus.textContent = speedBonusPercent.toFixed(1) + '%';
    }
}

regSoda = new Image();
regSoda.src = "images/regSoda.png";
moSoda = new Image();
moSoda.src = "images/moSoda.png";
clickSoda = new Image();
clickSoda.src = "images/clickSoda.png";


function sodaClick(number) {
    let clickAmount = new Decimal(number);
    let totalClickBonus = clickAmount.plus(suctionClickBonus.times(suctions));
    sips = sips.plus(totalClickBonus);
    document.getElementById("sips").innerHTML = prettify(sips);

    setTimeout(function () {
        document.getElementById("sodaButton").src = regSoda.src;
    }, 90);
    document.getElementById("sodaButton").src = clickSoda.src;
    
    // Check affordability after each click
    checkUpgradeAffordability();
}

function spsClick(number) {
    sips = sips.plus(number);
    document.getElementById("sips").innerHTML = prettify(sips);
    
    // Check affordability after passive income
    checkUpgradeAffordability();
}

function buyStraw() {
    let strawCost = Math.floor(10 * Math.pow(1.1, straws.toNumber()));
    if (sips.gte(strawCost)) {
        straws = straws.plus(1);
        sips = sips.minus(strawCost);
        strawSPS = new Decimal(0.4).times(strawUpCounter);
        sps = sps.plus(strawSPS);
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeStraw() {
    let strawUpCost = 200 * strawUpCounter.toNumber();
    if (sips.gte(strawUpCost)) {
        sips = sips.minus(strawUpCost);
        strawUpCounter = strawUpCounter.plus(1);
        strawSPS = new Decimal(0.4).times(strawUpCounter);
        sps = new Decimal(0);
        sps = sps.plus(strawSPS.times(straws));
        sps = sps.plus(cupSPS.times(cups));
        reload();
        checkUpgradeAffordability();
    }
}

function buyCup() {
    let cupCost = Math.floor(20 * Math.pow(1.2, cups.toNumber()));
    if (sips.gte(cupCost)) {
        cups = cups.plus(1);
        sips = sips.minus(cupCost);
        cupSPS = new Decimal(cupUpCounter.toNumber());
        sps = sps.plus(cupSPS);
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeCup() {
    let cupUpCost = 500 * cupUpCounter.toNumber();
    if (sips.gte(cupUpCost)) {
        sips = sips.minus(cupUpCost);
        cupUpCounter = cupUpCounter.plus(1);
        cupSPS = new Decimal(cupUpCounter.toNumber());
        sps = new Decimal(0);
        sps = sps.plus(strawSPS.times(straws));
        sps = sps.plus(cupSPS.times(cups));
        reload();
        checkUpgradeAffordability();
    }
}

function buySuction() {
    let suctionCost = Math.floor(50 * Math.pow(1.15, suctions.toNumber()));
    if (sips.gte(suctionCost)) {
        suctions = suctions.plus(1);
        sips = sips.minus(suctionCost);
        suctionClickBonus = new Decimal(0.2).times(suctionUpCounter);
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeSuction() {
    let suctionUpCost = 1000 * suctionUpCounter.toNumber();
    if (sips.gte(suctionUpCost)) {
        sips = sips.minus(suctionUpCost);
        suctionUpCounter = suctionUpCounter.plus(1);
        suctionClickBonus = new Decimal(0.2).times(suctionUpCounter);
        reload();
        checkUpgradeAffordability();
    }
}

function buyFasterTicks() {
    let fasterTicksCost = Math.floor(100 * Math.pow(1.12, fasterTicks.toNumber()));
    if (sips.gte(fasterTicksCost)) {
        fasterTicks = fasterTicks.plus(1);
        sips = sips.minus(fasterTicksCost);
        updateTickRate();
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeFasterTicks() {
    let fasterTicksUpCost = 2000 * fasterTicksUpCounter.toNumber();
    if (sips.gte(fasterTicksUpCost)) {
        sips = sips.minus(fasterTicksUpCost);
        fasterTicksUpCounter = fasterTicksUpCounter.plus(1);
        updateTickRate();
        reload();
        checkUpgradeAffordability();
    }
}

function levelUp() {
    let levelUpCost = 5000 * level.toNumber();
    if (sips.gte(levelUpCost)) {
        sips = sips.minus(levelUpCost);
        level = level.plus(1);
        sps = sps.times(level);

        document.getElementById("sips").innerHTML = prettify(sips);
        document.getElementById("sps").innerHTML = prettify(sips);
        document.getElementById("levelNumber").innerHTML = level.toNumber();
        changeLevel(level.toNumber());
        checkUpgradeAffordability();
    }
}

function changeLevel(i) {

    let body = document.querySelector("body");

    if (i === 2) {
        document.getElementById("levelText").innerHTML = "On a Red Background";
        body.style.backgroundColor = "#AE323B";
    }
}

function save() {

    let save = {
        sips: sips.toString(),
        straws: straws.toString(),
        cups: cups.toString(),
        suctions: suctions.toString(),
        fasterTicks: fasterTicks.toString(),
        sps: sps.toString(),
        strawSPS: strawSPS.toString(),
        cupSPS: cupSPS.toString(),
        suctionClickBonus: suctionClickBonus.toString(),
        strawUpCounter: strawUpCounter.toString(),
        cupUpCounter: cupUpCounter.toString(),
        suctionUpCounter: suctionUpCounter.toString(),
        fasterTicksUpCounter: fasterTicksUpCounter.toString(),
        level: level.toString()
    };

    localStorage.setItem("save", JSON.stringify(save));
}

function delete_save() {
    localStorage.removeItem("save")
}


function prettify(input) {
    if (input instanceof Decimal) {
        if (input.lt(1000)) {
            return input.toFixed(2);
        } else if (input.lt(1e6)) {
            return input.toFixed(1);
        } else if (input.lt(1e9)) {
            return (input.toNumber() / 1e6).toFixed(2) + "M";
        } else if (input.lt(1e12)) {
            return (input.toNumber() / 1e9).toFixed(2) + "B";
        } else if (input.lt(1e15)) {
            return (input.toNumber() / 1e12).toFixed(2) + "T";
        } else if (input.lt(1e18)) {
            return (input.toNumber() / 1e15).toFixed(2) + "Qa";
        } else if (input.lt(1e21)) {
            return (input.toNumber() / 1e18).toFixed(2) + "Qi";
        } else if (input.lt(1e24)) {
            return (input.toNumber() / 1e21).toFixed(2) + "Sx";
        } else if (input.lt(1e27)) {
            return (input.toNumber() / 1e24).toFixed(2) + "Sp";
        } else if (input.lt(1e30)) {
            return (input.toNumber() / 1e27).toFixed(2) + "Oc";
        } else {
            return input.toExponential(2);
        }
    }
    return input.toFixed(2);
}


function reload() {
    let strawCost = Math.floor(10 * Math.pow(1.1, straws.toNumber()));
    let cupCost = Math.floor(20 * Math.pow(1.2, cups.toNumber()));
    let suctionCost = Math.floor(50 * Math.pow(1.15, suctions.toNumber()));
    let fasterTicksCost = Math.floor(100 * Math.pow(1.12, fasterTicks.toNumber()));

    document.getElementById('straws').innerHTML = straws.toNumber();
    document.getElementById('strawCost').innerHTML = strawCost.toString();
    document.getElementById('cups').innerHTML = cups.toNumber();
    document.getElementById('cupCost').innerHTML = cupCost.toString();
    document.getElementById('suctions').innerHTML = suctions.toNumber();
    document.getElementById('suctionCost').innerHTML = suctionCost.toString();
    document.getElementById('fasterTicks').innerHTML = fasterTicks.toNumber();
    document.getElementById('fasterTicksCost').innerHTML = fasterTicksCost.toString();
    document.getElementById('sips').innerHTML = prettify(sips);
    document.getElementById('sps').innerHTML = prettify(sps);
    document.getElementById('strawSPS').innerHTML = prettify(strawSPS);
    document.getElementById('cupSPS').innerHTML = prettify(cupSPS);
    document.getElementById('suctionClickBonus').innerHTML = prettify(suctionClickBonus);
    document.getElementById('totalStrawSPS').innerHTML = prettify(strawSPS.times(straws));
    document.getElementById('totalCupSPS').innerHTML = prettify(cupSPS.times(cups));
    document.getElementById('totalSuctionBonus').innerHTML = prettify(suctionClickBonus.times(suctions));
    document.getElementById('strawUpCost').innerHTML = (200 * strawUpCounter.toNumber()).toString();
    document.getElementById('cupUpCost').innerHTML = (500 * cupUpCounter.toNumber()).toString();
    document.getElementById('suctionUpCost').innerHTML = (1000 * suctionUpCounter.toNumber()).toString();
    document.getElementById('fasterTicksUpCost').innerHTML = (2000 * fasterTicksUpCounter.toNumber()).toString();
    document.getElementById('levelNumber').innerHTML = level.toNumber();
    
    // Update tick speed display
    updateTickSpeedDisplay();
    
    // Check affordability after reloading all values
    checkUpgradeAffordability();
}

// Initialize splash screen when page loads
window.onload = function() {
    initSplashScreen();
};
