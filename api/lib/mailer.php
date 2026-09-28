<?php
declare(strict_types=1);

require_once __DIR__ . '/smtp.php';

function dnpMailHeaderValue(string $value): string {
    if (preg_match('/[\r\n]/', $value)) throw new RuntimeException('MAIL_HEADER_INVALID');
    return $value;
}

function dnpMailAddress(string $value): string {
    $value = trim($value);
    if (!filter_var($value, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $value)) {
        throw new RuntimeException('MAIL_ADDRESS_INVALID');
    }
    return $value;
}

function dnpMailIdentity(array $config): array {
    $mail = is_array($config['mail'] ?? null) ? $config['mail'] : [];
    $recipient = dnpMailAddress((string)($mail['recipient'] ?? $config['recipient'] ?? 'mkdevelop2026@gmail.com'));
    $fromEmail = dnpMailAddress((string)($mail['from_email'] ?? $config['from_email'] ?? 'kontakt@domynapolnej.pl'));
    $fromName = trim((string)($mail['from_name'] ?? $config['from_name'] ?? 'Domy na Polnej — formularz WWW'));
    dnpMailHeaderValue($fromName);
    if ($fromName === '') $fromName = 'Domy na Polnej';
    return [$recipient, $fromEmail, $fromName];
}

function dnpPhpMail(string $to, string $fromEmail, string $fromName, string $subject, string $body, string $replyTo = ''): void {
    $to = dnpMailAddress($to);
    $fromEmail = dnpMailAddress($fromEmail);
    dnpMailHeaderValue($fromName);
    dnpMailHeaderValue($subject);
    if ($replyTo !== '') $replyTo = dnpMailAddress($replyTo);

    $encodedName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers = [
        'From: ' . $encodedName . ' <' . $fromEmail . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Content-Type-Options: nosniff',
    ];
    if ($replyTo !== '') $headers[] = 'Reply-To: ' . $replyTo;

    $body = preg_replace('/\r?\n/', "\r\n", $body);
    if (!is_string($body)) throw new RuntimeException('MAIL_BODY_INVALID');

    // PHP mail() hands the message to the hosting server's local mail transport.
    // No Gmail password or external SMTP credentials are required for the recipient.
    if (!@mail($to, $encodedSubject, $body, implode("\r\n", $headers))) {
        throw new RuntimeException('PHP_MAIL_FAILED');
    }
}

/**
 * Send a site notification using the configured transport.
 * Default is the hosting server's local PHP mail transport. SMTP is optional
 * and used only when explicitly selected (or as an explicit fallback in auto mode).
 * Returns the transport that accepted the message: php_mail or smtp.
 */
function dnpSendConfiguredMail(array $config, string $subject, string $body, string $replyTo = ''): string {
    [$to, $fromEmail, $fromName] = dnpMailIdentity($config);
    $mail = is_array($config['mail'] ?? null) ? $config['mail'] : [];
    $transport = (string)($mail['transport'] ?? 'php_mail');
    if (!in_array($transport, ['php_mail', 'smtp', 'auto'], true)) throw new RuntimeException('MAIL_TRANSPORT_INVALID');

    if ($transport !== 'smtp') {
        try {
            dnpPhpMail($to, $fromEmail, $fromName, $subject, $body, $replyTo);
            return 'php_mail';
        } catch (Throwable $phpMailError) {
            if ($transport !== 'auto') throw new RuntimeException('MAIL_DELIVERY_FAILED', 0, $phpMailError);
        }
    }

    try {
        sendSmtp((array)($config['smtp'] ?? []), $to, $fromEmail, $fromName, $subject, $body, $replyTo);
        return 'smtp';
    } catch (Throwable $smtpError) {
        throw new RuntimeException('MAIL_DELIVERY_FAILED', 0, $smtpError);
    }
}
