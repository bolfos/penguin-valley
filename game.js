const farm = document.getElementById("farm");
const moneyEl = document.getElementById("money");

const GRID_SIZE = 6;

const crops = {
  carrot:  { emoji: "🥕", time: 60000,  profit: 5,  cost: 1 },
  cabbage: { emoji: "🥬", time: 180000, profit: 15, cost: 3 },
  flower:  { emoji: "🌼", time: 360000, profit: 40, cost: 5 }
};

let selectedCrop = "carrot";
let money = Number(localStorage.getItem("money")) || 10;
let tiles = JSON.parse(localStorage.getItem("tiles")) || {};
let penguinPos = Number(localStorage.getItem("penguinPos")) || 7;

const FREE_TILES = [7, 8, 13, 14];

moneyEl.textContent = "💰 " + money;

function selectCrop(type) {
  selectedCrop = type;
}

function saveGame() {
  localStorage.setItem("tiles", JSON.stringify(tiles));
  localStorage.setItem("money", money);
  localStorage.setItem("penguinPos", penguinPos);
}

function formatTime(ms) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function drawFarm() {
  farm.innerHTML = "";

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";

    if (!FREE_TILES.includes(i)) {
      tile.classList.add("frozen");
      farm.appendChild(tile);
      continue;
    }

    tile.classList.add("free");
    const isPenguin = penguinPos === i;

    if (!tiles[i]) {
      tile.textContent = isPenguin ? "🐧" : "";
      tile.onclick = () => plant(i);
    } else {
      const crop = crops[tiles[i].type];
      let elapsed = Date.now() - tiles[i].plantedAt;
      let growTime = isPenguin ? crop.time * 0.8 : crop.time;
      let remaining = growTime - elapsed;

      tile.textContent =
        crop.emoji +
        (remaining > 0 ? " " + formatTime(remaining) : "") +
        (isPenguin ? " 🐧" : "");

      tile.onclick = remaining <= 0
        ? () => harvest(i)
        : () => movePenguin(i);
    }

    farm.appendChild(tile);
  }
}

function plant(index) {
  const crop = crops[selectedCrop];
  if (tiles[index] || money < crop.cost) return;

  money -= crop.cost;
  tiles[index] = { type: selectedCrop, plantedAt: Date.now() };

  moneyEl.textContent = "💰 " + money;
  saveGame();
  drawFarm();
}

function harvest(index) {
  const crop = crops[tiles[index].type];
  money += crop.profit;
  delete tiles[index];

  moneyEl.textContent = "💰 " + money;
  saveGame();
  drawFarm();
}

function movePenguin(index) {
  penguinPos = index;
  saveGame();
  drawFarm();
}

setInterval(drawFarm, 1000);
drawFarm();
