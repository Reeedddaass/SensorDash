<?php
function respond_with_error($message, $log = true) {
    if ($log) {
        error_log("Error: " . $message);
    }

    http_response_code(400);
    echo json_encode(["error" => $message]);
    exit;
}