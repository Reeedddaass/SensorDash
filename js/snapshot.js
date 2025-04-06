import { formatDateTime } from "./format_datetime.js";

async function fetchLatestSnapshot() {
  try {
    const response = await fetch(`/backend/snapshot.php`);
    const text = await response.text();

    // Debug: log raw response in case of parsing error
    // console.log("Snapshot raw response:", text);

    const data = JSON.parse(text);

    if (!data.timestamp || !data.temperature || !data.humidity) {
      throw new Error("Incomplete snapshot data");
    }

    document.getElementById("snapshot-time").textContent = formatDateTime(data.timestamp);
    document.getElementById("snapshot-temp").textContent = parseFloat(data.temperature).toFixed(1);
    document.getElementById("snapshot-humi").textContent = parseFloat(data.humidity).toFixed(1);
  } catch (error) {
    console.error("Error fetching snapshot:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchLatestSnapshot();
  setInterval(fetchLatestSnapshot, 300000); // every 5 minutes

  const toggleBtn = document.getElementById("latest-toggle");
  const snapshot = document.getElementById("snapshot");

  toggleBtn.addEventListener("click", () => {
    snapshot.classList.remove("hidden");
    const isVisible = !snapshot.classList.contains("opacity-0");

    if (isVisible) {
      snapshot.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => snapshot.classList.add("hidden"), 300);
    } else {
      snapshot.classList.remove("opacity-0", "translate-y-2");
    }
  });

  document.addEventListener("click", (e) => {
    if (!snapshot.contains(e.target) && !toggleBtn.contains(e.target)) {
      if (!snapshot.classList.contains("opacity-0")) {
        snapshot.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => snapshot.classList.add("hidden"), 300);
      }
    }
  });

  window.addEventListener("scroll", () => {
    if (!snapshot.classList.contains("opacity-0")) {
      snapshot.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => snapshot.classList.add("hidden"), 300);
    }
  });
});