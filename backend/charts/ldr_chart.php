<?php
header("Content-Type: application/json");

require_once __DIR__ . '/../utils/db.php';
require_once __DIR__ . '/../utils/query_builder.php';
require_once __DIR__ . '/../utils/error_handling.php';

$range = $_GET["range"] ?? "24h";

if (!in_array($range, array_keys(get_valid_ranges()))) {
    respond_with_error("Invalid time range");
}

$conn = connect_to_db();

$fields = ['light_level'];
$table = 'ldr_data';

$queryInfo = build_query($range, 'timestamp', 'ASC', 0, 0, $table, $fields);

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