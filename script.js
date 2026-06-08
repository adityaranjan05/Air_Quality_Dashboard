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
const aqi_number_colors = [
    "#dcfce7", // Good
    "#ecfccb", // Moderate
    "#fef9c3", // Unhealthy for Sensitive Groups
    "#ffedd5", // Unhealthy
    "#fee2e2", // Very Unhealthy
    "#fecaca"  // Hazardous
];

let pollutantChart = null;

const ctx1 = document.getElementById("pollutantChart");

pollutantChart = new Chart(ctx1, {
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
        scales: {
            x: { ticks: { color: "rgba(255,255,255,0.9)", font: { family: "Lexend", size: 14 } }, grid: { color: "rgba(255,255,255,0.07)" } },
            y: { ticks: { color: "rgba(255,255,255,0.9)", font: { family: "Lexend", size: 14 } }, grid: { color: "rgba(255,255,255,0.07)" } }
        },
        plugins: {
            legend: {
                labels: {
                    color: "white",
                    font: {
                        family: "Lexend"
                    }
                }
            }
        }
    }
});

const map = L.map("map").setView([10, 30], 1);
const tiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>; CARTO',
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

// WEATHER DASHBOARD

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
        searchBtn.textContent = "Loading…";
        searchBtn.disabled = true;

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
        const aqi_bg = aqi_number_colors[us_aqi - 1];
        // document.body.style.background = `linear-gradient(135deg,${aqi_bg},white)`;
        
        switch (us_aqi) {
            case 1:
                recommendation = `• Ideal for outdoor exercise and sports.
                • Safe for all age groups — enjoy freely.
                `;
                break;

            case 2:
                recommendation = `• Air quality is acceptable.
                • Sensitive individuals should monitor symptoms.
                `;
                break;

            case 3:
                recommendation = `• Children and elderly should limit prolonged outdoor activity.
                • Consider a mask in crowded areas.
                `;
                break;

            case 4:
                recommendation = `• Limit outdoor exposure.
                • Avoid strenuous exercise outside.
                • Keep windows closed during peak hours.
                `;
                break;

            case 5:
                recommendation = `• Avoid outdoor exercise.
                • Use an N95 mask outdoors.
                • Stay indoors and use air purifiers if available.
                `;
                break;
            case 6:
                recommendation = `• Remain indoors.
                • Avoid all unnecessary outdoor activities.
                • Follow local health advisories closely.
                `;
                break;
        }

        // ADDING DATA TO CARDS
        weather_card.innerHTML = `
            <div class="card weather_card">
                <h3>Weather</h3>
                <p>Condition: ${description}</p>
                <p>Temperature: <span id="temp">${temp} °C</span></p>
                <p>Humidity: <span id="humidity">${humidity} %</span></p>
                <p>Wind Speed: <span id="wind">${windSpeed} m/s</span></p>
            </div>
        `;

        aqi_card.innerHTML = `
            <div class="card aqi_card">
                <h3>Air Quality Index</h3>
                <p id="cityName">${locationName}</p>
                <p class="aqi_number" id="aqiNumber" style="color: ${aqi_color}">${aqi}</p>
                <p class="aqi_status" id="aqiStatus">${aqi_status}</p>
            </div>
        `;

        pollutants_card.innerHTML = `
            <div class="card pollutants_card">
            <h3>Pollutants</h3>
                <p>SO2: <span id="so2">${so2} μg/m³</span></p>
                <p>PM2.5: <span id="pm2_5">${pm2_5} μg/m³</span></p>
                <p>PM10: <span id="pm10">${pm10} μg/m³</span></p>
                <p>NO2: <span id="no2">${no2} μg/m³</span></p>
                <p>CO: <span id="co">${co} μg/m³</span></p>
            </div>
        `;

        recommendations_card.innerHTML = `
            <div class="card recommendation_card">
                <h3>Recommendations</h3>
                <p style="white-space: pre-line;">
                    ${recommendation}
                </p>
            </div>
        `;
        // CHART

        if (pollutantChart) {
            pollutantChart.destroy();
        }
        pollutantChart = new Chart(ctx1, {
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
                    borderRadius: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: "rgba(255,255,255,0.6)", font: { family: "Lexend" } }, grid: { color: "rgba(255,255,255,0.07)" } },
                    y: { ticks: { color: "rgba(255,255,255,0.6)", font: { family: "Lexend" } }, grid: { color: "rgba(255,255,255,0.07)" } }
                }
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
    }
    finally {
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

// COMPARE CITIES

const city1Input = document.querySelector("#city1");
const city2Input = document.querySelector("#city2");
const compare_btn = document.querySelector("#compare_btn");
let compareChart = null;

const ctx2 = document.getElementById("compareChart");

compareChart = new Chart(ctx2, {
    type: "bar",
    data: {
        labels: ["AQI", "Temp(°C)", "Humidity%", "PM10μg/m³", "PM2.5μg/m³"],
        datasets: [
            {
                barThickness: window.innerWidth < 768 ? 15 : 30,
                label: "City1",
                backgroundColor: "#3b82f6",
                data: [0, 0, 0, 0, 0],
                borderRadius: 10
            },
            {
                barThickness: window.innerWidth < 768 ? 15 : 30,
                label: "City2",
                backgroundColor: "#10b981",
                data: [0, 0, 0, 0, 0],
                borderRadius: 10
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: "City Comparison",
                color: "#f0f6ff",
            },
            legend: {
                labels: {
                    color: "#f0f6ff",
                    font: {
                        family: "Lexend"
                    }
                }
            },
        },
        scales: {
            x: { ticks: { color: "rgba(255,255,255,0.9)", font: { family: "Lexend", size: 14 } }, grid: { color: "rgba(255,255,255,0.07)" } },
            y: { beginAtZero: true, ticks: { color: "rgba(255,255,255,0.9)", font: { family: "Lexend", size: 14 } }, grid: { color: "rgba(255,255,255,0.09)" } }
        }
    }
});

const compareCities = async () => {
    const city1 = city1Input.value.trim();
    const city2 = city2Input.value.trim();
    if (!city1 || !city2) {
        alert("Please enter a city name");
        return;
    }
    try {
        compare_btn.textContent = "Loading…";
        compare_btn.disabled = true;
        // LOCATION DATA
        city1Input.value = "";
        city2Input.value = "";
        const city1Location = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city1)}&limit=10&appid=${api_key}`;
        const city2Location = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city2)}&limit=10&appid=${api_key}`;
        console.log(city1Location);
        console.log(city2Location);
        const geoResponse1 = await fetch(city1Location);
        const geoResponse2 = await fetch(city2Location);
        const geoData1 = await geoResponse1.json();
        const geoData2 = await geoResponse2.json();

        if (geoData1.length === 0 || geoData2.length === 0) {
            alert("City not found");
            return;
        }

        const lat1 = geoData1[0].lat;
        const lon1 = geoData1[0].lon;    
        const lat2 = geoData2[0].lat;
        const lon2 = geoData2[0].lon;

        const weather_api1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat1}&lon=${lon1}&appid=${api_key}&units=metric`;
        const weather_api2 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat2}&lon=${lon2}&appid=${api_key}&units=metric`;
        const weatherResponse1 = await fetch(weather_api1);
        const weatherResponse2 = await fetch(weather_api2);
        const weatherData1 = await weatherResponse1.json();
        const weatherData2 = await weatherResponse2.json();
        console.log(weatherData1);
        console.log(weatherData2);
        const temp1 = Math.round(weatherData1["main"]["temp"]);
        const temp2 = Math.round(weatherData2["main"]["temp"]);
        const humidity1 = Math.round(weatherData1["main"]["humidity"]);
        const humidity2 = Math.round(weatherData2["main"]["humidity"]);

        const aqi_api1 = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat1}&longitude=${lon1}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
        const aqi_api2 = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat2}&longitude=${lon2}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
        const aqiResponse1 = await fetch(aqi_api1);
        const aqiResponse2 = await fetch(aqi_api2);
        const aqiData1 = await aqiResponse1.json();
        const aqiData2 = await aqiResponse2.json();
        console.log(aqiData1);
        console.log(aqiData2);
        const aqi1 = Math.round(aqiData1["current"]["us_aqi"]);
        const aqi2 = Math.round(aqiData2["current"]["us_aqi"]);
        const pm10_1st = Math.round(aqiData1["current"]["pm10"]);
        const pm10_2nd = Math.round(aqiData2["current"]["pm10"]);
        const pm2_5_1st = Math.round(aqiData1["current"]["pm2_5"]);
        const pm2_5_2nd = Math.round(aqiData2["current"]["pm2_5"]);

        if (compareChart) {
            compareChart.destroy();
        }
        compareChart = new Chart(ctx2, {
            type: "bar",
            data: {
                labels: ["AQI", "Temp(°C)", "Humidity%", "PM10μg/m³", "PM2.5μg/m³"],
                datasets: [
                    {
                        barThickness: window.innerWidth < 768 ? 15 : 30,
                        label: city1,
                        backgroundColor: "#3b82f6",
                        data: [aqi1, temp1, humidity1, pm10_1st, pm2_5_1st],
                        borderRadius: 10
                    },
                    {
                        barThickness: window.innerWidth < 768 ? 15 : 30,
                        label: city2,
                        backgroundColor: "#10b981",
                        data: [aqi2, temp2, humidity2, pm10_2nd, pm2_5_2nd],
                        borderRadius: 10
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "City Comparison",
                        color: "#f0f6ff",
                    },
                    legend: {
                        labels: {
                            color: "#f0f6ff",
                            font: {
                                family: "Lexend"
                            }
                        }
                    },
                },
                scales: {
                    x: { ticks: { color: "rgba(255,255,255,0.9)", font: { family: "Lexend", size: 14 } }, grid: { color: "rgba(255,255,255,0.07)" } },
                    y: { beginAtZero: true, ticks: { color: "rgba(255,255,255,0.9)", font: { family: "Lexend", size: 14 } }, grid: { color: "rgba(255,255,255,0.09)" } }
                }
            }
        });
    }
    catch (error) {
        console.error(error);
        alert("Unable to compare cities. Please try again.");
    }
    finally {
        compare_btn.textContent = "Compare";
        compare_btn.disabled = false;
    }
}

compare_btn.addEventListener ("click", compareCities)

city1Input.addEventListener ("keydown", (e) => {
    if (e.key === "Enter") compareCities();
})

city2Input.addEventListener ("keydown", (e) => {
    if (e.key === "Enter") compareCities();
})