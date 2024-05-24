document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const startScreen = document.getElementById("startScreen");
    const endScreen = document.getElementById("endScreen");
    const scoreDisplay = document.getElementById("score");
    const highscoreDisplay = document.getElementById("highscore");
    const finalScoreDisplay = document.getElementById("finalScore");
    const finalMultiplierDisplay = document.getElementById("finalMultiplier");
    const multiplierDisplay = document.getElementById("multiplier");
    canvas.width = 400;
    canvas.height = 600;

    let frameCount = 0;
    let score = 0;
    let highscore = 0;
    let multiplier = 1;
    let gameSpeed = 2;
    let gameStarted = false;
    let gameOver = false;
    let platforms = [];
    let orbs = [];
    let obstacles = [];
    let particles = [];
    let stars = [];
    let planets = [];
    let galaxies = [];

    let isSliding = false;

    const player = { x: 200, y: 300, width: 20, height: 20, dy: 0, gravity: 0.6, lift: -10 };

    const platformWidth = 80;
    const platformHeight = 10;

    const backgroundMusic = new Audio('synthwave.mp3');
    const jumpSound = new Audio('jump.mp3');
    const collectSound = new Audio('collect.mp3');
    const slidingSound = new Audio('sliding.mp3');
    const landSound = new Audio('land.mp3');
    const gameoverSound = new Audio('gameover.mp3');

    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.color = color;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.size *= 0.95;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Star {
        constructor(x, y, size, speed) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speed = speed;
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0) this.x = canvas.width;
        }
        draw() {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Planet {
        constructor(x, y, size, color, speed) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.speed = speed;
        }
        update() {
            this.x -= this.speed;
            if (this.x < -this.size) this.x = canvas.width + this.size;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Galaxy {
        constructor(x, y, size, color, speed) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.speed = speed;
        }
        update() {
            this.x -= this.speed;
            if (this.x < -this.size) this.x = canvas.width + this.size;
        }
        draw() {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function createStars() {
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2;
            const speed = Math.random() * 0.5;
            stars.push(new Star(x, y, size, speed));
        }
    }

    function createPlanets() {
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 20 + 10;
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            const speed = Math.random() * 0.3;
            planets.push(new Planet(x, y, size, color, speed));
        }
    }

    function createGalaxies() {
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 30 + 20;
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            const speed = Math.random() * 0.2;
            galaxies.push(new Galaxy(x, y, size, color, speed));
        }
    }

    function drawBackground() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        planets.forEach(planet => {
            planet.update();
            planet.draw();
        });

        galaxies.forEach(galaxy => {
            galaxy.update();
            galaxy.draw();
        });
    }

    function handleParticles() {
        particles.forEach((particle, index) => {
            particle.update();
            particle.draw();
            if (particle.size <= 0.5) {
                particles.splice(index, 1);
            }
        });
    }

    function drawPlayer() {
        ctx.fillStyle = `hsl(${frameCount % 360}, 100%, 50%)`;
        ctx.shadowColor = `hsl(${frameCount % 360}, 100%, 50%)`;
        ctx.shadowBlur = 20;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.shadowBlur = 0;
    }

    function createPlatform() {
        const y = Math.random() * (canvas.height - 100) + 50;
        platforms.push({ x: canvas.width, y: y, width: platformWidth, height: platformHeight, direction: Math.random() > 0.5 ? 1 : -1 });
    }

    function drawPlatforms() {
        platforms.forEach(platform => {
            const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x + platform.width, platform.y + platform.height);
            gradient.addColorStop(0, `hsl(${frameCount % 360}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${(frameCount + 180) % 360}, 100%, 50%)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Add glowing effect
            ctx.shadowColor = `hsl(${frameCount % 360}, 100%, 50%)`;
            ctx.shadowBlur = 20;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.shadowBlur = 0;
        });
    }

    function updatePlatforms() {
        platforms.forEach(platform => {
            platform.x -= gameSpeed;
            platform.y += platform.direction * 0.5; // Slight vertical movement
            if (platform.y <= 50 || platform.y >= canvas.height - 100) platform.direction *= -1; // Change direction if it hits bounds
        });

        if (platforms.length > 0 && platforms[0].x + platformWidth < 0) {
            platforms.shift();
        }

        if (frameCount % 100 === 0) {
            createPlatform();
        }
    }

    function createOrb() {
        const y = Math.random() * (canvas.height - 100) + 50;
        orbs.push({ x: canvas.width, y: y, radius: 10 });
    }

    function drawOrbs() {
        orbs.forEach(orb => {
            ctx.fillStyle = `hsl(${(frameCount + 90) % 360}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fill();

            // Add glowing effect
            ctx.shadowColor = `hsl(${(frameCount + 90) % 360}, 100%, 50%)`;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    function updateOrbs() {
        orbs.forEach(orb => {
            orb.x -= gameSpeed;
        });

        if (orbs.length > 0 && orbs[0].x + orbs[0].radius < 0) {
            orbs.shift();
        }

        if (frameCount % 200 === 0) {
            createOrb();
        }
    }

    function createObstacle() {
        const y = Math.random() * (canvas.height - 100) + 50;
        obstacles.push({ x: canvas.width, y: y, width: 30, height: 30 });
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = `hsl(${(frameCount + 180) % 360}, 100%, 50%)`;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // Add glowing effect
            ctx.shadowColor = `hsl(${(frameCount + 180) % 360}, 100%, 50%)`;
            ctx.shadowBlur = 20;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.shadowBlur = 0;
        });
    }

    function updateObstacles() {
        obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed + 1;
        });

        if (obstacles.length > 0 && obstacles[0].x + obstacles[0].width < 0) {
            obstacles.shift();
        }

        if (frameCount % 300 === 0) {
            createObstacle();
        }
    }

    function checkCollision() {
        let onPlatform = false;

        platforms.forEach(platform => {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height &&
                player.dy >= 0) {
                player.y = platform.y - player.height;
                player.dy = 0;
                onPlatform = true;
                score += 1;
                updateScore();
                landSound.play();
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(player.x + player.width / 2, player.y + player.height, `hsl(${frameCount % 360}, 100%, 50%)`));
                }
            }
        });

        if (onPlatform && !isSliding) {
            slidingSound.loop = true;
            slidingSound.play();
            isSliding = true;
        } else if (!onPlatform && isSliding) {
            slidingSound.pause();
            isSliding = false;
        }

        orbs.forEach((orb, index) => {
            const dx = player.x - orb.x;
            const dy = player.y - orb.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < player.width / 2 + orb.radius) {
                multiplier += 1;
                collectSound.play();
                orbs.splice(index, 1);
                updateScore();
            }
        });

        obstacles.forEach(obstacle => {
            if (player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y) {
                gameOver = true;
                gameoverSound.play();
                endGame();
            }
        });
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        multiplierDisplay.textContent = `Multiplier: x${multiplier}`;
        if (score > highscore) {
            highscore = score;
            highscoreDisplay.textContent = `Highscore: ${highscore}`;
        }
    }

    function drawScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        multiplierDisplay.textContent = `Multiplier: x${multiplier}`;
        highscoreDisplay.textContent = `Highscore: ${highscore}`;
    }

    function updatePlayer() {
        player.dy += player.gravity;
        player.y += player.dy;

        if (player.y + player.height > canvas.height) {
            gameOver = true;
            gameoverSound.play();
            endGame();
        }

        if (player.y < 0) {
            player.y = 0;
            player.dy = 0;
        }
    }

    function endGame() {
        gameStarted = false;
        platforms = [];
        orbs = [];
        obstacles = [];
        particles = [];
        stars = [];
        planets = [];
        galaxies = [];
        frameCount = 0;
        gameSpeed = 2;
        slidingSound.pause();
        isSliding = false;
        let finalScore = score * multiplier;
        finalScoreDisplay.textContent = `Final Score: ${finalScore}`;
        finalMultiplierDisplay.textContent = `Multiplier: x${multiplier}`;
        
        if (finalScore > highscore) {
            highscore = finalScore;
            highscoreDisplay.textContent = `Highscore: ${highscore}`;
        }

        endScreen.style.display = 'block';
    }

    function resetGame() {
        player.y = 300;
        player.dy = 0;
        score = 0;
        multiplier = 1;
        gameSpeed = 2;
        gameOver = false;
        gameStarted = true;
        endScreen.style.display = 'none';
        createStars();
        createPlanets();
        createGalaxies();
        drawScore();
        gameLoop();
    }

    function gameLoop() {
        if (!gameStarted) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground(); // Draw moving background
        handleParticles();
        drawPlayer();
        drawPlatforms();
        drawOrbs();
        drawObstacles();

        updatePlayer();
        updatePlatforms();
        updateOrbs();
        updateObstacles();
        checkCollision();

        frameCount++;
        gameSpeed += 0.0005;

        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    document.addEventListener("keydown", function(event) {
        if (event.code === "Space") {
            if (!gameStarted && !gameOver) {
                gameStarted = true;
                startScreen.style.display = 'none';
                if (backgroundMusic.paused) {
                    backgroundMusic.play().catch(error => {
                        console.log('Error playing background music:', error);
                    });
                }
                resetGame();
            } else if (gameOver) {
                resetGame();
            } else {
                player.dy = player.lift;
                jumpSound.play();
            }
        }
    });

    drawScore();
});

