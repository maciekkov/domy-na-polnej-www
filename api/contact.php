<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false, 'message' => 'Dozwolona jest wyłącznie metoda POST.']);

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) respond(503, ['ok' => false, 'message' => 'Formularz oczekuje na konfigurację serwera pocztowego.']);
$config = require $configPath;
if (!is_array($config)) respond(500, ['ok' => false, 'message' => 'Nieprawidłowa konfiguracja formularza.']);

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) respond(400, ['ok' => false, 'message' => 'Nieprawidłowe dane formularza.']);

if (!empty($data['website'])) respond(200, ['ok' => true]);

session_start();
$now = time();
$last = (int)($_SESSION['dnp_contact_last'] ?? 0);
if ($last && $now - $last < 45) respond(429, ['ok' => false, 'message' => 'Odczekaj chwilę przed ponownym wysłaniem formularza.']);

$slice = static fn(string $value, int $max): string => function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
$length = static fn(string $value): int => function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
$clean = static fn($value, int $max = 500): string => trim($slice(strip_tags((string)$value), $max));
$name = $clean($data['name'] ?? '', 100);
$phone = $clean($data['phone'] ?? '', 50);
$email = $clean($data['email'] ?? '', 160);
$message = $clean($data['message'] ?? '', 3000);
$house = $clean($data['house'] ?? 'unknown', 20);
$consentContact = filter_var($data['consentContact'] ?? false, FILTER_VALIDATE_BOOL);
$consentPrivacy = filter_var($data['consentPrivacy'] ?? false, FILTER_VALIDATE_BOOL);

if ($length($name) < 2 || $length((string)preg_replace('/\D+/', '', $phone)) < 7 || !$consentContact || !$consentPrivacy) {
    respond(422, ['ok' => false, 'message' => 'Uzupełnij wymagane pola i zgody.']);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(422, ['ok' => false, 'message' => 'Podaj poprawny adres e-mail.']);
if (!in_array($house, ['A','B','C','D','E','unknown'], true)) $house = 'unknown';

function smtpRead($socket): string {
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') break;
    }
    return $response;
}
function smtpCommand($socket, string $command, array $okCodes): void {
    fwrite($socket, $command . "\r\n");
    $response = smtpRead($socket);
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $okCodes, true)) throw new RuntimeException('SMTP: ' . trim($response));
}
function sendSmtp(array $cfg, string $to, string $fromEmail, string $fromName, string $subject, string $body, string $replyTo = ''): void {
    $host = (string)($cfg['host'] ?? '');
    $port = (int)($cfg['port'] ?? 587);
    $timeout = 12;
    $socket = fsockopen($host, $port, $errno, $errstr, $timeout);
    if (!$socket) throw new RuntimeException("SMTP connect: $errstr ($errno)");
    stream_set_timeout($socket, $timeout);
    $banner = smtpRead($socket);
    if ((int)substr($banner, 0, 3) !== 220) throw new RuntimeException('SMTP banner: ' . trim($banner));
    smtpCommand($socket, 'EHLO domynapolnej.pl', [250]);
    if (($cfg['encryption'] ?? 'tls') === 'tls') {
        smtpCommand($socket, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('Nie udało się uruchomić TLS.');
        smtpCommand($socket, 'EHLO domynapolnej.pl', [250]);
    }
    smtpCommand($socket, 'AUTH LOGIN', [334]);
    smtpCommand($socket, base64_encode((string)($cfg['username'] ?? '')), [334]);
    smtpCommand($socket, base64_encode((string)($cfg['password'] ?? '')), [235]);
    smtpCommand($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
    smtpCommand($socket, 'RCPT TO:<' . $to . '>', [250,251]);
    smtpCommand($socket, 'DATA', [354]);
    $headers = [
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'To: <' . $to . '>',
        'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if ($replyTo !== '') $headers[] = 'Reply-To: ' . $replyTo;
    $safeBody = preg_replace('/(?m)^\./', '..', $body);
    fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $safeBody . "\r\n.\r\n");
    $response = smtpRead($socket);
    if ((int)substr($response, 0, 3) !== 250) throw new RuntimeException('SMTP DATA: ' . trim($response));
    smtpCommand($socket, 'QUIT', [221]);
    fclose($socket);
}

$houseLabel = $house === 'unknown' ? 'jeszcze nie wybrano' : 'Dom ' . $house;
$body = "Nowe zapytanie ze strony Domy na Polnej\n\n" .
        "Dom: {$houseLabel}\nImię: {$name}\nTelefon: {$phone}\nE-mail: " . ($email ?: '—') . "\n\nWiadomość:\n" . ($message ?: '—') . "\n";

try {
    sendSmtp(
        (array)($config['smtp'] ?? []),
        (string)($config['recipient'] ?? ''),
        (string)($config['from_email'] ?? ''),
        (string)($config['from_name'] ?? 'Domy na Polnej'),
        'Nowe zapytanie — ' . $houseLabel,
        $body,
        $email
    );
    $_SESSION['dnp_contact_last'] = $now;
    respond(200, ['ok' => true]);
} catch (Throwable $error) {
    error_log('[DNP contact] ' . $error->getMessage());
    respond(502, ['ok' => false, 'message' => 'Nie udało się teraz wysłać wiadomości. Zadzwoń do nas lub spróbuj ponownie później.']);
}
