// Sample music data - Replace with your own music files
const musicList = [
    {
        id: 1,
        title: "Nơi này có anh",
        artist: "Sơn Tùng M-TP ",
        file: "./assets/music/music_1.mp3",
        cover: "./assets/images/image_1.png",
        lyrics: `
`
    },
    {
        id: 2,
        title: "Sample Song 2",
        artist: "Artist 2",
        file: "./assets/music/song2.mp3",
        cover: "./assets/images/cover2.jpg",
        lyrics: ""
    }
];

// Playlist management
let playlists = [];
let currentPlaylist = null;

// Lyrics Management
let currentLyrics = new Map();
let activeLyricLine = null;

// DOM Elements
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekBackward = document.getElementById('seekBackward');
const seekForward = document.getElementById('seekForward');
const currentSong = document.getElementById('currentSong');
const currentArtist = document.getElementById('currentArtist');
const progress = document.getElementById('progress');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.querySelector('.volume-container i');
const albumArt = document.getElementById('albumArt');
const playlist = document.getElementById('playlist');
const playlistTabs = document.getElementById('playlistTabs');
const playlistTabContent = document.getElementById('playlistTabContent');
const songSelection = document.getElementById('songSelection');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const playlistNameInput = document.getElementById('playlistName');
const speedControls = document.getElementById('speedControls');
const timerDisplay = document.getElementById('timerDisplay');
const timerValue = document.getElementById('timerValue');
const themeToggle = document.getElementById('themeToggle');

// Audio Object
const audio = new Audio();
let isPlaying = false;
let currentTrackIndex = 0;
let previousVolume = 100; // Store previous volume level

// Audio Context and Visualizer
let audioContext;
let analyser;
let dataArray;
let canvas;
let canvasCtx;
let animationId;

// Sleep Timer variables
let sleepTimerId = null;
let timerUpdateInterval = null;

// Parse lyrics with timestamps
function parseLyrics(lyricsText) {
    const lines = lyricsText.trim().split('\n');
    const lyrics = new Map();
    
    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);
            const text = match[4].trim();
            const timeInSeconds = minutes * 60 + seconds + milliseconds / 100;
            lyrics.set(timeInSeconds, text);
        }
    });
    
    return lyrics;
}

// Update lyrics display
function updateLyricsDisplay() {
    const container = document.getElementById('lyricsContainer');
    if (currentLyrics.size === 0) {
        container.innerHTML = '<p class="text-muted text-center">No lyrics available</p>';
        return;
    }

    container.innerHTML = '';
    Array.from(currentLyrics.entries())
        .sort((a, b) => a[0] - b[0])
        .forEach(([time, text]) => {
            const div = document.createElement('div');
            div.className = 'lyrics-line';
            div.textContent = text;
            div.dataset.time = time;
            container.appendChild(div);
        });
}

// Sync lyrics with current time
function syncLyrics(currentTime) {
    if (currentLyrics.size === 0) return;

    const times = Array.from(currentLyrics.keys());
    const currentLineTime = times.reduce((prev, curr) => {
        return (curr <= currentTime && curr > prev) ? curr : prev;
    }, -1);

    if (currentLineTime >= 0) {
        if (activeLyricLine) {
            activeLyricLine.classList.remove('active');
        }
        
        const newActiveLine = document.querySelector(`.lyrics-line[data-time="${currentLineTime}"]`);
        if (newActiveLine) {
            newActiveLine.classList.add('active');
            activeLyricLine = newActiveLine;
            
            const container = document.getElementById('lyricsContainer');
            
            // Get the position of the line relative to the container
            const containerRect = container.getBoundingClientRect();
            const lineRect = newActiveLine.getBoundingClientRect();
            const relativeTop = lineRect.top - containerRect.top;
            
            // If the line is not fully visible, scroll to it
            if (relativeTop < 0 || relativeTop > (containerRect.height - lineRect.height)) {
                const scrollAdjustment = container.clientHeight * 0.3; // Show line at 30% from top
                container.scrollTop = newActiveLine.offsetTop - scrollAdjustment;
            }
        }
    }
}

// Theme management
function initializeTheme() {
    // Get saved theme or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // Update button icon
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Initialize player
function initializePlayer() {
    // Initialize theme
    initializeTheme();
    
    // Setup theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Create playlist items
    updateAllSongsPlaylist();
    updateSongSelection();
    
    // Load first track
    loadTrack();

    // Setup create playlist button
    createPlaylistBtn.addEventListener('click', createNewPlaylist);

    // Setup seek controls
    seekBackward.addEventListener('click', () => seekAudio(-10));
    seekForward.addEventListener('click', () => seekAudio(10));

    // Setup playback speed controls
    speedControls.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const speed = parseFloat(button.dataset.speed);
            setPlaybackSpeed(speed);
            
            // Update active state
            speedControls.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        });
    });

    // Setup sleep timer
    document.querySelectorAll('.dropdown-item[data-timer]').forEach(item => {
        item.addEventListener('click', () => {
            const minutes = parseInt(item.dataset.timer);
            setSleepTimer(minutes);
        });
    });
}

