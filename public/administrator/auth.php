<?php
declare(strict_types=1);

header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, max-age=0');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");

function dnp_panel_config(): array
{
    $path = dirname(__DIR__, 2) . '/private/dnp/config.php';
    $config = is_file($path) ? require $path : [];
    return is_array($config) ? $config : [];
}

function dnp_panel_session(): void
{
    $https = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
        || (string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('dnp_panel_v51');
    session_set_cookie_params(['lifetime'=>0,'path'=>'/administrator/','secure'=>$https,'httponly'=>true,'samesite'=>'Strict']);
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
}

function dnp_panel_authenticated(): bool
{
    $last = (int)($_SESSION['last_activity'] ?? 0);
    if (empty($_SESSION['authenticated']) || $last < time() - 1800) {
        unset($_SESSION['authenticated'], $_SESSION['last_activity']);
        return false;
    }
    $_SESSION['last_activity'] = time();
    return true;
}

function dnp_panel_attempt(string $privateDir, string $ip, string $secret, bool $success): bool
{
    $file = $privateDir . '/data/panel-login-attempts.json';
    if (!is_dir(dirname($file))) return false;
    $handle = @fopen($file, 'c+b');
    if ($handle === false || !flock($handle, LOCK_EX)) return false;
    try {
        $rows = json_decode(stream_get_contents($handle, 100000) ?: '{}', true);
        if (!is_array($rows)) $rows = [];
        $key = substr(hash_hmac('sha256', $ip, $secret), 0, 32);
        foreach ($rows as $id => $times) {
            if (!is_array($times)) { unset($rows[$id]); continue; }
            $rows[$id] = array_values(array_filter($times, static fn($ts): bool => is_int($ts) && $ts > time() - 900));
            if (!$rows[$id]) unset($rows[$id]);
        }
        $blocked = count($rows[$key] ?? []) >= 6;
        if ($success && !$blocked) unset($rows[$key]);
        elseif (!$blocked) $rows[$key][] = time();
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($rows, JSON_THROW_ON_ERROR));
        fflush($handle);
        @chmod($file, 0600);
        return !$blocked;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
