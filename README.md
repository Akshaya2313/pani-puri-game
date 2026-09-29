const INGREDIENTS = {
  shell: [
    { name: 'Crispy', emoji: '🥟', color: '#f7c948' },
    { name: 'Soft', emoji: '🫓', color: '#f7a14d' },
    { name: 'Mini', emoji: '🥮', color: '#ffd6a5' }
  ],
  filling: [
    { name: 'Potato', emoji: '🥔', color: '#c7d45d' },
    { name: 'Ragda', emoji: '🫘', color: '#9adf7c' },
    { name: 'Chickpea', emoji: '🫘', color: '#8cbf4b' }
  ],
  water: [
    { name: 'Mint', emoji: '🌿', color: '#68d87e' },
    { name: 'Tamarind', emoji: '🍊', color: '#ff7b54' },
    { name: 'Spicy', emoji: '🌶️', color: '#ef5d5d' }
  ],
  topping: [
    { name: 'Sev', emoji: '✨', color: '#ffd166' },
    { name: 'Onion', emoji: '🧅', color: '#d7d2ff' },
    { name: 'Coriander', emoji: '🌱', color: '#7ad49f' }
  ]
};

const GROUP_ORDER = ['shell', 'filling', 'water', 'topping'];
const GROUP_LABEL = {
  shell: 'Shell',
  filling: 'Filling',
  water: 'Water',
  topping: 'Topping'
};

const state = {
  score: 0,
  combo: 1,
  lives: 3,
  timeLeft: 60,
  timerId: null,
  customer: null,
  selected: {},
  gameOver: false,
  started: false,
  soundOn: true
};

const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');
const customerCard = document.getElementById('customerCard');
const plate = document.getElementById('plate');
const ingredientsContainer = document.getElementById('ingredients');
const serveBtn = document.getElementById('serveBtn');
const clearBtn = document.getElementById('clearBtn');
const restartBtn = document.getElementById('restartBtn');
const soundBtn = document.getElementById('soundBtn');
const toast = document.getElementById('toast');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreEl = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

let audioCtx = null;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
}

function playTone(frequency, duration, type = 'sine', gainLevel = 0.04) {
  if (!state.soundOn) return;

  ensureAudioContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = gainLevel;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);

  gainNode.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
}

function playSfx(type) {
  if (!state.soundOn) return;

  switch (type) {
    case 'click':
      playTone(440, 0.08, 'triangle', 0.025);
      break;
    case 'success':
      playTone(660, 0.12, 'triangle', 0.04);
      setTimeout(() => playTone(880, 0.16, 'triangle', 0.04), 110);
      break;
    case 'fail':
      playTone(200, 0.15, 'sawtooth', 0.04);
      setTimeout(() => playTone(140, 0.2, 'sawtooth', 0.04), 120);
      break;
    case 'gameover':
      playTone(220, 0.18, 'square', 0.05);
      setTimeout(() => playTone(180, 0.22, 'square', 0.05), 160);
      setTimeout(() => playTone(120, 0.28, 'square', 0.05), 350);
      break;
    default:
      playTone(520, 0.08, 'sine', 0.03);
  }
}

function buildIngredientGroups() {
  ingredientsContainer.innerHTML = '';

  GROUP_ORDER.forEach((group) => {
    const section = document.createElement('div');
    section.className = 'group-box';

    const title = document.createElement('h3');
    title.textContent = GROUP_LABEL[group];

    const grid = document.createElement('div');
    grid.className = 'group-grid';

    INGREDIENTS[group].forEach((ingredient) => {
      const btn = document.createElement('button');
      btn.className = 'ingredient-btn';
      btn.dataset.group = group;
      btn.dataset.name = ingredient.name;
      btn.innerHTML = `<span class="emoji">${ingredient.emoji}</span><span>${ingredient.name}</span>`;

      btn.addEventListener('click', () => {
        if (!state.started || state.gameOver) return;
        state.selected[btn.dataset.group] = btn.dataset.name;
        playSfx('click');
        updateIngredientSelection();
        renderPlate();
      });

      grid.appendChild(btn);
    });

    section.appendChild(title);
    section.appendChild(grid);
    ingredientsContainer.appendChild(section);
  });

  updateIngredientSelection();
}

function updateIngredientSelection() {
  document.querySelectorAll('.ingredient-btn').forEach((btn) => {
    const isSelected = state.selected[btn.dataset.group] === btn.dataset.name;
    btn.classList.toggle('selected', isSelected);
  });
}

