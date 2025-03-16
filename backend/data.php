<?php
    header("Content-Type: application/json");

    $cred = include('credentials.php');
    $conn = new mysqli($cred["host"], $cred["user"], $cred["password"], $cred["database"]);

    if ($conn->connect_error) {
        die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
    }

    $range = isset($_GET["range"]) ? $_GET["range"] : "24h";

    $validRanges = [
        "1h" => "1 HOUR",
        "2h" => "2 HOUR",
        "12h" => "12 HOUR",
        "24h" => "24 HOUR",
        "all" => ""
    ];

    if (!array_key_exists($range, $validRanges)) {
        die(json_encode(["error" => "Invalid time range"]));
    }

    $query = "SELECT timestamp, temperature, humidity FROM weather_data";

    if ($validRanges[$range]) {
        $query .= " WHERE timestamp >= NOW() - INTERVAL " . $validRanges[$range];
    }

    $query .= " ORDER BY timestamp ASC";

    $result = $conn->query($query);

    if (!$result) {
        error_log("Query failed: " . $conn->error);
        die(json_encode(["error" => "Query failed: " . $conn->error]));
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    if (empty($data)) {
        die(json_encode(["error" => "No data found for range: " . $range]));
    }

    echo json_encode($data);
    $conn->close();
?>