// Stack Tower - Expert Edition
// Professional hyper-casual game with satisfying feedback

class StackTower {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.gameState = 'start';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('stackTowerHighScore')) || 0;
        this.canRevive = true;
        this.gamesPlayed = 0;

        // Combo system
        this.combo = 0;
        this.maxCombo = 0;
        this.comboMultiplier = 1;
        this.lastPerfect = false;

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
        this.cameraY = 0;
        this.targetCameraY = 0;
        this.screenShake = 0;
        this.screenShakeDecay = 0.9;
        this.glowIntensity = 0;

        // Background stars
        this.stars = [];
        this.initStars();

        // Colors - beautiful gradient palette
        this.colorSchemes = [
            ['#ff6b6b', '#ee5a5a'],
            ['#ff8e53', '#e67d42'],
            ['#feca57', '#e5b346'],
            ['#48dbfb', '#37caeb'],
            ['#1dd1a1', '#0cc090'],
            ['#5f27cd', '#4e16bc'],
            ['#ff9ff3', '#ee8ee2'],
            ['#54a0ff', '#4390ee'],
            ['#00d2d3', '#00c1c2'],
            ['#ff6b81', '#ee5a70']
        ];

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Input handlers - simple TAP
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleTap();
        });
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTap();
        }, { passive: false });

        // Button handlers
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('retry-btn').addEventListener('click', () => this.startGame());
        document.getElementById('revive-btn').addEventListener('click', () => this.requestRevive());

        this.updateHighScoreDisplay();
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
        return this.colorSchemes[index % this.colorSchemes.length];
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
        this.cameraY = 0;
        this.targetCameraY = 0;
        this.canRevive = true;
        this.blockSpeed = this.baseSpeed;
        this.glowIntensity = 0;

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');

        // Base block
        const baseBlock = {
            x: (this.canvas.width - this.baseBlockWidth) / 2,
            y: this.canvas.height - 120,
            width: this.baseBlockWidth,
            height: this.blockHeight,
            colors: this.getColors(0),
            settled: true,
            scale: 1
        };
        this.blocks.push(baseBlock);

        this.createNewBlock();
        this.updateScoreDisplay();
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
            moving: true,
            scale: 1
        };

        this.direction = startFromLeft ? 1 : -1;

        // Progressive difficulty - speed increases smoothly
        this.blockSpeed = this.baseSpeed + Math.min(this.score * 0.15, 6);
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

        // Calculate overlap
        const overlapStart = Math.max(current.x, lastBlock.x);
        const overlapEnd = Math.min(current.x + current.width, lastBlock.x + lastBlock.width);
        const overlapWidth = overlapEnd - overlapStart;

        // Completely missed
        if (overlapWidth <= 0) {
            this.createMissParticles(current);
            this.gameOver();
            return;
        }

        const offset = Math.abs(current.x - lastBlock.x);
        const isPerfect = offset <= this.perfectTolerance;

        if (isPerfect) {
            // PERFECT STACK
            current.x = lastBlock.x;
            current.width = lastBlock.width;
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.lastPerfect = true;

            // Combo bonuses
            let bonusPoints = 1;
            let message = 'PERFECT!';

            if (this.combo >= 10) {
                bonusPoints = 5;
                message = 'LEGENDARY!';
                this.screenShake = 15;
                this.glowIntensity = 1;
            } else if (this.combo >= 7) {
                bonusPoints = 4;
                message = 'INSANE!';
                this.screenShake = 12;
                this.glowIntensity = 0.8;
            } else if (this.combo >= 5) {
                bonusPoints = 3;
                message = 'AMAZING!';
                this.screenShake = 10;
                this.glowIntensity = 0.6;
            } else if (this.combo >= 3) {
                bonusPoints = 2;
                message = 'GREAT!';
                this.screenShake = 8;
                this.glowIntensity = 0.4;
            } else {
                this.screenShake = 5;
                this.glowIntensity = 0.2;
            }

            this.score += bonusPoints;
            this.showTextPopup(message, current.x + current.width / 2, current.y, bonusPoints);
            this.createPerfectParticles(current, this.combo);

        } else {
            // NOT PERFECT - cut the block
            this.combo = 0;
            this.lastPerfect = false;
            this.glowIntensity = 0;

            const cutSide = current.x < lastBlock.x ? 'left' : 'right';
            const cutWidth = current.width - overlapWidth;

            if (cutWidth > 0) {
                this.createFallingPiece(current, cutSide, cutWidth, overlapEnd);
            }

            current.x = overlapStart;
            current.width = overlapWidth;
            this.score++;

            // Small feedback
            this.screenShake = 2;
        }

        // Add block with bounce animation
        current.settled = false;
        current.bounceY = 0;
        current.bounceVel = -8;
        this.blocks.push(current);

        this.updateScoreDisplay();

        // Camera follows tower
        if (current.y < this.canvas.height * 0.5) {
            this.targetCameraY += this.blockHeight;
        }

        // Block too small = game over
        if (current.width < 15) {
            this.gameOver();
            return;
        }

        this.createNewBlock();
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

        // Debris particles
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
        const count = Math.min(30 + combo * 5, 60);
        const centerX = block.x + block.width / 2;
        const centerY = block.y + block.height / 2;

        // Burst particles
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

        // Sparkle ring
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            this.particles.push({
                x: centerX + Math.cos(angle) * 50,
                y: centerY + Math.sin(angle) * 30,
                velocityX: Math.cos(angle) * 2,
                velocityY: Math.sin(angle) * 2,
                size: 4,
                color: '#fff',
                life: 0.8,
                gravity: 0,
                glow: true
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

        // Also show on UI
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
            localStorage.setItem('stackTowerHighScore', this.highScore);
        }

        setTimeout(() => {
            document.getElementById('game-ui').classList.add('hidden');
            document.getElementById('gameover-screen').classList.remove('hidden');
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('gameover-best').textContent = this.highScore;

            const reviveBtn = document.getElementById('revive-btn');
            reviveBtn.style.display = this.canRevive ? 'block' : 'none';

            if (this.gamesPlayed % 3 === 0 && window.AdManager) {
                window.AdManager.showInterstitial();
            }
        }, 800);
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

        // Bonus width on revive
        const lastBlock = this.blocks[this.blocks.length - 1];
        lastBlock.width = Math.min(lastBlock.width + 30, this.baseBlockWidth);

        this.createNewBlock();
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }

    updateHighScoreDisplay() {
        document.getElementById('best-score').textContent = this.highScore;
    }

    update() {
        // Update stars
        this.stars.forEach(star => {
            star.brightness += (Math.random() - 0.5) * 0.1;
            star.brightness = Math.max(0.2, Math.min(1, star.brightness));
        });

        if (this.gameState !== 'playing') {
            this.updateEffects();
            return;
        }

        // Move current block
        if (this.currentBlock && this.currentBlock.moving) {
            this.currentBlock.x += this.blockSpeed * this.direction;

            if (this.currentBlock.x + this.currentBlock.width > this.canvas.width) {
                this.direction = -1;
            } else if (this.currentBlock.x < 0) {
                this.direction = 1;
            }
        }

        // Smooth camera
        this.cameraY += (this.targetCameraY - this.cameraY) * 0.08;

        // Block settle animation
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

        // Glow decay
        this.glowIntensity *= 0.95;

        this.updateEffects();
    }

    updateEffects() {
        // Screen shake decay
        this.screenShake *= this.screenShakeDecay;

        // Particles
        this.particles = this.particles.filter(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += p.gravity || 0.25;
            p.velocityX *= 0.99;
            p.life -= 0.025;
            p.size *= 0.98;
            return p.life > 0 && p.size > 0.5;
        });

        // Falling pieces
        this.fallingPieces = this.fallingPieces.filter(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += 0.6;
            p.rotation += p.rotationSpeed;
            p.alpha -= 0.01;
            return p.y < this.canvas.height + 200 && p.alpha > 0;
        });

        // Text popups
        this.textPopups = this.textPopups.filter(t => {
            t.y += t.velocityY;
            t.life -= 0.03;
            t.scale = Math.min(1, t.scale + 0.15);
            return t.life > 0;
        });
    }

    render() {
        const ctx = this.ctx;

        // Clear with gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#0f0f23');
        bgGradient.addColorStop(0.5, '#1a1a2e');
        bgGradient.addColorStop(1, '#16213e');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars
        this.stars.forEach(star => {
            ctx.globalAlpha = star.brightness * 0.6;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(star.x, (star.y + this.cameraY * star.speed * 0.1) % this.canvas.height, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Screen shake
        ctx.save();
        if (this.screenShake > 0.5) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }

        // Camera transform
        ctx.save();
        ctx.translate(0, this.cameraY);

        // Combo glow effect
        if (this.glowIntensity > 0.05) {
            const lastBlock = this.blocks[this.blocks.length - 1];
            if (lastBlock) {
                const glowGradient = ctx.createRadialGradient(
                    lastBlock.x + lastBlock.width / 2, lastBlock.y,
                    0,
                    lastBlock.x + lastBlock.width / 2, lastBlock.y,
                    200
                );
                glowGradient.addColorStop(0, `rgba(255, 215, 0, ${this.glowIntensity * 0.3})`);
                glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.fillRect(0, lastBlock.y - 200, this.canvas.width, 400);
            }
        }

        // Draw stacked blocks
        this.blocks.forEach((block, i) => {
            const offsetY = block.bounceY || 0;
            this.drawBlock(block, block.y + offsetY, i);
        });

        // Draw current block
        if (this.currentBlock) {
            this.drawBlock(this.currentBlock, this.currentBlock.y, this.blocks.length);

            // Guide line
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

        // Draw falling pieces
        this.fallingPieces.forEach(piece => {
            ctx.save();
            ctx.globalAlpha = piece.alpha;
            ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);
            ctx.rotate(piece.rotation);
            this.drawBlockShape(-piece.width / 2, -piece.height / 2, piece.width, piece.height, piece.colors);
            ctx.restore();
        });

        // Draw particles
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

        // Draw text popups
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

        ctx.restore(); // Camera
        ctx.restore(); // Shake

        // Draw combo counter
        if (this.gameState === 'playing' && this.combo >= 2) {
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.combo >= 5 ? '#ffd700' : '#fff';
            ctx.shadowBlur = this.combo >= 5 ? 15 : 5;
            ctx.shadowColor = this.combo >= 5 ? '#ffd700' : '#fff';
            ctx.fillText(`${this.combo}x COMBO`, this.canvas.width / 2, 100);
            ctx.shadowBlur = 0;
        }

        this.update();
        requestAnimationFrame(() => this.render());
    }

    drawBlock(block, y, index) {
        this.drawBlockShape(block.x, y, block.width, block.height, block.colors);
    }

    drawBlockShape(x, y, width, height, colors) {
        const ctx = this.ctx;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, width, height, 4);
        ctx.fill();

        // Main block gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 4);
        ctx.fill();

        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, width - 4, height * 0.4, 3);
        ctx.fill();

        // Bottom edge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x, y + height - 4, width, 4);

        // Side shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, 3, height);
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.game = new StackTower();
});
