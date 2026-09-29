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
const GRP_LABEL = {
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
  currentCustomer: null,
  selected: {},
  gameOver: false
};

const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');
const customerCard = document.getElementById('customerCard');
const orderList = document.getElementById('orderList');
const plate = document.getElementById('plate');
const ingredientsContainer = document.getElementById('ingredients');
const serveBtn = document.getElementById('serveBtn');
const clearBtn = document.getElementById('clearBtn');
const restartBtn = document.getElementById('restartBtn');
const toast = document.getElementById('toast');

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildIngredientGroups() {
  ingredientsContainer.innerHTML = '';

  GROUP_ORDER.forEach((group) => {
    const section = document.createElement('div');
    section.className = 'group-box';

    const title = document.createElement('h3');
    title.textContent = GRP_LABEL[group];

    const grid = document.createElement('div');
    grid.className = 'group-grid';

    INGREDIENTS[group].forEach((ingredient) => {
      const btn = document.createElement('button');
      btn.className = 'ingredient-btn';
      btn.dataset.group = group;
      btn.dataset.name = ingredient.name;
      btn.innerHTML = `<span class="emoji">${ingredient.emoji}</span><span>${ingredient.name}</span>`;

      btn.addEventListener('click', () => {
        if (state.gameOver) return;
        state.selected[group] = ingredient.name;
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

  const plateItems = document.createElement('div');
  plateItems.className = 'plate-items';

  entries.forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'plate-item';
    item.title = entry.name;
    item.textContent = entry.emoji;
    plateItems.appendChild(item);
  });

  plate.innerHTML = '';
  plate.appendChild(plateItems);
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
  const order = state.currentCustomer;
  orderList.innerHTML = '';

  GROUP_ORDER.forEach((group) => {
    const ingredient = INGREDIENTS[group].find((item) => item.name === order[group]);
    const chip = document.createElement('div');
    chip.className = 'order-chip';
    chip.innerHTML = `<span class="dot" style="background:${ingredient.color};"></span>${ingredient.name}`;
    orderList.appendChild(chip);
  });

  customerCard.innerHTML = `
    <div class="avatar">😄</div>
    <h3>Customer ${state.score + 1}</h3>
    <div id="orderList" class="order-list"></div>
  `;

  const orderListNode = customerCard.querySelector('#orderList');
  GROUP_ORDER.forEach((group) => {
    const ingredient = INGREDIENTS[group].find((item) => item.name === order[group]);
    const chip = document.createElement('div');
    chip.className = 'order-chip';
    chip.innerHTML = `<span class="dot" style="background:${ingredient.color};"></span>${ingredient.name}`;
    orderListNode.appendChild(chip);
  });
}

function servePuri() {
  if (state.gameOver) return;

  const required = state.currentCustomer;
  const hasEntry = GROUP_ORDER.some((group) => !state.selected[group]);
  if (hasEntry) {
    showToast('Choose all ingredients first!');
    return;
  }

  const isCorrect = GROUP_ORDER.every((group) => state.selected[group] === required[group]);

  if (isCorrect) {
    const bonus = Math.max(5, state.timeLeft);
    state.score += 10 + bonus / 2;
    state.combo += 1;
    state.timeLeft = Math.min(60, state.timeLeft + 2);
    showToast('Perfect serve!');
  } else {
    state.lives -= 1;
    state.combo = 1;
    state.timeLeft = Math.max(0, state.timeLeft - 6);
    showToast('Oops! Wrong order.');
  }

  updateHud();
  resetPlate();

  if (state.lives <= 0) {
    endGame();
    return;
  }

  state.currentCustomer = makeCustomerOrder();
  renderCustomerOrder();
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
    if (state.gameOver) return;

    state.timeLeft -= 1;
    updateHud();

    if (state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  state.gameOver = true;
  clearInterval(state.timerId);
  serveBtn.disabled = true;
  clearBtn.disabled = true;
  showToast('Game over! Final score: ' + state.score);
  customerCard.innerHTML = `
    <div class="avatar">🏁</div>
    <h3>Game Over</h3>
    <p style="margin: 14px 0 0; font-size: 1.05rem;">Your final score is <strong>${state.score}</strong> points.</p>
  `;
}

function restartGame() {
  state.score = 0;
  state.combo = 1;
  state.lives = 3;
  state.timeLeft = 60;
  state.gameOver = false;
  state.selected = {};
  state.currentCustomer = makeCustomerOrder();

  serveBtn.disabled = false;
  clearBtn.disabled = false;
  renderCustomerOrder();
  resetPlate();
  updateHud();
  startTimer();
}

serveBtn.addEventListener('click', servePuri);
clearBtn.addEventListener('click', resetPlate);
restartBtn.addEventListener('click', restartGame);

buildIngredientGroups();
restartGame();
