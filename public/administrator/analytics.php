<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
dnp_panel_session();
if (!dnp_panel_authenticated()) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":false,"message":"Sesja wygasła. Zaloguj się ponownie."}';
    exit;
}
$config = dnp_panel_config();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !is_array($config['admin'] ?? null)) {
    http_response_code(405);
    exit;
}
// The authenticated session authorizes the existing analytics API without exposing its key to JavaScript.
$_SERVER['HTTP_X_DNP_ADMIN_KEY'] = (string)($config['admin']['control_key'] ?? '');
require dirname(__DIR__) . '/api/analytics-summary.php';
