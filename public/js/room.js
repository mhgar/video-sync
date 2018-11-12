const socket = io();

// Elements
const volumeSlider = document.querySelector('#volume');
const seekSlider = document.querySelector('#seek');
const pauseButton = document.querySelector('#pause');
const playButton = document.querySelector('#play');
const localFileField = document.querySelector('#localFile');

const player = (() => {
    const video = document.querySelector('#player');
    
    return {
        setTime: (timeInSeconds) => video.currentTime = timeInSeconds,
        
        getTime: () => video.currentTime,
        
        pause: () => video.pause(),
        
        play: () => video.play(),
        
        fullScreen: () => {
            if (video.mozRequestFullScreen)
                video.mozRequestFullScreen();
            else if (video.webkitRequestFullScreen)
                video.webkitRequestFullScreen();
            else
                alert('Use right click > fullscreen.');
        },
        
        setVolume: (value) => video.volume = value,
        
        playFile: (file) => {
            if (!file && video.canPlayType(file.type)) {
                alert("You cannot play this file.");
            } else {
                video.src = URL.createObjectURL(file);
            }
        },
        
        getDuration: () => video.duration
    };
})();

volumeSlider.addEventListener('change', () => player.setVolume(volumeSlider.value));

localFileField.addEventListener('change', () => {
    const file = localFileField.files[0];
    player.playFile(file);
    socket.emit('seek', {"time":player.getTime()});
});


// Networking

// Send pause
pauseButton.addEventListener('click', () => {
    player.pause();
    socket.emit('pause', {"time": player.getTime()});
});

// Recv pause
socket.on('pause', (payload) => {
    player.setTime(payload.time);
    player.pause();
});

// Send play
playButton.addEventListener('click', () => {
    player.play();
    socket.emit('play', {"time": player.getTime()});
});

// Recv play
socket.on('play', (payload) => {
    player.setTime(payload.time);
    player.play();
});

// Send seek
seekSlider.addEventListener('change', () => {
    console.log(seekSlider.value);
    console.log(player.getDuration());
    
    const time = seekSlider.value * player.getDuration();
    player.setTime(time);
    socket.emit('seek', {"time": time});
});

// Recv seek
socket.on('seek', (payload) => {
    player.setTime(payload.time);
});


const readTimeToSeek = () => {
    const duration = player.getDuration();
    
    if (duration > 0) {
        seekSlider.value = player.getTime() / player.getDuration();
    } else {
        seekSlider.value = 0;
    }
    
    setTimeout(readTimeToSeek, 250);
}

setTimeout(readTimeToSeek, 250);
player.setVolume(0.33);
