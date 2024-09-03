const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

const stopButtons = [
    document.getElementById('stop1'),
    document.getElementById('stop2'),
    document.getElementById('stop3')
];

const rerollButton = document.getElementById('reroll');
const startButton = document.getElementById('start');
const betInput = document.getElementById('bet');
const moneyDisplay = document.getElementById('money');
const messageDisplay = document.getElementById('message');
const controlsContainer = document.querySelector('.controls');

const symbols = ['A', 'B', 'C', 'D'];
let intervals = [null, null, null];
let money = 10000;
let currentBet = 0;

const payoutMultipliers = {
    'AAA': 4,
    'BBB': 3,
    'CCC': 2,
    'DDD': 1,
    'ABC': 5,
    'ACB': 3,
    'BAC': 3,
    'BCA': 3,
    'CAB': 3,
    'CBA': 3
};

// 最高記録をローカルストレージから取得
let highestMoney = localStorage.getItem('highestMoney') || 0;
document.getElementById('highest-money').textContent = highestMoney;

function resetReels() {
    for (let i = 0; i < reels.length; i++) {
        reels[i].innerHTML = `<span>${symbols[0]}</span>`;
        reels[i].style.animation = 'none';
        reels[i].classList.remove('stopping', 'win-animation', 'lose-animation', 'spin');
    }
}

function startReel(reelIndex) {
    reels[reelIndex].classList.add('spin'); // 回転アニメーションを追加
    intervals[reelIndex] = setInterval(() => {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        reels[reelIndex].innerHTML = `<span>${randomSymbol}</span>`;
    }, 250);
}

function stopReel(reelIndex) {
    clearInterval(intervals[reelIndex]);
    intervals[reelIndex] = null;
    reels[reelIndex].classList.remove('spin'); // 回転アニメーションを削除
    reels[reelIndex].classList.add('stopping'); // 停止アニメーションを追加
    checkAllReelsStopped();
}

function startAllReels() {
    for (let i = 0; i < reels.length; i++) {
        startReel(i);
    }
}

function checkAllReelsStopped() {
    if (intervals.every(interval => interval === null)) {
        enableStopButtons(false);
        checkWin();
        startButton.disabled = false;
        rerollButton.disabled = false;
    }
}

function checkWin() {
    const result = reels.map(reel => reel.textContent).join('');
    let winnings = 0;

    if (payoutMultipliers[result]) {
        winnings = currentBet * payoutMultipliers[result];
    }

    if (winnings > 0) {
        messageDisplay.textContent = `おめでとう！ あなたは ${winnings} コインを獲得しました！`;
        reels.forEach(reel => reel.classList.add('win-animation')); // 勝利アニメーション
    } else {
        messageDisplay.textContent = "残念、もう一度挑戦しましょう。";
        reels.forEach(reel => reel.classList.add('lose-animation')); // 敗北アニメーション
    }

    money += winnings;
    moneyDisplay.textContent = money;
    betInput.max = money;

    if (money > highestMoney) {
        highestMoney = money;
        localStorage.setItem('highestMoney', highestMoney);
        document.getElementById('highest-money').textContent = highestMoney;
    }
}

function handleReroll() {
    if (money >= currentBet) {
        money -= currentBet;
        moneyDisplay.textContent = money;
        messageDisplay.textContent = "";
        startAllReels();
        enableStopButtons(true);
        rerollButton.disabled = true;
    } else {
        messageDisplay.textContent = "お金が足りません。";
    }
}

function enableStopButtons(enabled) {
    stopButtons.forEach(button => button.disabled = !enabled);
}

function handleStart() {
    currentBet = parseInt(betInput.value);
    if (money >= currentBet) {
        money -= currentBet;
        moneyDisplay.textContent = money;
        messageDisplay.textContent = "";
        startAllReels();
        enableStopButtons(true);
        startButton.disabled = true;
        rerollButton.disabled = true;

        controlsContainer.classList.add('hidden-start');
    } else {
        messageDisplay.textContent = "お金が足りません。";
    }
}

// 初期設定
resetReels();
enableStopButtons(false);
rerollButton.disabled = true;
betInput.max = money;

startButton.addEventListener('click', handleStart);

for (let i = 0; i < reels.length; i++) {
    stopButtons[i].addEventListener('click', () => {
        stopReel(i);
    });
}

rerollButton.addEventListener('click', handleReroll);

betInput.addEventListener('input', () => {
    if (parseInt(betInput.value) > money) {
        betInput.value = money;
    }
});
