<?php
declare(strict_types=1);
require_once __DIR__.'/../api/lib/security.php';
require_once __DIR__.'/../api/lib/presale.php';
function check(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); echo 'PASS '.$message."\n"; }
$dir=sys_get_temp_dir().'/dnp-presale-test-'.bin2hex(random_bytes(5)); mkdir($dir,0700);
try {
    foreach ([['email'=>'bad','consent'=>true], ['email'=>'qa@example.invalid','consent'=>false], ['email'=>'qa@example.invalid','consent'=>true,'consentVersion'=>'old'], ['email'=>[], 'action'=>'unsubscribe']] as $input) {
        try { dnpPresaleInput($input); throw new RuntimeException('Invalid input accepted'); } catch (InvalidArgumentException $expected) { echo "PASS invalid input rejected\n"; }
    }
    [$email,$action]=dnpPresaleInput(['email'=>' QA@example.invalid ', 'consent'=>true, 'consentVersion'=>'presale-1.0']);
    check($email==='qa@example.invalid' && $action==='subscribe','input normalized');
    check(dnpPresaleChange($dir,$email,$action)===true,'new subscription triggers notification');
    $files=glob($dir.'/presale/*.json'); check(count($files)===1,'real record persisted');
    $original=file_get_contents($files[0]);$record=json_decode($original,true,8,JSON_THROW_ON_ERROR);
    check($record['email']===$email && $record['consentText']===DNP_PRESALE_CONSENT_TEXT && $record['consentVersion']==='presale-1.0' && $record['emailVerified']===false,'email and consent provenance saved');
    check(dnpPresaleChange($dir,$email,'subscribe')===false,'duplicate does not trigger notification');check(count(glob($dir.'/presale/*.json'))===1 && file_get_contents($files[0])===$original,'duplicate does not replace original consent');
    dnpPresaleChange($dir,$email,'unsubscribe');check(count(glob($dir.'/presale/*.json'))===0,'unsubscribe removes stored email');
    dnpPresaleChange($dir,$email,'unsubscribe');check(count(glob($dir.'/presale/*.json'))===0,'unsubscribe idempotent');
    dnpPresaleChange($dir,$email,'subscribe');check(count(glob($dir.'/presale/*.json'))===1,'new explicit consent allows rejoin');
} finally { foreach(glob($dir.'/presale/*') ?: [] as $f) unlink($f); if(is_dir($dir.'/presale'))rmdir($dir.'/presale'); foreach(glob($dir.'/*') ?: [] as $f)unlink($f);rmdir($dir); }
