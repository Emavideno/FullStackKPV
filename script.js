const LEVELS = {
    1: {
        description: "Сложение двух однозначных чисел (1-9)",
        generator: () => {
            const num1 = Math.floor(Math.random() * 9) + 1;
            const num2 = Math.floor(Math.random() * 9) + 1;
            return {
                problemText: `${num1} + ${num2}`,
                correctAnswer: num1 + num2,
            };
        }
    },
    2: {
        description: "Сложение двух двухзначных чисел (10-99)",
        generator: () => {
            const num1 = Math.floor(Math.random() * 90) + 10;
            const num2 = Math.floor(Math.random() * 90) + 10;
            return {
                problemText: `${num1} + ${num2}`,
                correctAnswer: num1 + num2,
            };
        }
    },
    3: {
        description: "Сложение трёх двухзначных чисел (10-99)",
        generator: () => {
            const num1 = Math.floor(Math.random() * 90) + 10;
            const num2 = Math.floor(Math.random() * 90) + 10;
            const num3 = Math.floor(Math.random() * 90) + 10;
            return {
                problemText: `${num1} + ${num2} + ${num3}`,
                correctAnswer: num1 + num2 + num3,
            };
        }
    },
    4: {
        description: "Умножение (10-99 * 1-9) и сложение с трёхзначным (100-999)",
        generator: () => {
            const numA = Math.floor(Math.random() * 90) + 10;
            const numB = Math.floor(Math.random() * 9) + 1;
            const numC = Math.floor(Math.random() * 900) + 100;
            const result = (numA * numB) + numC;
            return {
                problemText: `(${numA} * ${numB}) + ${numC}`,
                correctAnswer: result,
            };
        }
    }
};

let currentLevel = null;
let currentProblem = {};
let currentScore = 0;
const HIGH_SCORE_KEY = 'mathGameHighScore'; 

const problemDisplay = document.getElementById('current-problem');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer-btn');
const feedbackMessage = document.getElementById('feedback-message');
const scoreDisplay = document.getElementById('current-score');
const highScoreDisplay = document.getElementById('high-score');
const levelSelectionDiv = document.getElementById('level-selection');

function updateScoreUI() {
    scoreDisplay.textContent = currentScore;
    highScoreDisplay.textContent = getHighScore();
}

function getHighScore() {
    const highScore = localStorage.getItem(HIGH_SCORE_KEY);
    return highScore ? parseInt(highScore) : 0; 
}

function saveHighScore(score) {
    if (score > getHighScore()) {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
        feedbackMessage.textContent = 'НОВЫЙ РЕКОРД! Сохранено.'; 
    }
}

async function sendScoreToServer(score, level) {
    const dataToSend = {
        userName: 'Player_JS',
        score: score,
        level: level,
        timestamp: new Date().toISOString()
    };
    
    const imaginaryServerURL = 'https://non-existent-server-for-project.com/api/scores';
    
    try {
        const response = await fetch(imaginaryServerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });
        
        if (response.ok) {
            const responseData = await response.json();
            console.log('Имитация: Данные успешно отправлены (статус 200). Ответ сервера:', responseData);
        } else {
            console.warn('Имитация: Сервер вернул ошибку, но запрос был выполнен. Статус:', response.status);
        }
        
    } catch (error) {
        console.error('Асинхронная операция выполнена (POST-запрос): Ошибка сети, сервер недоступен.', error.message);
        console.log('Данные, которые пытались отправить:', dataToSend);
    }
}

function generateAndDisplayProblem() {
    if (!currentLevel) return;

    const levelData = LEVELS[currentLevel];
    currentProblem = levelData.generator();
    problemDisplay.textContent = currentProblem.problemText;
    
    answerInput.value = ''; 
    answerInput.disabled = false;
    submitButton.disabled = false;
    answerInput.focus();
    feedbackMessage.textContent = `Уровень ${currentLevel}: ${levelData.description}`;
}

function handleSubmitAnswer() {
    const userAnswer = parseInt(answerInput.value.trim());

    if (isNaN(userAnswer)) {
        feedbackMessage.textContent = 'Введите корректное число!';
        return;
    }

    if (userAnswer === currentProblem.correctAnswer) {
        currentScore++;
        feedbackMessage.textContent = 'Правильно! Продолжайте.';
        
        if (currentScore > getHighScore()) {
            saveHighScore(currentScore);
            sendScoreToServer(currentScore, currentLevel); 
        }

        updateScoreUI();
        setTimeout(generateAndDisplayProblem, 1000); 

    } else {
        feedbackMessage.textContent = `Неправильно. Ответ: ${currentProblem.correctAnswer}. Счет сброшен.`;
        currentScore = 0; 

        answerInput.disabled = true;
        submitButton.disabled = true;

        updateScoreUI();
        setTimeout(() => {
            generateAndDisplayProblem();
            feedbackMessage.textContent = 'Новая попытка! Удачи.';
        }, 2000);
    }
}

function handleLevelSelection(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON' && target.dataset.level) {
        const newLevel = parseInt(target.dataset.level);
        
        if (newLevel !== currentLevel) {
            currentLevel = newLevel;
            currentScore = 0;
            
            Array.from(levelSelectionDiv.children).forEach(btn => {
                btn.classList.remove('active-level');
            });
            target.classList.add('active-level');
            
            updateScoreUI();
            generateAndDisplayProblem();
        }
    }
}

submitButton.addEventListener('click', handleSubmitAnswer); 
levelSelectionDiv.addEventListener('click', handleLevelSelection);
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !submitButton.disabled) {
        handleSubmitAnswer();
    }
});

function initializeGame() {
    updateScoreUI();
    problemDisplay.textContent = "Выберите уровень сложности, чтобы начать!";
}

initializeGame();