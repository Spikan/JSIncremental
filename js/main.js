let sips = 0;
let straws = 0;
let cups = 0;
let suctions = 0;
let sps = 0;
let strawSPS = 0;
let cupSPS = 0;
let suctionClickBonus = 0;
let strawUpCounter = 1;
let cupUpCounter = 1;
let suctionUpCounter = 1;
let level = 1;
const autosave = "on";
let autosaveCounter = 0;

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
    const strawCost = Math.floor(10 * Math.pow(1.1, straws));
    const cupCost = Math.floor(20 * Math.pow(1.2, cups));
    const suctionCost = Math.floor(50 * Math.pow(1.15, suctions));
    const strawUpCost = 200 * strawUpCounter;
    const cupUpCost = 500 * cupUpCounter;
    const suctionUpCost = 1000 * suctionUpCounter;
    const levelUpCost = 5000 * level;
    
    // Update button states based on affordability
    updateButtonState('buyStraw', sips >= strawCost, strawCost);
    updateButtonState('buyCup', sips >= cupCost, cupCost);
    updateButtonState('buySuction', sips >= suctionCost, suctionCost);
    updateButtonState('upgradeStraw', sips >= strawUpCost, strawUpCost);
    updateButtonState('upgradeCup', sips >= cupUpCost, cupUpCost);
    updateButtonState('upgradeSuction', sips >= suctionUpCost, suctionUpCost);
    updateButtonState('levelUp', sips >= levelUpCost, levelUpCost);
    
    // Update cost displays with affordability indicators
    updateCostDisplay('strawCost', strawCost, sips >= strawCost);
    updateCostDisplay('cupCost', cupCost, sips >= cupCost);
    updateCostDisplay('suctionCost', suctionCost, sips >= suctionCost);
    updateCostDisplay('strawUpCost', strawUpCost, sips >= strawUpCost);
    updateCostDisplay('cupUpCost', cupUpCost, sips >= cupUpCost);
    updateCostDisplay('suctionUpCost', suctionUpCost, sips >= suctionUpCost);
    updateCostDisplay('levelCost', levelUpCost, sips >= levelUpCost);
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
        sips = savegame.sips;
        straws = savegame.straws || 0;
        cups = savegame.cups || 0;
        suctions = savegame.suctions || 0;
        sps = savegame.sps || 0;
        strawUpCounter = savegame.strawUpCounter || 1;
        cupUpCounter = savegame.cupUpCounter || 1;
        suctionUpCounter = savegame.suctionUpCounter || 1;
        suctionClickBonus = savegame.suctionClickBonus || 0;
        level = savegame.level || 1;
    }
    
    strawSPS = .4 * (strawUpCounter);
    cupSPS = cupUpCounter;
    suctionClickBonus = 0.2 * suctionUpCounter;
    
    reload();
    
    // Start the game loop
    startGameLoop();
}

function startGameLoop() {
    window.setInterval(function () {
        spsClick(sps);
        
        if (autosave === "on") {
            autosaveCounter += 1;
            if (autosaveCounter >= 60) {
                save();
                autosaveCounter = 1;
            }
        }
    }, 1000);
}

regSoda = new Image();
regSoda.src = "images/regSoda.png";
moSoda = new Image();
moSoda.src = "images/moSoda.png";
clickSoda = new Image();
clickSoda.src = "images/clickSoda.png";


function sodaClick(number) {
    let totalClickBonus = number + (suctionClickBonus * suctions);
    sips = sips + totalClickBonus;
    document.getElementById("sips").innerHTML = prettify(sips);

    setTimeout(function () {
        document.getElementById("sodaButton").src = regSoda.src;
    }, 90);
    document.getElementById("sodaButton").src = clickSoda.src;
    
    // Check affordability after each click
    checkUpgradeAffordability();
}

function spsClick(number) {
    sips = sips + number;
    document.getElementById("sips").innerHTML = prettify(sips);
    
    // Check affordability after passive income
    checkUpgradeAffordability();
}

