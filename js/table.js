import { formatDateTime } from "./format_datetime.js";

let weatherData = [];
let sortDirection = { timestamp: "desc", temperature: "asc", humidity: "asc" };

async function fetchData() {
    try {
        const response = await fetch("/backend/data.php?range=all");
        const text = await response.text();
        console.log("Server response:", text);

        const result = JSON.parse(text);

        if (!Array.isArray(result)) {
            console.error("Invalid data format:", result);
            return [];
        }

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

async function loadTable() {
    weatherData = await fetchData();

    weatherData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    renderTable();
    updateSortIcons("timestamp");
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

    updateSortIcons();
}

function sortTable(column) {
    if (!weatherData.length) {
        console.error("Error: No data available to sort.");
        return;
    }

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

    renderTable();
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

document.addEventListener("DOMContentLoaded", loadTable);

window.sortTable = sortTable;
