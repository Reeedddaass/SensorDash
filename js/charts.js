import { formatDateTime } from "./format_datetime.js";

let temperatureChart, humidityChart, bmePressureChart, ldrChart;

function updateChart(chart, labels, data) {
  if (!chart) return;
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function updateChartDataset(chart, datasetIndex, labels, data) {
  if (!chart) return;
  chart.data.labels = labels;
  chart.data.datasets[datasetIndex].data = data;
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

    updateChartDataset(temperatureChart, 0, labels, tempData);
    updateChartDataset(humidityChart, 0, labels, humiData);
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

    updateChartDataset(temperatureChart, 1, labels, tempData);
    updateChartDataset(humidityChart, 1, labels, humiData);
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
      datasets: [
        {
          label: "DHT22 Temp (°C)",
          data: [],
          borderColor: "#FF0000",
          backgroundColor: "transparent",
          borderWidth: 2,
        },
        {
          label: "BME280 Temp (°C)",
          data: [],
          borderColor: "#00FF00",
          backgroundColor: "transparent",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
  
  humidityChart = new Chart(ctx("humidity-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "DHT22 Humidity (%)",
          data: [],
          borderColor: "#FF0000",
          backgroundColor: "transparent",
          borderWidth: 2,
        },
        {
          label: "BME280 Humidity (%)",
          data: [],
          borderColor: "#00FF00",
          backgroundColor: "transparent",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });  
}

document.addEventListener("DOMContentLoaded", () => {
  createCharts();

  let currentRange = "24h";

  const fetchAll = () => {
    fetchDHT22ChartData(currentRange);
    fetchBMEChartData(currentRange);
    fetchLDRChartData(currentRange);
  };

  fetchAll();

  const initialActive = document.querySelector(`[data-range="${currentRange}"]`);
  if (initialActive) {
    initialActive.classList.add("bg-slate-400", "text-white");
  }

  const rangeLabels = document.querySelectorAll("[data-range]");
  rangeLabels.forEach(label => {
    label.addEventListener("click", () => {
      const range = label.getAttribute("data-range");
      if (!range) return;

      currentRange = range;

      rangeLabels.forEach(l => l.classList.remove("bg-slate-400", "text-white"));
      label.classList.add("bg-slate-400", "text-white");

      fetchAll();
    });
  });

  setInterval(fetchAll, 300000);
});