// Update all songs playlist
function updateAllSongsPlaylist() {
    playlist.innerHTML = '';
    musicList.forEach((song, index) => {
        const div = document.createElement('div');
        div.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        div.innerHTML = `
            <div>
                <h6 class="mb-1">${song.title}</h6>
                <small class="text-muted">${song.artist}</small>
            </div>
            <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary play-btn" data-index="${index}">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `;
        const playButton = div.querySelector('.play-btn');
        playButton.addEventListener('click', () => {
            currentTrackIndex = index;
            loadAndPlayTrack();
        });
        playlist.appendChild(div);
    });
}

// Update song selection in create playlist modal
function updateSongSelection() {
    songSelection.innerHTML = '';
    musicList.forEach(song => {
        const div = document.createElement('div');
        div.className = 'list-group-item';
        div.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${song.id}" id="song${song.id}">
                <label class="form-check-label" for="song${song.id}">
                    ${song.title} - ${song.artist}
                </label>
            </div>
        `;
        songSelection.appendChild(div);
    });
}

// Create new playlist
function createNewPlaylist() {
    const name = playlistNameInput.value.trim();
    if (!name) {
        alert('Please enter a playlist name');
        return;
    }

    const selectedSongs = Array.from(songSelection.querySelectorAll('input:checked')).map(input => 
        musicList.find(song => song.id === parseInt(input.value))
    );

    if (selectedSongs.length === 0) {
        alert('Please select at least one song');
        return;
    }

    const newPlaylist = {
        id: Date.now(),
        name: name,
        songs: selectedSongs
    };

    playlists.push(newPlaylist);
    createPlaylistTab(newPlaylist);
    
    // Reset and close modal
    playlistNameInput.value = '';
    songSelection.querySelectorAll('input').forEach(input => input.checked = false);
    bootstrap.Modal.getInstance(document.getElementById('createPlaylistModal')).hide();
}

// Create playlist tab
function createPlaylistTab(playlist) {
    // Create tab button
    const tabButton = document.createElement('li');
    tabButton.className = 'nav-item';
    tabButton.role = 'presentation';
    tabButton.innerHTML = `
        <button class="nav-link" id="playlist-${playlist.id}-tab" data-bs-toggle="tab" 
                data-bs-target="#playlist-${playlist.id}" type="button">
            ${playlist.name}
        </button>
    `;
    playlistTabs.appendChild(tabButton);

    // Create tab content
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane fade';
    tabContent.id = `playlist-${playlist.id}`;
    tabContent.innerHTML = `
        <div class="playlist-container list-group">
            ${playlist.songs.map((song, index) => `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${song.title}</h6>
                        <small class="text-muted">${song.artist}</small>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary play-btn" data-index="${index}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    playlistTabContent.appendChild(tabContent);

    // Add event listeners to play buttons
    tabContent.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPlaylist = playlist;
            currentTrackIndex = parseInt(btn.dataset.index);
            loadAndPlayTrack();
        });
    });
}

// Update play button states
function updatePlayButtonStates() {
    const allPlayButtons = document.querySelectorAll('.play-btn i');
    allPlayButtons.forEach(button => {
        button.className = 'fas fa-play';
    });

    if (isPlaying) {
        const currentList = currentPlaylist ? 
            document.querySelector(`#playlist-${currentPlaylist.id} .playlist-container`) : 
            playlist;
        
        if (currentList) {
            const buttons = currentList.querySelectorAll('.play-btn');
            const currentButton = buttons[currentTrackIndex];
            if (currentButton) {
                currentButton.querySelector('i').className = 'fas fa-pause';
            }
        }
    }
}

// Initialize audio context and visualizer
function initializeAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    canvas = document.getElementById('visualizer');
    canvasCtx = canvas.getContext('2d');

    // Set canvas size
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// Draw visualizer
function drawVisualizer() {
    animationId = requestAnimationFrame(drawVisualizer);

    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / dataArray.length;

    canvasCtx.clearRect(0, 0, width, height);

    dataArray.forEach((value, index) => {
        const barHeight = (value / 255) * height;
        const x = index * barWidth;
        const hue = (index / dataArray.length) * 360;
        
        canvasCtx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        canvasCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    });
}

// Set sleep timer
function setSleepTimer(minutes) {
    // Clear existing timer if any
    if (sleepTimerId) {
        clearTimeout(sleepTimerId);
        clearInterval(timerUpdateInterval);
        sleepTimerId = null;
    }

    // If minutes is 0, cancel the timer
    if (minutes === 0) {
        timerDisplay.style.display = 'none';
        return;
    }

    // Calculate end time
    const endTime = Date.now() + minutes * 60 * 1000;

    // Show timer display
    timerDisplay.style.display = 'inline-block';

    // Update timer display
    function updateTimerDisplay() {
        const remaining = Math.max(0, endTime - Date.now());
        const minutesLeft = Math.floor(remaining / 60000);
        const secondsLeft = Math.floor((remaining % 60000) / 1000);
        timerValue.textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;

        // If timer has finished, clear the interval
        if (remaining <= 0) {
            clearInterval(timerUpdateInterval);
        }
    }

    // Update display immediately and then every second
    updateTimerDisplay();
    timerUpdateInterval = setInterval(updateTimerDisplay, 1000);

    // Set timeout to stop music
    sleepTimerId = setTimeout(() => {
        if (isPlaying) {
            playTrack(); // This will pause the music
        }
        timerDisplay.style.display = 'none';
        clearInterval(timerUpdateInterval);
    }, minutes * 60 * 1000);
}

// Modified loadTrack function
function loadTrack() {
    const songs = currentPlaylist ? currentPlaylist.songs : musicList;
    const song = songs[currentTrackIndex];
    audio.src = song.file;
    currentSong.textContent = song.title;
    currentArtist.textContent = song.artist;
    albumArt.src = song.cover;
    updatePlaylistActive();
    updatePlayButtonStates();

    // Load lyrics if available
    currentLyrics.clear();
    if (song.lyrics) {
        currentLyrics = parseLyrics(song.lyrics);
    }
    updateLyricsDisplay();

    // Reset and restart visualizer
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Update active playlist item
function updatePlaylistActive() {
    const items = playlist.getElementsByClassName('list-group-item');
    Array.from(items).forEach((item, index) => {
        if (index === currentTrackIndex && !currentPlaylist) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Load and play track
function loadAndPlayTrack() {
    loadTrack();
    playTrack();
}

// Modified playTrack function
function playTrack() {
    if (!isPlaying) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
        
        // Start visualizer if not initialized
        if (!audioContext) {
            initializeAudioContext();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        drawVisualizer();
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        isPlaying = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
    updatePlayButtonStates();
}

// Previous track
function prevTrack() {
    const songs = currentPlaylist ? currentPlaylist.songs : musicList;
    currentTrackIndex--;
    if (currentTrackIndex < 0) {
        currentTrackIndex = songs.length - 1;
    }
    loadAndPlayTrack();
}

// Next track
function nextTrack() {
    const songs = currentPlaylist ? currentPlaylist.songs : musicList;
    currentTrackIndex++;
    if (currentTrackIndex >= songs.length) {
        currentTrackIndex = 0;
    }
    loadAndPlayTrack();
}

// Update progress bar
function updateProgress() {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Update time displays
    currentTime.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);

    // Sync lyrics
    syncLyrics(audio.currentTime);
}

// Format time in minutes and seconds
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Set progress when clicking on progress bar
function setProgress(e) {
    const progressContainer = e.currentTarget;
    const clickX = e.offsetX;
    const width = progressContainer.clientWidth;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// Event Listeners
playBtn.addEventListener('click', playTrack);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextTrack);
document.querySelector('.progress').addEventListener('click', setProgress);

// Volume control
volumeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    setVolume(value);
});

// Set volume and update icon
function setVolume(value) {
    audio.volume = value / 100;
    volumeSlider.value = value;
    updateVolumeIcon(value);
    if (value > 0) {
        previousVolume = value;
    }
}

// Update volume icon based on volume level
function updateVolumeIcon(value) {
    if (value == 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (value < 50) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Toggle mute
volumeIcon.addEventListener('click', () => {
    if (audio.volume > 0) {
        // Mute
        setVolume(0);
    } else {
        // Unmute - restore previous volume
        setVolume(previousVolume);
    }
});

// Seek audio forward or backward
function seekAudio(seconds) {
    if (audio.src) {
        const newTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
        audio.currentTime = newTime;
    }
}

// Set playback speed
function setPlaybackSpeed(speed) {
    if (audio.src) {
        audio.playbackRate = speed;
    }
}

// Add event listeners for lyrics editing
document.getElementById('editLyricsBtn').addEventListener('click', () => {
    const songs = currentPlaylist ? currentPlaylist.songs : musicList;
    const song = songs[currentTrackIndex];
    document.getElementById('lyricsEditor').value = song.lyrics || '';
    new bootstrap.Modal(document.getElementById('lyricsEditorModal')).show();
});

document.getElementById('saveLyricsBtn').addEventListener('click', () => {
    const songs = currentPlaylist ? currentPlaylist.songs : musicList;
    const song = songs[currentTrackIndex];
    song.lyrics = document.getElementById('lyricsEditor').value;
    currentLyrics = parseLyrics(song.lyrics);
    updateLyricsDisplay();
    bootstrap.Modal.getInstance(document.getElementById('lyricsEditorModal')).hide();
});

// Initialize the player when the page loads
window.addEventListener('load', () => {
    initializePlayer();
    setVolume(100); // Set initial volume
});
