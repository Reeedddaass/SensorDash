<?php
function connect_to_db() {
    $cred = include __DIR__ . '/credentials.php';
    $conn = new mysqli($cred["host"], $cred["user"], $cred["password"], $cred["database"]);

    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
    }

    return $conn;
}
