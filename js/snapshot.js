import { formatDateTime } from "./format_datetime.js";

async function fetchLatestSnapshot() {
    try {
        const response = await fetch(`/backend/latest.php`);
        const data = await response.json();

        document.getElementById("snapshot-time").textContent = formatDateTime(data.timestamp);
        document.getElementById("snapshot-temp").textContent = parseFloat(data.temperature).toFixed(1);
        document.getElementById("snapshot-humi").textContent = parseFloat(data.humidity).toFixed(1);
    } catch (error) {
        console.error("Error fetching snapshot:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchLatestSnapshot();
    setInterval(fetchLatestSnapshot, 300000);

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
        const snapshot = document.getElementById("snapshot");
        if (!snapshot.classList.contains("opacity-0")) {
            snapshot.classList.add("opacity-0", "translate-y-2");
            setTimeout(() => snapshot.classList.add("hidden"), 300);
        }
    });
});

