"use strict";

const api_key = import.meta.env.VITE_WEATHER_API_KEY;
// console.log(api);
// console.log(import.meta.env.VITE_weather_API_Key);
const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const aqi_card = document.querySelector(".aqi_card");
const weather_card = document.querySelector(".weather_card");
const pollutants_card = document.querySelector(".pollutants_card");

const getWeatherData = async () => {
    const city = cityInput.value;
    try {
        const cityLocation = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${api_key}`;
        // console.log(cityLocation);
        const geoResponse = await fetch(cityLocation);
        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
        alert("City not found");
        return;
        }
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        // console.log(geoData);

        const api1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
        const weatherResponse = await fetch(api1);
        const weatherData = await weatherResponse.json();
        console.log(weatherData);
        
        const temp = weatherData["main"]["temp"];
        const humidity = weatherData["main"]["humidity"];
        const windSpeed = weatherData["wind"]["speed"];

        
    }
    catch (error) {
        console.error(error);
    }
};
// getWeatherData()
searchBtn.addEventListener("click", getWeatherData);
