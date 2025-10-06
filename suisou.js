const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerEl = document.getElementById('timer');
const lifeEl = document.getElementById('life');
const fishListEl = document.getElementById('fish-list');
const tankEl = document.getElementById('tank');
const resultMessageEl = document.getElementById('result-message');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const fishTypes = [
  { name: 'アジ', imgSrc: 'images/aji.png', size: 30, speed: 2 },
  { name: 'タイ', imgSrc: 'images/tai.png', size: 35, speed: 1.5 },
  { name: 'サバ', imgSrc: 'images/saba.png', size: 40, speed: 2.5 },
  { name: 'サンゴダイ', imgSrc: 'images/sangodai.png', size: 25, speed: 1.8 },
  { name: 'ヒラメ', imgSrc: 'images/hirame.png', size: 45, speed: 1.2 },
];

const jellyfishImg = new Image();
jellyfishImg.src = 'images/jellyfish.png';

let fishes = [];
let jellyfishes = [];

let caughtFish = new Set();
let caughtFishList = [];

let life = 3;
let gameRunning = true;
let startTime = performance.now();

const GAME_TIME = 20000; // 20秒

const fishImages = {};
function preloadFishImages(callback) {
  let loadedCount = 0;
  fishTypes.forEach(fish => {
    const img = new Image();
    img.src = fish.imgSrc;
    img.onload = () => {
      fishImages[fish.name] = img;
      loadedCount++;
      if (loadedCount === fishTypes.length) callback();
    };
    img.onerror = () => {
      console.warn(`画像の読み込み失敗: ${fish.imgSrc}`);
      loadedCount++;
      if (loadedCount === fishTypes.length) callback();
    };
  });
}

function spawnFish() {
  if (!gameRunning) return;
  if (fishes.length >= 5) return;

  const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
  const fromLeft = Math.random() < 0.5;
  const x = fromLeft ? -type.size : WIDTH + type.size;
  const y = Math.random() * (HEIGHT - type.size * 2) + type.size;
  const vx = fromLeft ? type.speed : -type.speed;
  const vy = (Math.random() - 0.5) * 1.5;
  const spawnTime = performance.now();

  fishes.push({ ...type, x, y, vx, vy, spawnTime, caught: false, escaping: false });
}

function spawnJellyfish() {
  if (!gameRunning) return;
  if (jellyfishes.length >= 2) return;

  const fromLeft = Math.random() < 0.5;
  const x = fromLeft ? -50 : WIDTH + 50;
  const y = Math.random() * (HEIGHT - 100) + 50;
  const vx = fromLeft ? 1 : -1;
  const vy = (Math.random() - 0.5) * 0.5;

  jellyfishes.push({ x, y, vx, vy, size: 60 });
}

function updateFishes(dt) {
  const now = performance.now();
  for (let i = fishes.length - 1; i >= 0; i--) {
    const f = fishes[i];
    if (f.caught) continue;

    if (!f.escaping && now - f.spawnTime > 3000) {
      f.escaping = true;
      f.vx = (f.x < WIDTH / 2) ? -f.speed * 3 : f.speed * 3;
      f.vy = 0;
    }

    f.x += f.vx;
    f.y += f.vy;

    if (f.y < f.size) {
      f.y = f.size;
      f.vy = -f.vy;
    } else if (f.y > HEIGHT - f.size) {
      f.y = HEIGHT - f.size;
      f.vy = -f.vy;
    }

    if (f.escaping && (f.x < -f.size || f.x > WIDTH + f.size)) {
      fishes.splice(i, 1);
    }
  }
}

