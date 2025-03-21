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

        const response = await fetch(`/backend/data.php?range=all&offset=${offset}&limit=${limit}&sort_by=${sortBy}&sort_dir=${sortDir}`);
        const text = await response.text();
        console.log("Server response:", text);

        const result = JSON.parse(text);

        if (!Array.isArray(result)) {
            console.error("Invalid data format:", result);
            return;
        }

        if (result.length < limit) {
            allDataLoaded = true;
        }

        weatherData = weatherData.concat(result);
        offset += limit;

        renderTable();
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        isFetching = false;
    }
}

function renderTable() {
    const tableBody = document.getElementById("data-table");

    if (!tableBody) {
        console.error("Error: Table body element not found.");
        return;
    }

    tableBody.innerHTML = "";

    weatherData.forEach((entry) => {
        const row = document.createElement("tr");
        const formattedTimestamp = formatDateTime(entry.timestamp);

        row.innerHTML = `
            <td class="py-3 px-4 border">${formattedTimestamp}</td>
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
    const columns = ["timestamp", "temperature", "humidity"];

    columns.forEach((col) => {
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