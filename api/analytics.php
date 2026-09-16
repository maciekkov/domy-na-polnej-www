<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload = []): never {
    http_response_code($status);
    if ($payload) echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false]);

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 8192) respond(413, ['ok' => false]);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) respond(400, ['ok' => false]);

$allowed = [
    'page_view', 'house_select', 'house_card_open', 'house_contact_click', 'house_pdf_download',
    'gallery_open', 'tour_start', 'tour_engaged', 'contact_start', 'contact_submit',
    'phone_click', 'email_click', 'directions_click'
];
$event = (string)($data['eventName'] ?? '');
if (!in_array($event, $allowed, true)) respond(422, ['ok' => false]);

$sessionId = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)($data['sessionId'] ?? '')) ?: '';
if (strlen($sessionId) < 8 || strlen($sessionId) > 80) respond(422, ['ok' => false]);

$house = strtoupper((string)($data['houseCode'] ?? ''));
if ($house !== '' && !in_array($house, ['A','B','C','D','E'], true)) $house = '';

$path = substr((string)($data['pagePath'] ?? '/'), 0, 180);
if (!str_starts_with($path, '/')) $path = '/';
$source = preg_replace('/[^a-zA-Z0-9._-]/', '', (string)($data['source'] ?? 'direct')) ?: 'direct';
$source = substr($source, 0, 80);

$record = [
    'createdAt' => gmdate('c'),
    'eventName' => $event,
    'sessionId' => $sessionId,
    'houseCode' => $house ?: null,
    'pagePath' => $path,
    'source' => $source,
];

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir) && !mkdir($dataDir, 0750, true) && !is_dir($dataDir)) respond(503, ['ok' => false]);
$file = $dataDir . '/analytics-' . gmdate('Y-m-d') . '.ndjson';
$line = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
if (file_put_contents($file, $line, FILE_APPEND | LOCK_EX) === false) respond(503, ['ok' => false]);

if (random_int(1, 100) === 1) {
    $cutoff = time() - 395 * 86400;
    foreach (glob($dataDir . '/analytics-*.ndjson') ?: [] as $candidate) {
        $mtime = filemtime($candidate);
        if ($mtime !== false && $mtime < $cutoff) @unlink($candidate);
    }
}

respond(200, ['ok' => true]);
