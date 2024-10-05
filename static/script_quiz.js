


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
      button.addEventListener("click", () => selectAnswer(answer));
      optionContainer.appendChild(button); // 添加选项按钮
    });

    const progress = (currentQuestionIndex + 1) / totalQuestions * 100; // 计算进度
    document.getElementById("progress").value = progress; // 更新进度条的值
    



    const nextButton = questionElement.querySelector("#next-option"); // 获取下一题按钮
    nextButton.style.display = "none"; // 隐藏下一题按钮
    nextButton.addEventListener('click',
      () => {
        currentQuestionIndex = currentQuestionIndex + 1
        if (currentQuestionIndex < questions.length) {
          questionElement.style.display = 'none'; // 隐藏当前问题
          showQuestion(); // 显示下一题
        } else {
          showResult(); // 显示结果
        }
      }
    )
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
    resultElement.innerText = `你得到了 ${score} 分，總共 ${questions.length} 題。`;
    resultElement.style.display = 'block'; // 显示结果
  }
  
  function resetState() {
    // 隐藏所有问题
    const allQuestions = document.querySelectorAll(".question");
    allQuestions.forEach(q => q.style.display = 'none'); // 隐藏所有问题
    document.getElementById("progress").value = 100;
  }
  
  // 初始化测验
  startQuiz();