function renderPlate() {
  const entries = GROUP_ORDER.filter((key) => state.selected[key]).map((key) => ({
    name: state.selected[key],
    emoji: INGREDIENTS[key].find((item) => item.name === state.selected[key])?.emoji || '✨'
  }));

  if (!entries.length) {
    plate.innerHTML = '<div class="plate-empty">No ingredients selected yet.</div>';
    return;
  }

  const iconGrid = document.createElement('div');
  iconGrid.className = 'plate-items';

  entries.forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'plate-item';
    item.title = entry.name;
    item.textContent = entry.emoji;
    iconGrid.appendChild(item);
  });

  plate.innerHTML = '';
  plate.appendChild(iconGrid);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('visible');
  }, 1200);
}

function makeCustomerOrder() {
  const order = {};
  GROUP_ORDER.forEach((group) => {
    order[group] = randomFrom(INGREDIENTS[group]).name;
  });
  return order;
}

function renderCustomerOrder() {
  if (!state.customer) {
    customerCard.innerHTML = `
      <div class="avatar">😄</div>
      <h3>Ready to start?</h3>
      <div class="order-list placeholder-list">
        <span class="placeholder-order">Press start to begin</span>
      </div>
    `;
    return;
  }

  const orderList = document.createElement('div');
  orderList.className = 'order-list';

  GROUP_ORDER.forEach((group) => {
    const ingredient = INGREDIENTS[group].find((item) => item.name === state.customer[group]);
    const chip = document.createElement('div');
    chip.className = 'order-chip';
    chip.innerHTML = `<span class="dot" style="background:${ingredient.color};"></span>${ingredient.name}`;
    orderList.appendChild(chip);
  });

  customerCard.innerHTML = `
    <div class="avatar">😄</div>
    <h3>Customer ${Math.max(1, state.score > 0 ? Math.floor(state.score / 10) + 1 : 1)}</h3>
  `;
  customerCard.appendChild(orderList);
}

function resetPlate() {
  state.selected = {};
  updateIngredientSelection();
  renderPlate();
}

function updateHud() {
  scoreEl.textContent = state.score;
  comboEl.textContent = `x${state.combo}`;
  timerEl.textContent = Math.max(0, state.timeLeft);
  livesEl.textContent = state.lives;
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    if (!state.started || state.gameOver) return;

    state.timeLeft -= 1;
    updateHud();

    if (state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function servePuri() {
  if (!state.started || state.gameOver) return;

  const required = state.customer;
  const missing = GROUP_ORDER.some((group) => !state.selected[group]);

  if (missing) {
    showToast('Choose all ingredients first!');
    playSfx('fail');
    return;
  }

  const isCorrect = GROUP_ORDER.every((group) => state.selected[group] === required[group]);

  if (isCorrect) {
    const bonus = Math.max(5, state.timeLeft);
    state.score += 10 + Math.floor(bonus / 2);
    state.combo += 1;
    state.timeLeft = Math.min(60, state.timeLeft + 2);
    showToast('Perfect serve!');
    playSfx('success');
  } else {
    state.lives -= 1;
    state.combo = 1;
    state.timeLeft = Math.max(0, state.timeLeft - 6);
    showToast('Wrong order!');
    playSfx('fail');
  }

  updateHud();
  resetPlate();

  if (state.lives <= 0) {
    endGame();
    return;
  }

  state.customer = makeCustomerOrder();
  renderCustomerOrder();
}

function endGame() {
  state.gameOver = true;
  state.started = false;
  clearInterval(state.timerId);
  finalScoreEl.textContent = state.score;
  gameOverOverlay.classList.remove('hidden');
  playSfx('gameover');
  showToast('Game over!');
}

function beginGame() {
  state.started = true;
  state.gameOver = false;
  state.score = 0;
  state.combo = 1;
  state.lives = 3;
  state.timeLeft = 60;
  state.selected = {};
  state.customer = makeCustomerOrder();
  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  renderCustomerOrder();
  renderPlate();
  updateHud();
  startTimer();
}

function restartGame() {
  clearInterval(state.timerId);
  state.started = false;
  state.gameOver = false;
  state.score = 0;
  state.combo = 1;
  state.lives = 3;
  state.timeLeft = 60;
  state.selected = {};
  state.customer = null;
  startOverlay.classList.remove('hidden');
  gameOverOverlay.classList.add('hidden');
  renderCustomerOrder();
  renderPlate();
  updateHud();
  playSfx('click');
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  soundBtn.textContent = state.soundOn ? '🔊 Sound On' : '🔇 Sound Off';
  playSfx('click');
}

soundBtn.addEventListener('click', toggleSound);
serveBtn.addEventListener('click', servePuri);
clearBtn.addEventListener('click', () => {
  if (!state.started || state.gameOver) return;
  resetPlate();
  playSfx('click');
});
restartBtn.addEventListener('click', restartGame);
startBtn.addEventListener('click', beginGame);
playAgainBtn.addEventListener('click', beginGame);

buildIngredientGroups();
renderCustomerOrder();
renderPlate();
updateHud();
