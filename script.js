"use strict";

const api_key = import.meta.env.VITE_WEATHER_API_KEY;

// console.log(api);
// console.log(import.meta.env.VITE_weather_API_Key);
const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const aqi_card = document.querySelector("#aqi_card_wrapper");
const weather_card = document.querySelector("#weather_card_wrapper");
const pollutants_card = document.querySelector("#pollutants_card_wrapper");
const recommendations_card = document.querySelector("#recommendations_card_wrapper");
let locationName;

let recommendation = "";

const aqi_status_list = [
    "Good",
    "Moderate",
    "Unhealthy for Sensitive Groups",
    "Unhealthy",
    "Very Unhealthy",
    "Hazardous"
];
const colors = [
    "#16a34a", // Good
    "#84cc16", // Moderate
    "#eab308", // Unhealthy for Sensitive Groups
    "#f97316", // Unhealthy
    "#dc2626", // Very Unhealthy
    "#7f1d1d"  // Hazardous
];
const backgrounds = [
    "#dcfce7", // Good
    "#ecfccb", // Moderate
    "#fef9c3", // Unhealthy for Sensitive Groups
    "#ffedd5", // Unhealthy
    "#fee2e2", // Very Unhealthy
    "#fecaca"  // Hazardous
];

let pollutantChart = null;

const ctx = document.getElementById("pollutantChart");

pollutantChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["SO2", "PM2.5", "PM10", "NO2", "CO"],
        datasets: [{
            label: "Search a city to view pollutant data",
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
                "#3b82f6", // SO2
                "#10b981", // PM2.5
                "#f59e0b", // PM10
                "#ef4444", // NO2
                "#8b5cf6"  // CO
            ],
            borderRadius: 18
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
    }
});

const map = L.map("map").setView([20, 0], 2);
const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);


let marker = null;

const popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent(`
            Latitude: ${e.latlng.lat.toFixed(4)}<br>
            Longitude: ${e.latlng.lng.toFixed(4)}
        `)
        .openOn(map);
}
map.on('click', onMapClick);

