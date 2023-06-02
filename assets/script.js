const textBox = $("#search");
const searchBtn = $("#search-btn");
const searchHist = $("#search-history");

let results = $("#daily");
let results5Day = $("#5-day");

const API_KEY = "ac837af1908d57698912579f839a6ba0";

let today = dayjs();
let historyData = localStorage.getItem("history");
let historyList = [];

const showHistory = () => {
   
  const findHistory = localStorage.getItem("history");
  let historyData = [];
  if (findHistory) {
    historyData = JSON.parse(findHistory);
  }
  const htmlHistory = historyData
    .reverse()
    .map(
      (city) =>
        `<button class="buttons button-style btn btn-primary">${city}</button>`
    )
    .join("");
  searchHist.html(htmlHistory);
};

showHistory();

const process = async (cityName) => {
  const responseUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&&appid=${API_KEY}`;

  try {
    const currentData = await fetch(responseUrl).then((response) =>
      response.json()
    );

    processHistory(cityName);
 
    const { lon: longitude, lat: latitude } = currentData.coord;
    const { temp: currTemp, humidity: currHumidity } = currentData.main;
    const { speed: currWind } = currentData.wind;

    const htmlCurrStat = `
      <h1>${cityName} ${today.format(
      " [(]M/D/YY[)] "
    )} <img src="http://openweathermap.org/img/wn/${
      currentData.weather[0].icon
    }.png"></h1>
      <p>Temp: ${currTemp}˚</p>
      <p>Wind: ${currWind} MPH</p>
      <p>Humidity: ${currHumidity}%</p>
    `;
    const fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_KEY}`;
    const fiveDayData = await fetch(fiveDayURL).then((response) =>
      response.json()
    );
    const listData = fiveDayData.list;

    let htmlIter = `<h2 class="five-day-forecast-title">5-Day Forecast:</h2>`;

    listData.forEach((element, idx) => {
      if (idx % 8 === 0) {
        const { temp: tempIter, humidity: humiIter } = element.main;
        const { speed: windIter } = element.wind;
        const dateTxt = element.dt_txt;
        const icon = element.weather[0].icon;

        htmlIter += `
          <div class="card card-elements card-style">
            <div class="card-body">
              <p class="card-title five-day-forecast-title">${
                dateTxt.split(" ")[0].split("-")[1]
              }/${dateTxt.split(" ")[0].split("-")[2]}/${
          dateTxt.split(" ")[0].split("-")[0]
        }</p>
              <img src="http://openweathermap.org/img/wn/${icon}.png">
              <p class="status-data">Temp: ${tempIter}˚</p>
              <p class="status-data">Wind: ${windIter} MPH</p>
              <p class="status-data">Humidity: ${humiIter}%</p>
            </div>
          </div>
        `;
      }
    });

    results.html(htmlCurrStat);
    results.addClass("current-status");
    results5Day.html(htmlIter);
  } catch (err) {
    console.log(err);
  }
};

const processHistory = (cityName) => {
  let tempHistory = JSON.parse(localStorage.getItem("history")) || [];
  if (!tempHistory.includes(cityName)) {
    if (tempHistory.length === 10) {
      tempHistory.shift();
    }
    tempHistory.push(cityName);
    localStorage.setItem("history", JSON.stringify(tempHistory));
  }
  showHistory();
};

const processBtn = () => {
  const city = textBox.val();
  process(city);
};

searchBtn.click(processBtn);

searchHist.on("click", ".buttons", (event) => {
  const citySelected = event.target.innerText;
  textBox.val(citySelected);
  process(citySelected);
});