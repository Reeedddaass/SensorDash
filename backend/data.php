<?php
    header("Content-Type: application/json");

    $cred = include('credentials.php');
    $conn = new mysqli($cred["host"], $cred["user"], $cred["password"], $cred["database"]);

    if ($conn->connect_error) {
        die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
    }

    $range = isset($_GET["range"]) ? $_GET["range"] : "24h";
    $offset = isset($_GET["offset"]) ? intval($_GET["offset"]) : 0;
    $limit = isset($_GET["limit"]) ? intval($_GET["limit"]) : 50;
    $applyLimit = $limit > 0;

    $sortBy = isset($_GET["sort_by"]) ? $_GET["sort_by"] : "timestamp";
    $sortDir = isset($_GET["sort_dir"]) && strtolower($_GET["sort_dir"]) === "asc" ? "ASC" : "DESC";

    $validRanges = [
        "2h" => "2 HOUR",
        "6h" => "6 HOUR",
        "12h" => "12 HOUR",
        "24h" => "24 HOUR",
        "7d" => "7 DAY",
        "30d" => "30 DAY",
        "all" => ""
    ];

    $validSortBy = ["timestamp", "temperature", "humidity"];

    if (!array_key_exists($range, $validRanges)) {
        die(json_encode(["error" => "Invalid time range"]));
    }

    if (!in_array($sortBy, $validSortBy)) {
        die(json_encode(["error" => "Invalid sort column"]));
    }

    $query = "SELECT timestamp, temperature, humidity FROM weather_data";

    if ($validRanges[$range]) {
        if ($range === "30d") {
            $query = "
                SELECT 
                    DATE_FORMAT(timestamp, '%Y-%m-%dT%H:00:00') AS timestamp,
                    ROUND(AVG(temperature), 2) AS temperature,
                    ROUND(AVG(humidity), 2) AS humidity
                FROM weather_data
                WHERE timestamp >= NOW() - INTERVAL 720 HOUR
                GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
                ORDER BY timestamp
            ";
    
            $result = $conn->query($query);
    
            if (!$result) {
                error_log("Query failed: " . $conn->error);
                die(json_encode(["error" => "Query failed: " . $conn->error]));
            }
    
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
    
            echo json_encode($data);
            $conn->close();
            exit;
        } else {
            $query .= " WHERE timestamp >= NOW() - INTERVAL " . $validRanges[$range];
        }
    }
    
    $query .= " ORDER BY $sortBy $sortDir";
    
    if ($applyLimit) {
        $query .= " LIMIT $limit OFFSET $offset";
    }    

    $result = $conn->query($query);

    if (!$result) {
        error_log("Query failed: " . $conn->error);
        die(json_encode(["error" => "Query failed: " . $conn->error]));
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    $conn->close();
?>