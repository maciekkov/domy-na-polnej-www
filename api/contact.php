<?php
declare(strict_types=1);
require_once __DIR__.'/lib/security.php';
try {
    $config = dnpConfig();
    [$data,$privateDir,$identity] = dnpGuard('contact',32768,$config);
} catch (Throwable $error) {
    error_log('[DNP contact] storage or configuration failure');
    dnpRespond(503,['ok'=>false,'message'=>'Formularz jest chwilowo niedostępny. Skontaktuj się telefonicznie.'],60);
}
if (!empty($data['website'])) dnpRespond(200,['ok'=>true]); // honeypot, after ingress limiting
foreach (['name','phone','email','message','house'] as $field) {
    if (isset($data[$field]) && !is_string($data[$field])) dnpRespond(422,['ok'=>false,'message'=>'Nieprawidłowy typ pola.']);
}
$length = static fn(string $s): int => preg_match_all('/./us',$s) ?: 0;
$name=trim($data['name']??'');$phone=trim($data['phone']??'');$email=trim($data['email']??'');$message=trim($data['message']??'');
$house=$data['house']??'unknown';
$digits=preg_replace('/\D/','',$phone);
if($length($name)<2||$length($name)>100||$length($phone)>50||strlen($digits)<7||strlen($digits)>15||!preg_match('/^[+\d\s().-]+$/',$phone)||($data['consentContact']??false)!==true||($data['consentPrivacy']??false)!==true) {
    dnpRespond(422,['ok'=>false,'message'=>'Uzupełnij imię, poprawny telefon i wymagane zgody.']);
}
if($email!==''&&($length($email)>160||!filter_var($email,FILTER_VALIDATE_EMAIL)||preg_match('/[\r\n]/',$email)))dnpRespond(422,['ok'=>false,'message'=>'Podaj poprawny adres e-mail.']);
if($length($message)>3000)dnpRespond(422,['ok'=>false,'message'=>'Wiadomość może mieć do 3000 znaków.']);
if(!in_array($house,['A','B','C','D','E','unknown'],true))$house='unknown';
// Limit valid delivery attempts, including failures; a new cookie does not reset this limit.
try {
    $retry=dnpLimit($privateDir,'contact-send',$identity,[[1,45],[5,3600],[100,86400,true]]);
    if($retry)dnpRespond(429,['ok'=>false,'message'=>'Odczekaj przed kolejną wiadomością.'], $retry);
} catch(Throwable $error) { dnpRespond(503,['ok'=>false,'message'=>'Formularz chwilowo niedostępny.'],60); }
if(empty($config['smtp']))dnpRespond(503,['ok'=>false,'message'=>'Formularz oczekuje na konfigurację serwera pocztowego.']);
foreach(['recipient','from_email'] as $key) if(!filter_var($config[$key]??'',FILTER_VALIDATE_EMAIL)||preg_match('/[\r\n]/',(string)($config[$key]??'')))dnpRespond(503,['ok'=>false,'message'=>'Formularz oczekuje na konfigurację poczty.']);
if(preg_match('/[\r\n]/',(string)($config['from_name']??'')))dnpRespond(503,['ok'=>false,'message'=>'Formularz oczekuje na konfigurację poczty.']);

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
    $body = preg_replace('/\r?\n/', "\r\n", $body);
    $safeBody = preg_replace('/(?m)^\./', '..', $body);
    fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $safeBody . "\r\n.\r\n");
    $response = smtpRead($socket);
    if ((int)substr($response, 0, 3) !== 250) throw new RuntimeException('SMTP DATA: ' . trim($response));
    smtpCommand($socket, 'QUIT', [221]);
    } finally { fclose($socket); }
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
    dnpRespond(200, ['ok' => true]);
} catch (Throwable $error) {
    error_log('[DNP contact] SMTP delivery failed');
    dnpRespond(502, ['ok' => false, 'message' => 'Nie udało się teraz wysłać wiadomości. Zadzwoń do nas lub spróbuj ponownie później.']);
}
