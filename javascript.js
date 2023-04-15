"use strict";

// DOM elements
const startDateElement = document.getElementById("startDate");
const endDateElement = document.getElementById("endDate");
const weekPresetButton = document.getElementById("weekPreset");
const monthPresetButton = document.getElementById("monthPreset");
const countingUnitsSelector = document.getElementById("counting_units-select");
const calculateButton = document.getElementById("calculate");
const resultLine = document.getElementById("result-line");
const allDaysRadioButton = document.getElementById("all-days");
const workDaysRadioButton = document.getElementById("workdays");
const resultsTable = document.getElementById("results-table");
const clearResultsButton = document.getElementById("clear-results");
const resetButton = document.getElementById("reset");
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");

// constants
const MILISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const MILISECONDS_IN_HOUR = 60 * 60 * 1000;
const MILISECONDS_IN_MINUTE = 60 * 1000;
const MILISECONDS_IN_SECOND = 1000;
const STORAGE_KEY = "dataArray";

//Variables
let result;
let countingUnit;
let daysInTheRange = [];
let daysTakenIntoAccount;
let resultTableItems;
let currentQuoteIndex = 0;
let quotes = [
  {
    quote: "“The most precious resource we all have is time.”",
    author: "Steve Jobs",
  },
  {
    quote: "“Time has a wonderful way of showing us what really matters.”",
    author: "Margaret Peters",
  },
  {
    quote: "“The bad news is time flies. The good news is you’re the pilot.”",
    author: "Michael Altshuler",
  },
  {
    quote:
      "“There is a time for work and a time for love. That leaves no other time.”",
    author: "Coco Chanel",
  },
  { quote: "“Lost time is never found again.”", author: "Benjamin Franklin" },
  {
    quote: "“Time you enjoy wasting, was not wasted.”",
    author: "John Lennon",
  },
  {
    quote: "“If you judge people, you have no time to love them.”",
    author: "Mother Teresa",
  },
  {
    quote:
      "“If you spend too much time thinking about a thing, you’ll never get it done.”",
    author: "Bruce Lee",
  },
  {
    quote: '"No man goes before his time. Unless the boss leaves early."',
    author: "Groucho Marx",
  },
  {
    quote: '"Better three hours too soon than a minute too late."',
    author: "William Shakespeare",
  },
];

// eventListeners

startDateElement.addEventListener("change", unblockSecondInput);
endDateElement.addEventListener("change", unblockCalculateButton);
weekPresetButton.addEventListener("click", presetWeek);
monthPresetButton.addEventListener("click", presetMonth);
resetButton.addEventListener("click", reset);

calculateButton.addEventListener("click", () => {
  getDaysTakenIntoAccount();
  calculateTimeDifference();
  createAndUnshiftObjectIntoArray();
  addResultItemsOnPage();
  reset();
});

clearResultsButton.addEventListener("click", clearAllResults);

// functions

// виводить на сторінку нову цитату з масиву кожні 15 секунд
function showQuote() {
  let quote = quotes[currentQuoteIndex];
  if (currentQuoteIndex < quotes.length - 1) {
    currentQuoteIndex++;
  } else {
    currentQuoteIndex = 0;
  }
  quoteText.textContent = quote.quote;
  quoteAuthor.textContent = quote.author;
}

setInterval(showQuote, 15000);

//Розблоковує друге вікно з датою, якщо введена початкова дата
// блокує в endDateElement всі дати, які йдуть раніше startDate
function unblockSecondInput() {
  if (startDateElement.value) {
    endDateElement.disabled = false;
    endDateElement.setAttribute("min", startDateElement.value);
  }
}

// Розблоковує кнопку calculate, якщо введені обидві дати
// блокує в startDateElement всі дати, які йдуть пізніше endDate
function unblockCalculateButton() {
  if (startDateElement.value && endDateElement.value) {
    calculateButton.disabled = false;
  }
  if (endDateElement.value) {
    startDateElement.setAttribute("max", endDateElement.value);
  }
}

// повертає всі значення інпутів в початковий стан, дізейблить другий інпут і кнопку calculate
function reset() {
  daysInTheRange = [];
  startDateElement.value = "";
  endDateElement.value = "";
  endDateElement.disabled = true;
  calculateButton.disabled = true;
  allDaysRadioButton.checked = true;
  countingUnitsSelector.value = "days";
  startDateElement.removeAttribute("max");
}

// Робить пресет кінцевої дати, яка йде через тиждень після початкової
function presetWeek() {
  let chosenDate = new Date(startDateElement.value);
  endDateElement.value = new Date(chosenDate.setDate(chosenDate.getDate() + 7))
    .toISOString() // повертає дату в фоматі YYYY-MM-DDTHH:mm:ss.sssZ
    .slice(0, 10); // вирізаємо частину YYYY-MM-DD
  unblockCalculateButton();
}

// Робить пресет кінцевої дати, яка йде через місяць після початкової
function presetMonth() {
  let chosenDate = new Date(startDateElement.value);
  endDateElement.value = new Date(
    chosenDate.setMonth(chosenDate.getMonth() + 1)
  )
    .toISOString()
    .slice(0, 10);
  unblockCalculateButton();
}

