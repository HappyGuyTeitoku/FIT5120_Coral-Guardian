// JavaScript to handle tab navigation
function openTab(tabName) {
    // Hide all tab content
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove "active" class from all tab buttons
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab and add "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// Initialize the first tab to be displayed
document.addEventListener("DOMContentLoaded", function() {
    // 显示第一个标签内容
    document.getElementById("overview").style.display = "block";

    // 获取第一个标签按钮并添加 'active' 类
    var firstTabButton = document.querySelector('.tab-button');
    if (firstTabButton) {
        firstTabButton.classList.add('active');
    }
});


// JavaScript to handle video playback and closing
document.addEventListener('DOMContentLoaded', function () {
    const videoContainers = [
        { thumbnailId: 'video-thumbnail1', playButtonId: 'play-button1', containerId: 'video-container1', playerId: 'video-player1', closeButtonId: 'close-video1', linkId: 'link-video1' },
        { thumbnailId: 'video-thumbnail2', playButtonId: 'play-button2', containerId: 'video-container2', playerId: 'video-player2', closeButtonId: 'close-video2', linkId: 'link-video2' }
    ];

    videoContainers.forEach(({ thumbnailId, playButtonId, containerId, playerId, closeButtonId, linkId }) => {
        const videoContainer = document.getElementById(containerId);
        const videoPlayer = document.getElementById(playerId);
        const playButton = document.getElementById(playButtonId);
        const closeButton = document.getElementById(closeButtonId);
        const videoThumbnail = document.getElementById(thumbnailId);
        const link = document.getElementById(linkId);

        // Handle play button click
        playButton.addEventListener('click', function () {
            videoContainer.style.display = 'block'; // Show the video container
            videoPlayer.play(); // Start video playback
            videoThumbnail.style.display = 'none'; // Hide the thumbnail
            playButton.style.display = 'none'; // Hide the play button
        });

        // Handle closing the video player
        closeButton.addEventListener('click', function () {
            videoContainer.style.display = 'none'; // Hide the video container
            videoPlayer.pause(); // Pause the video
            videoPlayer.currentTime = 0; // Reset the video to the start
            videoThumbnail.style.display = 'block'; // Show the thumbnail
            playButton.style.display = 'block'; // Show the play button
        });

        // Handle video link click
        link.addEventListener('click', function () {
            videoContainer.style.display = 'none'; // Hide the video container
            videoPlayer.pause(); // Pause the video
            videoPlayer.currentTime = 0; // Reset the video to the start
            videoThumbnail.style.display = 'block'; // Show the thumbnail
            playButton.style.display = 'block'; // Show the play button
        });
    });
});







   // -----------------------------------------------Add or remove a class based on scroll position
window.addEventListener('scroll', function() {
    let navbar = document.querySelector('nav');
    // Add or remove a class based on scroll position
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


   // -----------------------------------------------enddemo 


   // -----------------------------------------------test quiz js
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
    }
  ];
  
  let currentQuestionIndex = 0;
  let score = 0;
  
  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
  }
  
  function showQuestion() {
    resetState();
    const questionElement = document.getElementById(`question-${currentQuestionIndex + 1}`); // 使用动态 ID
    questionElement.style.display = 'block'; // 显示当前问题
  
    const questionText = questionElement.querySelector("p");
    questionText.innerText = questions[currentQuestionIndex].question;
  
    const optionContainer = questionElement.querySelector(".option-container"); // 获取选项容器
    questions[currentQuestionIndex].answers.forEach(answer => {
      const button = document.createElement("button");
      button.innerText = answer.text;
      button.classList.add("btn");
      button.addEventListener("click", () => selectAnswer(answer));
      optionContainer.appendChild(button); // 添加选项按钮
    });
  
    const nextButton = questionElement.querySelector("#next-option"); // 获取下一题按钮
    nextButton.style.display = "none"; // 隐藏下一题按钮
    nextButton.onclick = () => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        questionElement.style.display = 'none'; // 隐藏当前问题
        showQuestion(); // 显示下一题
      } else {
        showResult(); // 显示结果
      }
    };
  }
  
  function selectAnswer(answer) {
    if (answer.correct) {
      score++;
    }
    // 显示下一题按钮
    const questionElement = document.getElementById(`question-${currentQuestionIndex + 1}`);
    const nextButton = questionElement.querySelector("#next-option");
    nextButton.style.display = "block"; // 显示下一题按钮
  }
  
  function showResult() {
    const resultElement = document.getElementById("result");
    resultElement.innerText = `你得到了 ${score} 分，總共 ${questions.length} 題。`;
    resultElement.style.display = 'block'; // 显示结果
  }
  
  function resetState() {
    // 隐藏所有问题
    const allQuestions = document.querySelectorAll(".question");
    allQuestions.forEach(q => q.style.display = 'none'); // 隐藏所有问题
  }
  
  // 初始化测验
  startQuiz();
   // -----------------------------------------------test quiz js end