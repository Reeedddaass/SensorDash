<?php
header("Content-Type: application/json");

require_once __DIR__ . '/../utils/db.php';
require_once __DIR__ . '/../utils/query_builder.php';
require_once __DIR__ . '/../utils/error_handling.php';

$table = 'weather_data';
$fields = ['temperature', 'humidity'];
$range = $_GET["range"] ?? "24h";
$offset = isset($_GET["offset"]) ? intval($_GET["offset"]) : 0;
$limit = isset($_GET["limit"]) ? intval($_GET["limit"]) : 50;
$sortBy = $_GET["sort_by"] ?? "timestamp";
$sortDir = (isset($_GET["sort_dir"]) && strtolower($_GET["sort_dir"]) === "asc") ? "ASC" : "DESC";

if (!in_array($range, array_keys(get_valid_ranges()))) {
    respond_with_error("Invalid time range for table");
}

if (!in_array($sortBy, get_valid_sort_columns())) {
    respond_with_error("Invalid sort column");
}

$conn = connect_to_db();

$queryInfo = build_query($range, $sortBy, $sortDir, $offset, $limit, $table, $fields);

$result = $conn->query($queryInfo["query"]);

if (!$result) {
    respond_with_error("Table query failed: " . $conn->error);
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();