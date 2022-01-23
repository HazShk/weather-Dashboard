'use strict';

// selecting elements
const cityForm = document.querySelector('.city-form');
const cityInput = document.querySelector('#city-input');
const weatherTodayContainer = document.querySelector(
  '.weather-today-container'
);
const buttonsContainer = document.querySelector('.buttons-container');
const forecastInfo = document.querySelector('.forecast-info');
const forecastContainer = document.querySelector('.forecast-container');

// for getting the recently fetched citys name
let curCityName;

// for genareting the search history button and adding it to the page
const genButton = function (name) {
  let html = `<button type="button" class="btn">${name}</button>`;
  buttonsContainer.insertAdjacentHTML('beforeend', html);
};

// getting the previously searched citys from local storage
let prevSearchedCitys = JSON.parse(localStorage.getItem('citys'));

// if there is any then
if (prevSearchedCitys) {
  // looping over the array and calling the generator for each city name
  for (const city of prevSearchedCitys) {
    genButton(city);
  }
} else {
  // else setting it to empty array, will use later for keeping track
  prevSearchedCitys = [];
}

// for generating date
const dateGen = function (dt) {
  const date = new Date(dt * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// for showing the current data on page
const showCurrentData = function (obj) {
  // destructuring needed data from the obj
  const {
    dt,
    temp: { max },
    humidity,
    wind_speed: wind,
    uvi,
    weather: [{ icon }],
  } = obj;

  // generating the date
  const date = dateGen(dt);
  // for uv color coding
  let uvColor = '';

  if (uvi < 3) {
    uvColor = 'green';
  }
  if (uvi >= 3 && uvi < 6) {
    uvColor = 'yellow';
  }
  if (uvi >= 6 && uvi < 8) {
    uvColor = 'orange';
  }
  if (uvi >= 8 && uvi < 11) {
    uvColor = 'red';
  }
  if (uvi >= 11) {
    uvColor = 'purple';
  }

  // generating the html for the current weather info
  const html = `<div class="weather-today">
  <div class="part-head today-head">
    <h2 class="city-name">${curCityName} (${date})</h2>
    <img
      src="http://openweathermap.org/img/wn/${icon}.png"
      alt="weather icon"
    />
  </div>
  <div class="weather-info">
    <p class="temp">Temp: ${max}°F</p>
    <p class="wind">
      Wind: ${wind} MPH
    </p>
    <p class="humidity">
      Humidity: ${humidity}%
    </p>
    <p class="uvi">
      UV Index: <span class="showuvi ${uvColor}">${uvi}</span>
    </p>
  </div>
</div>`;

  // clearing the container
  weatherTodayContainer.innerHTML = '';
  // adding the html to the container
  weatherTodayContainer.insertAdjacentHTML('afterbegin', html);
};

// for showing the forecast info
const showForecast = function (data) {
  let html = '';

  // looping over each of the data and generting html for 5 days
  for (const info of data) {
    // destructuring needed data from the obj
    const {
      dt,
      temp: { max },
      humidity,
      wind_speed: wind,
      weather: [{ icon }],
    } = info;
    const date = dateGen(dt);
    // appending to the html string
    html += `<div class="forecast-card">
       <h3 class="forecast-date">${date}</h3>
       <img
         src="http://openweathermap.org/img/wn/${icon}.png"
         alt="weather-icon"
         class="forecast-icon"
       />
       <div class="weather-info">
         <p class="temp">Temp: ${max}°F</p>
         <p class="wind">Wind: ${wind} MPH</p>
         <p class="humidity">
           Humidity: ${humidity}%
         </p>
       </div>
     </div>`;
  }

  //   showing the forecast block
  forecastInfo.style.display = 'block';
  // clearing the forecast cards contianer block
  forecastContainer.innerHTML = '';
  // adding the html on the card container block
  forecastContainer.insertAdjacentHTML('afterbegin', html);
};

// for getting the weather data
const getWeatherData = function (lat, lon) {
  // fetching the weather data
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,hourly,minutely&units=imperial&appid=0c329a95da2b0f1e7842ecb5f393a7fb`
  )
    .then(res => res.json())
    .then(data => {
      // showing the current data
      showCurrentData(data.daily[0]);
      // showing the forecast data
      showForecast(data.daily.slice(1, 6));
    });
};

// for getting the local storage data
const getLocalStorage = function () {
  const localData = JSON.parse(localStorage.getItem('citys'));
  return localData;
};

// for setting the local storage data
const setLocalStorage = function (data) {
  let localData = getLocalStorage();
  if (localData) {
    localData.push(data);
  } else {
    localData = [data];
  }

  // setting the local storage
  localStorage.setItem('citys', JSON.stringify(localData));
};

// getting the lat and lon of the typed city in search bar
const getLatLon = function (cityName) {
  // fetching the lat and lon of the named city
  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=0c329a95da2b0f1e7842ecb5f393a7fb`
  )
    .then(res => res.json())
    .then(data => {
      // destructuring the lat lon and name from the data
      const { lat, lon, name } = data[0];
      // setting the curcity to the fetched city name
      curCityName = name;
      // if the city hasn't been searched already
      if (!prevSearchedCitys.includes(name)) {
        // pushing it to the array for tracking
        prevSearchedCitys.push(name);
        // generating a button for it
        genButton(name);
        // adding to the local storage
        setLocalStorage(name);
      }
      // getting the weather data with the lat lon
      getWeatherData(lat, lon);
    })
    .catch(err => {
      console.log(err.message);
    });
};

// form submit event
cityForm.addEventListener('submit', e => {
  e.preventDefault();

  // formatting the city name for fetch request
  const cityName = cityInput.value.split(' ').join('-');
  // calling the getlatlon func
  getLatLon(cityName);
});

// adding the click event on the parent of search buttons
buttonsContainer.addEventListener('click', e => {
  // if the click happens on a search button then
  if (e.target.classList.contains('btn')) {
    // get lat lon for that city
    getLatLon(e.target.innerText);
  }
});

// displaying toronto weather on page load
window.onload = function () {
  getLatLon('toronto');
};

// end
