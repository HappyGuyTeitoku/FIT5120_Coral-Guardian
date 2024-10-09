


const questions = [
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
        { text: " Phosphorus-containing detergent", correct: true },
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
  
  let currentQuestionIndex = 0;
  let score = 0;
  const totalQuestions = questions.length;


  
  
  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById("progress").value = 0; // 初始化进度条
    showQuestion();
  }
  
  
  function showQuestion() {
    resetState();
    const questionElement = document.querySelector(`#question-${currentQuestionIndex + 1}`); // 使用动态 ID
    questionElement.style.display = 'block'; // 显示当前问题
    const questionText = questionElement.querySelector("p");
    questionText.innerText = questions[currentQuestionIndex].question;
    const optionContainer = questionElement.querySelector("#option-container"); // 获取选项容器
    questions[currentQuestionIndex].answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer.text;
        button.classList.add("btn");
       
        optionContainer.appendChild(button); // 添加选项按钮
        button.addEventListener("click", (e) => {
          console.log(e)
          if (e.target.tagName === "BUTTON"){
          selectAnswer(answer)
          if(answer.correct){
            e.target.classList.add('correct')
          }
          else{
            e.target.classList.add('incorrect')
          }
        }});
        
    });

    const progress = (currentQuestionIndex + 1) / totalQuestions * 100; // 计算进度
    document.getElementById("progress").value = progress; // 更新进度条的值

    // 更新进度文本
    document.getElementById("progress-text").innerText = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`; // 更新显示的文本

    const nextButton = questionElement.querySelector("#next-option"); // 获取下一题按钮
    nextButton.style.display = "none"; // 隐藏下一题按钮
    nextButton.addEventListener('click',
        () => {
            currentQuestionIndex += 1; // 简化了这一行
            if (currentQuestionIndex < questions.length) {
                questionElement.style.display = 'none'; // 隐藏当前问题
                showQuestion(); // 显示下一题
            } else {
                showResult(); // 显示结果
            }
        }
    );
}







  
  function selectAnswer(answer) {
    if (answer.correct) {
      score++;
      
    }
    // 显示下一题按钮
    const questionElement = document.querySelector(`#question-${currentQuestionIndex + 1}`);
    const nextButton = questionElement.querySelector("#next-option");
    nextButton.style.display = "block"; // 显示下一题按钮
  }





  
  
  function showResult() {
    const resultElement = document.querySelector("#result");
    if(score === 3){
      resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${score} out of 3</p></h3><br/><img src="../static/quiz1.jpg"></td><td><span class="excellent-work">Perfect score! Congratulations, you've demonstrated excellent understanding of nutrient pollution. You're well-prepared to take meaningful actions and make a positive impact on our environment. Consider sharing this knowledge and advocating for sustainable practices in your community!</span></td></tr></table><br/><button id="restart-button">Restart</button>`;
    }
    
    if(score < 3 && score > 0){
      resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${score} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="great-effort">Good effort! You've got some answers right, which shows you're on your way to understanding nutrient pollution. Reviewing the information again can help you improve your knowledge and prepare to take more effective actions to reduce pollution. Keep learning and exploring!"</span></td></tr></table><br/><button id="restart-button">Restart</button>`;
    }
    
    if(score === 0){
      resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${score} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td><span class="bad-work">It seems like this topic might be new to you, and that's okay! Nutrient pollution is an important issue, and by learning more, you can make a big difference. Take a moment to review the information and try again—every bit of knowledge helps protect our environment!</span></td></tr></table><br/><button id="restart-button">Restart</button>`;
    }
    const restart = document.querySelector('#restart-button')
    restart.addEventListener('click', () => {
      location.reload()
    })
    resultElement.style.display = 'block'; // 显示结果
    game.style.display = 'none'

    
  }
 
  function resetState() {
    // 隐藏所有问题
    const allQuestions = document.querySelectorAll(".question");
    allQuestions.forEach(q => q.style.display = 'none'); // 隐藏所有问题
    document.getElementById("progress").value = 100;
  }
  
  // 初始化测验
  startQuiz();