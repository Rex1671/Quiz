
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const startButton = document.getElementById('startButton');
const resultContainer = document.getElementById('resultContainer');
const scoreDisplay = document.getElementById('scoreDisplay'); 
const userNameInput = document.getElementById('userName');

let currentQuestionIndex = 0;
let score = 0;
let userName = '';


const loadingQuestion = document.getElementById('loadingQuestion');
const loadingLeaderboard = document.getElementById('loadingLeaderboard');


function showLoading(element) {
    element.style.display = 'block';
  
}

function hideLoading(element) {
    element.style.display = 'none';
}

let quizQuestions = []; 

async function fetchQuizQuestionsFromAPI() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple&encode=url3986');
        const data = await response.json();
        quizQuestions = data.results; 
    } catch (error) {
        console.error('Error fetching quiz questions from API:', error);
    }
}

async function displayNextQuestion() {
    try {
        if (currentQuestionIndex <10) { 
            const questionObj = quizQuestions[currentQuestionIndex];

            const decodedQuestion = decodeURIComponent(questionObj.question);
            const decodedCorrectAnswer = decodeURIComponent(questionObj.correct_answer);
            const decodedIncorrectAnswers = questionObj.incorrect_answers.map(answer => decodeURIComponent(answer));

            questionElement.textContent = `${currentQuestionIndex + 1}. ${decodedQuestion}`;

            optionsElement.innerHTML = '';

            const allOptions = [decodedCorrectAnswer, ...decodedIncorrectAnswers];
            const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

            shuffledOptions.forEach((option) => {
                const button = document.createElement('button');
                button.textContent = option;
                button.addEventListener('click', () => handleAnswer(option, decodedCorrectAnswer));
                optionsElement.appendChild(button);
            });

            currentQuestionIndex++;
        } else {
            displayResult(userName);
        }
    } catch (error) {
        console.error('Error displaying next question:', error);
    }
}



function handleAnswer(selectedOption, correctAnswer) {
    if (selectedOption === correctAnswer) {
        score++;
    }

    scoreDisplay.textContent = `Score: ${score}/10`;

    const buttons = optionsElement.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
        button.style.pointerEvents = 'none';
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = 'gold';
            button.style.color = 'black';
        }
        if (button.textContent === selectedOption) {
            if (selectedOption === correctAnswer) {
                button.style.backgroundColor = 'green';
                button.style.color = 'white';
            } else {
                button.style.backgroundColor = 'red';
                button.style.color = 'white';
            }
        }
    });

    setTimeout(() => {
        displayNextQuestion();
    }, 800);
}

async function displayResult(userName) {
   
    questionElement.style.display = 'none';
    optionsElement.style.display = 'none';

    showLoading(loadingQuestion);
  
    const scoreText = document.createElement('p');
    scoreText.textContent = `Your Total Score: ${score} out of 10`;
    scoreText.style.color="white"
    resultContainer.appendChild(scoreText);

    
    await updateLeaderboard(userName, score);

   
    displayLeaderboard(userName);
    hideLoading(loadingQuestion);
}

async function updateLeaderboard(userName, score) {
    try {
        if (userName && userName.trim() !== '') { 
            const leaderboardRef = database.ref('leaderboard');
            await leaderboardRef.child(userName).set({
                name: userName,
                score: score
            });
        } else {
            console.error('Error updating leaderboard: Invalid userName');
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}
async function displayLeaderboard() {
    resultContainer.style.height = 'auto';
    scoreDisplay.style.display = 'none';

    const leaderboardRef = database.ref('leaderboard');
    leaderboardRef.once('value', function(snapshot) {
      
        const leaderboardData = [];
        snapshot.forEach(function(childSnapshot) {
            leaderboardData.push(childSnapshot.val());
        });

    
        leaderboardData.sort((a, b) => b.score - a.score);

      
        const leaderboardTable = document.createElement('table');
        leaderboardTable.classList.add('leaderboard-table');

        leaderboardData.forEach(function(entry) {
            const entryName = entry.name;
            const entryScore = entry.score;
            const row = leaderboardTable.insertRow(-1); 
            const nameCell = row.insertCell(0);
            const scoreCell = row.insertCell(1);

            nameCell.textContent = entryName;
            scoreCell.textContent = entryScore;
        });

        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry Quiz';
        retryButton.style.color="white"
        retryButton.style.padding="12px"
        retryButton.style.borderRadius= "9px"

        retryButton.style.backgroundColor="#c40084"
        retryButton.addEventListener('click', () => {
            startQuiz();
        });
        const caption = document.createElement('p');
        caption.textContent = 'Leaderboard';
        caption.style.textAlign = 'center';
        caption.style.fontWeight = 'bold';
        caption.style.color = '#fff'; 
        caption.style.fontSize="20px"
        caption.style.marginBottom="10px"
        resultContainer.appendChild(caption);

      resultContainer.appendChild(leaderboardTable);
        resultContainer.appendChild(retryButton);
    });


    const ctx = document.createElement('canvas');
   
    ctx.width = 200;
    
    ctx.height = 200;
    resultContainer.insertBefore(ctx, resultContainer.firstChild);

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Correct', 'Incorrect'],
            datasets: [{
                label: 'Score',
                data: [score, 10 - score],
                backgroundColor: [
                    'green',
                    'red'
                ]
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false
        }
    });
}


async function updateLeaderboard(userName, score) {
    try {
        if (userName && userName.trim() !== '') { 
            const leaderboardRef = database.ref('leaderboard');
            await leaderboardRef.child(userName).set({
                name: userName,
                score: score
            });
        } else {
            console.error('Error updating leaderboard: Invalid userName');
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

async function startQuiz() {
    showLoading(loadingQuestion);
    currentQuestionIndex = 0;
    score = 0;
    scoreDisplay.textContent = 'Score: 0/10'; 
    resultContainer.innerHTML = '';
    questionElement.style.display = 'block';
    optionsElement.style.display = 'block';
    startButton.disabled = true;
    const userNameInput = document.getElementById("userName1");
    userName = userNameInput.value;

    if (quizQuestions.length === 0) {
        await fetchQuizQuestionsFromAPI(); 
    }

    await displayNextQuestion();
    hideLoading(loadingQuestion);
    scoreDisplay.style.display = 'block';
    startButton.style.display = 'none';
    userName1.style.display= 'none';
}

startButton.addEventListener('click', startQuiz);
