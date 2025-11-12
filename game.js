// 獲取畫布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設置畫布大小
canvas.width = 800;
canvas.height = 600;

// 遊戲狀態
let gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
let score = 0;
let lives = 3;
let level = 1;

// 球物件
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: 4,
    dy: -4,
    speed: 4,
    color: '#ffd700'
};

// 擋板物件
const paddle = {
    x: canvas.width / 2 - 75,
    y: canvas.height - 30,
    width: 150,
    height: 15,
    speed: 8,
    color: '#667eea',
    originalWidth: 150 // 保存原始寬度
};

// 道具類型
const PowerUpType = {
    EXPAND_PADDLE: 'expand',
    SHRINK_PADDLE: 'shrink',
    SLOW_BALL: 'slow',
    FAST_BALL: 'fast',
    MULTI_BALL: 'multi',
    EXTRA_LIFE: 'life',
    LASER: 'laser'
};

// 道具陣列
let powerUps = [];

// 道具效果持續時間
let powerUpEffects = {
    expand: 0,
    shrink: 0,
    slow: 0,
    fast: 0
};

// 多球陣列
let extraBalls = [];

// 磚塊陣列
let bricks = [];
const brickRowCount = 5;
const brickColumnCount = 10;
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 5;
const brickOffsetTop = 60;
const brickOffsetLeft = 35;

// 初始化磚塊
function initBricks() {
    bricks = [];
    powerUps = []; // 清除所有道具
    extraBalls = []; // 清除額外球
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            const color = colors[r % colors.length];
            
            // 30% 的機率會掉落道具
            const hasPowerUp = Math.random() < 0.3;
            
            bricks.push({
                x: brickX,
                y: brickY,
                width: brickWidth,
                height: brickHeight,
                color: color,
                visible: true,
                hasPowerUp: hasPowerUp
            });
        }
    }
}

// 繪製球
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
    
    // 添加光澤效果
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, ball.radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
    ctx.closePath();
}

// 繪製擋板
function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
    
    // 添加陰影效果
    ctx.shadowBlur = 10;
    ctx.shadowColor = paddle.color;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// 繪製磚塊
function drawBricks() {
    bricks.forEach(brick => {
        if (brick.visible) {
            ctx.beginPath();
            ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
            ctx.fillStyle = brick.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
            
            // 如果有道具，顯示特殊標記
            if (brick.hasPowerUp) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(brick.x + brick.width / 2, brick.y + brick.height / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

// 創建道具
function createPowerUp(x, y) {
    const types = Object.values(PowerUpType);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const colors = {
        'expand': '#4ecdc4',
        'shrink': '#ff6b6b',
        'slow': '#45b7d1',
        'fast': '#f9ca24',
        'multi': '#6c5ce7',
        'life': '#ff6b6b',
        'laser': '#ff4757'
    };
    
    const symbols = {
        'expand': '⬌',
        'shrink': '⬍',
        'slow': '⏸',
        'fast': '⚡',
        'multi': '●',
        'life': '❤',
        'laser': '➤'
    };
    
    powerUps.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        speed: 3,
        type: type,
        color: colors[type],
        symbol: symbols[type],
        rotation: 0
    });
}

// 繪製道具
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        // 旋轉動畫
        powerUp.rotation += 0.1;
        
        ctx.save();
        ctx.translate(powerUp.x, powerUp.y);
        ctx.rotate(powerUp.rotation);
        
        // 繪製道具外框
        ctx.beginPath();
        ctx.roundRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height, 5);
        ctx.fillStyle = powerUp.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // 繪製符號
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerUp.symbol, 0, 0);
        
        ctx.restore();
        
        // 添加光暈效果
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerUp.color;
        ctx.beginPath();
        ctx.roundRect(powerUp.x - powerUp.width / 2, powerUp.y - powerUp.height / 2, powerUp.width, powerUp.height, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

// 更新道具位置
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += powerUp.speed;
        
        // 如果道具掉出畫面，移除
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            continue;
        }
        
        // 檢測道具與擋板碰撞
        if (powerUp.x + powerUp.width / 2 > paddle.x &&
            powerUp.x - powerUp.width / 2 < paddle.x + paddle.width &&
            powerUp.y + powerUp.height / 2 > paddle.y &&
            powerUp.y - powerUp.height / 2 < paddle.y + paddle.height) {
            
            // 觸發道具效果
            activatePowerUp(powerUp.type);
            powerUps.splice(i, 1);
        }
    }
}

