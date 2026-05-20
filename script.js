const pages = [
  { id: "home", label: "Home", href: "index.html" },
  { id: "causes", label: "Causes", href: "causes.html" },
  { id: "impacts", label: "Impacts", href: "impacts.html" },
  { id: "solutions", label: "Solutions", href: "solutions.html" },
  { id: "weather", label: "Weather", href: "weather.html" }
];

const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail"
};

let weatherState = {
  unit: localStorage.getItem("weatherUnit") || "c",
  data: null,
  selectedPlace: null,
  suggestionTimer: null,
  suggestionAbort: null
};

document.addEventListener("DOMContentLoaded", () => {
  buildNavigation();
  applySavedTheme();
  setupScrollProgress();
  setupScrollAnimations();
  setupPointerEffects();
  setupWeather();
});

function buildNavigation() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const currentPage = document.body.dataset.page || getPageFromPath();
  header.innerHTML = `
    <nav class="nav" aria-label="Main navigation">
      <a class="brand" href="index.html" aria-label="Climate Shift home">
        <span class="brand-mark" aria-hidden="true">C</span>
        <span>Climate Shift</span>
      </a>
      <div class="nav-links" id="navLinks">
        ${pages.map((page) => `
          <a class="nav-link${page.id === currentPage ? " active" : ""}" href="${page.href}" ${page.id === currentPage ? 'aria-current="page"' : ""}>${page.label}</a>
        `).join("")}
      </div>
      <div class="nav-actions">
        <button class="icon-button" id="themeToggle" type="button" aria-label="Switch theme" title="Switch theme"><span class="theme-icon" aria-hidden="true"></span></button>
        <button class="icon-button menu-toggle" id="menuToggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks"><span class="menu-icon" aria-hidden="true"></span></button>
      </div>
    </nav>
    <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
  `;

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
}

function setupScrollProgress() {
  const progress = document.getElementById("scrollProgress");
  const header = document.querySelector(".site-header");
  if (!progress || !header) return;

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = `scaleX(${Math.min(Math.max(amount, 0), 1)})`;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function setupScrollAnimations() {
  const revealTargets = document.querySelectorAll([
    ".section",
    ".section-heading",
    ".feature-panel",
    ".topic-card",
    ".info-card",
    ".solution-card",
    ".impact-row",
    ".callout-band",
    ".action-list li",
    ".weather-search",
    ".weather-card",
    ".weather-note",
    ".rounded-media"
  ].join(","));

  if (!revealTargets.length) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  });

  revealTargets.forEach((element) => observer.observe(element));
}

function setupPointerEffects() {
  const surfaces = document.querySelectorAll([
    ".feature-panel",
    ".topic-card",
    ".info-card",
    ".solution-card",
    ".impact-row",
    ".weather-search",
    ".weather-card",
    ".weather-note",
    ".action-list li",
    ".forecast-day",
    ".weather-meta div",
    ".hero-data div"
  ].join(","));

  if (!surfaces.length || !window.matchMedia("(hover: hover)").matches) return;

  surfaces.forEach((surface) => {
    surface.classList.add("magnetic-surface");

    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      surface.style.setProperty("--mx", `${x}%`);
      surface.style.setProperty("--my", `${y}%`);
    });

    surface.addEventListener("pointerleave", () => {
      surface.style.removeProperty("--mx");
      surface.style.removeProperty("--my");
    });
  });
}

