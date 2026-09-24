<?php
declare(strict_types=1);
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
    $username = (string)($cfg['username'] ?? '');
    $password = (string)($cfg['password'] ?? '');
    if ($host === '' || $port < 1 || $port > 65535 || !filter_var($username, FILTER_VALIDATE_EMAIL)
        || $password === '' || preg_match('/UZUPELNIJ|HASLO_APLIKACJI|CHANGE_ME|APP_PASSWORD/i', $password)) {
        throw new RuntimeException('SMTP_NOT_CONFIGURED');
    }
    if (!in_array(($cfg['encryption'] ?? 'tls'), ['tls', 'ssl'], true)) throw new RuntimeException('SMTP_ENCRYPTION_INVALID');
    $timeout = 12;
    $socket = fsockopen(($cfg['encryption'] ?? 'tls') === 'ssl' ? 'ssl://' . $host : $host, $port, $errno, $errstr, $timeout);
    if (!$socket) throw new RuntimeException("SMTP connect: $errstr ($errno)");
    try {
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
    smtpCommand($socket, base64_encode($username), [334]);
    smtpCommand($socket, base64_encode($password), [235]);
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
    $body = preg_replace('/\r?\n/', "\r\n", $body);
    $safeBody = preg_replace('/(?m)^\./', '..', $body);
    fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $safeBody . "\r\n.\r\n");
    $response = smtpRead($socket);
    if ((int)substr($response, 0, 3) !== 250) throw new RuntimeException('SMTP DATA: ' . trim($response));
    smtpCommand($socket, 'QUIT', [221]);
    } finally { fclose($socket); }
}
