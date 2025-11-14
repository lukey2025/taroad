const tarotDeck = Array.from({length:78},(_,i)=>`tarot/${i+1}.jpg`);
const tarotNames = [
"愚者","魔术师","女祭司","皇后","国王","教皇","恋人","战车","力量","隐士",
"命运之轮","正义","倒吊人","死神","节制","恶魔","塔","星星","月亮","太阳",
"审判","世界","权杖王牌","权杖二","权杖三","权杖四","权杖五","权杖六","权杖七","权杖八",
"权杖九","权杖十","圣杯王牌","圣杯二","圣杯三","圣杯四","圣杯五","圣杯六","圣杯七","圣杯八",
"圣杯九","圣杯十","圣杯侍者","圣杯骑士","圣杯皇后","圣杯国王","宝剑王牌","宝剑二","宝剑三","宝剑四",
"宝剑五","宝剑六","宝剑七","宝剑八","宝剑九","宝剑十","宝剑侍者","宝剑骑士","宝剑皇后","宝剑国王",
"钱币王牌","钱币二","钱币三","钱币四","钱币五","钱币六","钱币七","钱币八","钱币九","钱币十",
"钱币侍者","钱币骑士","钱币皇后","钱币国王","权杖侍者","权杖骑士","权杖皇后","权杖国王"
];

let selectedCards = [];

function selectTheme(theme){
document.querySelector('.themes-container').style.display='none';
document.getElementById('reading-room').style.display='block';
renderCards();
}

function backToHome(){
document.getElementById('reading-room').style.display='none';
document.querySelector('.themes-container').style.display='flex';
document.getElementById('reading-result').style.display='none';
selectedCards=[];
}

function renderCards(){
const container=document.getElementById('tarot-container');
container.innerHTML='';
const selectedIndexes=new Set();
while(selectedIndexes.size<3) selectedIndexes.add(Math.floor(Math.random()*tarotDeck.length));
[...selectedIndexes].forEach(idx=>{
const card=document.createElement('div');
card.className='tarot-card';
card.dataset.idx=idx;
const inner=document.createElement('div');
inner.className='tarot-card-inner';
const front=document.createElement('div');
front.className='tarot-card-front';
const img=document.createElement('img');
img.src=tarotDeck[idx];
const name=document.createElement('div');
name.className='card-name';
name.innerText=tarotNames[idx];
front.appendChild(img);
front.appendChild(name);
const back=document.createElement('div');
back.className='tarot-card-back';
back.innerText='?';
inner.appendChild(front);
inner.appendChild(back);
card.appendChild(inner);
card.onclick=()=>chooseCard(idx,card);
container.appendChild(card);
});
}

function chooseCard(idx,cardEl){
if(selectedCards.includes(idx)) return;
selectedCards.push(idx);
cardEl.classList.add('flipped');
if(selectedCards.length<3){
setTimeout(renderCards,800);
}else{
setTimeout(fetchReading,800);
}
}

async function fetchReading(){
const readingDiv=document.getElementById('reading-result');
readingDiv.style.display='block';
document.getElementById('reading-text').innerHTML='<p>正在生成占卜结果...</p>';
try{
const response=await fetch('/api/deepseek',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({prompt:`你是一位专业塔罗师。用户选择了以下三张牌：${selectedCards.map(i=>tarotNames[i]).join(', ')}。请生成三段式解读：1.象征意义 2.情绪洞察 3.灵性建议，每段100字左右。`})
});
const data=await response.json();
document.getElementById('reading-text').innerHTML=`<p>${data.text||'AI未返回结果，请稍后重试'}</p>`;
}catch(err){console.error(err);document.getElementById('reading-text').innerHTML='<p>生成占卜失败，请检查网络或API Key</p>';}
}
async function generateReading(selectedCards) {
    try {
        const response = await fetch("/api/tarot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cards: selectedCards
            })
        });

        const data = await response.json();

        if (data.error) {
            alert("占卜失败：" + data.error);
            return;
        }

        document.getElementById("reading-output").innerHTML = data.result;

    } catch (err) {
        alert("生成占卜失败，请检查网络或 API");
        console.error(err);
    }
}

