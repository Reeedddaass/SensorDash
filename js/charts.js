import { formatDateTime } from "./format_datetime.js";

let temperatureChart, humidityChart;
let bmeTemperatureChart, bmeHumidityChart, bmePressureChart;
let ldrChart;

function updateChart(chart, labels, data) {
  if (!chart) return;
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

async function fetchDHT22ChartData(range = "24h") {
  try {
    const response = await fetch(`/backend/charts/dht22_chart.php?range=${range}`);
    const data = await response.json();

    if (!Array.isArray(data)) throw new Error("Invalid DHT22 chart data.");

    const labels = data.map(entry => formatDateTime(entry.timestamp));
    const tempData = data.map(entry => entry.temperature);
    const humiData = data.map(entry => entry.humidity);

    updateChart(temperatureChart, labels, tempData);
    updateChart(humidityChart, labels, humiData);
  } catch (error) {
    console.error("Error fetching DHT22 chart data:", error);
  }
}

async function fetchBMEChartData(range = "24h") {
  try {
    const response = await fetch(`/backend/charts/bme280_chart.php?range=${range}`);
    const data = await response.json();

    if (!Array.isArray(data)) throw new Error("Invalid BME280 chart data.");

    const labels = data.map(entry => formatDateTime(entry.timestamp));
    const tempData = data.map(entry => entry.temperature);
    const humiData = data.map(entry => entry.humidity);
    const pressureData = data.map(entry => entry.pressure);

    updateChart(bmeTemperatureChart, labels, tempData);
    updateChart(bmeHumidityChart, labels, humiData);
    updateChart(bmePressureChart, labels, pressureData);
  } catch (error) {
    console.error("Error fetching BME280 chart data:", error);
  }
}

async function fetchLDRChartData(range = "24h") {
  try {
    const response = await fetch(`/backend/charts/ldr_chart.php?range=${range}`);
    const data = await response.json();

    if (!Array.isArray(data)) throw new Error("Invalid LDR chart data.");

    const labels = data.map(entry => formatDateTime(entry.timestamp));
    const lightData = data.map(entry => entry.light_level);

    updateChart(ldrChart, labels, lightData);
  } catch (error) {
    console.error("Error fetching LDR chart data:", error);
  }
}

function createCharts() {
  const ctx = id => {
    const canvas = document.getElementById(id);
    return canvas ? canvas.getContext("2d") : null;
  };

  temperatureChart = new Chart(ctx("temperature-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Temperature (°C)",
        data: [],
        borderColor: "#FF0000",
        backgroundColor: "transparent",
        borderWidth: 2,
      }],
    },
    options: { responsive: true },
  });

  humidityChart = new Chart(ctx("humidity-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Humidity (%)",
        data: [],
        borderColor: "#FF0000",
        backgroundColor: "transparent",
        borderWidth: 2,
      }],
    },
    options: { responsive: true },
  });

  bmeTemperatureChart = new Chart(ctx("bme-temperature-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "BME Temp (°C)",
        data: [],
        borderColor: "#00FF00",
        backgroundColor: "transparent",
        borderWidth: 2,
      }],
    },
    options: { responsive: true },
  });

  bmeHumidityChart = new Chart(ctx("bme-humidity-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "BME Humidity (%)",
        data: [],
        borderColor: "#00FF00",
        backgroundColor: "transparent",
        borderWidth: 2,
      }],
    },
    options: { responsive: true },
  });

  bmePressureChart = new Chart(ctx("bme-pressure-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Pressure (hPa)",
        data: [],
        borderColor: "#00FF00",
        backgroundColor: "transparent",
        borderWidth: 2,
      }],
    },
    options: { responsive: true },
  });

  ldrChart = new Chart(ctx("ldr-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Light Level",
        data: [],
        borderColor: "#0000FF",
        backgroundColor: "transparent",
        borderWidth: 2,
      }],
    },
    options: { responsive: true },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createCharts();

  const defaultRange = "24h";
  fetchDHT22ChartData(defaultRange);
  fetchBMEChartData(defaultRange);
  fetchLDRChartData(defaultRange);

  const rangeLabels = document.querySelectorAll("[data-range]");
  rangeLabels.forEach(label => {
    label.addEventListener("click", () => {
      const range = label.getAttribute("data-range");
      if (!range) return;

      rangeLabels.forEach(l => l.classList.remove("active"));
      label.classList.add("active");

      fetchDHT22ChartData(range);
      fetchBMEChartData(range);
      fetchLDRChartData(range);
    });
  });
});