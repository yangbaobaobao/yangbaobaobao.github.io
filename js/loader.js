const app = document.getElementById("app");
const pageStyle = document.getElementById("pageStyle");

const loadedScripts = new Set();

function loadScriptOnce(src) {
  console.log("loading script:", src);
  return new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };

    script.onerror = reject;

    document.body.appendChild(script);
  });
}

async function loadPage(file, css) {
  pageStyle.href = css;

  const res = await fetch(file);
  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, "text/html");
  app.innerHTML = doc.body.innerHTML;
}

async function startGame() {
    if (typeof stopLose === "function") {
        stopLose();
    }

    await loadPage("game.html", "style.css");

    await loadScriptOnce("js/effects.js");
    await loadScriptOnce("js/enemy.js");
    await loadScriptOnce("js/player.js");
    await loadScriptOnce("js/game.js");

    startEverything();
    resetGame();
}

async function gameOver() {
  await loadPage("game over.html", "style.css");

  await loadScriptOnce("js/lose.js");

  startLose();
}

async function goIntro() {
  await loadPage("intro.html", "intro.css");

  await loadScriptOnce("js/intro.js");

  if (typeof startEverything === "function") {
    startEverything();
  }
}

goIntro();