// 激活道具效果
function activatePowerUp(type) {
    switch(type) {
        case PowerUpType.EXPAND_PADDLE:
            paddle.width = Math.min(paddle.originalWidth * 1.5, 250);
            powerUpEffects.expand = 600; // 10秒 (60fps * 10)
            break;
            
        case PowerUpType.SHRINK_PADDLE:
            paddle.width = Math.max(paddle.originalWidth * 0.7, 80);
            powerUpEffects.shrink = 600;
            break;
            
        case PowerUpType.SLOW_BALL:
            const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = (ball.dx / currentSpeed) * (ball.speed * 0.6);
            ball.dy = (ball.dy / currentSpeed) * (ball.speed * 0.6);
            powerUpEffects.slow = 600;
            break;
            
        case PowerUpType.FAST_BALL:
            const currentSpeed2 = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = (ball.dx / currentSpeed2) * (ball.speed * 1.5);
            ball.dy = (ball.dy / currentSpeed2) * (ball.speed * 1.5);
            powerUpEffects.fast = 600;
            break;
            
        case PowerUpType.MULTI_BALL:
            // 創建兩個額外的球
            for (let i = 0; i < 2; i++) {
                extraBalls.push({
                    x: ball.x,
                    y: ball.y,
                    radius: ball.radius,
                    dx: (Math.random() - 0.5) * 8,
                    dy: -Math.abs(ball.dy),
                    speed: ball.speed,
                    color: '#ffd700'
                });
            }
            break;
            
        case PowerUpType.EXTRA_LIFE:
            lives++;
            updateLives();
            break;
            
        case PowerUpType.LASER:
            // 激光效果（可以穿透磚塊）
            // 這裡簡化為直接清除一行磚塊
            const rowToClear = Math.floor(Math.random() * brickRowCount);
            bricks.forEach(brick => {
                if (brick.visible) {
                    const brickRow = Math.floor((brick.y - brickOffsetTop) / (brickHeight + brickPadding));
                    if (brickRow === rowToClear) {
                        brick.visible = false;
                        score += 10;
                    }
                }
            });
            updateScore();
            break;
    }
}

// 更新道具效果
function updatePowerUpEffects() {
    // 更新擴展擋板效果
    if (powerUpEffects.expand > 0) {
        powerUpEffects.expand--;
        if (powerUpEffects.expand === 0) {
            paddle.width = paddle.originalWidth;
        }
    }
    
    // 更新縮小擋板效果
    if (powerUpEffects.shrink > 0) {
        powerUpEffects.shrink--;
        if (powerUpEffects.shrink === 0) {
            paddle.width = paddle.originalWidth;
        }
    }
    
    // 更新慢速球效果
    if (powerUpEffects.slow > 0) {
        powerUpEffects.slow--;
        if (powerUpEffects.slow === 0) {
            const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = (ball.dx / currentSpeed) * ball.speed;
            ball.dy = (ball.dy / currentSpeed) * ball.speed;
        }
    }
    
    // 更新快速球效果
    if (powerUpEffects.fast > 0) {
        powerUpEffects.fast--;
        if (powerUpEffects.fast === 0) {
            const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = (ball.dx / currentSpeed) * ball.speed;
            ball.dy = (ball.dy / currentSpeed) * ball.speed;
        }
    }
}

// 繪製額外球
function drawExtraBalls() {
    extraBalls.forEach(extraBall => {
        ctx.beginPath();
        ctx.arc(extraBall.x, extraBall.y, extraBall.radius, 0, Math.PI * 2);
        ctx.fillStyle = extraBall.color;
        ctx.fill();
        ctx.closePath();
    });
}

