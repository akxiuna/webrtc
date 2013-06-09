/* This source is distributed under the MIT License: Copyright © 2013 Alvin Khoo<akxiuna>
	DISCLAIMER:
	Part of the code used in this file has been adopted from the "WebSockets" project by Muaz Khan
	https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket
*/

//config is a configuration function that sets up the sockets, do the signalling and returns an object seen in rtclib.js
//rtc = rtclib(config) --> really set up everything with the configuration function
var config = {
    openSocket: function (config) {
        "use strict";
        var socket = new WebSocket('wss://pubsub.pubnub.com/pub-c-43a717c8-5815-4a7a-b118-19cd690fe879/sub-c-a0cf38de-7263-11e2-8b02-12313f022c90/' + (config.channel || location.hash.replace('#', '') || 'webrtc-websocket'));
        socket.onmessage = function (evt) {
            config.onmessage(evt.data);
        };
        if (config.onopen) socket.onopen = config.onopen;
        return socket;
    },
    onRemoteStream: function (media) {
        var video = media.video;
        video.setAttribute('controls', true);

        participants.insertBefore(video, participants.firstChild);

        video.play();
        rotateVideo(video);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td style="text-align:center; "><span>' + room.roomName + 
            '</span><button style="float:right; position:relative; right:235px;" class="join" id="' + room.roomToken + '">Join Room</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function () {
            var tr = this;
            captureUserMedia(function () {
                rtc.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id
                });
            });
            hideUnnecessaryStuff();
        };
    }
};

function createButtonClickHandler() {
    captureUserMedia(function () {
        rtc.createRoom({
            roomName: (document.getElementById('room-name') || {}).value || 'Anonymous'
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('controls', true);

    participants.insertBefore(video, participants.firstChild);

    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            rotateVideo(video);
            video.setAttribute('muted', true);
        },
        onerror: function (error) {
            alert('unable to get access to your webcam');
            callback && callback();
        }
    });
}

/* on page load: get public rooms */
var rtc = rtclib(config);

/* UI specific */
var participants = document.getElementById("participants") || document.body;
var startConferencing = document.getElementById('share-camera');
var roomsList = document.getElementById('rooms-list');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
	var areaid= document.getElementById('area-id');
	areaid.innerHTML='Chat Id: '+location.hash;
}

function rotateVideo(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

(function () {
    var uniqueToken = document.getElementById('unique-token');
	var hashTag = document.getElementById('hashtag');
    if (uniqueToken) 
		if (location.hash.length > 2) {
			uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<span><strong>Share this URL: </strong></span><a href="' + location.href + '" target="_blank">'+location.href+'</a>';
			hashTag.innerHTML = location.hash;
		}
    else window.location= "index.html";
})();