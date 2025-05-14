const API_KEY = 'cb5516ccd6c944c48eb74408250305'; 
const BASE_URL = 'https://api.weatherapi.com/v1';


const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const clouds = document.getElementById('clouds');
const forecastContainer = document.getElementById('forecast-container');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');


searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError('Please enter a city name');
    }
});

locationBtn.addEventListener('click', getLocationWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});


window.addEventListener('load', () => {
    getWeatherData('London');
});


async function getWeatherData(city) {
    try {
        showLoading();
        hideError();
        
        
        const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        displayCurrentWeather(data);
        displayForecast(data);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Weather API Error:', error);
    }
}


function displayCurrentWeather(data) {
    const { location, current } = data;
    
    cityName.textContent = `${location.name}, ${location.country}`;
    currentDate.textContent = new Date(location.localtime).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    currentTemp.textContent = Math.round(current.temp_c);
    weatherDescription.textContent = current.condition.text;
    windSpeed.textContent = Math.round(current.wind_kph);
    humidity.textContent = current.humidity;
    clouds.textContent = current.cloud;
    
    weatherIcon.src = current.condition.icon;
    weatherIcon.alt = current.condition.text;
    weatherIcon.style.display = 'block';
}


function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    data.forecast.forecastday.forEach(dayData => {
        const date = new Date(dayData.date);
        const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(dayData.day.maxtemp_c);
        const minTemp = Math.round(dayData.day.mintemp_c);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        
        forecastCard.innerHTML = `
            <div class="forecast-date">${dateString}</div>
            <img src="${dayData.day.condition.icon}" alt="${dayData.day.condition.text}">
            <p>${dayData.day.condition.text}</p>
            <div class="forecast-temp">
                <span class="max-temp">${maxTemp}°</span>
                <span class="min-temp">${minTemp}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=3&aqi=no&alerts=no`);
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch weather data');
                    }
                    
                    const data = await response.json();
                    displayCurrentWeather(data);
                    cityInput.value = data.location.name;
                    displayForecast(data);
                    
                    hideLoading();
                } catch (error) {
                    hideLoading();
                    showError(error.message);
                    console.error(error);
                }
            },
            (error) => {
                hideLoading();
                showError(`Geolocation error: ${error.message}`);
            }
        );
    } else {
        showError("Geolocation is not supported by this browser.");
    }
}

function showLoading() {
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    errorElement.style.display = 'none';
}