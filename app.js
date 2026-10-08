const EPA_LABELS = {
  1: "Dobrá",
  2: "Střední",
  3: "Nezdravá pro citlivé skupiny",
  4: "Nezdravá",
  5: "Velmi nezdravá",
  6: "Nebezpečná",
};

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  await loadWeather(city);
});

async function loadWeather(city) {
  setStatus("Načítám...");
  resultEl.hidden = true;

  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=3&aqi=yes&lang=cs`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Neznámá chyba API");
    }

    renderCurrent(data);
    renderAqi(data.current.air_quality);
    renderForecast(data.forecast.forecastday);

    setStatus("");
    resultEl.hidden = false;
  } catch (err) {
    setStatus(`Chyba: ${err.message}`);
  }
}

function setStatus(msg) {
  statusEl.textContent = msg;
  statusEl.hidden = !msg;
}

function renderCurrent(data) {
  const { location, current } = data;
  document.getElementById("locationName").textContent =
    `${location.name}, ${translateCountry(location.country)}`;
  document.getElementById("conditionIcon").src = `https:${current.condition.icon}`;
  document.getElementById("conditionIcon").alt = current.condition.text;
  document.getElementById("temp").textContent = `${current.temp_c} °C`;
  document.getElementById("conditionText").textContent = current.condition.text;
  document.getElementById("feelslike").textContent = `${current.feelslike_c} °C`;
  document.getElementById("humidity").textContent = `${current.humidity} %`;
  document.getElementById("wind").textContent = `${current.wind_kph} km/h`;
  document.getElementById("uv").textContent = current.uv;
}

function renderAqi(aqi) {
  const epaIndex = aqi["us-epa-index"];
  document.getElementById("epaIndex").textContent = epaIndex;
  document.getElementById("epaLabel").textContent = EPA_LABELS[epaIndex] || "Neznámá";
  document.getElementById("pm25").textContent = aqi.pm2_5.toFixed(1);
  document.getElementById("pm10").textContent = aqi.pm10.toFixed(1);
  document.getElementById("o3").textContent = aqi.o3.toFixed(1);
}

function renderForecast(days) {
  const container = document.getElementById("forecastDays");
  container.innerHTML = "";
  for (const day of days) {
    const el = document.createElement("div");
    el.className = "forecast-day";
    el.innerHTML = `
      <div class="date">${day.date}</div>
      <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
      <div class="maxmin">${day.day.maxtemp_c}° / ${day.day.mintemp_c}°</div>
    `;
    container.appendChild(el);
  }
}
