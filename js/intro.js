const canvas = document.getElementById("introCanvas");
const ctx = canvas.getContext("2d");

let difficulty = "normal";


canvas.width = innerWidth;
canvas.height = innerHeight;


function drawGrid(size, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  for (let x = 0; x <= canvas.width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawIntroBackground() {
  ctx.fillStyle = "#020b14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid(25, "rgba(0,190,255,0.12)", 1);
  drawGrid(150, "rgba(0,220,255,0.45)", 2);
  drawGrid(450, "rgba(0,220,255,0.25)", 2);

  ctx.strokeStyle = "rgba(0,255,255,0.04)";
  ctx.lineWidth = 1;

  for (let y = 0; y < canvas.height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  if (Math.random() < 0.2) {
    ctx.fillStyle = "rgba(0,255,255,0.08)";
    ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 5);
  }
}

function loop() {
  drawIntroBackground();
  requestAnimationFrame(loop);
}

function setDifficulty(mode) {
  difficulty = mode;
  localStorage.setItem("difficulty", difficulty);
  console.log("Difficulty:", difficulty);
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

function cycleDifficulty() {
  difficultyIndex++;

  if (difficultyIndex >= difficulties.length) {
    difficultyIndex = 0;
  }

  document.getElementById("difficultyButton").textContent =
    difficulties[difficultyIndex].name;
}

function startGame() {
  localStorage.setItem(
    "difficulty",
    difficulties[difficultyIndex].value
  );

  window.location.href = "game.html";
}
function cycleDifficulty() {
  difficultyIndex =
    (difficultyIndex + 1) % difficulties.length;

  const btn = document.getElementById("difficultyButton");

  btn.textContent =
    difficulties[difficultyIndex].name;

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

const keybinds = JSON.parse(localStorage.getItem("keybinds")) || {
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
    button.textContent = `${action.toUpperCase()}: ${displayKey(keybinds[action])}`;
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

  keybinds[hoveredKeybind] = key;
  localStorage.setItem("keybinds", JSON.stringify(keybinds));

  updateKeybindButtons();
});

updateKeybindButtons();

loop();