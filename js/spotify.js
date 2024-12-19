class SpotifyPlayer {
    constructor() {
        this.clientId = '0f53bd47f0fa4835ace083b80e20aa7a'; // Replace with your client ID
        this.redirectUri = window.location.origin + '/pomodoro.html';
        this.player = null;
        this.deviceId = null;
        this.playbackState = false;
        this.token = null;

        this.initializeSpotify();
    }

    initializeSpotify() {
        // Check if there's a token in URL (after redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            this.exchangeToken(code);
        }

        // Initialize login button
        document.getElementById('login-button').addEventListener('click', () => {
            this.login();
        });

        // Initialize Spotify Web Playback SDK
        window.onSpotifyWebPlaybackSDKReady = () => {
            if (this.token) {
                this.initializePlayer();
            }
        };
    }

    login() {
        const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scope)}`;
        window.location.href = authUrl;
    }

    async exchangeToken(code) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.redirectUri,
                    client_id: this.clientId,
                    client_secret: 'YOUR_CLIENT_SECRET', // Replace with your client secret
                }),
            });

            const data = await response.json();
            this.token = data.access_token;
            localStorage.setItem('spotify_token', this.token);
            this.initializePlayer();
        } catch (error) {
            console.error('Error exchanging token:', error);
        }
    }

    initializePlayer() {
        this.player = new Spotify.Player({
            name: 'Pomodoro Web Player',
            getOAuthToken: cb => { cb(this.token); }
        });

        // Error handling
        this.player.addListener('initialization_error', ({ message }) => {
            console.error(message);
        });
        this.player.addListener('authentication_error', ({ message }) => {
            console.error(message);
        });
        this.player.addListener('account_error', ({ message }) => {
            console.error(message);
        });
        this.player.addListener('playback_error', ({ message }) => {
            console.error(message);
        });

        // Playback status updates
        this.player.addListener('player_state_changed', state => {
            this.updatePlayerState(state);
        });

        // Ready
        this.player.addListener('ready', ({ device_id }) => {
            this.deviceId = device_id;
            this.setupPlayerControls();
            document.getElementById('spotify-login').classList.add('hidden');
            document.getElementById('spotify-player').classList.remove('hidden');
        });

        // Connect to the player
        this.player.connect();
    }

    setupPlayerControls() {
        document.getElementById('toggle-play').addEventListener('click', () => {
            this.player.togglePlay();
        });

        document.getElementById('next-track').addEventListener('click', () => {
            this.player.nextTrack();
        });

        document.getElementById('previous-track').addEventListener('click', () => {
            this.player.previousTrack();
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.player.setVolume(e.target.value / 100);
        });
    }

    updatePlayerState(state) {
        if (!state) return;

        const playButton = document.getElementById('toggle-play');
        playButton.innerHTML = state.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';

        if (state.track_window) {
            const track = state.track_window.current_track;
            document.getElementById('current-track-name').textContent = track.name;
            document.getElementById('current-track-artist').textContent = track.artists.map(artist => artist.name).join(', ');
            document.getElementById('current-track-image').src = track.album.images[0].url;
        }
    }
}

// Initialize Spotify player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpotifyPlayer();
});