const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const currentLevelElement = document.getElementById('currentLevel');
const levelTargetElement = document.getElementById('levelTarget');
const highestLevelElement = document.getElementById('highestLevel');

// 食物种类
const foods = [
    '🍜', '🍖', '🍣', '🍕', '🍔', '🌮', '🍙', '🍱', '🥟', '🍪'
];

const gridSize = 20;
const tileCount = 20;

let snake = [
    { x: 10, y: 10 }
];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
    type: foods[Math.floor(Math.random() * foods.length)]
};

let dx = 0;
let dy = 0;
let score = 0;

// 添加食物名称映射
const foodNames = {
    '🍜': '热腾腾的面条',
    '🍖': '香喷喷的肉',
    '🍣': '新鲜的寿司',
    '🍕': '披萨',
    '🍔': '汉堡',
    '🌮': '墨西哥卷',
    '🍙': '饭团',
    '🍱': '便当',
    '🥟': '饺子',
    '🍪': '曲奇'
};

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

let currentLevel = 1;
let highestLevel = parseInt(localStorage.getItem('snakeHighestLevel')) || 1;
let gameSpeed = 100;

// 计算关卡目标分数
function calculateLevelTarget(level) {
    return level * 50; // 每关递增50分
}

// 计算关卡速度
function calculateGameSpeed(level) {
    return Math.max(100 - (level - 1) * 2, 30); // 速度逐渐加快，最快30ms
}

// 更新关卡信息显示
function updateLevelInfo() {
    currentLevelElement.textContent = currentLevel;
    levelTargetElement.textContent = calculateLevelTarget(currentLevel);
    highestLevelElement.textContent = highestLevel;
    gameSpeed = calculateGameSpeed(currentLevel);
}

// 在文件开头添加场景配置
const levelThemes = {
    beginner: {
        background: '#fff5f5',
        border: '#ffb3b3',
        snake: '#ff8080',
        message: '#ff4d4d'
    },
    intermediate: {
        background: '#fff0e6',
        border: '#ffb380',
        snake: '#ff944d',
        message: '#ff751a'
    },
    advanced: {
        background: '#fff2e6',
        border: '#ffb366',
        snake: '#ff944d',
        message: '#ff751a'
    }
};

// 获取当前关卡主题
function getLevelTheme(level) {
    if (level <= 33) {
        return levelThemes.beginner;
    } else if (level <= 66) {
        return levelThemes.intermediate;
    } else {
        return levelThemes.advanced;
    }
}

// 修改 drawGame 函数
function drawGame() {
    const theme = getLevelTheme(currentLevel);
    
    // 清空画布并绘制背景
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制边框装饰
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // 添加关卡装饰
    drawLevelDecorations(theme);

    // 移动蛇
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        // 显示吃到食物的消息
        showMessage(`穆木偷吃了${foodNames[food.type]}！`);
        generateFood();
    } else {
        snake.pop();
    }

    // 检查是否达到关卡目标
    if (score >= calculateLevelTarget(currentLevel)) {
        if (currentLevel < 99) {
            showMessage('穆木真棒！升级啦！');
            currentLevel++;
            if (currentLevel > highestLevel) {
                highestLevel = currentLevel;
                localStorage.setItem('snakeHighestLevel', highestLevel);
            }
            updateLevelInfo();
        } else {
            showMessage('恭喜通关！穆木最棒！');
            setTimeout(() => {
                alert('恭喜你通关了所有99个关卡！');
                resetGame();
            }, 1000);
            return;
        }
    }

    // 检查游戏结束条件
    if (isGameOver()) {
        showMessage('菜就多练！');
        setTimeout(() => {
            alert(`游戏结束！当前关卡：${currentLevel}，得分：${score}`);
            resetGame();
        }, 1000);
        return;
    }

    // 绘制食物
    ctx.font = `${gridSize}px Arial`;
    ctx.fillText(food.type, food.x * gridSize, (food.y + 1) * gridSize);

    // 绘制蛇
    ctx.fillStyle = theme.snake;
    snake.forEach((segment, index) => {
        // 蛇身渐变效果
        const alpha = 1 - (index / snake.length) * 0.5;
        ctx.globalAlpha = alpha;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    ctx.globalAlpha = 1;

    setTimeout(drawGame, gameSpeed);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        type: foods[Math.floor(Math.random() * foods.length)]
    };
    
    // 确保食物不会生成在蛇身上
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function isGameOver() {
    // 撞墙
    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        return true;
    }
    
    // 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    currentLevel = 1;
    scoreElement.textContent = score;
    messageElement.textContent = '';
    updateLevelInfo();
    generateFood();
    showMessage('欢迎穆木！');
    drawGame();
}

// 添加关卡装饰函数
function drawLevelDecorations(theme) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    // 根据关卡等级添加不同的装饰
    if (currentLevel <= 33) {
        // 初级关卡：温暖的樱花图案
        drawFlowers(10);
    } else if (currentLevel <= 66) {
        // 中级关卡：星星图案
        drawStars(15);
    } else {
        // 高级关卡：复杂的花纹图案
        drawPatterns(20);
    }
    
    ctx.restore();
}

// 绘制樱花装饰
function drawFlowers(count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 10 + Math.random() * 10;
        
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const angle = (j * 2 * Math.PI) / 5;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (j === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.fillStyle = '#ffcce6';
        ctx.fill();
    }
}

// 绘制星星装饰
function drawStars(count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 5 + Math.random() * 8;
        
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const angle = (j * 4 * Math.PI) / 5;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (j === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.fillStyle = '#ffd480';
        ctx.fill();
    }
}

// 绘制花纹装饰
function drawPatterns(count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 15;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffcc99';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe6cc';
        ctx.fill();
    }
}

// 修改 showMessage 函数使用主题颜色
function showMessage(text) {
    const theme = getLevelTheme(currentLevel);
    messageElement.style.color = theme.message;
    messageElement.textContent = text;
    setTimeout(() => {
        messageElement.textContent = '';
    }, 2000);
}

// 在游戏开始前初始化关卡信息
updateLevelInfo();
showMessage('欢迎穆木！');
drawGame(); 