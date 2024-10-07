const questionsQuiz2 = [
    {
        question: "1.What elements primarilasdasdadsy cause nutrient pollution?",
        answers: [
            { text: "Nitrogen and Phosphorus", correct: true },
            { text: "Iron and Zinc", correct: false },
            { text: "Carbon and Oxygen", correct: false },
        ]
    },
    {
        question: "Which product usage can increase nutrient pollution?",
        answers: [
            { text: "Phosphorus-containing detergent", correct: true },
            { text: "Phosphate-free detergent", correct: false },
            { text: "Organic fertilizer", correct: false },
        ]
    },
    {
        question: "How does nutrient pollution affect outdoor activities?",
        answers: [
            { text: "Leads to excessive algae growth, affecting water quality", correct: true },
            { text: "Increases water temperature, suitable for more activities", correct: false },
            { text: "Enhances water clarity", correct: false },
        ]
    }
];

let currentQuestionIndexQuiz2 = 0;
let scoreQuiz2 = 0;
const totalQuestionsQuiz2 = questionsQuiz2.length;

function startQuiz2() {
    currentQuestionIndexQuiz2 = 0;
    scoreQuiz2 = 0;
    document.getElementById("progress-quiz2").value = 0; // Initialize progress bar
    showQuestionQuiz2();
}

function showQuestionQuiz2() {
    resetStateQuiz2();
    const questionElement = document.querySelector(`#question-quiz2-${currentQuestionIndexQuiz2 + 1}`);
    questionElement.style.display = 'block';
    const questionText = questionElement.querySelector("p");
    questionText.innerText = questionsQuiz2[currentQuestionIndexQuiz2].question;
    const optionContainer = questionElement.querySelector("#option-container-quiz2");
    questionsQuiz2[currentQuestionIndexQuiz2].answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer.text;
        button.classList.add("btn");
        optionContainer.appendChild(button);
        button.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") {
                selectAnswerQuiz2(answer);
                if (answer.correct) {
                    e.target.classList.add('correct');
                } else {
                    e.target.classList.add('incorrect');
                }
            }
        });
    });

    const progress = (currentQuestionIndexQuiz2 + 1) / totalQuestionsQuiz2 * 100;
    document.getElementById("progress-quiz2").value = progress;
    document.getElementById("progress-text-quiz2").innerText = `Question ${currentQuestionIndexQuiz2 + 1} of ${totalQuestionsQuiz2}`;

    const nextButton = questionElement.querySelector("#next-option-quiz2");
    nextButton.style.display = "none";
    nextButton.addEventListener('click', () => {
        currentQuestionIndexQuiz2 += 1;
        if (currentQuestionIndexQuiz2 < questionsQuiz2.length) {
            questionElement.style.display = 'none';
            showQuestionQuiz2();
        } else {
            showResultQuiz2();
        }
    });
}

function selectAnswerQuiz2(answer) {
    if (answer.correct) {
        scoreQuiz2++;
    }
    const questionElement = document.querySelector(`#question-quiz2-${currentQuestionIndexQuiz2 + 1}`);
    const nextButton = questionElement.querySelector("#next-option-quiz2");
    nextButton.style.display = "block";
}

function showResultQuiz2() {
    const resultElement = document.querySelector("#result-quiz2");
    if (scoreQuiz2 === 3) {
        resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz2} out of 3</p></h3><br/><img src="../static/quiz1.jpg"></td><td><span class="excellent-work">Excellent work!</span></td></tr></table><br/><button id="restart-button-quiz2">Restart</button>`;
    }
    if (scoreQuiz2 < 3 && scoreQuiz2 > 0) {
        resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz2} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="great-effort">Great effort!</span></td></tr></table><br/><button id="restart-button-quiz2">Restart</button>`;
    }
    if (scoreQuiz2 === 0) {
        resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz2} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="bad-work">Bad work!</span></td></tr></table><br/><button id="restart-button-quiz2">Restart</button>`;
    }
    const restart = document.querySelector('#restart-button-quiz2');
    restart.addEventListener('click', () => {
        location.reload();
    });
    resultElement.style.display = 'block';
    gameQuiz2.style.display = 'none';
}

function resetStateQuiz2() {
    const allQuestions = document.querySelectorAll(".question-quiz2");
    allQuestions.forEach(q => q.style.display = 'none');
    document.getElementById("progress-quiz2").value = 100;
}

startQuiz2();