//Робить масив daysInTheRange з усіма датами, які йдуть в проміжку від startDate до endDate не враховуючи startDate
function getDatesFromTheRange() {
  let startDate = new Date(startDateElement.value);
  let endDate = new Date(endDateElement.value);
  for (let i = startDate; i <= endDate; i.setDate(i.getDate() + 1)) {
    daysInTheRange.push(new Date(i));
  }
  daysInTheRange.shift();
}

// рахує к-сть вихідних днів у масиві daysInTheRange
function getWeekends() {
  getDatesFromTheRange();
  let numberOfWeekends = 0;
  for (let dayOfWeek of daysInTheRange) {
    if (dayOfWeek.getDay() === 0 || dayOfWeek.getDay() === 6) {
      numberOfWeekends = numberOfWeekends + 1;
    }
  }
  return numberOfWeekends;
}

// повідомляє які дні беремо до уваги: всі, робочі чи вихідні
function getDaysTakenIntoAccount() {
  if (allDaysRadioButton.checked === true) {
    daysTakenIntoAccount = "all days";
  } else if (workDaysRadioButton.checked === true) {
    daysTakenIntoAccount = "workdays";
  } else {
    daysTakenIntoAccount = "weekends";
  }
}

// рахує різницю між startDate і endDate залежно від значень daysTakenIntoAccount та countingUnit
function calculateTimeDifference() {
  countingUnit = countingUnitsSelector.value;
  let startDate = new Date(startDateElement.value);
  let endDate = new Date(endDateElement.value);
  let dateDifference;

  if (daysTakenIntoAccount === "all days") {
    dateDifference = endDate - startDate;
  } else if (daysTakenIntoAccount === "workdays") {
    let numberOfWeekends = getWeekends();
    dateDifference =
      endDate - startDate - numberOfWeekends * MILISECONDS_IN_DAY;
  } else {
    let numberOfWeekends = getWeekends();
    dateDifference = numberOfWeekends * MILISECONDS_IN_DAY;
  }

  switch (countingUnit) {
    case "hours":
      result = dateDifference / MILISECONDS_IN_HOUR;
      break;
    case "minutes":
      result = dateDifference / MILISECONDS_IN_MINUTE;
      break;
    case "seconds":
      result = dateDifference / MILISECONDS_IN_SECOND;
      break;
    default:
      result = Math.floor(dateDifference / MILISECONDS_IN_DAY);
  }

  resultLine.textContent = `${result} ${countingUnit}`;
}

//записує результати обчислень після натискання calculate, збирає їх в окремий обєкт і додає цей обєкт в початок масиву
// готовий масив зберігається в local storage
function createAndUnshiftObjectIntoArray() {
  let startDate = new Date(startDateElement.value);
  let endDate = new Date(endDateElement.value);
  let calculatedResult = {
    startDate: startDate.toLocaleDateString(),
    endDate: endDate.toLocaleDateString(),
    result: `${result} ${countingUnit}`,
    daysTakenIntoAccount: daysTakenIntoAccount,
  };
  resultTableItems.unshift(calculatedResult);
  controlresultTableItemsLength();
  storeItemsInLocalStorage();
}

// не дає масиву resultTableItems мати більше 10 елементів
function controlresultTableItemsLength() {
  if (resultTableItems.length > 10) {
    resultTableItems.pop();
  }
}

// бере значення попередніх результатів з масиву обєктів resultTableItems і виводить іх на сторінку у вигляді таблиці
function addResultItemsOnPage() {
  removeItemsFromPage();
  for (let resultItem of resultTableItems) {
    let resultItemValues = Object.values(resultItem);
    let resultsRow = document.createElement("tr");
    resultsTable.append(resultsRow);
    let startColumn = document.createElement("td");
    startColumn.textContent = resultItemValues[0];
    resultsRow.append(startColumn);
    let endColumn = document.createElement("td");
    endColumn.textContent = resultItemValues[1];
    resultsRow.append(endColumn);
    let resultColumn = document.createElement("td");
    resultColumn.textContent = resultItemValues[2];
    resultsRow.append(resultColumn);
    let daysTakenIntoAccountColumn = document.createElement("td");
    daysTakenIntoAccountColumn.textContent = resultItemValues[3];
    resultsRow.append(daysTakenIntoAccountColumn);
  }
}

// видаляє попередні результати зі сторінки, щоб потім викласти результати оновленого масиву resultTableItems
function removeItemsFromPage() {
  let tableColumnToRemove = document.querySelectorAll("table td");
  tableColumnToRemove.forEach((column) => column.remove());
  let tableRowToRemove = document.querySelectorAll("tr:empty");
  tableRowToRemove.forEach((row) => row.remove());
}

//Видаляє всі попередні результати, обнуляє масив resultTableItems, очищає local storage
function clearAllResults() {
  removeItemsFromPage();
  clearResultsFromLocalStorage();
  resultLine.textContent = "";
  resultTableItems = [];
}

// Функції для local storage
function storeItemsInLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resultTableItems));
}

function getItemsFromLocalStorage() {
  resultTableItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function clearResultsFromLocalStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

// Запуск сторінки
function initApp() {
  getItemsFromLocalStorage();
  addResultItemsOnPage();
}

initApp();
