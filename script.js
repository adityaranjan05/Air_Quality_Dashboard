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

let recommendation = "";

const aqi_status_list = [
    "Good",
    "Fair",
    "Moderate",
    "Poor",
    "Very Poor"
];
const colors = [
  "#059669", // Good
  "#65a30d", // Fair
  "#d97706", // Moderate
  "#ea580c", // Poor
  "#b91c1c"  // Very Poor
];
const backgrounds = [
  "#d1fae5",
  "#ecfccb",
  "#fef3c7",
  "#fed7aa",
  "#fecaca"
];

let pollutantChart = null;

const ctx = document.getElementById("pollutantChart");

pollutantChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["PM2.5", "PM10", "NO2", "CO"],
        datasets: [{
            label: "Search a city to view pollutant data",
            data: [0, 0, 0, 0],
            backgroundColor: [
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444"
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
        const description = weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1);

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
        document.body.style.background = `linear-gradient(135deg,${aqi_bg},white)`;
        
        switch (aqi) {
            case 1:
                recommendation = `-Excellent air quality
                -Perfect for outdoor activities
                -Great time for exercise and jogging
                `;
                break;

            case 2:
                recommendation = `-Air quality is acceptable
                -Safe for most outdoor activities
                -No significant health concerns
                `;
                break;

            case 3:
                recommendation = `-Moderate air quality
                -Sensitive individuals should be cautious
                -Reduce prolonged outdoor exercise
                -Consider staying indoors during peak traffic hours
                `;
                break;

            case 4:
                recommendation = `-Poor air quality
                -Wear a mask outdoors if possible
                -Avoid strenuous outdoor activities
                -Keep windows closed during polluted periods
                `;
                break;

            case 5:
                recommendation = `-Very poor air quality
                -Wear a high-quality mask when outdoors
                -Avoid outdoor exercise and long exposure
                -Extra care for children, elderly, and people with respiratory issues
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
                <p id="cityName" style="color: ${aqi_color}">${geoData[0].name}</p>
                <p class="aqi_number" id="aqiNumber" style="color: ${aqi_color}">${aqi}</p>
                <p class="aqi_status" id="aqiStatus" style="color: ${aqi_color}">${aqi_status}</p>
            </div>
        `;

        pollutants_card.innerHTML = `
            <div class="card pollutants_card" style="border-left:8px solid ${aqi_color};
            background:${aqi_bg};">
            <h3 style="color:${aqi_color}">Pollutants</h3>
                <p>PM2.5: <span id="pm25">${pm2_5} μg/m³</span></p>
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
                    "PM2.5",
                    "PM10",
                    "NO2",
                    "CO"
                ],
                datasets: [{
                    label: "Pollutant Levels (μg/m³)",
                    data: [pm2_5, pm10, no2, co],
                    barThickness: 30,
                    backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444"
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
            marker.setLatLng([lat, lon]);
            marker.bindPopup(`
                <b>${geoData[0].name}, ${geoData[0].country}</b><br>
                AQI: ${aqi} (${aqi_status})<br>
                Temp: ${temp}°C
            `);
        }
        else {
            marker = L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`
                    <b>${geoData[0].name}, ${geoData[0].country}</b><br>
                    AQI: ${aqi} (${aqi_status})<br>
                    Temp: ${temp}°C
                `);
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