// 更新額外球
function updateExtraBalls() {
    for (let i = extraBalls.length - 1; i >= 0; i--) {
        const extraBall = extraBalls[i];
        extraBall.x += extraBall.dx;
        extraBall.y += extraBall.dy;
        
        // 牆壁碰撞
        if (extraBall.x + extraBall.radius > canvas.width || extraBall.x - extraBall.radius < 0) {
            extraBall.dx = -extraBall.dx;
        }
        if (extraBall.y - extraBall.radius < 0) {
            extraBall.dy = -extraBall.dy;
        }
        
        // 掉落
        if (extraBall.y + extraBall.radius > canvas.height) {
            extraBalls.splice(i, 1);
            continue;
        }
        
        // 擋板碰撞
        if (extraBall.x + extraBall.radius > paddle.x &&
            extraBall.x - extraBall.radius < paddle.x + paddle.width &&
            extraBall.y + extraBall.radius > paddle.y &&
            extraBall.y - extraBall.radius < paddle.y + paddle.height) {
            extraBall.y = paddle.y - extraBall.radius;
            const hitPos = (extraBall.x - paddle.x) / paddle.width;
            const normalizedHitPos = Math.max(0.1, Math.min(0.9, hitPos));
            const angle = normalizedHitPos * Math.PI - Math.PI / 2;
            const speed = Math.sqrt(extraBall.dx * extraBall.dx + extraBall.dy * extraBall.dy);
            extraBall.dx = speed * Math.sin(angle);
            extraBall.dy = -Math.abs(speed * Math.cos(angle));
        }
        
        // 磚塊碰撞
        bricks.forEach(brick => {
            if (brick.visible) {
                if (extraBall.x + extraBall.radius > brick.x &&
                    extraBall.x - extraBall.radius < brick.x + brick.width &&
                    extraBall.y + extraBall.radius > brick.y &&
                    extraBall.y - extraBall.radius < brick.y + brick.height) {
                    
                    brick.visible = false;
                    score += 10;
                    updateScore();
                    
                    if (brick.hasPowerUp) {
                        createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                    
                    const overlapLeft = (extraBall.x + extraBall.radius) - brick.x;
                    const overlapRight = (brick.x + brick.width) - (extraBall.x - extraBall.radius);
                    const overlapTop = (extraBall.y + extraBall.radius) - brick.y;
                    const overlapBottom = (brick.y + brick.height) - (extraBall.y - extraBall.radius);
                    
                    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                    
                    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                        extraBall.dx = -extraBall.dx;
                        if (minOverlap === overlapLeft) {
                            extraBall.x = brick.x - extraBall.radius;
                        } else {
                            extraBall.x = brick.x + brick.width + extraBall.radius;
                        }
                    } else {
                        extraBall.dy = -extraBall.dy;
                        if (minOverlap === overlapTop) {
                            extraBall.y = brick.y - extraBall.radius;
                        } else {
                            extraBall.y = brick.y + brick.height + extraBall.radius;
                        }
                    }
                }
            }
        });
    }
}

// 碰撞檢測：球與擋板
function ballPaddleCollision() {
    // 檢查球是否在擋板上方且正在向下移動
    if (ball.dy > 0 && 
        ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height) {
        
        // 將球移到擋板上方，避免卡在擋板內
        ball.y = paddle.y - ball.radius;
        
        // 根據擊中擋板的位置改變角度
        const hitPos = (ball.x - paddle.x) / paddle.width;
        // 限制角度範圍，避免過於極端的角度
        const normalizedHitPos = Math.max(0.1, Math.min(0.9, hitPos));
        const angle = normalizedHitPos * Math.PI - Math.PI / 2;
        
        // 計算新的速度，保持速度大小
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle)); // 確保向上移動
    }
}

// 碰撞檢測：球與磚塊
function ballBrickCollision() {
    let collisionDetected = false;
    
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (brick.visible && !collisionDetected) {
            // 計算球與磚塊的碰撞
            const ballLeft = ball.x - ball.radius;
            const ballRight = ball.x + ball.radius;
            const ballTop = ball.y - ball.radius;
            const ballBottom = ball.y + ball.radius;
            
            const brickLeft = brick.x;
            const brickRight = brick.x + brick.width;
            const brickTop = brick.y;
            const brickBottom = brick.y + brick.height;
            
            // 檢查是否碰撞
            if (ballRight > brickLeft && 
                ballLeft < brickRight && 
                ballBottom > brickTop && 
                ballTop < brickBottom) {
                
                // 計算球從哪個方向進入磚塊
                const prevX = ball.x - ball.dx;
                const prevY = ball.y - ball.dy;
                
                const prevBallLeft = prevX - ball.radius;
                const prevBallRight = prevX + ball.radius;
                const prevBallTop = prevY - ball.radius;
                const prevBallBottom = prevY + ball.radius;
                
                // 判斷碰撞面
                const overlapLeft = ballRight - brickLeft;
                const overlapRight = brickRight - ballLeft;
                const overlapTop = ballBottom - brickTop;
                const overlapBottom = brickBottom - ballTop;
                
                // 找出最小的重疊量，確定碰撞面
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                // 根據碰撞面反彈
                if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                    // 左右碰撞
                    ball.dx = -ball.dx;
                    // 將球移出磚塊範圍
                    if (minOverlap === overlapLeft) {
                        ball.x = brickLeft - ball.radius;
                    } else {
                        ball.x = brickRight + ball.radius;
                    }
                } else {
                    // 上下碰撞
                    ball.dy = -ball.dy;
                    // 將球移出磚塊範圍
                    if (minOverlap === overlapTop) {
                        ball.y = brickTop - ball.radius;
                    } else {
                        ball.y = brickBottom + ball.radius;
                    }
                }
                
                brick.visible = false;
                score += 10;
                updateScore();
                
                // 如果磚塊有道具，生成道具
                if (brick.hasPowerUp) {
                    createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                }
                
                // 標記已檢測到碰撞，避免同一幀內多次碰撞
                collisionDetected = true;
                break;
            }
        }
    }
}

