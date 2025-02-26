<?php
    header('Content-Type: application/json');

    $cred = include('credentials.php');
    date_default_timezone_set('Europe/Helsinki');

    $conn = new mysqli($cred["host"], $cred["user"], $cred["password"], $cred["database"]);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
        exit();
    }

    $sql = "SELECT timestamp, temperature, humidity FROM weather_data ORDER BY timestamp DESC";
    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Query failed: " . $conn->error]);
        $conn->close();
        exit();
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $datetime = DateTime::createFromFormat("Y-m-d H:i:s", $row['timestamp']);
        if ($datetime) {
            $row['timestamp'] = $datetime->format(DateTime::ATOM);
        }
        $data[] = $row;
    }

    $conn->close();

    echo json_encode(["data" => $data]);
?>
