import { fetchData } from "./fetch_data.js";
import { formatDate } from "./format_datetime.js";

let weatherData = [];
let sortDirection = { timestamp: "asc", temperature: "asc", humidity: "asc" };

async function loadTable() {
    weatherData = await fetchData();
    renderTable();
}

function renderTable() {
    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = "";

    weatherData.forEach((entry) => {
        const row = document.createElement("tr");

        const formattedTimestamp = formatDate(entry.timestamp);

        row.innerHTML = `
            <td class="py-3 px-4">${formattedTimestamp}</td>
            <td class="py-3 px-4">${entry.temperature}°C</td>
            <td class="py-3 px-4">${entry.humidity}%</td>
        `;
    
        tableBody.appendChild(row);
    });
}

function sortTable(column) {
    sortDirection[column] = sortDirection[column] === "asc" ? "desc" : "asc";
    weatherData.sort((a, b) => {
        if (column === "timestamp") {
            return sortDirection[column] === "asc"
                ? new Date(a[column]) - new Date(b[column])
                : new Date(b[column]) - new Date(a[column]);
        } else {
            return sortDirection[column] === "asc"
                ? a[column] - b[column]
                : b[column] - a[column];
        }
    });

    updateSortIcons(column);
    renderTable();
}

function updateSortIcons(activeColumn) {
    document.getElementById("timestamp-sort").textContent = activeColumn === "timestamp" ? (sortDirection.timestamp === "asc" ? "∧" : "∨") : "";
    document.getElementById("temperature-sort").textContent = activeColumn === "temperature" ? (sortDirection.temperature === "asc" ? "∧" : "∨") : "";
    document.getElementById("humidity-sort").textContent = activeColumn === "humidity" ? (sortDirection.humidity === "asc" ? "∧" : "∨") : "";
}

window.sortTable = sortTable;
window.onload = loadTable;