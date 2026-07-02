var canvasIntro;
var ctxIntro;
var credits = Number(localStorage.getItem("credits")) || 0;
const ramAmountIntro = document.getElementById("ramAmount");
ramAmountIntro.textContent = credits;

function loadIntro() {
  canvasIntro = document.getElementById("introCanvas");
  ctxIntro = canvasIntro.getContext("2d");
  canvasIntro.width = innerWidth;
  canvasIntro.height = innerHeight;
}

let introDifficulty = "normal";




function drawGridIntro(size, color, width) {
  ctxIntro.strokeStyle = color;
  ctxIntro.lineWidth = width;

  for (let x = 0; x <= canvasIntro.width; x += size) {
    ctxIntro.beginPath();
    ctxIntro.moveTo(x, 0);
    ctxIntro.lineTo(x, canvasIntro.height);
    ctxIntro.stroke();
  }

  for (let y = 0; y <= canvasIntro.height; y += size) {
    ctxIntro.beginPath();
    ctxIntro.moveTo(0, y);
    ctxIntro.lineTo(canvasIntro.width, y);
    ctxIntro.stroke();
  }
}

function drawIntroBackground() {
  if (!canvasIntro) return;
  ctxIntro.fillStyle = "#020b14";
  ctxIntro.fillRect(0, 0, canvasIntro.width, canvasIntro.height);

  drawGridIntro(25, "rgba(0,190,255,0.12)", 1);
  drawGridIntro(150, "rgba(0,220,255,0.45)", 2);
  drawGridIntro(450, "rgba(0,220,255,0.25)", 2);

  ctxIntro.strokeStyle = "rgba(0,255,255,0.04)";
  ctxIntro.lineWidth = 1;

  for (let y = 0; y < canvasIntro.height; y += 4) {
    ctxIntro.beginPath();
    ctxIntro.moveTo(0, y);
    ctxIntro.lineTo(canvasIntro.width, y);
    ctxIntro.stroke();
  }

  if (Math.random() < 0.2) {
    ctxIntro.fillStyle = "rgba(0,255,255,0.08)";
    ctxIntro.fillRect(0, Math.random() * canvasIntro.height, canvasIntro.width, 5);
  }
}

let introRunning = false;

function introLoop() {
  if (!introRunning) return;

  drawIntroBackground();
  requestAnimationFrame(introLoop);
}

function startIntroLoop() {
  introRunning = true;
  introLoop();
}

function stopIntroLoop() {
  introRunning = false;
}

function setDifficulty(mode) {
  introDifficulty = mode;
  localStorage.setItem("difficulty", introDifficulty);
}

function toggleOptions() {
  const panel = document.getElementById("optionsPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}

const difficulties = [
  {
    name: "NOOB",
    value: "easy"
  },
  {
    name: "PRO",
    value: "normal"
  },
  {
    name: "HACKER",
    value: "hard"
  },
  {
    name: "SINGULARITY",
    value: "impossible"
  }
];

let difficultyIndex = 0;

const savedDifficulty = localStorage.getItem("difficulty");

if (savedDifficulty) {
  const savedIndex = difficulties.findIndex(d => d.value === savedDifficulty);

  if (savedIndex !== -1) {
    difficultyIndex = savedIndex;
  }
}

function updateDifficultyButton() {
  const btn = document.getElementById("difficultyButton");
  btn.textContent = difficulties[difficultyIndex].name;

  switch (difficultyIndex) {
    case 0:
      btn.style.color = "#00ff88";
      break;
    case 1:
      btn.style.color = "#00ffff";
      break;
    case 2:
      btn.style.color = "#ff8800";
      break;
    case 3:
      btn.style.color = "#ff0000";
      break;
  }
}

function cycleDifficulty() {
  difficultyIndex = (difficultyIndex + 1) % difficulties.length;

  localStorage.setItem("difficulty", difficulties[difficultyIndex].value);

  updateDifficultyButton();
}

function startTutorial() {
  localStorage.setItem("difficulty", "tutorial");
  startGame();
}

updateDifficultyButton();

const keybindsIntro = JSON.parse(localStorage.getItem("keybinds")) || {
  heal: "h",
  dash: "shift",
  time: "p",
  up: "w",
  down: "s",
  left: "a",
  right: "d",
  recall: " "
};

let hoveredKeybind = null;

function displayKey(key) {
  if (key === " ") return "SPACE";
  return key.toUpperCase();
}

function updateKeybindButtons() {
  document.querySelectorAll(".keybind-button").forEach(button => {
    const action = button.dataset.action;
    button.textContent = `${action.toUpperCase()}: ${displayKey(keybindsIntro[action])}`;
  });
}

document.querySelectorAll(".keybind-button").forEach(button => {
  button.addEventListener("mouseenter", () => {
    hoveredKeybind = button.dataset.action;
    button.textContent = `${hoveredKeybind.toUpperCase()}: PRESS KEY`;
  });

  button.addEventListener("mouseleave", () => {
    hoveredKeybind = null;
    updateKeybindButtons();
  });
});

addEventListener("keydown", e => {
  if (!hoveredKeybind) return;

  e.preventDefault();

  let key = e.key.toLowerCase();

  if (e.code === "Space") {
    key = " ";
  }

  keybindsIntro[hoveredKeybind] = key;
  localStorage.setItem("keybinds", JSON.stringify(keybindsIntro));

  updateKeybindButtons();
});

updateKeybindButtons();
localStorage.setItem("difficulty", difficulties[difficultyIndex].value);

startIntroLoop();