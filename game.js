const farm = document.getElementById("farm");
const moneyEl = document.getElementById("money");

const GRID = 6;
const FREE_TILES = [7, 8, 13, 14];

const crops = {
  carrot:  { emoji: "🥕", time: 60000, profit: 5, cost: 1 },
  cabbage: { emoji: "🥬", time: 180000, profit: 15, cost: 3 },
  flower:  { emoji: "🌼", time: 360000, profit: 40, cost: 5 }
};

let selectedCrop = "carrot";
let money = Number(localStorage.getItem("money")) || 10;
let tiles = JSON.parse(localStorage.getItem("tiles")) || {};
let penguinPos = Number(localStorage.getItem("penguinPos")) || 7;

moneyEl.textContent = "💰 " + money;

function save() {
  localStorage.setItem("money", money);
  localStorage.setItem("tiles", JSON.stringify(tiles));
  localStorage.setItem("penguinPos", penguinPos);
}

function selectCrop(type) {
  selectedCrop = type;
}

function drawFarm() {
  farm.innerHTML = "";

  for (let i = 0; i < GRID * GRID; i++) {
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
        (remaining > 0 ? " ⏳" : "") +
        (isPenguin ? " 🐧" : "");

      tile.onclick =
        remaining <= 0 ? () => harvest(i) : () => movePenguin(i);
    }

    farm.appendChild(tile);
  }
}

function plant(i) {
  const crop = crops[selectedCrop];
  if (tiles[i] || money < crop.cost) return;

  money -= crop.cost;
  tiles[i] = { type: selectedCrop, plantedAt: Date.now() };
  moneyEl.textContent = "💰 " + money;

  save();
  drawFarm();
}

function harvest(i) {
  const crop = crops[tiles[i].type];
  money += crop.profit;
  delete tiles[i];

  moneyEl.textContent = "💰 " + money;
  save();
  drawFarm();
}

function movePenguin(i) {
  penguinPos = i;
  save();
  drawFarm();
}

/* MARKET */
function openMarket() {
  document.getElementById("market").classList.remove("hidden");
}

function closeMarket() {
  document.getElementById("market").classList.add("hidden");
}

setInterval(drawFarm, 1000);
drawFarm();
