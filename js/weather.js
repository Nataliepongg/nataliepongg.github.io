// js/weather.js
class WeatherCard {
    constructor() {
        this.lat = 22.3193;
        this.lon = 114.1694;
        this.apiKey = WEATHER_CONFIG.API_KEY;
        this.init();
    }

    async init() {
        this.showLoading();
        
        try {
            if (!this.apiKey || this.apiKey === '1fff9e80f2a70643717aa13743e90451') {
                throw new Error('API key not configured');
            }

            // Try to get live weather
            const weather = await this.getWeather();
            this.updateCard(weather);
        } catch (error) {
            console.error('Weather error:', error);
            
            // If API key is invalid or not yet activated, show fallback data
            if (error.message.includes('401')) {
                this.showFallbackData();
            } else {
                this.showError(error);
            }
        }
    }

    showFallbackData() {
        // Temporary fallback data for Hong Kong
        const fallbackData = {
            main: {
                temp: 24,
                temp_min: 22,
                temp_max: 26
            },
            weather: [{
                main: "PARTLY CLOUDY",
                icon: "02d"
            }]
        };
        this.updateCard(fallbackData);
    }

    showLoading() {
        document.getElementById('weather-desc').textContent = 'LOADING...';
        document.getElementById('current-temp').textContent = '--°';
        document.getElementById('min-temp').textContent = '--°';
        document.getElementById('max-temp').textContent = '--°';
    }

    showError(error) {
        document.getElementById('weather-desc').textContent = 'ERROR';
        document.getElementById('current-temp').textContent = '--°';
        document.getElementById('min-temp').textContent = '--°';
        document.getElementById('max-temp').textContent = '--°';
        
        if (error.message === 'API key not configured') {
            console.error('Please configure your OpenWeather API key in config.js');
        }
    }

    async getWeather() {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error - check your internet connection');
            }
            throw error;
        }
    }

    updateCard(data) {
        try {
            // Update temperature
            const currentTemp = Math.round(data.main.temp);
            const minTemp = Math.round(data.main.temp_min);
            const maxTemp = Math.round(data.main.temp_max);
            
            document.getElementById('current-temp').textContent = `${currentTemp}°`;
            document.getElementById('min-temp').textContent = `${minTemp}°`;
            document.getElementById('max-temp').textContent = `${maxTemp}°`;
            
            // Update weather description
            const desc = data.weather[0].main.toUpperCase();
            document.getElementById('weather-desc').textContent = desc;
            
            // Update weather icon
            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            const iconImg = document.getElementById('weather-icon-img');
            iconImg.setAttribute('href', iconUrl);

        } catch (error) {
            console.error('Error updating weather card:', error);
            this.showError(error);
        }
    }
}

// Initialize weather card when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherCard();
});