// 更新球的位置
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 左右牆壁碰撞
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.dx = -ball.dx;
    } else if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.dx = -ball.dx;
    }
    
    // 上牆壁碰撞
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy = -ball.dy;
    }
    
    // 球掉落
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();
        
        if (lives <= 0) {
            gameOver(false);
        } else {
            resetBall();
        }
    }
    
    // 先檢測擋板碰撞，再檢測磚塊碰撞
    ballPaddleCollision();
    ballBrickCollision();
}

// 重置球的位置
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;
}

// 更新擋板位置（滑鼠控制）
function updatePaddleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;
    
    // 限制擋板在畫布內
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// 鍵盤控制
const keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
});

function updatePaddleKeyboard() {
    if (keys.left && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (keys.right && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.speed;
    }
}

// 更新分數顯示
function updateScore() {
    document.getElementById('score').textContent = score;
}

// 更新生命顯示
function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// 更新關卡顯示
function updateLevel() {
    document.getElementById('level').textContent = level;
}

// 檢查是否過關
function checkLevelComplete() {
    const visibleBricks = bricks.filter(brick => brick.visible);
    if (visibleBricks.length === 0) {
        level++;
        updateLevel();
        ball.speed += 0.5;
        initBricks();
        resetBall();
    }
}

// 遊戲結束
function gameOver(won) {
    gameState = 'gameOver';
    const gameOverScreen = document.getElementById('gameOver');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const finalScore = document.getElementById('finalScore');
    
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = score;
    
    if (won) {
        gameOverTitle.textContent = '恭喜過關！';
        gameOverMessage.innerHTML = `你完成了所有關卡！<br>最終得分: <span id="finalScore">${score}</span>`;
    } else {
        gameOverTitle.textContent = '遊戲結束';
        gameOverMessage.innerHTML = `最終得分: <span id="finalScore">${score}</span>`;
    }
}

// 重新開始遊戲
function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    ball.speed = 4;
    gameState = 'playing';
    
    // 重置道具效果
    powerUpEffects = {
        expand: 0,
        shrink: 0,
        slow: 0,
        fast: 0
    };
    paddle.width = paddle.originalWidth;
    powerUps = [];
    extraBalls = [];
    
    updateScore();
    updateLives();
    updateLevel();
    
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startScreen').classList.add('hidden');
    
    initBricks();
    resetBall();
}

// 主遊戲循環
function gameLoop() {
    if (gameState === 'playing') {
        // 清空畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 繪製遊戲元素
        drawBricks();
        drawPaddle();
        drawBall();
        drawExtraBalls(); // 繪製額外球
        drawPowerUps(); // 繪製道具
        
        // 更新遊戲邏輯
        updateBall();
        updateExtraBalls(); // 更新額外球
        updatePowerUps(); // 更新道具
        updatePowerUpEffects(); // 更新道具效果
        updatePaddleKeyboard();
        checkLevelComplete();
        
        // 檢查是否完成所有關卡
        if (level > 10) {
            gameOver(true);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// 事件監聽器
canvas.addEventListener('mousemove', updatePaddleMouse);

document.getElementById('startBtn').addEventListener('click', () => {
    gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    
    // 重置道具效果
    powerUpEffects = {
        expand: 0,
        shrink: 0,
        slow: 0,
        fast: 0
    };
    paddle.width = paddle.originalWidth;
    powerUps = [];
    extraBalls = [];
    
    initBricks();
    resetBall();
});

document.getElementById('restartBtn').addEventListener('click', restartGame);

// 初始化
updateScore();
updateLives();
updateLevel();
gameLoop();

