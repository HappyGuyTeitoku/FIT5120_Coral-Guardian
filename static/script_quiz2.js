const questionsQuiz2 = [
    {
        question: "1.What elements primarily cause nutrient pollution?",
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

function showQuestionQuiz2() { // 修改函數名稱
    resetStateQuiz2(); // 修改函數名稱
    const questionElementQuiz2 = document.querySelector(`#question2-quiz2-${currentQuestionIndexQuiz2 + 1}`); // 使用动态 ID，添加 quiz2
    questionElementQuiz2.style.display = 'block'; // 显示当前问题
    const questionTextQuiz2 = questionElementQuiz2.querySelector("p"); // 修改變量名稱
    questionTextQuiz2.innerText = questionsQuiz2[currentQuestionIndexQuiz2].question; // 修改變量名稱
    const optionContainerQuiz2 = questionElementQuiz2.querySelector(`#option-container-quiz2-${currentQuestionIndexQuiz2 + 1}`);
 // 获取选项容器，添加 quiz2
    
    questionsQuiz2[currentQuestionIndexQuiz2].answers.forEach(answer => {
        const buttonQuiz2 = document.createElement("button"); // 修改變量名稱
        buttonQuiz2.innerText = answer.text;
        buttonQuiz2.classList.add("btn");
       
        optionContainerQuiz2.appendChild(buttonQuiz2); // 添加选项按钮
        buttonQuiz2.addEventListener("click", (e) => {
          console.log(e)
          if (e.target.tagName === "BUTTON") {
              selectAnswerQuiz2(answer); // 修改函數名稱
              if (answer.correct) {
                  e.target.classList.add('correct');
              } else {
                  e.target.classList.add('incorrect');
              }
          }
        });
    });
}

    const progressQuiz2 = (currentQuestionIndexQuiz2 + 1) / totalQuestionsQuiz2 * 100;
    document.getElementById("progress-quiz2").value = progressQuiz2;
    document.getElementById("progress-text-quiz2").innerText = `Questionquiz2 ${currentQuestionIndexQuiz2 + 1} of ${totalQuestionsQuiz2}`;

    const nextButtonQuiz2 = questionElementQuiz2.querySelector("#next-option-quiz2");
    nextButtonQuiz2.style.display = "none";
    nextButtonQuiz2.addEventListener('click', () => {
        currentQuestionIndexQuiz2 += 1;
        if (currentQuestionIndexQuiz2 < questionsQuiz2.length) {
            questionElementQuiz2.style.display = 'none';
            showQuestionQuiz2();
        } else {
            showResultQuiz2();
        }
    });


function selectAnswerQuiz2(answer) {
    if (answer.correct) {
        scoreQuiz2++;
    }
    const questionElementQuiz2 = document.querySelector(`#question2-quiz2-${currentQuestionIndexQuiz2 + 1}`);
    const nextButtonQuiz2 = questionElementQuiz2.querySelector("#next-option-quiz2");
    nextButtonQuiz2.style.display = "block";
}

function showResultQuiz2() {
    const resultElementQuiz2 = document.querySelector("#result-quiz2");
    if (scoreQuiz2 === 3) {
        resultElementQuiz2.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz2} out of 3</p></h3><br/><img src="../static/quiz1.jpg"></td><td><span class="excellent-work">Excellent work!</span></td></tr></table><br/><button id="restart-button-quiz2">Restart</button>`;
    }
    if (scoreQuiz2 < 3 && scoreQuiz2 > 0) {
        resultElementQuiz2.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz2} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="great-effort">Great effort!</span></td></tr></table><br/><button id="restart-button-quiz2">Restart</button>`;
    }
    if (scoreQuiz2 === 0) {
        resultElementQuiz2.innerHTML = `<table><tr><td><h3>You Scored <p>${scoreQuiz2} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="bad-work">Bad work!</span></td></tr></table><br/><button id="restart-button-quiz2">Restart</button>`;
    }
    const restartQuiz2 = document.querySelector('#restart-button-quiz2');
    restartQuiz2.addEventListener('click', () => {
        location.reload();
    });
    resultElementQuiz2.style.display = 'block';
    document.querySelector('.game-quiz2').style.display = 'none';
}

function resetStateQuiz2() {
    const allQuestionsQuiz2 = document.querySelectorAll(".question-quiz2");
    allQuestionsQuiz2.forEach(q => q.style.display = 'none');
    document.getElementById("progress-quiz2").value = 100;
}

startQuiz2();