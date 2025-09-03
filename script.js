const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const suggestionsContainer = document.getElementById("suggestions");
const backgroundVideo = document.getElementById("background-video");

const weatherApiKey = "089ef4cf886f48aa9fa963d90a5a2893";
const geoApiKey = "965ba57ca5764dd69be5bc8a016e3d4d";

let debounceTimer;

document.addEventListener('DOMContentLoaded', () => {
    backgroundVideo.src = 'https://videos.pexels.com/video-files/4782047/4782047-hd.mp4';
});

cityInput.addEventListener("input", () => {
    const query = cityInput.value;
    clearTimeout(debounceTimer);
    if (query.length < 3) {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = 'none';
        return;
    }
    debounceTimer = setTimeout(() => {
        getCitySuggestions(query);
    }, 300);
});

async function getCitySuggestions(query) {
    const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${geoApiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displaySuggestions(data.features);
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
    }
}

function displaySuggestions(features) {
    suggestionsContainer.innerHTML = "";
    if (!features || features.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    features.forEach(feature => {
        const suggestionItem = document.createElement("div");
        suggestionItem.textContent = feature.properties.formatted;
        suggestionItem.classList.add("p-3", "cursor-pointer", "hover:bg-gray-700");
        suggestionItem.addEventListener("click", () => {
            cityInput.value = feature.properties.city || feature.properties.name;
            suggestionsContainer.innerHTML = "";
            suggestionsContainer.style.display = 'none';
            weatherForm.dispatchEvent(new Event('submit'));
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
    suggestionsContainer.style.display = 'block';
}

weatherForm.addEventListener("submit", async event => {
    event.preventDefault();
    suggestionsContainer.style.display = 'none';
    const city = cityInput.value;
    if (city) {
        try {
            card.innerHTML = `<p class="text-2xl">Fetching weather...</p>`;
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
        } catch (error) {
            console.error(error);
            displayError(error.message);
        }
    } else {
        displayError("Please enter a city");
    }
});

async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Could not fetch weather data. Please check the city name.");
    }
    return await response.json();
}

function displayWeatherInfo(data) {
    const { name: city, main: { temp, humidity }, weather: [{ description, id }] } = data;
    updateBackgroundVideo(id);
    card.textContent = "";

    const weatherContainer = document.createElement("div");
    weatherContainer.classList.add("flex", "items-center", "justify-between", "w-full", "gap-8", "text-shadow");

    const leftColumn = document.createElement("div");
    leftColumn.classList.add("text-left", "space-y-2");

    const cityDisplay = document.createElement("h1");
    cityDisplay.textContent = city;
    cityDisplay.classList.add("text-6xl", "font-bold");

    const descDisplay = document.createElement("p");
    descDisplay.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    descDisplay.classList.add("text-3xl", "capitalize");

    const humidityDisplay = document.createElement("p");
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    humidityDisplay.classList.add("text-2xl");

    const weatherEmoji = document.createElement("p");
    weatherEmoji.textContent = getWeatherEmoji(id);
    weatherEmoji.classList.add("text-8xl", "mt-4");

    leftColumn.append(cityDisplay, weatherEmoji, descDisplay, humidityDisplay);

    const rightColumn = document.createElement("div");

    const tempDisplay = document.createElement("p");
    tempDisplay.textContent = `${(temp - 273.15).toFixed(1)}°C`;
    tempDisplay.classList.add("text-9xl", "font-extrabold");

    rightColumn.append(tempDisplay);

    weatherContainer.append(leftColumn, rightColumn);
    card.append(weatherContainer);
}

function updateBackgroundVideo(weatherId) {
    let videoUrl = 'https://videos.pexels.com/video-files/4782047/4782047-hd.mp4';
    switch (true) {
        case (weatherId >= 200 && weatherId < 300):
            videoUrl = 'https://videos.pexels.com/video-files/6830631/6830631-hd.mp4';
            break;
        case (weatherId >= 300 && weatherId < 600):
            videoUrl = 'https://videos.pexels.com/video-files/4056633/4056633-hd.mp4';
            break;
        case (weatherId >= 600 && weatherId < 700):
            videoUrl = 'https://videos.pexels.com/video-files/3253459/3253459-hd.mp4';
            break;
        case (weatherId >= 700 && weatherId < 800):
            videoUrl = 'https://videos.pexels.com/video-files/2759491/2759491-hd.mp4';
            break;
        case (weatherId === 800):
            videoUrl = 'https://videos.pexels.com/video-files/853874/853874-hd.mp4';
            break;
        case (weatherId > 800):
            videoUrl = 'https://videos.pexels.com/video-files/4782047/4782047-hd.mp4';
            break;
    }
    if (backgroundVideo.src !== videoUrl) {
        backgroundVideo.style.opacity = '0';
        setTimeout(() => {
            backgroundVideo.src = videoUrl;
            backgroundVideo.style.opacity = '1';
        }, 1000);
    }
}

function getWeatherEmoji(weatherId) {
    switch (true) {
        case (weatherId >= 200 && weatherId < 300): return "⛈️";
        case (weatherId >= 300 && weatherId < 400): return "🌦️";
        case (weatherId >= 500 && weatherId < 600): return "🌧️";
        case (weatherId >= 600 && weatherId < 700): return "❄️";
        case (weatherId >= 700 && weatherId < 800): return "🌫️";
        case (weatherId === 800): return "☀️";
        case (weatherId > 800): return "☁️";
        default: return "❓";
    }
}

function displayError(message) {
    card.textContent = "";
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("text-red-400", "font-semibold", "text-2xl");
    card.append(errorDisplay);
}

document.addEventListener('click', function(event) {
    const isClickInside = cityInput.contains(event.target) || suggestionsContainer.contains(event.target);
    if (!isClickInside) {
        suggestionsContainer.style.display = 'none';
    }
});