function buyStraw() {
    let strawCost = Math.floor(10 * Math.pow(1.1, straws));
    strawSPS = .4 * (strawUpCounter);
    if (sips >= strawCost) {
        straws = straws + 1;
        sips = sips - strawCost;
        sps = sps + strawSPS;
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeStraw() {
    let strawUpCost = 200 * strawUpCounter;
    if (sips >= strawUpCost) {
        sips = sips - strawUpCost;
        strawUpCounter++;
        strawSPS = .4 * (strawUpCounter);
        sps = 0;
        sps = sps + (strawSPS * straws);
        sps = sps + (cupSPS * cups);
        reload();
        checkUpgradeAffordability();
    }
}

function buyCup() {
    let cupCost = Math.floor(20 * Math.pow(1.2, cups));
    cupSPS = cupUpCounter;
    if (sips >= cupCost) {
        cups = cups + 1;
        sips = sips - cupCost;
        sps = sps + cupSPS;
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeCup() {
    let cupUpCost = 500 * cupUpCounter;
    if (sips >= cupUpCost) {
        sips = sips - cupUpCost;
        cupUpCounter++;
        cupSPS = cupUpCounter;
        sps = 0;
        sps = sps + (strawSPS * straws);
        sps = sps + (cupSPS * cups);
        reload();
        checkUpgradeAffordability();
    }
}

function buySuction() {
    let suctionCost = Math.floor(50 * Math.pow(1.15, suctions));
    suctionClickBonus = 0.2 * suctionUpCounter;
    if (sips >= suctionCost) {
        suctions = suctions + 1;
        sips = sips - suctionCost;
        reload();
        checkUpgradeAffordability();
    }
}

function upgradeSuction() {
    let suctionUpCost = 1000 * suctionUpCounter;
    if (sips >= suctionUpCost) {
        sips = sips - suctionUpCost;
        suctionUpCounter++;
        suctionClickBonus = 0.2 * suctionUpCounter;
        reload();
        checkUpgradeAffordability();
    }
}

function levelUp() {
    let levelUpCost = 5000 * level;
    if (sips >= levelUpCost) {
        sips = sips - levelUpCost;
        level++
        sps = sps * level;

        document.getElementById("sips").innerHTML = prettify(sips);
        document.getElementById("sps").innerHTML = prettify(sips);
        document.getElementById("levelNumber").innerHTML = level;
        changeLevel(level);
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
        sips: sips,
        straws: straws,
        cups: cups,
        suctions: suctions,
        sps: sps,
        strawSPS: strawSPS,
        cupSPS: cupSPS,
        suctionClickBonus: suctionClickBonus,
        strawUpCounter: strawUpCounter,
        cupUpCounter: cupUpCounter,
        suctionUpCounter: suctionUpCounter,
        level: level
    };

    localStorage.setItem("save", JSON.stringify(save));
}

function delete_save() {
    localStorage.removeItem("save")
}


function prettify(input) {
    return Math.round(input * 1000000) / 1000000;
}


function reload() {
    let strawCost = Math.floor(10 * Math.pow(1.1, straws));
    let cupCost = Math.floor(20 * Math.pow(1.2, cups));
    let suctionCost = Math.floor(50 * Math.pow(1.15, suctions));

    document.getElementById('straws').innerHTML = straws;
    document.getElementById('strawCost').innerHTML = strawCost.toString();
    document.getElementById('cups').innerHTML = cups;
    document.getElementById('cupCost').innerHTML = cupCost.toString();
    document.getElementById('suctions').innerHTML = suctions;
    document.getElementById('suctionCost').innerHTML = suctionCost.toString();
    document.getElementById('sips').innerHTML = prettify(sips);
    document.getElementById('sps').innerHTML = prettify(sps);
    document.getElementById('strawSPS').innerHTML = prettify(strawSPS);
    document.getElementById('cupSPS').innerHTML = prettify(cupSPS);
    document.getElementById('suctionClickBonus').innerHTML = prettify(suctionClickBonus);
    document.getElementById('totalStrawSPS').innerHTML = prettify(strawSPS * straws);
    document.getElementById('totalCupSPS').innerHTML = prettify(cupSPS * cups);
    document.getElementById('totalSuctionBonus').innerHTML = prettify(suctionClickBonus * suctions);
    document.getElementById('strawUpCost').innerHTML = (200 * strawUpCounter).toString();
    document.getElementById('cupUpCost').innerHTML = (500 * cupUpCounter).toString();
    document.getElementById('suctionUpCost').innerHTML = (1000 * suctionUpCounter).toString();
    document.getElementById('levelNumber').innerHTML = level;
    
    // Check affordability after reloading all values
    checkUpgradeAffordability();
}

// Initialize splash screen when page loads
window.onload = function() {
    initSplashScreen();
};
