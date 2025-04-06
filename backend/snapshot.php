<?php
header("Content-Type: application/json");

require_once __DIR__ . '/utils/db.php';
require_once __DIR__ . '/utils/error_handling.php';

$conn = connect_to_db();

$query = "SELECT timestamp, temperature, humidity FROM weather_data ORDER BY timestamp DESC LIMIT 1";
$result = $conn->query($query);

if (!$result || $result->num_rows === 0) {
    respond_with_error("No data found.");
}

$data = $result->fetch_assoc();
echo json_encode($data);

$conn->close();