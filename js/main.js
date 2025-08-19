let sips = 0;
let straws = 0;
let cups = 0;
let sps = 0;
let strawSPS = 0;
let cupSPS = 0;
let strawUpCounter = 1;
let cupUpCounter = 1;
let level = 1;
const autosave = "on";
let autosaveCounter = 0;

regSoda = new Image();
regSoda.src = "images/regSoda.png";
moSoda = new Image();
moSoda.src = "images/moSoda.png";
clickSoda = new Image();
clickSoda.src = "images/clickSoda.png";


function sodaClick(number) {
    sips = sips + number;
    document.getElementById("sips").innerHTML = prettify(sips);

    setTimeout(function () {
        document.getElementById("sodaButton").src = regSoda.src;
    }, 90);
    document.getElementById("sodaButton").src = clickSoda.src;
}

function spsClick(number) {
    sips = sips + number;
    document.getElementById("sips").innerHTML = prettify(sips);

}

function buyStraw() {
    let strawCost = Math.floor(10 * Math.pow(1.1, straws));
    strawSPS = .4 * (strawUpCounter);
    if (sips >= strawCost) {
        straws = straws + 1;
        sips = sips - strawCost;
        sps = sps + strawSPS;
        reload();
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
    }
}

function levelUp() {
    let levelUpCost = 5000 * level;
    if (sips >= levelUpCost) {
        sips = sips - levelUpCost;
        level++
        sps = sps * level;

        document.getElementById("sips").innerHTML = prettify(sips);
        document.getElementById("sps").innerHTML = prettify(sps);
        document.getElementById("levelNumber").innerHTML = level;
        changeLevel(level);
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
        sps: sps,
        strawSPS: strawSPS,
        cupSPS: cupSPS,
        strawUpCounter: strawUpCounter,
        cupUpCounter: cupUpCounter,
        level: level
    };

    localStorage.setItem("save", JSON.stringify(save));
}

window.onload = function load() {
    let savegame = JSON.parse(localStorage.getItem("save"));

    if (savegame && typeof savegame.sips !== "undefined") sips = savegame.sips;
    if (savegame && typeof savegame.straws !== "undefined") straws = savegame.straws;
    if (savegame && typeof savegame.cups !== "undefined") cups = savegame.cups;
    if (savegame && typeof savegame.sps !== "undefined") sps = savegame.sps;
    if (savegame && typeof savegame.strawUpCounter !== "undefined") strawUpCounter = savegame.strawUpCounter;
    if (savegame && typeof savegame.cupUpCounter !== "undefined") cupUpCounter = savegame.cupUpCounter;
    if (savegame && typeof savegame.level !== "undefined") level = savegame.level;

    strawSPS = .4 * (strawUpCounter);
    cupSPS = cupUpCounter;

    reload();
};

function delete_save() {
    localStorage.removeItem("save")
}


function prettify(input) {
    return Math.round(input * 1000000) / 1000000;
}


function reload() {
    let strawCost = Math.floor(10 * Math.pow(1.1, straws));
    let cupCost = Math.floor(20 * Math.pow(1.2, cups));

    document.getElementById('straws').innerHTML = straws;
    document.getElementById('strawCost').innerHTML = strawCost.toString();
    document.getElementById('cups').innerHTML = cups;
    document.getElementById('cupCost').innerHTML = cupCost.toString();
    document.getElementById('sips').innerHTML = prettify(sips);
    document.getElementById('sps').innerHTML = prettify(sps);
    document.getElementById('strawSPS').innerHTML = prettify(strawSPS);
    document.getElementById('cupSPS').innerHTML = prettify(cupSPS);
    document.getElementById('totalStrawSPS').innerHTML = prettify(strawSPS * straws);
    document.getElementById('totalCupSPS').innerHTML = prettify(cupSPS * cups);
    document.getElementById('strawUpCost').innerHTML = (200 * strawUpCounter).toString();
    document.getElementById('cupUpCost').innerHTML = (500 * cupUpCounter).toString();
    document.getElementById('levelNumber').innerHTML = level;
}

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