function getPageFromPath() {
  const fileName = window.location.pathname.split("/").pop() || "index.html";
  const match = pages.find((page) => page.href === fileName);
  return match ? match.id : "home";
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("siteTheme");
  const preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (preferredDark ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  updateThemeButton(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("siteTheme", nextTheme);
  updateThemeButton(nextTheme);
}

function updateThemeButton(theme) {
  const button = document.getElementById("themeToggle");
  if (!button) return;
  button.classList.toggle("light-target", theme === "dark");
  button.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}

function setupWeather() {
  const form = document.getElementById("weatherForm");
  if (!form) return;

  const locationInput = document.getElementById("locationInput");
  const suggestions = document.getElementById("locationSuggestions");
  const unitButtons = document.querySelectorAll(".unit-button");
  unitButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.unit === weatherState.unit);
    button.addEventListener("click", () => {
      weatherState.unit = button.dataset.unit;
      localStorage.setItem("weatherUnit", weatherState.unit);
      unitButtons.forEach((item) => item.classList.toggle("active", item === button));
      if (weatherState.data) renderWeather(weatherState.data);
    });
  });

  locationInput.addEventListener("input", () => {
    weatherState.selectedPlace = null;
    queueLocationSuggestions(locationInput.value.trim());
  });

  locationInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideSuggestions();
    }

    if (event.key === "ArrowDown" && !suggestions.hidden) {
      const firstSuggestion = suggestions.querySelector(".suggestion-button");
      if (firstSuggestion) {
        event.preventDefault();
        firstSuggestion.focus();
      }
    }
  });

  suggestions.addEventListener("keydown", (event) => {
    const buttons = Array.from(suggestions.querySelectorAll(".suggestion-button"));
    const currentIndex = buttons.indexOf(document.activeElement);

    if (event.key === "Escape") {
      hideSuggestions();
      locationInput.focus();
    }

    if (event.key === "ArrowDown" && currentIndex >= 0) {
      event.preventDefault();
      buttons[Math.min(currentIndex + 1, buttons.length - 1)].focus();
    }

    if (event.key === "ArrowUp" && currentIndex >= 0) {
      event.preventDefault();
      if (currentIndex === 0) {
        locationInput.focus();
      } else {
        buttons[currentIndex - 1].focus();
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!form.contains(event.target)) {
      hideSuggestions();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const location = locationInput.value.trim();
    if (!location) return;
    hideSuggestions();
    await loadWeather(location, weatherState.selectedPlace);
  });
}

function queueLocationSuggestions(query) {
  clearTimeout(weatherState.suggestionTimer);

  if (weatherState.suggestionAbort) {
    weatherState.suggestionAbort.abort();
  }

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  renderSuggestionStatus("Searching locations...");
  weatherState.suggestionTimer = setTimeout(async () => {
    weatherState.suggestionAbort = new AbortController();

    try {
      const places = await searchLocations(query, 6, weatherState.suggestionAbort.signal);
      renderLocationSuggestions(places, query);
    } catch (error) {
      if (error.name !== "AbortError") {
        renderSuggestionStatus("Could not load suggestions.");
      }
    }
  }, 250);
}

async function searchLocations(query, count, signal) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`;
  const geoResponse = await fetch(geoUrl, { signal });
  if (!geoResponse.ok) throw new Error("Unable to search for that location.");
  const geoData = await geoResponse.json();
  return geoData.results || [];
}

function renderLocationSuggestions(places, query) {
  const suggestions = document.getElementById("locationSuggestions");

  if (!places.length) {
    renderSuggestionStatus(`No suggestions found for "${escapeHtml(query)}".`);
    return;
  }

  suggestions.innerHTML = places.map((place, index) => {
    const name = escapeHtml(place.name);
    const detail = escapeHtml([place.admin1, place.country].filter(Boolean).join(", "));
    return `
      <button class="suggestion-button" type="button" role="option" data-index="${index}">
        <strong>${name}</strong>
        <span>${detail || "Weather location"}</span>
      </button>
    `;
  }).join("");

  suggestions.hidden = false;
  suggestions.querySelectorAll(".suggestion-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const place = places[Number(button.dataset.index)];
      selectLocationSuggestion(place);
      await loadWeather(formatPlaceName(place), place);
    });
  });
}

function renderSuggestionStatus(message) {
  const suggestions = document.getElementById("locationSuggestions");
  suggestions.innerHTML = `<p class="suggestion-status">${message}</p>`;
  suggestions.hidden = false;
}

function selectLocationSuggestion(place) {
  const locationInput = document.getElementById("locationInput");
  locationInput.value = formatPlaceName(place);
  weatherState.selectedPlace = place;
  hideSuggestions();
}

function hideSuggestions() {
  const suggestions = document.getElementById("locationSuggestions");
  if (!suggestions) return;
  suggestions.hidden = true;
  suggestions.innerHTML = "";
}

function formatPlaceName(place) {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

async function loadWeather(location, selectedPlace) {
  const weatherCard = document.getElementById("weatherCard");
  weatherCard.innerHTML = '<p class="weather-empty">Loading weather data...</p>';

  try {
    const place = selectedPlace || (await searchLocations(location, 1))[0];
    if (!place) throw new Error("No matching location was found.");

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.search = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min,weather_code",
      timezone: "auto",
      forecast_days: "3"
    });

    const weatherResponse = await fetch(forecastUrl);
    if (!weatherResponse.ok) throw new Error("Weather data is temporarily unavailable.");
    const weatherData = await weatherResponse.json();
    weatherState.data = { place, weather: weatherData };
    renderWeather(weatherState.data);
  } catch (error) {
    weatherCard.innerHTML = `<p class="weather-error">${error.message}</p>`;
  }
}

function renderWeather(data) {
  const weatherCard = document.getElementById("weatherCard");
  const { place, weather } = data;
  const current = weather.current;
  const condition = weatherCodes[current.weather_code] || "Weather update";
  const temp = formatTemp(current.temperature_2m);
  const placeTitle = escapeHtml(`${place.name}${place.country ? `, ${place.country}` : ""}`);
  const forecast = weather.daily.time.map((day, index) => {
    const high = formatTemp(weather.daily.temperature_2m_max[index]);
    const low = formatTemp(weather.daily.temperature_2m_min[index]);
    const label = index === 0 ? "Today" : new Date(day).toLocaleDateString(undefined, { weekday: "short" });
    return `
      <div class="forecast-day">
        <strong>${label}</strong>
        <span>${weatherCodes[weather.daily.weather_code[index]] || "Forecast"}</span>
        <p>${high} / ${low}</p>
      </div>
    `;
  }).join("");

  weatherCard.innerHTML = `
    <div class="weather-main">
      <div>
        <h2>${placeTitle}</h2>
        <p class="condition">${condition}</p>
      </div>
      <div class="temp">${temp}</div>
    </div>
    <div class="weather-meta">
      <div>
        <span>Humidity</span>
        <strong>${Math.round(current.relative_humidity_2m)}%</strong>
      </div>
      <div>
        <span>Wind</span>
        <strong>${Math.round(current.wind_speed_10m)} km/h</strong>
      </div>
      <div>
        <span>Updated</span>
        <strong>${new Date(current.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
      </div>
    </div>
    <div class="forecast">${forecast}</div>
  `;
}

function formatTemp(celsius) {
  if (weatherState.unit === "f") {
    return `${Math.round((celsius * 9) / 5 + 32)} F`;
  }
  return `${Math.round(celsius)} C`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}
