<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';

$config = dnp_panel_config();
$admin = is_array($config['admin'] ?? null) ? $config['admin'] : [];
$hash = (string)($admin['password_sha256'] ?? '');
$login = (string)($admin['login'] ?? '');
if ($login === '' || !preg_match('/^[a-f0-9]{64}$/', $hash)) {
    http_response_code(503);
    echo 'Panel wymaga prywatnej konfiguracji administratora w private/dnp/config.php.';
    exit;
}
dnp_panel_session();
if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: /administrator/', true, 303);
    exit;
}
$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $csrf = (string)($_POST['csrf'] ?? '');
    if ($csrf === '' || !hash_equals((string)$_SESSION['csrf'], $csrf)) {
        http_response_code(403);
        $error = 'Sesja formularza wygasła. Odśwież stronę.';
    } else {
        $privateDir = dirname(__DIR__, 2) . '/private/dnp';
        $secret = (string)($admin['control_key'] ?? '');
        $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
        $user = trim((string)($_POST['login'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $valid = strlen($password) <= 256 && hash_equals($login, $user) && hash_equals($hash, hash('sha256', $password));
        $allowed = dnp_panel_attempt($privateDir, $ip, $secret, $valid);
        if (!$allowed) { http_response_code(429); $error = 'Zbyt wiele prób. Spróbuj ponownie za 15 minut.'; }
        elseif ($valid) {
            session_regenerate_id(true);
            $_SESSION['authenticated'] = true;
            $_SESSION['last_activity'] = time();
            $_SESSION['csrf'] = bin2hex(random_bytes(24));
            header('Location: /administrator/', true, 303);
            exit;
        } else $error = 'Nieprawidłowy login lub hasło.';
    }
}
$authenticated = dnp_panel_authenticated();
$csrf = htmlspecialchars((string)$_SESSION['csrf'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
?><!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Panel administratora — Domy na Polnej</title><?php if ($authenticated): ?><link rel="stylesheet" href="/administrator/assets/admin-app.css"><script type="module" src="/administrator/assets/admin-app.js"></script><?php endif ?></head><body><?php if ($authenticated): ?><div id="admin-root" data-server-session="active"></div><?php else: ?><main style="font:16px/1.5 system-ui;max-width:440px;margin:10vh auto;padding:28px;border:1px solid #d8ddd5;border-radius:18px;color:#18201b"><h1>Panel administratora</h1><p>Domy na Polnej · analityka serwera i edytor lokalny</p><?php if ($error !== ''): ?><p role="alert" style="color:#a33"><?=htmlspecialchars($error, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')?></p><?php endif ?><form method="post"><input type="hidden" name="csrf" value="<?=$csrf?>"><label>Login<br><input name="login" autocomplete="username" required style="width:100%;padding:12px;margin:8px 0 18px"></label><br><label>Hasło<br><input type="password" name="password" autocomplete="current-password" required style="width:100%;padding:12px;margin:8px 0 18px"></label><br><button type="submit" style="padding:12px 20px;background:#4e5c35;border:0;border-radius:8px;color:white;cursor:pointer">Zaloguj się</button></form></main><?php endif ?></body></html>
