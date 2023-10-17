const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// OpenWeatherMap API key
const API_KEY = "d0d001c3e55400d1e5bad3f71b7c2671"; //API key for OpenWeatherMap API

// Function to generate weather card HTML
const weatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img
                    src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"
                    alt="weather-icon"
                    />
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return ` <li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img
                    src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png"
                    alt="weather-icon"
                    />
                    <h4>Temp: ${weatherItem.main.temp} C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
    
}

// Function to fetch and display weather details
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        const uniqueForecast = [];
        const fiveDayForecast = data.list.filter(forecast => {
            const forecastDate = new Date (forecast.dt_txt).getDate();
            if(!uniqueForecast.includes(forecastDate)) {
                 return uniqueForecast.push(forecastDate);
            }
        });

        cityInput.value = " ";
        currentWeatherDiv.innerHTML = " ";
        weatherCardsDiv.innerHTML = " ";


        fiveDayForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", weatherCard(cityName, weatherItem, index));
            }else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", weatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("An error has occured while fethcing the weather forecast");
    });
}

// Function to get coordinates by city name
const getCoordinates = () => {
    const cityName = cityInput.value.trim(); 
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error has occured while fethcing the coordinates");
    });
}

// Function to get user's coordinates and fetch weather details
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;


            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude); 
            }).catch(() => {
                alert("An error has occured while fethcing the city");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED) {
                alert("Location request denied");
            }
        }
    );
}

// Event listeners
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCoordinates());
