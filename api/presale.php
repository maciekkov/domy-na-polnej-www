<?php
declare(strict_types=1);
require_once __DIR__.'/lib/security.php';
require_once __DIR__.'/lib/presale.php';
require_once __DIR__.'/lib/smtp.php';
try {
    $config = dnpConfig();
    [$data, $privateDir, $identity] = dnpGuard('presale', 4096, $config);
} catch (Throwable $error) {
    error_log('[DNP presale] storage or configuration failure');
    dnpRespond(503, ['ok'=>false, 'message'=>'Zapisy są chwilowo niedostępne. Spróbuj ponownie później.']);
}
if (!empty($data['website'])) dnpRespond(200, ['ok'=>true]);
try { [$email, $action] = dnpPresaleInput($data); }
catch (InvalidArgumentException $error) { dnpRespond(422, ['ok'=>false, 'message'=>$error->getMessage()]); }
try {
    if ($action === 'subscribe') {
        $site = json_decode(file_get_contents(dirname(__DIR__).'/data/site-data.json'), true, 32, JSON_THROW_ON_ERROR);
        if (($site['salesStage'] ?? null) !== 'prelaunch') dnpRespond(409, ['ok'=>false, 'message'=>'Lista przedsprzedaży jest zamknięta. Zapraszamy do kontaktu w sprawie aktualnej oferty.']);
    }
    $retry = dnpLimit($privateDir, 'presale-submit', $identity, [[5,3600],[100,3600,true]]);
    if ($retry) dnpRespond(429, ['ok'=>false,'message'=>'Odczekaj przed kolejną próbą.'], $retry);
    $changed = dnpPresaleChange($privateDir, $email, $action);
    if ($changed) {
        // The private list is authoritative; a temporary mail failure cannot undo a saved consent/removal.
        try {
            $to = (string)($config['recipient'] ?? '');
            $from = (string)($config['from_email'] ?? '');
            if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $to.$from.(string)($config['from_name'] ?? ''))) throw new RuntimeException('Mail configuration unavailable');
            sendSmtp((array)($config['smtp'] ?? []), $to, $from, (string)($config['from_name'] ?? 'Domy na Polnej'),
                $action === 'subscribe' ? 'Nowy zapis na przedsprzedaż' : 'Rezygnacja z powiadomienia',
                "Adres: ".$email."\nOperacja: ".$action."\nData UTC: ".gmdate('c')."\nBieżąca lista w prywatnym magazynie jest wiążąca.");
        } catch (Throwable $mailError) { error_log('[DNP presale] Saved change; notification delivery failed. Check SMTP and private list.'); }
    }
    dnpRespond(200, ['ok'=>true]);
} catch (Throwable $error) {
    error_log('[DNP presale] cannot save request');
    dnpRespond(503, ['ok'=>false, 'message'=>'Nie udało się zapisać zmiany. Spróbuj ponownie później.']);
}
