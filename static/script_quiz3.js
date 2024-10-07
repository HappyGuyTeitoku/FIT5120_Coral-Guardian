const questionsQuiz3 = [
    {
        question: "1.What elements primaraaaaily cause nutrient pollution?",
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

let currentQuestionIndexQuiz3 = 0;
let scoreQuiz3 = 0;
const totalQuestionsQuiz3 = questionsQuiz3.length;

function startQuiz3() {
    currentQuestionIndexQuiz3 = 0;
    scoreQuiz3 = 0;
    document.getElementById("progress-quiz3").value = 0; // Initialize progress bar
    showQuestionQuiz3();
}

function showQuestionQuiz3() {
    resetStateQuiz3();
    const questionElement = document.querySelector(`#question-quiz3-${currentQuestionIndexQuiz3 + 1}`);
    questionElement.style.display = 'block';
    const questionText = questionElement.querySelector("p");
    questionText.innerText = questionsQuiz3[currentQuestionIndexQuiz3].question;
    const optionContainer = questionElement.querySelector("#option-container-quiz3");
    questionsQuiz3[currentQuestionIndexQuiz3].answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer.text;
        button.classList.add("btn");
        optionContainer.appendChild(button);
        button.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") {
                selectAnswerQuiz3(answer);
                if (answer.correct) {
                    e.target.classList.add('correct');
                } else {
                    e.target.classList.add('incorrect');
                }
            }
        });
    });

    const progress = (currentQuestionIndexQuiz3 + 1) / totalQuestionsQuiz3 * 100;
    document.getElementById("progress-quiz3").value = progress;
    document.getElementById("progress-text-quiz3").innerText = `Question ${currentQuestionIndexQuiz3 + 1} of ${totalQuestionsQuiz3}`;

    const nextButton = questionElement.querySelector("#next-option-quiz3");
    nextButton.style.display = "none";
    nextButton.addEventListener('click', () => {
        currentQuestionIndexQuiz3 += 1;
        if (currentQuestionIndexQuiz3 < questionsQuiz3.length) {
            questionElement.style.display = 'none';
            showQuestionQuiz3();
        } else {
            showResultQuiz3();
        }
    });
}

function selectAnswerQuiz3(answer) {
    if (answer.correct) {
        scoreQuiz3++;
    }
    const questionElement = document.querySelector(`#question-quiz3-${currentQuestionIndexQuiz3 + 1}`);
    const nextButton = questionElement.querySelector("#next-option-quiz3");
    nextButton.style.display = "block";
}

function showResultQuiz3() {
    const resultElement = document.querySelector("#result-quiz3");
    if (scoreQuiz3 === 3) {
        resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz3} out of 3</p></h3><br/><img src="../static/quiz1.jpg"></td><td><span class="excellent-work">Excellent work!</span></td></tr></table><br/><button id="restart-button-quiz3">Restart</button>`;
    }
    if (scoreQuiz3 < 3 && scoreQuiz3 > 0) {
        resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz3} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="great-effort">Great effort!</span></td></tr></table><br/><button id="restart-button-quiz3">Restart</button>`;
    }
    if (scoreQuiz3 === 0) {
        resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz3} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="bad-work">Bad work!</span></td></tr></table><br/><button id="restart-button-quiz3">Restart</button>`;
    }
    const restart = document.querySelector('#restart-button-quiz3');
    restart.addEventListener('click', () => {
        location.reload();
    });
    resultElement.style.display = 'block';
    gameQuiz3.style.display = 'none';
}

function resetStateQuiz3() {
    const allQuestions = document.querySelectorAll(".question-quiz3");
    allQuestions.forEach(q => q.style.display = 'none');
    document.getElementById("progress-quiz3").value = 100;
}

startQuiz3();