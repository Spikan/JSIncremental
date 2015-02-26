var sips = 0;
var straws = 0;
var cups = 0;
var sps = 0;
var strawSPS = 0;
var cupSPS = 0;
var strawUpCounter = 1;
var cupUpCounter = 1;
var level = 1;
var autosave = "on";
var autosaveCounter = 0;

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
    var strawCost = Math.floor(10 * Math.pow(1.1, straws));
    strawSPS = .4 * (strawUpCounter);
    if (sips >= strawCost) {
        straws = straws + 1;
        sips = sips - strawCost;
        sps = sps + strawSPS;
        document.getElementById('straws').innerHTML = straws;
        document.getElementById('sips').innerHTML = prettify(sips);
        document.getElementById('sps').innerHTML = prettify(sps);
        document.getElementById('strawCost').innerHTML = Math.floor(10 * Math.pow(1.1, straws));
        document.getElementById('totalStrawSPS').innerHTML = prettify(strawSPS * straws);
    }


}

function upgradeStraw() {
    var strawUpCost = 200 * strawUpCounter;
    if (sips >= strawUpCost) {
        sips = sips - strawUpCost;
        strawUpCounter++;
        strawSPS = .4 * (strawUpCounter);
        sps = 0;
        sps = sps + (strawSPS * straws);
        sps = sps + (cupSPS * cups);
        document.getElementById('strawUpCost').innerHTML = 200 * strawUpCounter;
        document.getElementById('straws').innerHTML = straws;
        document.getElementById('sips').innerHTML = prettify(sips);
        document.getElementById('sps').innerHTML = prettify(sps);
        document.getElementById('strawCost').innerHTML = Math.floor(10 * Math.pow(1.1, straws));
        document.getElementById('totalStrawSPS').innerHTML = prettify(strawSPS * straws);
    }
}

function buyCup() {
    var cupCost = Math.floor(20 * Math.pow(1.2, cups));
    cupSPS = cupUpCounter;
    if (sips >= cupCost) {
        cups = cups + 1;
        sips = sips - cupCost;
        sps = sps + cupSPS;
        document.getElementById('cups').innerHTML = cups;
        document.getElementById('sips').innerHTML = prettify(sips);
        document.getElementById('sps').innerHTML = prettify(sps);
        document.getElementById('cupCost').innerHTML = Math.floor(20 * Math.pow(1.2, cups));
        document.getElementById('totalCupSPS').innerHTML = prettify(cupSPS * cups);
    }

}

function upgradeCup() {
    var cupUpCost = 500 * (cupUpCounter);
    if (sips >= cupUpCost) {
        sips = sips - cupUpCost;
        cupUpCounter++;
        cupSPS = cupUpCounter;
        sps = 0;
        sps = sps + (strawSPS * straws);
        sps = sps + (cupSPS * cups);
        document.getElementById('cupUpCost').innerHTML = 500 * cupUpCounter;
        document.getElementById('cups').innerHTML = cups;
        document.getElementById('sips').innerHTML = prettify(sips);
        document.getElementById('sps').innerHTML = prettify(sps);
        document.getElementById('cupCost').innerHTML = Math.floor(20 * Math.pow(1.2, cups));
        document.getElementById('totalCupSPS').innerHTML = prettify(cupSPS * cups);
    }
}

function levelUp() {
    var levelUpCost = 5000 * level;
    if (sips >= levelUpCost) {
        sips = sips - levelUpCost;
        level++
        sps = sps * level;

        document.getElementById("sips").innerHTML = prettify(sips);
        document.getElementById("sps").innerHTML = prettify(sps);
        document.getElementById("levelNumber").innerHTML = level;
    }
}

function changeLevel(i) {

    var body = document.querySelector("body");

    if(i==2)
    {
        document.getElementById("levelText").innerHTML = "On a Red Background";
        body.style.backgroundColor = "#AE323B";
    }
}

function save() {

    var save = {
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


    var savegame = JSON.parse(localStorage.getItem("save"));

    if (typeof savegame.sips !== "undefined") sips = savegame.sips;
    if (typeof savegame.straws !== "undefined") straws = savegame.straws;
    if (typeof savegame.cups !== "undefined") cups = savegame.cups;
    if (typeof savegame.sps !== "undefined") sps = savegame.sps;
    if (typeof savegame.strawUpCounter !== "undefined") strawUpCounter = savegame.strawUpCounter;
    if (typeof savegame.cupUpCounter !== "undefined") cupUpCounter = savegame.cupUpCounter;
    if (typeof savegame.level !== "undefined") level = savegame.level;

    var strawCost = Math.floor(10 * Math.pow(1.1, straws));
    var cupCost = Math.floor(20 * Math.pow(1.2, cups));

    strawSPS = .4 * (strawUpCounter);
    cupSPS = cupUpCounter;


    document.getElementById('straws').innerHTML = straws;
    document.getElementById('strawCost').innerHTML = strawCost;
    document.getElementById('cups').innerHTML = cups;
    document.getElementById('cupCost').innerHTML = cupCost;
    document.getElementById('sips').innerHTML = prettify(sips);
    document.getElementById('sps').innerHTML = prettify(sps);
    document.getElementById('strawSPS').innerHTML = prettify(strawSPS);
    document.getElementById('cupSPS').innerHTML = prettify(cupSPS);
    document.getElementById('totalStrawSPS').innerHTML = prettify(strawSPS * straws);
    document.getElementById('totalCupSPS').innerHTML = prettify(cupSPS * cups);
    document.getElementById('strawUpCost').innerHTML = 200 * strawUpCounter;
    document.getElementById('cupUpCost').innerHTML = 500 * cupUpCounter;
    document.getElementById('levelNumber').innerHTML = level;
};

function delete_save() {
    localStorage.removeItem("save")
}


function prettify(input) {
    return Math.round(input * 1000000) / 1000000;
}


function reload() {
    document.getElementById('straws').innerHTML = straws;
    document.getElementById('strawCost').innerHTML = strawCost;
    document.getElementById('cups').innerHTML = cups;
    document.getElementById('cupCost').innerHTML = cupCost;
    document.getElementById('sips').innerHTML = prettify(sips);
    document.getElementById('sps').innerHTML = prettify(sps);
    document.getElementById('strawSPS').innerHTML = prettify(strawSPS);
    document.getElementById('cupSPS').innerHTML = prettify(cupSPS);
    document.getElementById('totalStrawSPS').innerHTML = prettify(strawSPS * straws);
    document.getElementById('totalCupSPS').innerHTML = prettify(cupSPS * cups);
    document.getElementById('strawUpCost').innerHTML = 200 * strawUpCounter;
    document.getElementById('cupUpCost').innerHTML = 500 * cupUpCounter;
    document.getElementById('levelNumber').innerHTML = level;
}

window.setInterval(function () {

    spsClick(sps);


    if (autosave == "on") {
        autosaveCounter += 1;
        if (autosaveCounter >= 60) {
            save();
            autosaveCounter = 1;
        }
    }


}, 1000);
