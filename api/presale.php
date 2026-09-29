<?php
declare(strict_types=1);
require_once __DIR__.'/lib/security.php';
require_once __DIR__.'/lib/presale.php';
require_once __DIR__.'/lib/mailer.php';
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

    // Każde prawidłowe zgłoszenie zapisu wysyła powiadomienie do biura.
    // Dotyczy to również ponownego wysłania tego samego adresu: zapis w bazie
    // pozostaje pojedynczy, ale właściciel strony dostaje e-mail z formularza.
    if ($action === 'subscribe') {
        $subject = $changed
            ? 'NOWY ZAPIS — przedsprzedaż Domy na Polnej'
            : 'PONOWNY ZAPIS — przedsprzedaż Domy na Polnej';
        $body = "Nowe zgłoszenie z formularza przedsprzedaży Domy na Polnej\n\n" .
                "E-mail zainteresowanego: {$email}\n" .
                "Status: " . ($changed ? 'nowy adres zapisany na liście' : 'adres był już zapisany na liście') . "\n" .
                "Data UTC: " . gmdate('c') . "\n\n" .
                "Adres pozostaje zapisany w prywatnej liście przedsprzedaży.";
        try {
            $transport = dnpSendConfiguredMail($config, $subject, $body, $email);
            error_log('[DNP presale] signup notification accepted by ' . $transport);
        } catch (Throwable $mailError) {
            error_log('[DNP presale] signup saved, but notification mail delivery failed');
            dnpRespond(502, [
                'ok' => false,
                'saved' => true,
                'message' => 'Adres został zapisany, ale nie udało się wysłać powiadomienia do biura. Spróbuj ponownie za chwilę.'
            ]);
        }
    } elseif ($changed) {
        // Rezygnacja jest raportowana tylko wtedy, gdy faktycznie usunięto adres.
        try {
            $transport = dnpSendConfiguredMail(
                $config,
                'REZYGNACJA — przedsprzedaż Domy na Polnej',
                "Rezygnacja z listy przedsprzedaży Domy na Polnej\n\nE-mail: {$email}\nData UTC: " . gmdate('c'),
                $email
            );
            error_log('[DNP presale] unsubscribe notification accepted by ' . $transport);
        } catch (Throwable $mailError) {
            // Rezygnacja musi pozostać skuteczna nawet przy awarii transportu pocztowego.
            error_log('[DNP presale] unsubscribe saved; notification delivery failed');
        }
    }
    dnpRespond(200, ['ok'=>true]);
} catch (Throwable $error) {
    error_log('[DNP presale] cannot save request');
    dnpRespond(503, ['ok'=>false, 'message'=>'Nie udało się zapisać zmiany. Spróbuj ponownie później.']);
}
