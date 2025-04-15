<?php
header("Content-Type: application/json");

require_once __DIR__ . '/../utils/db.php';
require_once __DIR__ . '/../utils/query_builder.php';
require_once __DIR__ . '/../utils/error_handling.php';

$range = $_GET["range"] ?? "all";
$offset = isset($_GET["offset"]) ? intval($_GET["offset"]) : 0;
$limit = isset($_GET["limit"]) ? intval($_GET["limit"]) : 50;
$sortBy = $_GET["sort_by"] ?? "timestamp";
$sortDir = (isset($_GET["sort_dir"]) && strtolower($_GET["sort_dir"]) === "asc") ? "ASC" : "DESC";

if (!in_array($range, array_keys(get_valid_ranges()))) {
    respond_with_error("Invalid time range");
}

$conn = connect_to_db();

$table = 'bme280_data';
$fields = ['temperature', 'humidity', 'pressure'];

if (!in_array($sortBy, get_valid_sort_columns($table))) {
    respond_with_error("Invalid sort column");
}

$queryInfo = build_query($range, $sortBy, $sortDir, $offset, $limit, $table, $fields);
$result = $conn->query($queryInfo["query"]);

if (!$result) {
    respond_with_error("Query failed: " . $conn->error);
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();