function updateJellyfish(dt) {
  for (let i = jellyfishes.length - 1; i >= 0; i--) {
    const j = jellyfishes[i];

    j.x += j.vx;
    j.y += j.vy;

    if (j.y < j.size / 2) {
      j.y = j.size / 2;
      j.vy = -j.vy;
    } else if (j.y > HEIGHT - j.size / 2) {
      j.y = HEIGHT - j.size / 2;
      j.vy = -j.vy;
    }

    if (j.x < -j.size || j.x > WIDTH + j.size) {
      jellyfishes.splice(i, 1);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  for (const f of fishes) {
    const img = fishImages[f.name];
    if (img) {
      ctx.drawImage(img, f.x - f.size / 2, f.y - f.size / 2, f.size, f.size);
    } else {
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, f.size / 2, f.size / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const j of jellyfishes) {
    if (jellyfishImg.complete) {
      ctx.drawImage(jellyfishImg, j.x - j.size / 2, j.y - j.size / 2, j.size, j.size);
    } else {
      ctx.fillStyle = 'purple';
      ctx.beginPath();
      ctx.arc(j.x, j.y, j.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

canvas.addEventListener('click', e => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  for (let i = fishes.length - 1; i >= 0; i--) {
    const f = fishes[i];
    if (f.caught || f.escaping) continue;

    const dx = clickX - f.x;
    const dy = clickY - f.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < f.size / 2) {
      f.caught = true;
      addToFishBook(f.name);
      fishes.splice(i, 1);
      return;
    }
  }
});

let lastJellyDamageTime = 0;

function checkJellyfishDamage() {
  const now = performance.now();

  for (const j of jellyfishes) {
    const dx = j.x - WIDTH / 2;
    const dy = j.y - HEIGHT / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100 && now - lastJellyDamageTime > 1000) {
      life = Math.max(0, life - 1);
      lifeEl.textContent = life;
      startTime += 5000;
      lastJellyDamageTime = now;

      if (life <= 0) {
        gameRunning = false;
        showResult();
      }
    }
  }
}

function addToFishBook(name) {
  caughtFishList.push(name);
  const li = document.createElement('li');
  li.textContent = name;
  fishListEl.appendChild(li);

  addToTank(name);
}

function addToTank(name) {
  const fish = fishTypes.find(f => f.name === name);
  if (!fish) return;

  const fishDiv = document.createElement('div');
  fishDiv.classList.add('fish-tank-item');

  const img = fishImages[name];
  if (img) {
    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.style.width = '40px';
    imgEl.style.height = 'auto';
    imgEl.style.marginBottom = '4px';
    fishDiv.appendChild(imgEl);
  } else {
    fishDiv.textContent = name;
  }

  const nameSpan = document.createElement('span');
  nameSpan.textContent = name;
  fishDiv.appendChild(nameSpan);

  tankEl.appendChild(fishDiv);
}

function showResult() {
  const counts = {};
  for (const name of caughtFishList) {
    counts[name] = (counts[name] || 0) + 1;
  }

  if (caughtFishList.length === 0) {
    resultMessageEl.textContent = '残念！魚は一匹も釣れませんでした…。';
  } else {
    let msg = '釣れた魚の種類と数:<br>';
    for (const [name, count] of Object.entries(counts)) {
      msg += `・${name} × ${count}<br>`;
    }
    resultMessageEl.innerHTML = msg;
  }

  resultMessageEl.style.display = 'block';
}

function gameLoop() {
  if (!gameRunning) return;

  const now = performance.now();
  const elapsed = now - startTime;
  let remain = Math.max(0, GAME_TIME - elapsed);

  timerEl.textContent = (remain / 1000).toFixed(1);
  lifeEl.textContent = life;

  if (remain <= 0 || life <= 0) {
    gameRunning = false;
    showResult();
    return;
  }

  if (Math.random() < 0.02) spawnFish();
  if (Math.random() < 0.01) spawnJellyfish();

  const dt = now - lastTime;
  lastTime = now;

  updateFishes(dt);
  updateJellyfish(dt);
  checkJellyfishDamage();

  draw();

  requestAnimationFrame(gameLoop);
}

let lastTime = performance.now();

preloadFishImages(() => {
  gameLoop();
});
