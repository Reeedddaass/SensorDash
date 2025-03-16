import { formatDateTime } from "./format_datetime.js"; 

document.addEventListener("DOMContentLoaded", function () {
    const tempCanvas = document.getElementById("tempChart");
    const humiCanvas = document.getElementById("humiChart");

    if (!tempCanvas || !humiCanvas) {
        console.error("Error: One or both canvas elements are missing in the HTML.");
        return;
    }

    const ctxTemp = tempCanvas.getContext("2d");
    const ctxHumi = humiCanvas.getContext("2d");

    let tempChart = null;
    let humiChart = null;

    async function fetchAndUpdateCharts(timeRange = "24h") {
        try {
            const response = await fetch(`/backend/data.php?range=${timeRange}`);
            const text = await response.text();

            console.log("Server response:", text);

            const data = JSON.parse(text);

            if (!data || data.error) {
                console.error("Error from server:", data.error);
                alert(`Error: ${data.error}`);
                return;
            }

            const labels = data.map(entry => formatDateTime(entry.timestamp));
            const temperatures = data.map(entry => parseFloat(entry.temperature));
            const humidities = data.map(entry => parseFloat(entry.humidity));

            updateTemperatureChart(labels, temperatures);
            updateHumidityChart(labels, humidities);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to fetch data. Check console for details.");
        }
    }

    function updateTemperatureChart(labels, temperatures) {
        if (tempChart) {
            tempChart.destroy();
        }

        tempChart = new Chart(ctxTemp, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Temperature (°C)",
                        data: temperatures,
                        borderColor: "red",
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "category",
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateHumidityChart(labels, humidities) {
        if (humiChart) {
            humiChart.destroy();
        }

        humiChart = new Chart(ctxHumi, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Humidity (%)",
                        data: humidities,
                        borderColor: "blue",
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "category",
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    document.querySelectorAll(".time-filter").forEach(button => {
        button.addEventListener("click", function () {
            const timeRange = this.getAttribute("data-range");
            fetchAndUpdateCharts(timeRange);
        });
    });

    fetchAndUpdateCharts("24h");

    setInterval(() => fetchAndUpdateCharts("24h"), 300000);
});