const getWeatherData = async () => {
    const city = cityInput.value;
    if (!city.trim()) {
        alert("Please enter a city name");
        return;
    }
    try {
        // LOCATION DATA
        cityInput.value = "";
        const cityLocation = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=10&appid=${api_key}`;
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
        if (geoData[0].state) {
            locationName = `${geoData[0].name}, ${geoData[0].state}, ${geoData[0].country}`;
        }
        else {
            locationName = `${geoData[0].name}, ${geoData[0].country}`;
        }

        // WEATHER DATA

        const weather_api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
        const weatherResponse = await fetch(weather_api);
        const weatherData = await weatherResponse.json();
        console.log(weatherData);
        
        const temp = Math.round(weatherData["main"]["temp"]);
        const humidity = Math.round(weatherData["main"]["humidity"]);
        const windSpeed = Math.round(weatherData["wind"]["speed"]);
        const description = weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1);

        // AQI AND POLLUTANTS DATA
        
        const aqi_api = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
        const aqiResponse = await fetch(aqi_api);
        const aqiData = await aqiResponse.json();
        console.log(aqiData);

        const aqi = Math.round(aqiData["current"]["us_aqi"]);
        const so2 = Math.round(aqiData["current"]["sulphur_dioxide"]);
        const pm10 = Math.round(aqiData["current"]["pm10"]);
        const pm2_5 = Math.round(aqiData["current"]["pm2_5"]);
        const no2 = Math.round(aqiData["current"]["nitrogen_dioxide"]);
        const co = Math.round(aqiData["current"]["carbon_monoxide"]);
        
        let us_aqi;
        if (aqi <= 50 && aqi >= 0) us_aqi = 1;
        else if (aqi <= 100) us_aqi = 2;
        else if (aqi <= 150) us_aqi = 3;
        else if (aqi <= 200) us_aqi = 4;
        else if (aqi <= 300) us_aqi = 5;
        else us_aqi = 6;
        const aqi_status = aqi_status_list[us_aqi-1];
        const aqi_color = colors[us_aqi-1];
        const aqi_bg = backgrounds[us_aqi - 1];
        document.body.style.background = `linear-gradient(135deg,${aqi_bg},white)`;
        
        switch (us_aqi) {
            case 1:
                recommendation = `- Air quality is excellent
                - Ideal for outdoor exercise and sports
                - Safe for children and older adults
                - Enjoy outdoor activities freely
                `;
                break;

            case 2:
                recommendation = `• Air quality is acceptable
                • Most people can continue normal activities
                • Sensitive individuals should monitor symptoms
                • Outdoor activities remain generally safe
                `;
                break;

            case 3:
                recommendation = `• Children and elderly should limit prolonged outdoor activity
                • People with asthma or respiratory conditions should take precautions
                • Consider wearing a mask in crowded areas
                • Reduce intense outdoor workouts
                `;
                break;

            case 4:
                recommendation = `• Limit outdoor exposure when possible
                • Avoid strenuous exercise outdoors
                • Wear a mask when spending long periods outside
                • Keep doors and windows closed during peak pollution hours
                `;
                break;

            case 5:
                recommendation = `• Avoid outdoor exercise
                • Use an N95 or equivalent mask outdoors
                • Stay indoors whenever possible
                • Use air purifiers if available
                • Extra caution for children, elderly, and people with health conditions
                `;
                break;
            case 6:
                recommendation = `• Remain indoors as much as possible
                • Avoid all unnecessary outdoor activities
                • Wear a high-quality mask if going outside is unavoidable
                • Use air purification and ventilation systems
                • Follow local health advisories and warnings
                `;
                break;
        }

        // ADDING DATA TO CARDS
        weather_card.innerHTML = `
            <div class="card weather_card" style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
                <h3 style="color:${aqi_color}">Weather</h3>
                <p>Condition: ${description}</p>
                <p>Temperature: <span id="temp">${temp} °C</span></p>
                <p>Humidity: <span id="humidity">${humidity} %</span></p>
                <p>Wind Speed: <span id="wind">${windSpeed} m/s</span></p>
            </div>
        `;

        aqi_card.innerHTML = `
            <div class="card aqi_card" style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
                <h3 style="color:${aqi_color}">Air Quality Index</h3>
                <p id="cityName" style="color: ${aqi_color}">${locationName}</p>
                <p class="aqi_number" id="aqiNumber" style="color: ${aqi_color}">${aqi}</p>
                <p class="aqi_status" id="aqiStatus" style="color: ${aqi_color}">${aqi_status}</p>
            </div>
        `;

        pollutants_card.innerHTML = `
            <div class="card pollutants_card" style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
            <h3 style="color:${aqi_color}">Pollutants</h3>
                <p>SO2: <span id="so2">${so2} μg/m³</span></p>
                <p>PM2.5: <span id="pm2_5">${pm2_5} μg/m³</span></p>
                <p>PM10: <span id="pm10">${pm10} μg/m³</span></p>
                <p>NO2: <span id="no2">${no2} μg/m³</span></p>
                <p>CO: <span id="co">${co} μg/m³</span></p>
            </div>
        `;

        recommendations_card.innerHTML = `
            <div class="card recommendation_card"
            style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
                <h3 style="color:${aqi_color}">Recommendations</h3>
                <p style="white-space: pre-line;">
                    ${recommendation}
                </p>
            </div>
`;
        // CHART

        const ctx = document.getElementById("pollutantChart");
        if (pollutantChart) {
            pollutantChart.destroy();
        }
        pollutantChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [
                    "SO2",
                    "PM2.5",
                    "PM10",
                    "NO2",
                    "CO"
                ],
                datasets: [{
                    label: "Pollutant Levels (μg/m³)",
                    data: [so2, pm2_5, pm10, no2, co],
                    barThickness: 30,
                    backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6" 
                    ],
                    borderRadius: 18
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // MAP

        map.flyTo([lat, lon], 13, {duration: 2} );
        if (marker) {
            marker
                .setLatLng([lat, lon])
                .bindPopup(`
                    <b>${geoData[0].name}, ${geoData[0].country}</b><br>
                    AQI: ${aqi} (${aqi_status})<br>
                    Temp: ${temp}°C
                `)
                .openPopup();
        }
        else {
            marker = L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`
                    <b>${geoData[0].name}, ${geoData[0].country}</b><br>
                    AQI: ${aqi} (${aqi_status})<br>
                    Temp: ${temp}°C
                `)
                .openPopup();
        }
    }
    catch (error) {
        alert("Unable to fetch data. Please try again.");
        console.error(error);
        searchBtn.textContent = "Search";
        searchBtn.disabled = false;
    }
};

searchBtn.addEventListener("click", getWeatherData);

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        getWeatherData();
    }
});