// Stack Tower - Ultimate Edition with Currency & Progression

class StackTower {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Load saved data
        this.loadGameData();

        // Game state
        this.gameState = 'start';
        this.score = 0;
        this.gamesPlayed = 0;
        this.canRevive = true;

        // Combo system
        this.combo = 0;
        this.maxCombo = 0;

        // Tower settings
        this.blocks = [];
        this.currentBlock = null;
        this.baseBlockWidth = 200;
        this.blockHeight = 35;
        this.baseSpeed = 4;
        this.blockSpeed = this.baseSpeed;
        this.direction = 1;
        this.perfectTolerance = 8;

        // Visual effects
        this.particles = [];
        this.fallingPieces = [];
        this.textPopups = [];
        this.coinPopups = [];
        this.cameraY = 0;
        this.targetCameraY = 0;
        this.screenShake = 0;
        this.glowIntensity = 0;

        // Stars
        this.stars = [];
        this.initStars();

        // Skin colors
        this.skins = {
            default: [['#ff6b6b','#ee5a5a'],['#ff8e53','#e67d42'],['#feca57','#e5b346'],['#48dbfb','#37caeb'],['#1dd1a1','#0cc090']],
            neon: [['#00ff87','#00cc6a'],['#00d4ff','#00a8cc'],['#ff00ff','#cc00cc'],['#ffff00','#cccc00'],['#ff3366','#cc2952']],
            dark: [['#2c3e50','#1a252f'],['#34495e','#22303d'],['#7f8c8d','#5d6d6e'],['#95a5a6','#748485'],['#bdc3c7','#9ca3a7']],
            gold: [['#ffd700','#ccac00'],['#ffb347','#cc8f39'],['#ff6b35','#cc5629'],['#f7dc6f','#c4b058'],['#f39c12','#c27d0e']],
            candy: [['#ff69b4','#e050a0'],['#da70d6','#c050b6'],['#87ceeb','#6ab8d5'],['#98fb98','#7adc7a'],['#dda0dd','#c480c4']],
            galaxy: [['#9b59b6','#7c4792'],['#3498db','#2a7ab8'],['#1abc9c','#15967d'],['#e74c3c','#b93d30'],['#f39c12','#c27d0e']],
            ice: [['#a8e6cf','#86c8b1'],['#dcedc1','#c4d5a9'],['#ffd3a5','#e0b58d'],['#ffaaa5','#e0928d'],['#ff8b94','#e06d76']],
            fire: [['#ff0000','#cc0000'],['#ff4500','#cc3700'],['#ff6600','#cc5200'],['#ff9900','#cc7a00'],['#ffcc00','#cca300']]
        };

        // Powerups owned
        this.activePowerups = {
            widerStart: false,
            slowMotion: false,
            doubleCoins: false,
            shield: false
        };

