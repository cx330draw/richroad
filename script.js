const CARD_TEXTS = [
  "【地基主顯靈】直接退3格",
  "【遭路霸驅離】直接退2格",
  "【交通管制】直接退1格",
  "【突發事件】回到上個抽卡處",
  "【突發事件】下局撤離保底減半",
  "【財富卡】保底+200w",
  "【保鑣開路】前進1-3格立即選擇",
];

const cardArea = document.getElementById("cardArea");
const shuffleBtn = document.getElementById("shuffleBtn");
let cards = [];
let openedCard = null;
let hasDrawnThisRound = false;
let canPickCard = false;

function applyCardTransform(card) {
  const rotate = Number(card.dataset.rotate || 0);
  const faceRotation = card.classList.contains("flipped") ? 180 : 0;
  card.style.transform = `rotateY(${faceRotation}deg) rotate(${rotate}deg)`;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createCard(text, idx) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.index = idx;
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", "點擊翻卡");

  const back = document.createElement("div");
  back.className = "card-face card-back";

  const front = document.createElement("div");
  front.className = "card-face card-front";
  front.textContent = text;

  card.append(back, front);

  card.addEventListener("click", () => {
    if (!canPickCard || hasDrawnThisRound) {
      return;
    }

    card.classList.add("flipped");
    openedCard = card;
    hasDrawnThisRound = true;
    applyCardTransform(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });

  return card;
}

function getScatterPositions(count) {
  const areaWidth = window.innerWidth;
  const areaHeight = window.innerHeight;

  const cardWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--card-width"));
  const cardHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--card-height"));

  const startY = Math.max(areaHeight * 0.62, 220);
  const sidePadding = 20;
  const minGap = 8;
  const availableWidth = Math.max(areaWidth - sidePadding * 2, cardWidth * count);
  const rawGap = (availableWidth - cardWidth * count) / Math.max(count - 1, 1);
  const gap = Math.max(minGap, rawGap);
  const totalWidth = cardWidth * count + gap * Math.max(count - 1, 0);
  const startX = Math.max(sidePadding, (areaWidth - totalWidth) / 2);

  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const left = Math.min(
      areaWidth - cardWidth - 16,
      Math.max(16, startX + i * (cardWidth + gap))
    );
    const top = Math.min(areaHeight - cardHeight - 16, startY);

    positions.push({
      left,
      top,
      rotate: 0,
    });
  }

  return positions;
}

function renderInitialCards() {
  cardArea.innerHTML = "";
  cards = shuffleArray(CARD_TEXTS).map((text, idx) => createCard(text, idx));
  cards.forEach((card) => {
    card.style.left = `${window.innerWidth / 2 - 80}px`;
    card.style.top = `${window.innerHeight * 0.62}px`;
    card.style.zIndex = "1";
    cardArea.append(card);
  });
}

function scatterCards({ animated = true } = {}) {
  const positions = getScatterPositions(cards.length);

  cards.forEach((card, i) => {
    const { left, top, rotate } = positions[i];
    const faceRotation = card.classList.contains("flipped") ? 180 : 0;

    if (animated) card.classList.add("shuffling");
    else card.classList.remove("shuffling");

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.zIndex = `${i + 10}`;
    card.dataset.rotate = String(rotate);
    card.style.transform = `rotateY(${faceRotation}deg) rotate(${rotate}deg)`;

    if (animated) {
      setTimeout(() => card.classList.remove("shuffling"), 450);
    }
  });
}

function fullShuffle() {
  canPickCard = false;
  hasDrawnThisRound = false;
  const centerX = window.innerWidth / 2 - 80;
  const centerY = window.innerHeight * 0.6;

  cards.forEach((card, idx) => {
    card.classList.remove("flipped");
    card.classList.add("shuffling");
    if (openedCard === card) openedCard = null;

    const swirlX = centerX + (Math.random() * 120 - 60);
    const swirlY = centerY + (Math.random() * 90 - 45);

    card.style.left = `${swirlX}px`;
    card.style.top = `${swirlY}px`;
    card.style.zIndex = `${100 + idx}`;
    card.dataset.rotate = String(Math.random() * 360);
    applyCardTransform(card);
  });

  setTimeout(() => {
    scatterCards({ animated: true });
    canPickCard = true;
  }, 420);
}

shuffleBtn.addEventListener("click", fullShuffle);
window.addEventListener("resize", () => scatterCards({ animated: false }));

renderInitialCards();
setTimeout(() => {
  scatterCards({ animated: true });
  canPickCard = true;
}, 200);
