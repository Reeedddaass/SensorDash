import { formatDateTime } from "./format_datetime.js";

let weatherData = [];
let sortDirection = { timestamp: "desc", temperature: "asc", humidity: "asc" };
let activeSortColumn = "timestamp";
let offset = 0;
const limit = 50;
let isFetching = false;
let allDataLoaded = false;

async function fetchDataChunk() {
  if (isFetching || allDataLoaded) return;

  isFetching = true;

  try {
    const sortBy = activeSortColumn;
    const sortDir = sortDirection[sortBy];
    const response = await fetch(`/backend/tables/dht22_table.php?range=all&offset=${offset}&limit=${limit}&sort_by=${sortBy}&sort_dir=${sortDir}`);
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Invalid table data format:", data);
      return;
    }

    if (data.length < limit) {
      allDataLoaded = true;
    }

    weatherData = weatherData.concat(data);
    offset += limit;

    renderTable();
  } catch (error) {
    console.error("Error fetching table data:", error);
  } finally {
    isFetching = false;
  }
}

function renderTable() {
  const tableBody = document.getElementById("data-table");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  weatherData.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="py-3 px-4 border">${formatDateTime(entry.timestamp)}</td>
      <td class="py-3 px-4 border">${entry.temperature}°C</td>
      <td class="py-3 px-4 border">${entry.humidity}%</td>
    `;
    tableBody.appendChild(row);
  });

  updateSortIcons(activeSortColumn);
}

async function sortTable(column) {
  sortDirection[column] = sortDirection[column] === "asc" ? "desc" : "asc";
  activeSortColumn = column;
  weatherData = [];
  offset = 0;
  allDataLoaded = false;
  await fetchDataChunk();
  updateSortIcons(column);
}

function updateSortIcons(activeColumn = "timestamp") {
  ["timestamp", "temperature", "humidity"].forEach((col) => {
    const sortElement = document.getElementById(`${col}-sort`);
    if (sortElement) {
      if (col === activeColumn) {
        sortElement.textContent = sortDirection[col] === "asc" ? "▲" : "▼";
        sortElement.classList.remove("hidden");
      } else {
        sortElement.classList.add("hidden");
      }
    }
  });
}

window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    fetchDataChunk();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  fetchDataChunk();
});

window.sortTable = sortTable;