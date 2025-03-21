<?php
    header("Content-Type: application/json");

    $cred = include('credentials.php');
    $conn = new mysqli($cred["host"], $cred["user"], $cred["password"], $cred["database"]);

    if ($conn->connect_error) {
        die(json_encode(["error" => "Database connection failed"]));
    }

    $query = "SELECT timestamp, temperature, humidity FROM weather_data ORDER BY timestamp DESC LIMIT 1";

    $result = $conn->query($query);

    if (!$result || $result->num_rows === 0) {
        die(json_encode(["error" => "No data found."]));
    }

    echo json_encode($result->fetch_assoc());
    $conn->close();
?>