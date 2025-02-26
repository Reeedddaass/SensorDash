import { fetchData } from './fetch_data.js';
import { formatDate } from './format_datetime.js';

let tempChart = null;
let humiChart = null;

async function updateChart() {
    const data = await fetchData();

    const limitedData = data.slice(0, 9);

    const timestamps = limitedData.map(d => formatDate(d.timestamp)).reverse();
    const temperatures = limitedData.map(d => d.temperature).reverse();
    const humidities = limitedData.map(d => d.humidity).reverse();

    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    const ctxHumi = document.getElementById('humiChart').getContext('2d');

    if (tempChart !== null) { tempChart.destroy(); }
    if (humiChart !== null) { humiChart.destroy(); }

    tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: timestamps,
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
            maintainAspectRatio: false
        }
    });

    humiChart = new Chart(ctxHumi, {
        type: 'line',
        data: {
            labels: timestamps,
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
            maintainAspectRatio: false
        }
    });
}

window.onload = () => {
    updateChart();
    setInterval(updateChart, 600000);
};