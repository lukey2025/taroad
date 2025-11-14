// ----------------------------------------------------
// 1. 塔罗牌卡组（这里你未来可以替换成 78 张）
// ----------------------------------------------------
const tarotCards = [
    "The Fool",
    "The Magician",
    "The High Priestess",
    "The Empress",
    "The Emperor",
    "The Hierophant",
    "The Lovers",
    "The Chariot",
    "Strength",
    "The Hermit",
    "Wheel of Fortune",
    "Justice",
    "The Hanged Man",
    "Death",
    "Temperance",
    "The Devil",
    "The Tower",
    "The Star",
    "The Moon",
    "The Sun",
    "Judgement",
    "The World"
];

// ----------------------------------------------------
// 2. 页面逻辑
// ----------------------------------------------------
let selectedCards = [];
let isSelecting = false;

// 初始化显示三张随机卡
function renderCardChoices() {
    const container = document.getElementById("cardSelection");
    container.innerHTML = "";

    const randomCards = tarotCards.sort(() => 0.5 - Math.random()).slice(0, 3);

    randomCards.forEach(cardName => {
        const cardElement = document.createElement("div");
        cardElement.className = "tarot-card";
        cardElement.innerHTML = `
            <div class="card-back">🔮</div>
            <div class="card-front">${cardName}</div>
        `;
        cardElement.onclick = () => selectCard(cardName, cardElement);
        container.appendChild(cardElement);
    });
}

// ----------------------------------------------------
// 3. 选择卡牌（连续 3 次）
// ----------------------------------------------------
function selectCard(cardName, element) {
    if (isSelecting) return;
    if (selectedCards.length >= 3) return;

    isSelecting = true;
    element.classList.add("flipped");

    setTimeout(() => {
        selectedCards.push(cardName);

        if (selectedCards.length < 3) {
            // 渲染下一轮抽卡
            renderCardChoices();
            isSelecting = false;
        } else {
            // 抽满 3 张 → 调用 API
            generateReading(selectedCards);
        }

    }, 1000);
}

// ----------------------------------------------------
// 4. 调用 Vercel Serverless API（deepseek）
// ----------------------------------------------------
async function generateReading(cards) {
    document.getElementById("readingResult").innerHTML = "🔮 正在生成塔罗解读…";

    try {
        const response = await fetch("/api/tarot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cards })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById("readingResult").innerHTML =
                "❌ 占卜失败：" + data.error;
            console.error(data);
            return;
        }

        document.getElementById("readingResult").innerHTML = `
            <h2>✨ 塔罗解读结果</h2>
            <pre>${data.result}</pre>
        `;

    } catch (err) {
        document.getElementById("readingResult").innerHTML =
            "❌ 占卜失败，请检查网络或 API。";
        console.error(err);
    }
}

// ----------------------------------------------------
// 页面加载 → 显示第一轮抽卡
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    renderCardChoices();
});
