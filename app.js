const tarotDeck = Array.from({length: 78}, (_, i) => `tarot/${i+1}.jpg`);

function selectTheme(theme) {
    document.querySelector('.themes-container').style.display = 'none';
    document.getElementById('reading-room').style.display = 'block';
}

function backToHome() {
    document.getElementById('reading-room').style.display = 'none';
    document.querySelector('.themes-container').style.display = 'flex';
    document.getElementById('reading-result').style.display = 'none';
}

function drawCards() {
    const container = document.getElementById('tarot-container');
    container.innerHTML = '';
    const selected = [];
    while (selected.length < 3) {
        const idx = Math.floor(Math.random() * tarotDeck.length);
        if (!selected.includes(idx)) selected.push(idx);
    }

    selected.forEach(idx => {
        const card = document.createElement('div');
        card.className = 'tarot-card';
        card.onclick = () => card.classList.toggle('flipped');

        const inner = document.createElement('div');
        inner.className = 'tarot-card-inner';

        const front = document.createElement('div');
        front.className = 'tarot-card-front';
        const img = document.createElement('img');
        img.src = tarotDeck[idx];
        front.appendChild(img);

        const back = document.createElement('div');
        back.className = 'tarot-card-back';
        back.innerText = '?';

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);
        container.appendChild(card);
    });

    const reading = document.getElementById('reading-result');
    reading.style.display = 'block';
    document.getElementById('reading-text').innerHTML = `
        <p>象征意义：这里显示塔罗象征意义</p>
        <p>情绪洞察：这里显示情绪洞察</p>
        <p>灵性建议：这里显示灵性建议</p>
    `;
}