        this.init();
        this.checkDailyReward();
    }

    loadGameData() {
        const saved = localStorage.getItem('stackTowerData');
        if (saved) {
            const data = JSON.parse(saved);
            this.coins = data.coins || 0;
            this.gems = data.gems || 0;
            this.highScore = data.highScore || 0;
            this.totalGames = data.totalGames || 0;
            this.currentSkin = data.currentSkin || 'default';
            this.unlockedSkins = data.unlockedSkins || ['default'];
            this.achievements = data.achievements || {};
            this.lastDaily = data.lastDaily || 0;
            this.dailyStreak = data.dailyStreak || 0;
            this.totalCoinsEarned = data.totalCoinsEarned || 0;
            this.totalPerfects = data.totalPerfects || 0;
            this.powerupCounts = data.powerupCounts || { widerStart: 0, slowMotion: 0, doubleCoins: 0, shield: 0 };
        } else {
            this.coins = 0;
            this.gems = 0;
            this.highScore = 0;
            this.totalGames = 0;
            this.currentSkin = 'default';
            this.unlockedSkins = ['default'];
            this.achievements = {};
            this.lastDaily = 0;
            this.dailyStreak = 0;
            this.totalCoinsEarned = 0;
            this.totalPerfects = 0;
            this.powerupCounts = { widerStart: 0, slowMotion: 0, doubleCoins: 0, shield: 0 };
        }
    }

    saveGameData() {
        const data = {
            coins: this.coins,
            gems: this.gems,
            highScore: this.highScore,
            totalGames: this.totalGames,
            currentSkin: this.currentSkin,
            unlockedSkins: this.unlockedSkins,
            achievements: this.achievements,
            lastDaily: this.lastDaily,
            dailyStreak: this.dailyStreak,
            totalCoinsEarned: this.totalCoinsEarned,
            totalPerfects: this.totalPerfects,
            powerupCounts: this.powerupCounts
        };
        localStorage.setItem('stackTowerData', JSON.stringify(data));
    }

    checkDailyReward() {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const lastDate = new Date(this.lastDaily).setHours(0,0,0,0);
        const today = new Date(now).setHours(0,0,0,0);

        if (today > lastDate) {
            if (today - lastDate <= dayMs * 2) {
                this.dailyStreak++;
            } else {
                this.dailyStreak = 1;
            }

            const rewards = [50, 75, 100, 150, 200, 300, 500];
            const reward = rewards[Math.min(this.dailyStreak - 1, rewards.length - 1)];

            this.coins += reward;
            this.lastDaily = now;
            this.saveGameData();

            setTimeout(() => {
                this.showDailyReward(reward, this.dailyStreak);
            }, 500);
        }
    }

    showDailyReward(amount, streak) {
        const popup = document.createElement('div');
        popup.className = 'daily-popup';
        popup.innerHTML = `
            <h2>DAILY REWARD!</h2>
            <p class="streak">Day ${streak} Streak!</p>
            <p class="reward">+${amount} coins</p>
            <button onclick="this.parentElement.remove()">COLLECT</button>
        `;
        document.body.appendChild(popup);
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('click', (e) => { e.preventDefault(); this.handleTap(); });
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleTap(); }, { passive: false });

        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('retry-btn').addEventListener('click', () => this.startGame());
        document.getElementById('revive-btn').addEventListener('click', () => this.requestRevive());
        document.getElementById('shop-btn').addEventListener('click', () => this.openShop());
        document.getElementById('close-shop').addEventListener('click', () => this.closeShop());

        this.updateUI();
        this.render();
    }

    initStars() {
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random()
            });
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.baseBlockWidth = Math.min(180, this.canvas.width * 0.45);
    }

    getColors(index) {
        const skinColors = this.skins[this.currentSkin] || this.skins.default;
        return skinColors[index % skinColors.length];
    }

    openShop() {
        const shop = document.getElementById('shop-screen');
        shop.classList.remove('hidden');
        this.renderShop();
    }

    closeShop() {
        document.getElementById('shop-screen').classList.add('hidden');
    }

    renderShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        // Skins section
        const skinPrices = { neon: 500, dark: 300, gold: 1000, candy: 400, galaxy: 800, ice: 600, fire: 1500 };

        let html = '<h3>SKINS</h3><div class="shop-grid">';
        for (const [skin, price] of Object.entries(skinPrices)) {
            const owned = this.unlockedSkins.includes(skin);
            const equipped = this.currentSkin === skin;
            html += `
                <div class="shop-item ${equipped ? 'equipped' : ''}" onclick="game.buySkin('${skin}', ${price})">
                    <div class="skin-preview" style="background: linear-gradient(${this.skins[skin][0][0]}, ${this.skins[skin][1][0]})"></div>
                    <p>${skin.toUpperCase()}</p>
                    <p class="price">${owned ? (equipped ? 'EQUIPPED' : 'SELECT') : price + ' coins'}</p>
                </div>
            `;
        }
        html += '</div>';

        // Powerups section
        html += '<h3>POWERUPS</h3><div class="shop-grid">';
        const powerups = [
            { id: 'widerStart', name: 'Wide Start', desc: '+50% width', price: 100 },
            { id: 'slowMotion', name: 'Slow Mo', desc: '50% slower', price: 150 },
            { id: 'doubleCoins', name: '2X Coins', desc: 'Double coins', price: 200 },
            { id: 'shield', name: 'Shield', desc: 'One free miss', price: 250 }
        ];

        for (const p of powerups) {
            html += `
                <div class="shop-item powerup" onclick="game.buyPowerup('${p.id}', ${p.price})">
                    <p class="powerup-name">${p.name}</p>
                    <p class="powerup-desc">${p.desc}</p>
                    <p class="owned">Owned: ${this.powerupCounts[p.id]}</p>
                    <p class="price">${p.price} coins</p>
                </div>
            `;
        }
        html += '</div>';

        container.innerHTML = html;
    }

    buySkin(skin, price) {
        if (this.unlockedSkins.includes(skin)) {
            this.currentSkin = skin;
            this.saveGameData();
            this.renderShop();
            return;
        }

        if (this.coins >= price) {
            this.coins -= price;
            this.unlockedSkins.push(skin);
            this.currentSkin = skin;
            this.saveGameData();
            this.updateUI();
            this.renderShop();
            this.showNotification(`Unlocked ${skin.toUpperCase()} skin!`);
        } else {
            this.showNotification('Not enough coins!');
        }
    }

    buyPowerup(id, price) {
        if (this.coins >= price) {
            this.coins -= price;
            this.powerupCounts[id]++;
            this.saveGameData();
            this.updateUI();
            this.renderShop();
            this.showNotification('Powerup purchased!');
        } else {
            this.showNotification('Not enough coins!');
        }
    }

    showNotification(text) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.blocks = [];
        this.particles = [];
        this.fallingPieces = [];
        this.textPopups = [];
        this.coinPopups = [];
        this.cameraY = 0;
        this.targetCameraY = 0;
        this.canRevive = true;
        this.glowIntensity = 0;
        this.sessionCoins = 0;
        this.hasShield = false;

        // Apply powerups
        this.activePowerups = { widerStart: false, slowMotion: false, doubleCoins: false, shield: false };

        if (this.powerupCounts.widerStart > 0) {
            this.activePowerups.widerStart = true;
            this.powerupCounts.widerStart--;
        }
        if (this.powerupCounts.slowMotion > 0) {
            this.activePowerups.slowMotion = true;
            this.powerupCounts.slowMotion--;
        }
        if (this.powerupCounts.doubleCoins > 0) {
            this.activePowerups.doubleCoins = true;
            this.powerupCounts.doubleCoins--;
        }
        if (this.powerupCounts.shield > 0) {
            this.activePowerups.shield = true;
            this.hasShield = true;
            this.powerupCounts.shield--;
        }

        this.blockSpeed = this.activePowerups.slowMotion ? this.baseSpeed * 0.5 : this.baseSpeed;
        const startWidth = this.activePowerups.widerStart ? this.baseBlockWidth * 1.5 : this.baseBlockWidth;

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');

        const baseBlock = {
            x: (this.canvas.width - startWidth) / 2,
            y: this.canvas.height - 120,
            width: startWidth,
            height: this.blockHeight,
            colors: this.getColors(0),
            settled: true
        };
        this.blocks.push(baseBlock);

        this.createNewBlock();
        this.updateUI();
        this.saveGameData();
    }

    createNewBlock() {
        const lastBlock = this.blocks[this.blocks.length - 1];
        const startFromLeft = Math.random() > 0.5;

        this.currentBlock = {
            x: startFromLeft ? -lastBlock.width : this.canvas.width,
            y: lastBlock.y - this.blockHeight,
            width: lastBlock.width,
            height: this.blockHeight,
            colors: this.getColors(this.blocks.length),
            moving: true
        };

        this.direction = startFromLeft ? 1 : -1;

        // Progressive difficulty - gets HARD
        const baseIncrease = this.activePowerups.slowMotion ? 0.08 : 0.2;
        this.blockSpeed = (this.activePowerups.slowMotion ? this.baseSpeed * 0.5 : this.baseSpeed) +
                          Math.min(this.score * baseIncrease, 10);
    }

    handleTap() {
        if (this.gameState === 'start') {
            this.startGame();
            return;
        }
        if (this.gameState !== 'playing' || !this.currentBlock || !this.currentBlock.moving) return;
        this.dropBlock();
    }

    dropBlock() {
        const current = this.currentBlock;
        const lastBlock = this.blocks[this.blocks.length - 1];
        current.moving = false;

        const overlapStart = Math.max(current.x, lastBlock.x);
        const overlapEnd = Math.min(current.x + current.width, lastBlock.x + lastBlock.width);
        const overlapWidth = overlapEnd - overlapStart;

        // Completely missed
        if (overlapWidth <= 0) {
            if (this.hasShield) {
                this.hasShield = false;
                this.showNotification('Shield saved you!');
                current.x = lastBlock.x;
                current.width = lastBlock.width;
                this.addCoins(1);
                current.settled = true;
                this.blocks.push(current);
                this.createNewBlock();
                return;
            }
            this.createMissParticles(current);
            this.gameOver();
            return;
        }

        const offset = Math.abs(current.x - lastBlock.x);
        const isPerfect = offset <= this.perfectTolerance;

        if (isPerfect) {
            current.x = lastBlock.x;
            current.width = lastBlock.width;
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.totalPerfects++;

            let bonusPoints = 1;
            let coinBonus = 1;
            let message = 'PERFECT!';

            if (this.combo >= 15) {
                bonusPoints = 8; coinBonus = 10; message = 'GODLIKE!!';
                this.screenShake = 20; this.glowIntensity = 1;
            } else if (this.combo >= 10) {
                bonusPoints = 5; coinBonus = 6; message = 'LEGENDARY!';
                this.screenShake = 15; this.glowIntensity = 0.8;
            } else if (this.combo >= 7) {
                bonusPoints = 4; coinBonus = 4; message = 'INSANE!';
                this.screenShake = 12; this.glowIntensity = 0.6;
            } else if (this.combo >= 5) {
                bonusPoints = 3; coinBonus = 3; message = 'AMAZING!';
                this.screenShake = 10; this.glowIntensity = 0.5;
            } else if (this.combo >= 3) {
                bonusPoints = 2; coinBonus = 2; message = 'GREAT!';
                this.screenShake = 8; this.glowIntensity = 0.3;
            } else {
                this.screenShake = 5; this.glowIntensity = 0.2;
            }

            this.score += bonusPoints;
            this.addCoins(coinBonus);
            this.showTextPopup(message, current.x + current.width / 2, current.y, bonusPoints);
            this.createPerfectParticles(current, this.combo);

        } else {
            this.combo = 0;
            this.glowIntensity = 0;

            const cutSide = current.x < lastBlock.x ? 'left' : 'right';
            const cutWidth = current.width - overlapWidth;

            if (cutWidth > 0) {
                this.createFallingPiece(current, cutSide, cutWidth, overlapEnd);
            }

            current.x = overlapStart;
            current.width = overlapWidth;
            this.score++;
            this.addCoins(1);
            this.screenShake = 2;
        }

        current.settled = false;
        current.bounceY = 0;
        current.bounceVel = -8;
        this.blocks.push(current);

        this.updateUI();

        if (current.y < this.canvas.height * 0.5) {
            this.targetCameraY += this.blockHeight;
        }

        // Block too small = game over (HARDER threshold)
        if (current.width < 20) {
            if (this.hasShield) {
                this.hasShield = false;
                this.showNotification('Shield saved you!');
                current.width = 40;
                this.createNewBlock();
                return;
            }
            this.gameOver();
            return;
        }

        this.createNewBlock();
    }

    addCoins(amount) {
        if (this.activePowerups.doubleCoins) amount *= 2;
        this.sessionCoins += amount;
        this.coins += amount;
        this.totalCoinsEarned += amount;

        this.coinPopups.push({
            x: this.canvas.width - 80,
            y: 60,
            amount: amount,
            life: 1
        });
    }

    createFallingPiece(block, side, width, overlapEnd) {
        const piece = {
            x: side === 'left' ? block.x : overlapEnd,
            y: block.y,
            width: width,
            height: this.blockHeight,
            colors: block.colors,
            velocityY: -3,
            velocityX: side === 'left' ? -3 - Math.random() * 2 : 3 + Math.random() * 2,
            rotation: 0,
            rotationSpeed: (side === 'left' ? -1 : 1) * (0.05 + Math.random() * 0.1),
            alpha: 1
        };
        this.fallingPieces.push(piece);

        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: piece.x + piece.width / 2,
                y: piece.y + piece.height / 2,
                velocityX: (side === 'left' ? -1 : 1) * (Math.random() * 5 + 2),
                velocityY: -Math.random() * 6 - 2,
                size: Math.random() * 4 + 2,
                color: block.colors[0],
                life: 1,
                gravity: 0.3
            });
        }
    }

    createPerfectParticles(block, combo) {
        const count = Math.min(30 + combo * 5, 80);
        const centerX = block.x + block.width / 2;
        const centerY = block.y + block.height / 2;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 4 + Math.random() * 4 + combo;

            this.particles.push({
                x: centerX,
                y: centerY,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 2,
                size: Math.random() * 6 + 3,
                color: this.getParticleColor(combo),
                life: 1,
                gravity: 0.15,
                glow: combo >= 5
            });
        }

        // Coin particles
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: centerX + (Math.random() - 0.5) * 50,
                y: centerY,
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: -Math.random() * 5 - 3,
                size: 8,
                color: '#ffd700',
                life: 1.5,
                gravity: 0.2,
                glow: true,
                isCoin: true
            });
        }
    }

    createMissParticles(block) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: block.x + Math.random() * block.width,
                y: block.y + Math.random() * block.height,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: -Math.random() * 5,
                size: Math.random() * 5 + 2,
                color: '#ff4757',
                life: 1,
                gravity: 0.4
            });
        }
    }

    getParticleColor(combo) {
        if (combo >= 15) return '#ff00ff';
        if (combo >= 10) return '#ffd700';
        if (combo >= 7) return '#ff6b6b';
        if (combo >= 5) return '#ff9ff3';
        if (combo >= 3) return '#48dbfb';
        return '#feca57';
    }

    showTextPopup(text, x, y, points) {
        this.textPopups.push({
            text: text,
            points: points > 1 ? `+${points}` : '',
            x: x,
            y: y,
            life: 1,
            velocityY: -2,
            scale: 0
        });

        const perfectText = document.getElementById('perfect-text');
        perfectText.textContent = text;
        perfectText.classList.remove('hidden');
        perfectText.style.animation = 'none';
        perfectText.offsetHeight;
        perfectText.style.animation = 'perfectPop 0.6s ease-out forwards';
        setTimeout(() => perfectText.classList.add('hidden'), 600);
    }

    gameOver() {
        this.gameState = 'gameover';
        this.totalGames++;
        this.gamesPlayed++;
        this.screenShake = 20;

        if (this.currentBlock) {
            this.fallingPieces.push({
                x: this.currentBlock.x,
                y: this.currentBlock.y,
                width: this.currentBlock.width,
                height: this.blockHeight,
                colors: this.currentBlock.colors,
                velocityY: -5,
                velocityX: this.direction * 4,
                rotation: 0,
                rotationSpeed: this.direction * 0.15,
                alpha: 1
            });
            this.currentBlock = null;
        }

        if (this.score > this.highScore) {
            this.highScore = this.score;
        }

        this.checkAchievements();
        this.saveGameData();

        setTimeout(() => {
            document.getElementById('game-ui').classList.add('hidden');
            document.getElementById('gameover-screen').classList.remove('hidden');
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('session-coins').textContent = `+${this.sessionCoins} coins`;
            document.getElementById('gameover-best').textContent = this.highScore;

            const reviveBtn = document.getElementById('revive-btn');
            reviveBtn.style.display = this.canRevive ? 'block' : 'none';

            if (this.gamesPlayed % 3 === 0 && window.AdManager) {
                window.AdManager.showInterstitial();
            }
        }, 800);
    }

    checkAchievements() {
        const checks = [
            { id: 'first_game', cond: this.totalGames >= 1, reward: 50 },
            { id: 'score_25', cond: this.highScore >= 25, reward: 100 },
            { id: 'score_50', cond: this.highScore >= 50, reward: 200 },
            { id: 'score_100', cond: this.highScore >= 100, reward: 500 },
            { id: 'combo_5', cond: this.maxCombo >= 5, reward: 75 },
            { id: 'combo_10', cond: this.maxCombo >= 10, reward: 150 },
            { id: 'combo_15', cond: this.maxCombo >= 15, reward: 300 },
            { id: 'games_10', cond: this.totalGames >= 10, reward: 100 },
            { id: 'games_50', cond: this.totalGames >= 50, reward: 300 },
            { id: 'coins_1000', cond: this.totalCoinsEarned >= 1000, reward: 200 },
            { id: 'perfects_100', cond: this.totalPerfects >= 100, reward: 250 }
        ];

        for (const a of checks) {
            if (a.cond && !this.achievements[a.id]) {
                this.achievements[a.id] = true;
                this.coins += a.reward;
                this.showNotification(`Achievement! +${a.reward} coins`);
            }
        }
    }

    requestRevive() {
        if (window.AdManager) {
            window.AdManager.showRewarded(() => this.revive());
        } else {
            this.revive();
        }
    }

    revive() {
        this.canRevive = false;
        this.gameState = 'playing';
        this.combo = 0;

        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');

        const lastBlock = this.blocks[this.blocks.length - 1];
        lastBlock.width = Math.min(lastBlock.width + 30, this.baseBlockWidth);

        this.createNewBlock();
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('coins-display').textContent = this.coins;
        document.getElementById('best-score').textContent = this.highScore;
    }

    update() {
        this.stars.forEach(star => {
            star.brightness += (Math.random() - 0.5) * 0.1;
            star.brightness = Math.max(0.2, Math.min(1, star.brightness));
        });

        if (this.gameState !== 'playing') {
            this.updateEffects();
            return;
        }

        if (this.currentBlock && this.currentBlock.moving) {
            this.currentBlock.x += this.blockSpeed * this.direction;

            if (this.currentBlock.x + this.currentBlock.width > this.canvas.width) {
                this.direction = -1;
            } else if (this.currentBlock.x < 0) {
                this.direction = 1;
            }
        }

        this.cameraY += (this.targetCameraY - this.cameraY) * 0.08;

        this.blocks.forEach(block => {
            if (!block.settled && block.bounceVel !== undefined) {
                block.bounceY += block.bounceVel;
                block.bounceVel += 1.5;
                if (block.bounceY >= 0) {
                    block.bounceY = 0;
                    block.settled = true;
                }
            }
        });

        this.glowIntensity *= 0.95;
        this.updateEffects();
    }

    updateEffects() {
        this.screenShake *= 0.9;

        this.particles = this.particles.filter(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += p.gravity || 0.25;
            p.velocityX *= 0.99;
            p.life -= 0.025;
            if (!p.isCoin) p.size *= 0.98;
            return p.life > 0 && p.size > 0.5;
        });

        this.fallingPieces = this.fallingPieces.filter(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += 0.6;
            p.rotation += p.rotationSpeed;
            p.alpha -= 0.01;
            return p.y < this.canvas.height + 200 && p.alpha > 0;
        });

        this.textPopups = this.textPopups.filter(t => {
            t.y += t.velocityY;
            t.life -= 0.03;
            t.scale = Math.min(1, t.scale + 0.15);
            return t.life > 0;
        });

        this.coinPopups = this.coinPopups.filter(c => {
            c.y -= 1;
            c.life -= 0.03;
            return c.life > 0;
        });
    }

    render() {
        const ctx = this.ctx;

        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#0f0f23');
        bgGradient.addColorStop(0.5, '#1a1a2e');
        bgGradient.addColorStop(1, '#16213e');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => {
            ctx.globalAlpha = star.brightness * 0.6;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(star.x, (star.y + this.cameraY * star.speed * 0.1) % this.canvas.height, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        ctx.save();
        if (this.screenShake > 0.5) {
            ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
        }

        ctx.save();
        ctx.translate(0, this.cameraY);

        if (this.glowIntensity > 0.05) {
            const lastBlock = this.blocks[this.blocks.length - 1];
            if (lastBlock) {
                const glowGradient = ctx.createRadialGradient(
                    lastBlock.x + lastBlock.width / 2, lastBlock.y, 0,
                    lastBlock.x + lastBlock.width / 2, lastBlock.y, 200
                );
                glowGradient.addColorStop(0, `rgba(255, 215, 0, ${this.glowIntensity * 0.3})`);
                glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.fillRect(0, lastBlock.y - 200, this.canvas.width, 400);
            }
        }

        this.blocks.forEach((block, i) => {
            const offsetY = block.bounceY || 0;
            this.drawBlock(block, block.y + offsetY);
        });

        if (this.currentBlock) {
            this.drawBlock(this.currentBlock, this.currentBlock.y);

            if (this.blocks.length > 0) {
                const lastBlock = this.blocks[this.blocks.length - 1];
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(lastBlock.x, this.currentBlock.y + this.blockHeight);
                ctx.lineTo(lastBlock.x, lastBlock.y);
                ctx.moveTo(lastBlock.x + lastBlock.width, this.currentBlock.y + this.blockHeight);
                ctx.lineTo(lastBlock.x + lastBlock.width, lastBlock.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        this.fallingPieces.forEach(piece => {
            ctx.save();
            ctx.globalAlpha = piece.alpha;
            ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);
            ctx.rotate(piece.rotation);
            this.drawBlockShape(-piece.width / 2, -piece.height / 2, piece.width, piece.height, piece.colors);
            ctx.restore();
        });

        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            if (p.glow) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
            }
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1;

        this.textPopups.forEach(t => {
            ctx.globalAlpha = t.life;
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.scale(t.scale, t.scale);
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffd700';
            ctx.fillText(t.text, 0, 0);
            if (t.points) {
                ctx.font = 'bold 18px Arial';
                ctx.fillStyle = '#ffd700';
                ctx.fillText(t.points, 0, 25);
            }
            ctx.restore();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        ctx.restore();
        ctx.restore();

        // Coin popups
        this.coinPopups.forEach(c => {
            ctx.globalAlpha = c.life;
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'right';
            ctx.fillText(`+${c.amount}`, c.x, c.y);
        });
        ctx.globalAlpha = 1;

        // Combo counter
        if (this.gameState === 'playing' && this.combo >= 2) {
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.combo >= 5 ? '#ffd700' : '#fff';
            ctx.shadowBlur = this.combo >= 5 ? 15 : 5;
            ctx.shadowColor = this.combo >= 5 ? '#ffd700' : '#fff';
            ctx.fillText(`${this.combo}x COMBO`, this.canvas.width / 2, 100);
            ctx.shadowBlur = 0;
        }

        // Shield indicator
        if (this.gameState === 'playing' && this.hasShield) {
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00ff87';
            ctx.fillText('SHIELD ACTIVE', 15, this.canvas.height - 20);
        }

        this.update();
        requestAnimationFrame(() => this.render());
    }

    drawBlock(block, y) {
        this.drawBlockShape(block.x, y, block.width, block.height, block.colors);
    }

    drawBlockShape(x, y, width, height, colors) {
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, width, height, 4);
        ctx.fill();

        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 4);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, width - 4, height * 0.4, 3);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x, y + height - 4, width, 4);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, 3, height);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new StackTower();
});
