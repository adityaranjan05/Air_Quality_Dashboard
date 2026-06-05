"use strict";

const api_key = import.meta.env.VITE_WEATHER_API_KEY;
// console.log(api);
// console.log(import.meta.env.VITE_weather_API_Key);
const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const aqi_card = document.querySelector("#aqi_card_wrapper");
const weather_card = document.querySelector("#weather_card_wrapper");
const pollutants_card = document.querySelector("#pollutants_card_wrapper");
const aqi_status_list = [
    "Good",
    "Fair",
    "Moderate",
    "Poor",
    "Very Poor"
];
const colors = [
    "#10b981", // Good - Emerald
    "#84cc16", // Fair - Lime
    "#f59e0b", // Moderate - Amber
    "#f97316", // Poor - Orange
    "#dc2626"  // Very Poor - Red
];
const backgrounds = [
    "#ecfdf5", // Good
    "#f7fee7", // Fair
    "#fffbeb", // Moderate
    "#fff7ed", // Poor
    "#fef2f2"  // Very Poor
];

const getWeatherData = async () => {
    const city = cityInput.value;
    if (!city.trim()) {
        alert("Please enter a city name");
        return;
    }
    try {
        // LOCATION DATA
        
        const cityLocation = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${api_key}`;
        console.log(cityLocation);
        const geoResponse = await fetch(cityLocation);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
        alert("City not found");
        return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        console.log(geoData);

        // WEATHER DATA

        const api1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
        const weatherResponse = await fetch(api1);
        const weatherData = await weatherResponse.json();
        console.log(weatherData);
        
        const temp = weatherData["main"]["temp"];
        const humidity = weatherData["main"]["humidity"];
        const windSpeed = weatherData["wind"]["speed"];
        const description = weatherData.weather[0].description;

        // AQI AND POLLUTANTS DATA
        
        const api2 = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
        const aqiResponse = await fetch(api2);
        const aqiData = await aqiResponse.json();
        console.log(aqiData);

        const aqi = aqiData.list[0]["main"]["aqi"];
        const pm2_5 = aqiData.list[0]["components"]["pm2_5"];
        const pm10 = aqiData.list[0]["components"]["pm10"];
        const no2 = aqiData.list[0]["components"]["no2"];
        const co = aqiData.list[0]["components"]["co"];
        const aqi_status = aqi_status_list[aqi-1];
        const aqi_color = colors[aqi-1];
        const aqi_bg = backgrounds[aqi - 1];
        document.body.style.background = `
linear-gradient(
135deg,
${aqi_bg},
white
)
`;

        // ADDING DATA TO CARDS
        weather_card.innerHTML = `
            <div class="card weather_card" style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
                <h3>Weather</h3>
                <p>Condition: ${description}</p>
                <p>Temperature: <span id="temp">${temp} °C</span></p>
                <p>Humidity: <span id="humidity">${humidity} %</span></p>
                <p>Wind Speed: <span id="wind">${windSpeed} m/s</span></p>
            </div>
        `;

        aqi_card.innerHTML = `
            <div class="card aqi_card" style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
                <h3>Air Quality Index</h3>
                <p id="cityName" style="color: ${aqi_color}">${geoData[0].name}</p>
                <p class="aqi_number" id="aqiNumber" style="color: ${aqi_color}">${aqi}</p>
                <p class="aqi_status" id="aqiStatus" style="color: ${aqi_color}">${aqi_status}</p>
            </div>
        `;

        pollutants_card.innerHTML = `
            <div class="card pollutants_card" style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
            <h3>Pollutants</h3>
                <p>PM2.5: <span id="pm25">${pm2_5} μg/m³</span></p>
                <p>PM10: <span id="pm10">${pm10} μg/m³</span></p>
                <p>NO2: <span id="no2">${no2} μg/m³</span></p>
                <p>CO: <span id="co">${co} μg/m³</span></p>
            </div>
        `;
    }
    catch (error) {
        console.error(error);
    }
};
// getWeatherData()
searchBtn.addEventListener("click", getWeatherData);