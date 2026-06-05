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
        // const api1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;

        const geoResponse = await fetch(cityLocation);
        const geoData = await geoResponse.json();
        console.log(geoData);
    }
    catch(error){
        console.error(error);
    }
}
// getWeatherData()