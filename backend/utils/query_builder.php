<?php
function get_valid_ranges() {
    return [
        "2h" => "2 HOUR",
        "6h" => "6 HOUR",
        "12h" => "12 HOUR",
        "24h" => "24 HOUR",
        "7d" => "7 DAY",
        "30d" => "30 DAY",
        "all" => ""
    ];
}

function get_valid_sort_columns($table = null) {
    switch ($table) {
        case 'bme280_data':
            return ['timestamp', 'temperature', 'humidity', 'pressure'];
        case 'ldr_data':
            return ['timestamp', 'light_level'];
        case 'weather_data':
        default:
            return ['timestamp', 'temperature', 'humidity'];
    }
}

function build_query($range, $sortBy, $sortDir, $offset, $limit, $table, $fields) {
    $validRanges = get_valid_ranges();
    $rangeClause = isset($validRanges[$range]) ? $validRanges[$range] : $validRanges["24h"];
    $applyLimit = $limit > 0;
    $columns = implode(", ", $fields);

    if ($range === "30d" || $range === "7d") {
        $interval = $range === "30d" ? "30 DAY" : "7 DAY";
        return [
            "query" => "
                SELECT 
                    DATE_FORMAT(timestamp, '%Y-%m-%dT%H:00:00') AS timestamp,
                    " . implode(", ", array_map(fn($f) => "ROUND(AVG($f), 2) AS $f", $fields)) . "
                FROM $table
                WHERE timestamp >= NOW() - INTERVAL $interval
                GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
                ORDER BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') ASC
            ",
            "grouped" => true
        ];
    }

    $query = "SELECT timestamp, $columns FROM $table";

    if ($rangeClause) {
        $query .= " WHERE timestamp >= NOW() - INTERVAL $rangeClause";
    }

    $query .= " ORDER BY $sortBy $sortDir";

    if ($applyLimit) {
        $query .= " LIMIT $limit OFFSET $offset";
    }

    return [
        "query" => $query,
        "grouped" => false
    ];
}