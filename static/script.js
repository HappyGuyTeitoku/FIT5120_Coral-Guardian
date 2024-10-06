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

const productItems = document.querySelectorAll('.product_recommend_item');

productItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const hoverInfo = item.querySelector('.hover-info');
        hoverInfo.style.display = 'block'; // 顯示彈出框
        hoverInfo.style.left = `${e.pageX + 10}px`; // 將彈出框位置設置為鼠標的右邊
        hoverInfo.style.top = `${e.pageY + 10}px`;
    });

    item.addEventListener('mouseleave', () => {
        const hoverInfo = item.querySelector('.hover-info');
        hoverInfo.style.display = 'none'; // 當鼠標離開時隱藏彈出框
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






function onYouTubeIframeAPIReady() {
    // Initialize YouTube Player
    var player1 = new YT.Player('player1', {
        height: '360',
        width: '640',
        videoId: 'vCicSNnKUvM', // YouTube 视频 ID
        events: {
            'onReady': onPlayerReady,
        }
    });
}

function onPlayerReady(event) {
    const videoContainer1 = document.getElementById('video-container1');
    const videoThumbnail = document.getElementById('video-thumbnail1');

    // Handle thumbnail click to play video
    videoThumbnail.addEventListener('click', function () {
        videoContainer1.style.display = 'block'; // Show the video container
        event.target.playVideo(); // Play the video
        videoThumbnail.style.display = 'none'; // Hide the thumbnail
    });
}

// Load YouTube iframe API script
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
