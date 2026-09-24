<?php
// Run on the server with PHP CLI. Never copy scripts/ into the public web directory.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__.'/../api/lib/security.php';
require_once __DIR__.'/../api/lib/presale.php';
$command = $argv[1] ?? '';
$dir = dnpStorage(dnpConfig());
if ($command === 'remove') {
    [$email] = dnpPresaleInput(['email'=>$argv[2] ?? '', 'action'=>'unsubscribe']);
    dnpPresaleChange($dir, $email, 'unsubscribe'); echo "Adres usunięty, jeśli był na liście.\n"; exit;
}
if ($command !== 'export') { fwrite(STDERR, "Użycie: php scripts/presale-list.php export > zapisy.csv\n        php scripts/presale-list.php remove adres@example.pl\nMagazyn: DNP_PRIVATE_DIR lub security.storage_dir w api/config.php.\n"); exit(1); }
// Export is serialized with registration/removal to give one consistent snapshot.
$folder=$dir.'/presale';
$out=fopen('php://stdout','wb'); fputcsv($out,['email','data_zgody','wersja_zgody','email_verified'], ';', '"', '');
if (!is_dir($folder)) exit;
$lock=fopen($folder.'/write.lock','c+b'); if (!$lock || !flock($lock, LOCK_SH)) throw new RuntimeException('Lista jest niedostępna.');
try {
    foreach (glob($folder.'/*.json') ?: [] as $file) {
        $row=json_decode(file_get_contents($file),true,8,JSON_THROW_ON_ERROR);
        $email=(string)$row['email'];
        if (preg_match('/^[=+\-@]/',$email)) $email="'".$email;
        fputcsv($out,[$email,$row['createdAt'],$row['consentVersion'],'nie'], ';', '"', '');
    }
} finally { flock($lock,LOCK_UN); fclose($lock); }
