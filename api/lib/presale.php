<?php
declare(strict_types=1);
const DNP_PRESALE_CONSENT_VERSION = 'presale-1.0';
const DNP_PRESALE_CONSENT_TEXT = 'Chcę otrzymać od X-SMART DEVELOP sp. z o.o. e-mail o rozpoczęciu przedsprzedaży Domów na Polnej i warunkach promocji.';
function dnpPresaleInput(array $data): array {
    $email = $data['email'] ?? null;
    $action = $data['action'] ?? 'subscribe';
    if (!is_string($email) || strlen($email) > 160 || !filter_var(trim($email), FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) throw new InvalidArgumentException('Wpisz poprawny adres e-mail.');
    if (!is_string($action) || !in_array($action, ['subscribe', 'unsubscribe'], true)) throw new InvalidArgumentException('Nieprawidłowa operacja.');
    if ($action === 'subscribe' && (($data['consent'] ?? false) !== true || ($data['consentVersion'] ?? '') !== DNP_PRESALE_CONSENT_VERSION)) throw new InvalidArgumentException('Zaznacz zgodę na wiadomość o przedsprzedaży.');
    return [strtolower(trim($email)), $action];
}
function dnpPresaleChange(string $privateDir, string $email, string $action): bool {
    $dir = $privateDir . '/presale';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) throw new RuntimeException('Storage unavailable');
    $lock = fopen($dir . '/write.lock', 'c+b');
    if (!$lock) throw new RuntimeException('Storage unavailable');
    @chmod($dir . '/write.lock', 0600);
    $locked = false; $deadline = microtime(true) + .25;
    try {
        do { $locked = flock($lock, LOCK_EX | LOCK_NB); if (!$locked) usleep(2000); } while (!$locked && microtime(true) < $deadline);
        if (!$locked) throw new RuntimeException('Storage busy');
        $key = hash_hmac('sha256', $email, dnpSecret($privateDir));
        $path = $dir . '/' . $key . '.json';
        if ($action === 'unsubscribe') {
            if (!is_file($path)) return false;
            if (!unlink($path)) throw new RuntimeException('Storage unavailable');
            return true;
        }
        if (is_file($path)) return false; // Same response; no duplicate and no overwriting original consent.
        $record = ['email'=>$email, 'createdAt'=>gmdate('c'), 'consentVersion'=>DNP_PRESALE_CONSENT_VERSION, 'consentText'=>DNP_PRESALE_CONSENT_TEXT, 'source'=>'website-presale', 'emailVerified'=>false];
        $temporary = $path . '.' . bin2hex(random_bytes(8)) . '.tmp';
        try {
            $bytes = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
            if (file_put_contents($temporary, $bytes, LOCK_EX) !== strlen($bytes)) throw new RuntimeException('Storage unavailable');
            if (!chmod($temporary, 0600) || !rename($temporary, $path)) throw new RuntimeException('Storage unavailable');
        } finally { if (is_file($temporary)) @unlink($temporary); }
        return true;
    } finally { if ($locked) flock($lock, LOCK_UN); fclose($lock); }
}
