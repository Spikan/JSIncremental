var sips = 0;
var straws = 0;
var cups = 0;
var sps = 0;
var autosave = "on";
var autosaveCounter = 0;

function sodaClick(number){
    sips = sips + number;
    document.getElementById("sips").innerHTML = sips;
};



function buyStraw(){
    var strawCost = Math.floor(10 * Math.pow(1.1,straws));
    if(sips >= strawCost){
        straws = straws + 1;
        sips = sips - strawCost;
        document.getElementById('straws').innerHTML = straws;
        document.getElementById('sips').innerHTML = sips;

        sps = sps + 1;
        document.getElementById('sps').innerHTML = sps;
    };
    var nextStrawCost = Math.floor(10 * Math.pow(1.1,straws));
    document.getElementById('strawCost').innerHTML = nextStrawCost;
};

function buyCup(){
    var cupCost = Math.floor(20 * Math.pow(1.2,cups));
    if(sips >= cupCost){
        cups = cups + 1;
        sips = sips - cupCost;
        document.getElementById('cups').innerHTML = cups;
        document.getElementById('sips').innerHTML = sips;

        sps = sps + 2;
        document.getElementById('sps').innerHTML = sps;
    };
    var nextCupCost = Math.floor(20 * Math.pow(1.2,cups));
    document.getElementById('cupCost').innerHTML = nextCupCost;


};

function save(){

    var save = {
        sips: sips,
        straws: straws,
        cups: cups,
        sps: sps
    }

    localStorage.setItem("save",JSON.stringify(save));
}

window.onload = function load(){


    var savegame = JSON.parse(localStorage.getItem("save"));

    if (typeof savegame.sips !== "undefined") sips = savegame.sips;
    if (typeof savegame.straws !== "undefined") straws = savegame.straws;
    if (typeof savegame.cups !== "undefined") cups = savegame.cups;
    if (typeof savegame.sps !== "undefined") sps = savegame.sps;

    var strawCost = Math.floor(10 * Math.pow(1.1,straws));
    var cupCost = Math.floor(20 * Math.pow(1.2,cups));


    document.getElementById('straws').innerHTML = straws;
    document.getElementById('strawCost').innerHTML = strawCost;
    document.getElementById('cups').innerHTML = cups;
    document.getElementById('cupCost').innerHTML = cupCost;
    document.getElementById('sips').innerHTML = sips;
    document.getElementById('sps').innerHTML = sps;

}

function delete_save(){
    localStorage.removeItem("save")
}



window.setInterval(function(){

    sodaClick(sps);


    if(autosave == "on") {
        autosaveCounter+=1;
        if(autosaveCounter>=60)
        {
            save();
            autosaveCounter=1;
        }
    }


}, 1000);

window.setInterval(function(){


}, 2000);