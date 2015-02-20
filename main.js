var sips = 0;

function sodaClick(number){
    sips = sips + number;
    document.getElementById("sips").innerHTML = sips;
};

var straws = 0;
var cups = 0;

function buyStraw(){
    var strawCost = Math.floor(10 * Math.pow(1.1,straws));     //works out the cost of this straw
    if(sips >= strawCost){                                   //checks that the player can afford the straw
        straws = straws + 1;                                   //increases number of straws
        sips = sips - strawCost;                          //removes the sips spent
        document.getElementById('straws').innerHTML = straws;  //updates the number of straws for the user
        document.getElementById('sips').innerHTML = sips;  //updates the number of sips for the user
    };
    var nextStrawCost = Math.floor(10 * Math.pow(1.1,straws));       //works out the cost of the next straw
    document.getElementById('strawCost').innerHTML = nextStrawCost;  //updates the straw cost for the user
};

function buyCup(){
    var cupCost = Math.floor(20 * Math.pow(1.2,cups));     //works out the cost of this straw
    if(sips >= cupCost){                                   //checks that the player can afford the straw
        cups = cups + 1;                                   //increases number of straws
        sips = sips - cupCost;                          //removes the sips spent
        document.getElementById('cups').innerHTML = cups;  //updates the number of straws for the user
        document.getElementById('sips').innerHTML = sips;  //updates the number of sips for the user
    };
    var nextCupCost = Math.floor(20 * Math.pow(1.2,cups));       //works out the cost of the next straw
    document.getElementById('cupCost').innerHTML = nextCupCost;  //updates the straw cost for the user
};

function save(){

    var save = {
        sips: sips,
        straws: straws,
        cups: cups
    }

    localStorage.setItem("save",JSON.stringify(save));
}

window.onload = function load(){

    var savegame = JSON.parse(localStorage.getItem("save"));

    if (typeof savegame.sips !== "undefined") sips = savegame.sips;
    if (typeof savegame.straws !== "undefined") straws = savegame.straws;
    if (typeof savegame.cups !== "undefined") cups = savegame.cups;

    var strawCost = Math.floor(10 * Math.pow(1.1,straws));
    var cupCost = Math.floor(10 * Math.pow(1.2,cups));


    document.getElementById('straws').innerHTML = straws;
    document.getElementById('strawCost').innerHTML = strawCost;
    document.getElementById('cups').innerHTML = cups;
    document.getElementById('cupCost').innerHTML = cupCost;
    document.getElementById('sips').innerHTML = sips;

}

function delete_save(){
    localStorage.removeItem("save")
}



window.setInterval(function(){

    sodaClick(straws);
    sodaClick(cups*2);

}, 1000);