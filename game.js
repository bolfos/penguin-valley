const farm = document.getElementById("farm");
const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const inventoryEl = document.getElementById("inventory");

const GRID = 6;
let FREE_TILES = JSON.parse(localStorage.getItem("freeTiles")) || [7,8,13,14];

const crops = {
  carrot:  { emoji:"🥕", time:60000, profit:5, cost:1, xp:5 },
  cabbage: { emoji:"🥬", time:180000, profit:15, cost:3, xp:15 },
  flower:  { emoji:"🌼", time:360000, profit:40, cost:5, xp:30 }
};

let selectedCrop = "carrot";
let money = Number(localStorage.getItem("money")) || 10;
let tiles = JSON.parse(localStorage.getItem("tiles")) || {};
let penguinPos = Number(localStorage.getItem("penguinPos")) || 7;
let xp = Number(localStorage.getItem("xp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let inventory = JSON.parse(localStorage.getItem("inventory")) || {};

function save() {
  localStorage.setItem("money", money);
  localStorage.setItem("tiles", JSON.stringify(tiles));
  localStorage.setItem("penguinPos", penguinPos);
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("freeTiles", JSON.stringify(FREE_TILES));
}

function updateUI() {
  moneyEl.textContent = "💰 " + money;
  levelEl.textContent = "⭐ Lv " + level;
}

function selectCrop(type){ selectedCrop = type; }

function drawFarm(){
  farm.innerHTML = "";
  for(let i=0;i<GRID*GRID;i++){
    const tile=document.createElement("div");
    tile.className="tile";

    if(!FREE_TILES.includes(i)){
      tile.classList.add("frozen");
      tile.textContent="❄️";
      tile.onclick=()=>breakIce(i);
      farm.appendChild(tile);
      continue;
    }

    tile.classList.add("free");
    const isPenguin=penguinPos===i;

    if(!tiles[i]){
      tile.textContent=isPenguin?"🐧":"";
      tile.onclick=()=>plant(i);
    } else {
      const crop=crops[tiles[i].type];
      let elapsed=Date.now()-tiles[i].plantedAt;
      let grow=isPenguin?crop.time*0.8:crop.time;
      let ready=elapsed>=grow;

      tile.textContent=crop.emoji+(ready?"":" ⏳")+(isPenguin?" 🐧":"");
      tile.onclick=ready?()=>harvest(i):()=>movePenguin(i);
    }

    farm.appendChild(tile);
  }
}

function plant(i){
  const c=crops[selectedCrop];
  if(money<c.cost||tiles[i])return;
  money-=c.cost;
  tiles[i]={type:selectedCrop,plantedAt:Date.now()};
  save(); updateUI(); drawFarm();
}

function harvest(i){
  const c=crops[tiles[i].type];
  money+=c.profit;
  inventory[c.emoji]=(inventory[c.emoji]||0)+1;
  xp+=c.xp;
  if(xp>=level*100){ xp=0; level++; }
  delete tiles[i];
  save(); updateUI(); drawFarm();
}

function movePenguin(i){
  penguinPos=i;
  save(); drawFarm();
}

function breakIce(i){
  if(money<20)return alert("Nu ai bani!");
  money-=20;
  FREE_TILES.push(i);
  save(); updateUI(); drawFarm();
}

/* MARKET */
function openMarket(){
  inventoryEl.innerHTML="";
  for(let k in inventory){
    const div=document.createElement("div");
    div.textContent=`${k} x${inventory[k]}`;
    const btn=document.createElement("button");
    btn.textContent="Vinde";
    btn.onclick=()=>{
      money+=5*inventory[k];
      inventory[k]=0;
      save(); updateUI(); openMarket();
    };
    div.appendChild(btn);
    inventoryEl.appendChild(div);
  }
  document.getElementById("market").classList.remove("hidden");
}

function closeMarket(){
  document.getElementById("market").classList.add("hidden");
}

setInterval(drawFarm,1000);
updateUI();
drawFarm();
/* ZONE SYSTEM */
let currentZone = localStorage.getItem("zone") || "farm";

function goTo(zone) {
  currentZone = zone;
  localStorage.setItem("zone", zone);

  document.getElementById("farmView").classList.add("hidden");
  document.getElementById("mapView").classList.add("hidden");
  document.getElementById("cityView").classList.add("hidden");

  if (zone === "farm") document.getElementById("farmView").classList.remove("hidden");
  if (zone === "map") document.getElementById("mapView").classList.remove("hidden");
  if (zone === "city") document.getElementById("cityView").classList.remove("hidden");

  document.getElementById("zone").textContent =
    "📍 " + (zone === "farm" ? "Ferma" : zone === "map" ? "Harta" : "Oraș");
}

/* QUEST SYSTEM */
const quests = [
  { id:1, text:"Recoltează 3 morcovi", reward:20, done:false },
  { id:2, text:"Câștigă 50 monede", reward:30, done:false }
];

function openQuests() {
  const ql = document.getElementById("questList");
  ql.innerHTML = "";

  quests.forEach(q=>{
    const div=document.createElement("div");
    div.textContent=q.text + (q.done?" ✔":"");
    const btn=document.createElement("button");
    btn.textContent="Finalizează";
    btn.disabled=q.done;
    btn.onclick=()=>{
      q.done=true;
      money+=q.reward;
      save(); updateUI(); openQuests();
    };
    div.appendChild(btn);
    ql.appendChild(div);
  });

  document.getElementById("quests").classList.remove("hidden");
}

function closeQuests(){
  document.getElementById("quests").classList.add("hidden");
}

/* INIT ZONE */
goTo(currentZone);

