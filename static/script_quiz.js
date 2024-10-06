


const questions = [
    {
      
      question: "這是什麼動物？",
      answers: [
        { text: "狗", correct: true },
        { text: "貓", correct: false },
        { text: "老鼠", correct: false },
      ]
    },
    {
      question: "這是一個什麼水果？",
      answers: [
        { text: "蘋果", correct: true },
        { text: "香蕉", correct: false },
        { text: "橘子", correct: false },
      ]
    },
    {
      question: "這是一個什麼水果？",
      answers: [
        { text: "蘋a果", correct: true },
        { text: "香a蕉", correct: false },
        { text: "橘a子", correct: false },
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
      console.log(button)
      button.classList.add('correct')
    }
    // 显示下一题按钮
    const questionElement = document.querySelector(`#question-${currentQuestionIndex + 1}`);
    const nextButton = questionElement.querySelector("#next-option");
    nextButton.style.display = "block"; // 显示下一题按钮
  }





  
  
  function showResult() {
    const resultElement = document.querySelector("#result");
    if(score === 3){
      resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${score} out of 3</p></h3><br/><img src="../static/quiz1.jpg"></td><td>Excellent work! You’ve mastered the key impacts of nutrient pollution on outdoor activities, fish health, and the ecosystem. You're well-equipped with the knowledge to make informed decisions and help protect our water resources. Keep spreading the word and continue making a positive impact in your community!</td></tr></table><br/><button id="restart-button">重新开始</button>`;
    }
    if(score < 3 && score > 0){
      resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${score} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td>work! You’ve mastered the key impacts of nutrient pollution on outdoor activities, fish health, and the ecosystem. You're well-equipped with the knowledge to make informed decisions and help protect our water resources. Keep spreading the word and continue making a positive impact in your community!</td></tr></table><br/><button id="restart-button">重新开始</button>`;
    }
    if(score === 0){
      resultElement.innerHTML = `<table><tr><td><h3>You Scored <p>${score} out of 3</p></h3><br/><img src="./static/quiz2.jpg"></td><td>Bad work! You’ve mastered the key impacts of nutrient pollution on outdoor activities, fish health, and the ecosystem. You're well-equipped with the knowledge to make informed decisions and help protect our water resources. Keep spreading the word and continue making a positive impact in your community!</td></tr></table><br/><button id="restart-button">重新开始</button>`;
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