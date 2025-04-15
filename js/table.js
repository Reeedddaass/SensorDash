import { formatDateTime } from "./format_datetime.js";

let weatherData = [];
let sortDirection = { timestamp: "desc", temperature: "asc", humidity: "asc", pressure: "asc", light_level: "asc" };
let activeSortColumn = "timestamp";
let offset = 0;
const limit = 50;
let isFetching = false;
let allDataLoaded = false;
let activeSensor = "dht22";

function getTableFields(sensor) {
  switch (sensor) {
    case "bme280":
      return ["timestamp", "temperature", "humidity", "pressure"];
    case "ldr":
      return ["timestamp", "light_level"];
    default:
      return ["timestamp", "temperature", "humidity"];
  }
}

async function fetchDataChunk() {
  if (isFetching || allDataLoaded) return;

  isFetching = true;

  try {
    const sortBy = activeSortColumn;
    const sortDir = sortDirection[sortBy] || "asc";
    const response = await fetch(`/backend/tables/${activeSensor}_table.php?range=all&offset=${offset}&limit=${limit}&sort_by=${sortBy}&sort_dir=${sortDir}`);
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
  const tableHead = document.getElementById("table-head");
  if (!tableBody || !tableHead) return;

  const fields = getTableFields(activeSensor);

  tableHead.innerHTML = `
    <tr>
      ${fields.map((field) => `
        <th class="py-3 px-4 border cursor-pointer" onclick="sortTable('${field}')">
          ${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
          <span id="${field}-sort" class="ml-2 hidden">▼</span>
        </th>
      `).join("")}
    </tr>
  `;

  tableBody.innerHTML = "";
  weatherData.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = fields.map(field => {
      const value = field === "timestamp" ? formatDateTime(entry[field]) : entry[field];
      return `<td class="py-3 px-4 border">${value}</td>`;
    }).join("");
    tableBody.appendChild(row);
  });

  updateSortIcons(activeSortColumn);
}

async function sortTable(column) {
  if (!(column in sortDirection)) {
    sortDirection[column] = "asc";
  }

  sortDirection[column] = sortDirection[column] === "asc" ? "desc" : "asc";
  activeSortColumn = column;
  weatherData = [];
  offset = 0;
  allDataLoaded = false;
  await fetchDataChunk();
  updateSortIcons(column);
}


function updateSortIcons(activeColumn = "timestamp") {
  const fields = getTableFields(activeSensor);
  fields.forEach((col) => {
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

  const sensorButtons = document.querySelectorAll(".sensor-filter");
  sensorButtons.forEach(button => {
    button.addEventListener("click", () => {
      const sensor = button.getAttribute("data-sensor");
      if (!sensor || sensor === activeSensor) return;

      activeSensor = sensor;
      activeSortColumn = "timestamp";
      weatherData = [];
      offset = 0;
      allDataLoaded = false;

      sensorButtons.forEach(b => b.classList.remove("bg-slate-400", "text-white"));

      button.classList.add("bg-slate-400", "text-white");

      fetchDataChunk();
    });
  });

  const defaultButton = document.querySelector('.sensor-filter[data-sensor="dht22"]');
  if (defaultButton) {
    defaultButton.classList.add("bg-slate-400", "text-white");
  }
});


window.sortTable = sortTable;

const scrollBtn = document.getElementById("scroll-to-top");

window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    fetchDataChunk();
  }

  if (scrollBtn) {
    if (window.scrollY > 300) {
      scrollBtn.classList.remove("opacity-0", "pointer-events-none");
    } else {
      scrollBtn.classList.add("opacity-0", "pointer-events-none");
    }
  }
});

if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
