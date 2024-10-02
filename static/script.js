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
   let currentQuestion = 0;
   let score = 0;
   
   const questions = document.querySelectorAll('.question');
   const nextButton = document.getElementById('next-question');
   const resultDiv = document.getElementById('result');
   const progressBar = document.getElementById('progress');
   
   function setupQuestion() {
     const currentOptions = questions[currentQuestion].querySelectorAll('.option');
     
     // 移除之前绑定的点击事件，防止重复绑定
     currentOptions.forEach((option, index) => {
       // 确保选项按钮是可点击的
       option.disabled = false;
       option.classList.remove('correct', 'incorrect');
   
       // 移除之前的事件监听器，防止重复触发
       option.replaceWith(option.cloneNode(true));
     });
   
     // 为新的选项按钮重新绑定点击事件
     const newOptions = questions[currentQuestion].querySelectorAll('.option');
     newOptions.forEach((option, index) => {
       option.addEventListener('click', function handleOptionClick() {
         // 禁用所有选项，防止多次点击
         newOptions.forEach(opt => opt.disabled = true);
   
         // 获取正确答案的索引
         const correctAnswerIndex = questions[currentQuestion].getAttribute('data-correct');
         if (index == correctAnswerIndex) {
           option.classList.add('correct');
           score++;
         } else {
           option.classList.add('incorrect');
           newOptions[correctAnswerIndex].classList.add('correct');
         }
   
         // 显示 "下一題" 按鈕
         nextButton.style.display = 'inline-block';
       });
     });
   }
   
   // 初始设置
   setupQuestion();
   
   // 点击“下一题”按钮逻辑
   nextButton.addEventListener('click', function() {
     // 隐藏当前问题
     questions[currentQuestion].style.display = 'none';
   
     // 更新进度条
     currentQuestion++;
     progressBar.value = (currentQuestion / questions.length) * 100;
   
     if (currentQuestion < questions.length) {
       // 显示下一个问题
       questions[currentQuestion].style.display = 'block';
       nextButton.style.display = 'none';
       setupQuestion(); // 设置下一个问题的选项
     } else {
       // 显示结果
       resultDiv.textContent = `你答对了 ${score} 题！`;
       nextButton.style.display = 'none';
     }
   });
   // -----------------------------------------------test quiz js end