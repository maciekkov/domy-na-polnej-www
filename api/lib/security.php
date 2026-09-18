<?php
declare(strict_types=1);
/** Application-layer abuse controls. Use server/CDN controls too, not as DDoS protection. */
function dnpRespond(int $status, array $body, ?int $retry = null): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    if ($retry !== null) header('Retry-After: ' . max(1, $retry));
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function dnpConfig(): array {
    $path = dirname(__DIR__) . '/config.php';
    if (!is_file($path)) return [];
    $config = require $path;
    if (!is_array($config)) throw new RuntimeException('Invalid server configuration');
    return $config;
}
function dnpStorage(array $config): string {
    $dir = $config['security']['storage_dir'] ?? getenv('DNP_PRIVATE_DIR') ?: dirname(__DIR__) . '/data/private';
    if (!is_string($dir) || $dir === '') throw new RuntimeException('Invalid storage directory');
    if (!is_dir($dir) && !mkdir($dir, 0750, true) && !is_dir($dir)) throw new RuntimeException('Storage unavailable');
    if (!is_writable($dir)) throw new RuntimeException('Storage not writable');
    return rtrim($dir, '/');
}
function dnpClientAddress(array $server, array $trusted = []): string {
    $peer = $server['REMOTE_ADDR'] ?? '';
    if (!filter_var($peer, FILTER_VALIDATE_IP)) throw new RuntimeException('Invalid peer address');
    // Forwarded headers are ignored unless the immediate peer was explicitly configured.
    if (in_array($peer, $trusted, true)) {
        $chain = explode(',', substr((string)($server['HTTP_X_FORWARDED_FOR'] ?? ''), 0, 1024));
        $chain[] = $peer;
        for ($i = count($chain) - 1; $i >= 0; $i--) {
            $candidate = trim($chain[$i]);
            if (!filter_var($candidate, FILTER_VALIDATE_IP)) throw new RuntimeException('Invalid proxy chain');
            $peer = $candidate;
            if (!in_array($candidate, $trusted, true)) break;
        }
    }
    $binary = inet_pton($peer);
    // Group IPv6 addresses by /64 to discourage cheap per-address rotation.
    return strlen($binary) === 16 ? bin2hex(substr($binary, 0, 8)) . '/64' : $peer;
}
function dnpSecret(string $dir): string {
    $path = $dir . '/rate-secret';
    $handle = fopen($path, 'c+b');
    if (!$handle) throw new RuntimeException('Secret unavailable');
    @chmod($path, 0600);
    $locked = false; $deadline = microtime(true) + .25;
    try {
        do { $locked = flock($handle, LOCK_EX | LOCK_NB); if (!$locked) usleep(2000); } while (!$locked && microtime(true) < $deadline);
        if (!$locked) throw new RuntimeException('Secret storage busy');
        $secret = stream_get_contents($handle, 128);
        if ($secret === '') {
            $secret = bin2hex(random_bytes(32));
            rewind($handle);
            if (fwrite($handle, $secret) !== 64) throw new RuntimeException('Secret write failed');
            fflush($handle);
        }
        if (!is_string($secret) || !preg_match('/^[a-f0-9]{64}$/', $secret)) throw new RuntimeException('Invalid secret');
        return $secret;
    } finally { if ($locked) flock($handle, LOCK_UN); fclose($handle); }
}
/** Bounded shared token buckets; every state update is atomic under a file lock. */
function dnpLimit(string $dir, string $scope, string $key, array $policies, ?float $now = null): int {
    if (!preg_match('/^[a-z-]+$/', $scope)) throw new RuntimeException('Invalid scope');
    $now ??= microtime(true);
    $file = $dir . '/' . $scope . '-rates.json';
    $handle = fopen($file, 'c+b');
    if (!$handle) throw new RuntimeException('Rate storage unavailable');
    @chmod($file, 0600);
    $locked = false; $deadline = microtime(true) + .25;
    try {
        do { $locked = flock($handle, LOCK_EX | LOCK_NB); if (!$locked) usleep(2000); } while (!$locked && microtime(true) < $deadline);
        if (!$locked) throw new RuntimeException('Rate storage busy');
        if (fstat($handle)['size'] > 2_000_000) throw new RuntimeException('Rate storage oversized');
        $raw = stream_get_contents($handle);
        $state = $raw === '' ? [] : json_decode($raw, true, 12, JSON_THROW_ON_ERROR);
        if (!is_array($state)) throw new RuntimeException('Rate state invalid');
        foreach ($state as $id => $value) if (($value['expires'] ?? 0) < $now) unset($state[$id]);
        $updates = []; $retry = 0;
        foreach ($policies as $index => $policy) {
            $capacity = (float)$policy[0]; $period = (float)$policy[1]; $global = $policy[2] ?? false;
            if ($capacity <= 0 || $period <= 0) throw new RuntimeException('Invalid rate policy');
            $id = ($global ? 'global' : $key) . ':' . $index;
            $old = $state[$id] ?? ['tokens' => $capacity, 'at' => $now];
            $tokens = min($capacity, (float)$old['tokens'] + max(0.0, $now - (float)$old['at']) * $capacity / $period);
            if ($tokens < 1) $retry = max($retry, (int)ceil((1 - $tokens) * $period / $capacity));
            $updates[$id] = ['tokens' => max(0.0, $tokens - 1), 'at' => $now, 'expires' => $now + 2 * $period];
        }
        if ($retry > 0) return $retry;
        if (count($state + $updates) > 4096) return 60;
        $state = array_replace($state, $updates);
        $encoded = json_encode($state, JSON_THROW_ON_ERROR);
        rewind($handle); if (!ftruncate($handle, 0) || fwrite($handle, $encoded) !== strlen($encoded)) throw new RuntimeException('Rate write failed');
        fflush($handle);
        return 0;
    } finally { if ($locked) flock($handle, LOCK_UN); fclose($handle); }
}
function dnpOriginCheck(array $server, array $config): bool {
    if (($server['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') return false;
    if (!isset($server['HTTP_ORIGIN'])) return true; // Non-browser clients still face IP/global rate limits.
    $origin = $server['HTTP_ORIGIN'];
    $allowed = $config['security']['allowed_origins'] ?? ['https://domynapolnej.pl', 'https://www.domynapolnej.pl'];
    return is_string($origin) && in_array($origin, $allowed, true);
}
function dnpGuard(string $scope, int $maximum, array $config): array {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { header('Allow: POST'); dnpRespond(405, ['ok'=>false,'message'=>'Dozwolona jest wyłącznie metoda POST.']); }
    if (!dnpOriginCheck($_SERVER, $config)) dnpRespond(403, ['ok'=>false,'message'=>'Żądanie z niedozwolonego źródła.']);
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') dnpRespond(415, ['ok'=>false,'message'=>'Wymagany format JSON.']);
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > $maximum) dnpRespond(413, ['ok'=>false,'message'=>'Przekroczony rozmiar żądania.']);
    $dir = dnpStorage($config);
    $identity = hash_hmac('sha256', dnpClientAddress($_SERVER, $config['security']['trusted_proxy_ips'] ?? []), dnpSecret($dir));
    $policies = $scope === 'analytics' ? [[60,60],[1000,3600],[3000,60,true]] : [[20,600],[200,600,true]];
    $retry = dnpLimit($dir, $scope.'-request', $identity, $policies);
    if ($retry) dnpRespond(429, ['ok'=>false,'message'=>'Zbyt wiele żądań. Odczekaj i spróbuj ponownie.'], $retry);
    $handle = fopen('php://input', 'rb'); $raw = stream_get_contents($handle, $maximum+1); fclose($handle);
    if (!is_string($raw) || strlen($raw) > $maximum) dnpRespond(413, ['ok'=>false,'message'=>'Przekroczony rozmiar żądania.']);
    try { $data = json_decode($raw, true, 16, JSON_THROW_ON_ERROR); }
    catch (JsonException) { dnpRespond(400, ['ok'=>false,'message'=>'Nieprawidłowy JSON.']); }
    if (!is_array($data) || array_is_list($data)) dnpRespond(400, ['ok'=>false,'message'=>'Wymagany obiekt JSON.']);
    foreach ($data as $value) if (!is_scalar($value) && $value !== null) dnpRespond(422, ['ok'=>false,'message'=>'Nieprawidłowy typ pola.']);
    return [$data,$dir,$identity];
}
function dnpAppendAnalytics(string $dir, array $record): bool {
    $logDir=$dir.'/analytics';
    if(!is_dir($logDir) && !mkdir($logDir,0750) && !is_dir($logDir))throw new RuntimeException('Log directory unavailable');
    $lock=fopen($logDir.'/write.lock','c+b');if(!$lock||!flock($lock,LOCK_EX|LOCK_NB)){if($lock)fclose($lock);throw new RuntimeException('Log busy');}
    try {
        $total=0;
        foreach(glob($logDir.'/analytics-*.ndjson') ?: [] as $candidate){
            if(filemtime($candidate)<time()-200*86400){unlink($candidate);continue;}
            $total+=filesize($candidate);
        }
        $file=$logDir.'/analytics-'.gmdate('Y-m-d').'.ndjson';
        $line=json_encode($record,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR)."\n";
        $daily=is_file($file)?filesize($file):0;
        if($daily+strlen($line)>4*1024*1024||$total+strlen($line)>64*1024*1024)return false;
        if(file_put_contents($file,$line,FILE_APPEND)!==strlen($line))throw new RuntimeException('Log append failed');
        chmod($file,0640);return true;
    } finally {flock($lock,LOCK_UN);fclose($lock);}
}

/** Constant-time authentication for private admin API operations. Configure only on the server. */
function dnpAdminAuthorized(array $config): bool {
    $expected = $config['admin']['control_key'] ?? getenv('DNP_ADMIN_KEY') ?: '';
    $provided = $_SERVER['HTTP_X_DNP_ADMIN_KEY'] ?? '';
    return is_string($expected) && strlen($expected) >= 24 && is_string($provided) && hash_equals($expected, $provided);
}
function dnpRequireAdmin(array $config): void {
    if (!dnpAdminAuthorized($config)) dnpRespond(401, ['ok'=>false,'message'=>'Brak autoryzacji administratora.']);
}
