class SpotifyPlayer {
    constructor() {
        this.token = localStorage.getItem('spotify_token');
        this.initializeElements();
        
        if (!this.token) {
            this.showLogin();
        } else {
            this.initializePlayer();
        }
    }

    initializeElements() {
        this.loginSection = document.getElementById('spotify-login');
        this.playerSection = document.getElementById('spotify-player');
        this.loginButton = document.getElementById('login-button');
        this.playButton = document.getElementById('toggle-play');
        this.prevButton = document.getElementById('previous-track');
        this.nextButton = document.getElementById('next-track');
        this.volumeSlider = document.getElementById('volume-slider');
        this.trackName = document.getElementById('current-track-name');
        this.trackArtist = document.getElementById('current-track-artist');
        this.trackImage = document.getElementById('current-track-image');

        this.loginButton.addEventListener('click', () => this.handleLogin());
    }

    showLogin() {
        this.loginSection.classList.remove('hidden');
        this.playerSection.classList.add('hidden');
    }

    showPlayer() {
        this.loginSection.classList.add('hidden');
        this.playerSection.classList.remove('hidden');
    }

    handleLogin() {
        const scopes = [
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-read-playback-state',
            'user-modify-playback-state'
        ];

        const authUrl = new URL('https://accounts.spotify.com/authorize');
        const params = {
            client_id: SPOTIFY_CONFIG.CLIENT_ID,
            response_type: 'token',
            redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
            scope: scopes.join(' '),
            show_dialog: true
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    }

    checkAuthCallback() {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const token = hashParams.get('access_token');
        
        if (token) {
            localStorage.setItem('spotify_token', token);
            window.location.hash = '';
            this.token = token;
            this.initializePlayer();
        }
    }

    async initializePlayer() {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        script.onload = () => {
            window.onSpotifyWebPlaybackSDKReady = () => {
                this.createPlayer();
            };
        };

        document.body.appendChild(script);
        this.initializeControls();
    }

    createPlayer() {
        this.player = new Spotify.Player({
            name: 'Pomodoro Lofi Player',
            getOAuthToken: cb => { cb(this.token); },
            volume: 0  // Initial volume at 50%
        });
    
        this.player.addListener('ready', ({ device_id }) => {
            this.deviceId = device_id;
            this.startPlayback();
            this.showPlayer();
            // Set initial volume slider position
            this.volumeSlider.value = 0;
        });
    
        this.player.addListener('player_state_changed', state => {
            this.updatePlayerState(state);
        });
    
        this.player.connect();
    }

    initializeControls() {
        this.playButton.addEventListener('click', () => this.togglePlay());
        this.prevButton.addEventListener('click', () => this.previousTrack());
        this.nextButton.addEventListener('click', () => this.nextTrack());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
    }

    async startPlayback() {
        try {
            // First start the playback
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context_uri: SPOTIFY_CONFIG.LOFI_PLAYLIST_URI,
                    offset: { position: Math.floor(Math.random() * 20) },
                    position_ms: 0
                })
            });
    
            // Add a small delay to ensure the track is loaded
            await new Promise(resolve => setTimeout(resolve, 500));
    
            // Then immediately pause it
            await this.player.pause();
            
            // Update the play button icon
            const icon = this.playButton.querySelector('i');
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
    
        } catch (error) {
            console.error('Playback error:', error);
        }
    }

    async togglePlay() {
        if (!this.player) return;
        await this.player.togglePlay();
        const icon = this.playButton.querySelector('i');
        icon.classList.toggle('fa-play');
        icon.classList.toggle('fa-pause');
    }

    async previousTrack() {
        if (!this.player) return;
        await this.player.previousTrack();
    }

    async nextTrack() {
        if (!this.player) return;
        await this.player.nextTrack();
    }

    async setVolume(volume) {
        if (!this.player) return;
        await this.player.setVolume(volume);
    }

    updatePlayerState(state) {
        if (!state) return;

        const track = state.track_window?.current_track;
        if (track) {
            this.trackName.textContent = track.name;
            this.trackArtist.textContent = track.artists[0].name;
            this.trackImage.src = track.album.images[0].url;
        }

        const playIcon = this.playButton.querySelector('i');
        if (state.paused) {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        } else {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        }
    }
}

// Initialize the player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const player = new SpotifyPlayer();
    player.checkAuthCallback();
});