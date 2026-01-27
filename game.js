const farm = document.getElementById("farm");
const moneyEl = document.getElementById("money");

const GRID_SIZE = 6;

// Culturile disponibile
const crops = {
  carrot: { emoji: "🥕", time: 60_000, profit: 5, cost: 1 },
  cabbage: { emoji: "🥬", time: 180_000, profit: 15, cost: 3 },
  flower: { emoji: "🌼", time: 360_000, profit: 40, cost: 5 }
};

// Starea jocului
let selectedCrop = "carrot";
let money = 10;
let tiles = JSON.parse(localStorage.getItem("tiles")) || {};
let savedMoney = localStorage.getItem("money");
let penguinPos = JSON.parse(localStorage.getItem("penguinPos")) || 7;
let FREE_TILES = JSON.parse(localStorage.getItem("freeTiles")) || [7, 8, 13, 14];

if (savedMoney !== null) money = parseInt(savedMoney);
moneyEl.textContent = "💰 " + money;

// Selectarea culturii
function selectCrop(type) {
  selectedCrop = type;
}

// Salvare locală
function saveGame() {
  localStorage.setItem("tiles", JSON.stringify(tiles));
  localStorage.setItem("money", money);
  localStorage.setItem("penguinPos", penguinPos);
  localStorage.setItem("freeTiles", JSON.stringify(FREE_TILES));
}

// Formatare timp mm:ss
function formatTime(ms) {
  let totalSec = Math.ceil(ms / 1000);
  let min = Math.floor(totalSec / 60);
  let sec = totalSec % 60;
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

// Desenare farm
function drawFarm() {
  farm.innerHTML = "";

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");

    if (FREE_TILES.includes(i)) {
      tile.classList.add("free");

      let plant = tiles[i];
      let isPenguin = penguinPos === i;
      let penguinEmoji = isPenguin ? "🐧" : "";

      if (plant) {
        // Tile cu plantă
        const crop = crops[plant.type];
        let elapsed = Date.now() - plant.plantedAt;
        let effectiveTime = crop.time;
        if (isPenguin) effectiveTime *= 0.8; // bonus pinguin
        let remaining = Math.max(0, effectiveTime - elapsed);

        tile.innerHTML = `${crop.emoji} ${remaining > 0 ? formatTime(remaining) : ""} ${penguinEmoji}`;

        if (remaining <= 0) {
          tile.onclick = () => harvest(i);
        } else {
          tile.onclick = () => movePenguin(i);
        }

      } else {
        // Tile liber fără plantă
        tile.textContent = penguinEmoji;
        tile.onclick = () => plant(i); // Plantare funcționează întotdeauna
      }

    } else {
      // Tile înghețat
      tile.classList.add("frozen");
    }

    farm.appendChild(tile);
  }
}

// Plantare cultură
function plant(index) {
  const crop = crops[selectedCrop];
  if (money < crop.cost) return;

  money -= crop.cost;
  tiles[index] = { type: selectedCrop, plantedAt: Date.now() };

  moneyEl.textContent = "💰 " + money;
  saveGame();
  drawFarm();
}

// Recoltare
function harvest(index) {
  const crop = crops[tiles[index].type];
  money += crop.profit;
  delete tiles[index];

  moneyEl.textContent = "💰 " + money;
  saveGame();
  drawFarm();
}

// Mutare pinguin
function movePenguin(index) {
  if (!FREE_TILES.includes(index)) return;
  penguinPos = index;
  saveGame();
  drawFarm();
}

// Redraw timer la fiecare secundă
setInterval(drawFarm, 1000);

// Desenare inițială
drawFarm();
