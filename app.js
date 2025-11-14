/* app.js - 三轮选择，每轮三张；A 模式：显示牌名（无图片） */

// 78 张牌名称（English common names）
const tarotNames = [
"The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit",
"Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun",
"Judgement","The World",
"Ace of Wands","Two of Wands","Three of Wands","Four of Wands","Five of Wands","Six of Wands","Seven of Wands","Eight of Wands","Nine of Wands","Ten of Wands",
"Page of Wands","Knight of Wands","Queen of Wands","King of Wands",
"Ace of Cups","Two of Cups","Three of Cups","Four of Cups","Five of Cups","Six of Cups","Seven of Cups","Eight of Cups","Nine of Cups","Ten of Cups",
"Page of Cups","Knight of Cups","Queen of Cups","King of Cups",
"Ace of Swords","Two of Swords","Three of Swords","Four of Swords","Five of Swords","Six of Swords","Seven of Swords","Eight of Swords","Nine of Swords","Ten of Swords",
"Page of Swords","Knight of Swords","Queen of Swords","King of Swords",
"Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles","Five of Pentacles","Six of Pentacles","Seven of Pentacles","Eight of Pentacles","Nine of Pentacles","Ten of Pentacles",
"Page of Pentacles","Knight of Pentacles","Queen of Pentacles","King of Pentacles"
];

const totalCards = tarotNames.length; // 78

let currentRound = 0;      // 已选次数（0..2）
let selectedIndexArray = []; // 存 3 个被选中的索引值（对应 tarotNames）
const tarotContainer = document.getElementById('tarot-container');
const readingResult = document.getElementById('reading-result');
const readingText = document.getElementById('reading-text');

function selectTheme(theme) {
  document.getElementById('home').style.display = 'none';
  document.getElementById('reading-room').style.display = 'block';
  currentRound = 0;
  selectedIndexArray = [];
  readingResult.style.display = 'none';
  renderRound();
}

function backToHome() {
  document.getElementById('reading-room').style.display = 'none';
  document.getElementById('home').style.display = 'flex';
  tarotContainer.innerHTML = '';
  readingResult.style.display = 'none';
  currentRound = 0;
  selectedIndexArray = [];
}

// 生成一组 3 张随机且不重复的牌（每轮从 78 中选）
function getThreeUniqueIndexes() {
  const set = new Set();
  while (set.size < 3) {
    set.add(Math.floor(Math.random() * totalCards));
  }
  return Array.from(set);
}

// 渲染当前回合的三张牌（只显示牌名）
function renderRound() {
  tarotContainer.innerHTML = '';
  const three = getThreeUniqueIndexes();
  three.forEach(idx => {
    const card = document.createElement('div');
    card.className = 'tarot-card';
    card.dataset.idx = idx;

    const inner = document.createElement('div');
    inner.className = 'tarot-card-inner';

    const front = document.createElement('div');
    front.className = 'tarot-card-front';
    const nameEl = document.createElement('div');
    nameEl.className = 'card-name';
    nameEl.innerText = tarotNames[idx];

    const subtitle = document.createElement('div');
    subtitle.className = 'card-sub';
    subtitle.innerText = `牌号 ${idx + 1}`;

    front.appendChild(nameEl);
    front.appendChild(subtitle);

    const back = document.createElement('div');
    back.className = 'tarot-card-back';
    back.innerText = '?';

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // 点击：翻牌并记录选中（只允许本回合一次）
    card.addEventListener('click', () => {
      chooseCard(parseInt(card.dataset.idx, 10), card);
    });

    tarotContainer.appendChild(card);
  });
}

// 处理选择
function chooseCard(idx, cardEl) {
  // 防止重复选择同一个回合（或重复选同个牌）
  if (selectedIndexArray.length > currentRound) return; // 已选择本轮
  // 翻牌动画（视觉）
  cardEl.classList.add('flipped');

  // 记录
  selectedIndexArray.push(idx);
  currentRound++;

  // 若尚未选满 3 轮，延时展示下一轮
  if (currentRound < 3) {
    setTimeout(() => {
      renderRound();
    }, 700);
  } else {
    // 三轮完成，发起 API 请求
    setTimeout(() => {
      callDeepSeekAPI();
    }, 700);
  }
}

// 调用 Vercel Serverless（/api/deepseek）中转 DeepSeek
async function callDeepSeekAPI() {
  readingResult.style.display = 'block';
  readingText.innerHTML = '<p>正在生成占卜结果，请稍候…</p>';

  // 组织 payload：把牌名 + 随机正逆位（可以按需调整）
  const payloadCards = selectedIndexArray.map(i => {
    const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
    return { name: tarotNames[i], orientation };
  });

  const prompt = `你是一位温柔、专业的塔罗占卜师。用户按顺序选择了三张牌：
1. ${payloadCards[0].name}（${payloadCards[0].orientation}）
2. ${payloadCards[1].name}（${payloadCards[1].orientation}）
3. ${payloadCards[2].name}（${payloadCards[2].orientation}）

请用中文输出结构化解读（不要输出多余系统信息），格式如下：
【象征意义】
（约80-120字）

【情绪洞察】
（约80-120字）

【灵性建议】
（约80-120字）

语气：温柔、鼓励、具体可执行。`;

  try {
    const resp = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(()=>({error:'unknown'}));
      readingText.innerHTML = `<p>占卜失败：${err.error || 'Server Error'}</p>`;
      return;
    }

    const data = await resp.json();
    // 期望 server 返回 { result: "..." }
    const resultText = data.result || data.reading || JSON.stringify(data);
    readingText.innerHTML = `<div>${resultText.replace(/\n/g,'<br/>')}</div>`;
  } catch (e) {
    console.error(e);
    readingText.innerHTML = `<p>生成占卜失败，请稍后重试（网络或后端错误）</p>`;
  }
}
