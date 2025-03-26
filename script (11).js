document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const splashScreen = document.getElementById('splash-screen');
    const splashText = document.getElementById('splash-text');
    const gameContainer = document.getElementById('game-container');
    const nameInputScreen = document.getElementById('name-input-screen');
    const gameScreen = document.getElementById('game-screen');
    const scoreboardScreen = document.getElementById('scoreboard-screen');
    const playerNameInput = document.getElementById('player-name');
    const startGameBtn = document.getElementById('start-game-btn');
    const currentPlayerSpan = document.getElementById('current-player');
    const currentLevelSpan = document.getElementById('current-level');
    const currentScoreSpan = document.getElementById('current-score');
    const numberDisplay = document.getElementById('number-display');
    const userInput = document.getElementById('user-input');
    const submitBtn = document.getElementById('submit-btn');
    const feedback = document.getElementById('feedback');
    const scoreboardBtn = document.getElementById('scoreboard-btn');
    const backToGameBtn = document.getElementById('back-to-game-btn');
    const scoreboardTable = document.getElementById('scoreboard-table').querySelector('tbody');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    // Game Variables
    let playerName = '';
    let currentNumber = '';
    let currentLevel = 1;
    let score = 0;
    let gameStartTime = 0;
    let gameActive = false;
    let displayTimeout = null;

    // Initialize splash screen sequence
    setTimeout(() => {
        splashText.textContent = "Loading.....";
    }, 500);

    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            gameContainer.classList.remove('hidden');
        }, 500);
    }, 1000);

    // Initialize local storage for scores if not exists
    if (!localStorage.getItem('memoryGameScores')) {
        localStorage.setItem('memoryGameScores', JSON.stringify([]));
    }

    // Event Listeners
    startGameBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    scoreboardBtn.addEventListener('click', showScoreboard);
    backToGameBtn.addEventListener('click', () => {
        scoreboardScreen.classList.add('hidden');
        if (gameActive) {
            gameScreen.classList.remove('hidden');
        } else {
            nameInputScreen.classList.remove('hidden');
        }
    });

    // Game Functions
    function startGame() {
        playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }

        currentPlayerSpan.textContent = playerName;
        nameInputScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameActive = true;
        gameStartTime = Date.now();
        startRound();
    }

    function startRound() {
        currentNumber = generateNumber(currentLevel);
        numberDisplay.textContent = currentNumber;
        userInput.value = '';
        userInput.disabled = true;
        submitBtn.disabled = true;
        feedback.textContent = '';

        if (displayTimeout) clearTimeout(displayTimeout);
        displayTimeout = setTimeout(() => {
            numberDisplay.textContent = '';
            userInput.disabled = false;
            submitBtn.disabled = false;
            userInput.focus();
        }, 1000);
    }

    function generateNumber(digits) {
        let number = '';
        for (let i = 0; i < digits; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
    }

    function checkAnswer() {
        if (!gameActive) return;

        const userAnswer = userInput.value.trim();
        if (userAnswer === currentNumber) {
            // Correct answer
            feedback.textContent = 'Correct!';
            feedback.style.color = '#00ff00';
            correctSound.currentTime = 0;
            correctSound.play();
            score += currentLevel;
            currentScoreSpan.textContent = score;
            currentLevel++;
            currentLevelSpan.textContent = currentLevel;
            startRound();
        } else {
            // Wrong answer
            feedback.textContent = 'Wrong! The number was: ' + currentNumber;
            feedback.style.color = '#ff0000';
            wrongSound.currentTime = 0;
            wrongSound.play();
            endGame();
        }
    }

    function endGame() {
        gameActive = false;
        userInput.disabled = true;
        submitBtn.disabled = true;
        
        const duration = Math.floor((Date.now() - gameStartTime) / 1000);
        saveScore(playerName, currentLevel - 1, duration);
        
        setTimeout(() => {
            if (confirm(`Game Over! Your score: ${currentLevel - 1} digits\nPlay again?`)) {
                resetGame();
            }
        }, 1000);
    }

    function resetGame() {
        currentLevel = 1;
        score = 0;
        currentLevelSpan.textContent = currentLevel;
        currentScoreSpan.textContent = score;
        gameScreen.classList.add('hidden');
        nameInputScreen.classList.remove('hidden');
        playerNameInput.focus();
    }

    function saveScore(name, score, duration) {
        const scores = JSON.parse(localStorage.getItem('memoryGameScores'));
        scores.push({ name, score, duration, date: new Date().toISOString() });
        
        // Sort by score (descending) and keep only top 10
        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, 10);
        
        localStorage.setItem('memoryGameScores', JSON.stringify(topScores));
    }

    function showScoreboard() {
        gameScreen.classList.add('hidden');
        nameInputScreen.classList.add('hidden');
        scoreboardScreen.classList.remove('hidden');
        
        // Load and display scores
        const scores = JSON.parse(localStorage.getItem('memoryGameScores'));
        scoreboardTable.innerHTML = '';
        
        if (scores.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4">No scores yet</td>';
            scoreboardTable.appendChild(row);
        } else {
            scores.forEach((score, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${score.name}</td>
                    <td>${score.score} digits</td>
                    <td>${score.duration}s</td>
                `;
                scoreboardTable.appendChild(row);
            });
        }
    }
});