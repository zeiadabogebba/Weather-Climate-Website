# Climate Shift

Climate Shift is a multi-page educational website about drastic climate changes. It explains the causes, impacts, and solutions of climate change, and includes a live weather search tool powered by a public weather API.

## Project Features

- Multi-page static website built with HTML, CSS, and JavaScript
- Dynamic navigation bar that highlights the current page
- Responsive design for desktop, tablet, and mobile screens
- Light mode and dark mode theme toggle
- Scroll animations and hover effects throughout the site
- Live weather search for any city or location
- Real-time location suggestions while typing
- Celsius and Fahrenheit temperature toggle
- Modern visual design with climate-inspired textures and animated interface details

## Pages

- `index.html` - Home page and overview
- `causes.html` - Main causes of climate change
- `impacts.html` - Effects and risks of climate change
- `solutions.html` - Practical climate solutions
- `weather.html` - Live weather search tool

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Open-Meteo Geocoding API
- Open-Meteo Forecast API
- Google Fonts

## How To Run

Open `index.html` directly in a browser, or run the folder with a local server.

If Node.js is installed, you can use:

```bash
npx serve .
```

Then open the local URL shown in the terminal.

## Weather API

This project uses Open-Meteo public APIs:

- Geocoding API for live location suggestions
- Forecast API for current weather and short forecast data

No API key is required.

## Folder Structure

```text
WebDevLevel2/
  index.html
  causes.html
  impacts.html
  solutions.html
  weather.html
  styles.css
  script.js
  README.md
```

## Main JavaScript Features

- Builds the navigation bar dynamically
- Detects and highlights the active page
- Saves the selected theme in local storage
- Fetches live city suggestions from Open-Meteo
- Fetches current weather and forecast data
- Converts temperatures between Celsius and Fahrenheit
- Adds scroll progress and reveal animations

## Credits

Weather data is provided by [Open-Meteo](https://open-meteo.com/).

Images are loaded from [Unsplash](https://unsplash.com/).
