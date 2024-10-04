// Filename: OFF_api_for_product_lookup.js
// Author: Tsz Chung Wong (Leo)
// Purpose: 
//     This script handles displaying the videos in education.html
//     When the user clicks on "show video" button, it will hide and stop all other videos,
//     then display the video user selected.

// Initialise the list that stores all player iframes
var players = [];

// Initialize YouTube players
function onYouTubeIframeAPIReady() {
    // Create player 1
    var player1 = new YT.Player('player1', {
        height: '360',
        width: '640',
        videoId: 'vCicSNnKUvM', // Overview video 1
        events: {
            'onReady': onPlayerReady
        }
    });

    // Create player 2
    var player2 = new YT.Player('player2', {
        height: '360',
        width: '640',
        videoId: 'TqPzdFXEGiE', // Overview video 2
        events: {
            'onReady': onPlayerReady
        }
    });

    // Create player 2
    var player3 = new YT.Player('player3', {
        height: '360',
        width: '640',
        videoId: 'jFIG6jrzPy4', // Impact video
        events: {
            'onReady': onPlayerReady
        }
    });

    players.push(player1, player2, player3); // Store both players in the array
}

// This function will stop all videos except the one that's clicked to play
function stopOtherVideos(currentPlayer) {
    players.forEach(function (player) {
        if (player !== currentPlayer) {
            player.stopVideo(); // Stop all other players
        }
    });
}

// When players are ready, attach event listeners to play buttons
function onPlayerReady(event) {
    var player = event.target;

    // Play Video 1 when "Play video 1" is clicked
    document.getElementById('playButton1').addEventListener('click', function () {
        document.getElementById('video-container1').style.display = 'block'; // Show video 1
        document.getElementById('video-container2').style.display = 'none'; // Hide video 2
        document.getElementById('video-container3').style.display = 'none'; // Hide video 3
        stopOtherVideos(players[0]); // Stop other videos
        players[0].playVideo(); // Play this video
    });

    // Play Video 2 when "Play video 2" is clicked
    document.getElementById('playButton2').addEventListener('click', function () {
        document.getElementById('video-container1').style.display = 'none'; // Hide video 1
        document.getElementById('video-container2').style.display = 'block'; // Show video 2
        document.getElementById('video-container3').style.display = 'none'; // Hide video 3
        stopOtherVideos(players[1]); // Stop other videos
        players[1].playVideo(); // Play this video
    });

    // Play Video 3 when "Play video 3" is clicked
    document.getElementById('playButton3').addEventListener('click', function () {
        document.getElementById('video-container1').style.display = 'none'; // Hide video 1
        document.getElementById('video-container2').style.display = 'none'; // Hide video 2
        document.getElementById('video-container3').style.display = 'block'; // Show video 3
        stopOtherVideos(players[2]); // Stop other videos
        players[2].playVideo(); // Play this video
    });
}