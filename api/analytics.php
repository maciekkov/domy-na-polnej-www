<?php
declare(strict_types=1);
require_once __DIR__.'/lib/security.php';

function dnpAnalyticsId(mixed $value, string $field): string {
    if (!is_string($value) || !preg_match('/^[a-zA-Z0-9_-]{8,100}$/', $value)) dnpRespond(422,['ok'=>false,'message'=>'Nieprawidłowy identyfikator: '.$field]);
    return $value;
}
function dnpAnalyticsText(mixed $value, int $max = 120, string $pattern = '/[^a-zA-Z0-9._:\/-]/'): ?string {
    if ($value === null || $value === '') return null;
    if (!is_string($value)) dnpRespond(422,['ok'=>false,'message'=>'Nieprawidłowy typ pola.']);
    $clean = substr((string)preg_replace($pattern, '', $value), 0, $max);
    return $clean === '' ? null : $clean;
}

try {
    [$data,$dir] = dnpGuard('analytics', 12288, dnpConfig());
    $allowed = json_decode(file_get_contents(__DIR__.'/event-names.json'), true, 8, JSON_THROW_ON_ERROR);
    $event = $data['eventName'] ?? '';
    if (!is_string($event) || !in_array($event,$allowed,true)) dnpRespond(422,['ok'=>false,'message'=>'Nieprawidłowe zdarzenie.']);

    $visitor = dnpAnalyticsId($data['visitorId'] ?? '', 'visitorId');
    $visit = dnpAnalyticsId($data['visitId'] ?? '', 'visitId');
    $session = dnpAnalyticsId($data['sessionId'] ?? '', 'sessionId');
    $eventId = isset($data['eventId']) && $data['eventId'] !== '' ? dnpAnalyticsId($data['eventId'],'eventId') : null;

    $house = $data['houseCode'] ?? 'unknown';
    if (!in_array($house,['A','B','C','D','E','unknown'],true)) $house='unknown';
    $path = $data['pagePath'] ?? '/';
    if (!is_string($path) || strlen($path)>180 || !preg_match('~^/[a-zA-Z0-9._/-]*$~',$path)) $path='/';
    $device = $data['deviceClass'] ?? 'desktop';
    if (!in_array($device,['mobile','tablet','desktop'],true)) $device='desktop';
    $viewport = $data['viewportBucket'] ?? 'unknown';
    if (!in_array($viewport,['<480','480-767','768-1023','1024-1439','1440+','unknown'],true)) $viewport='unknown';
    $tourMode = $data['tourMode'] ?? null;
    if ($tourMode !== null && !in_array($tourMode,['interior','exterior'],true)) $tourMode=null;
    $duration = $data['durationMs'] ?? null;
    if ($duration !== null && (!is_int($duration) && !is_float($duration))) dnpRespond(422,['ok'=>false,'message'=>'Nieprawidłowy czas zdarzenia.']);
    if ($duration !== null) $duration = max(0,min(21600000,(int)round((float)$duration)));

    // Deliberately pseudonymous: no IP, form fields, names, phone/e-mail, full user-agent or query string.
    $record = [
      'createdAt'=>gmdate('c'), 'eventName'=>$event,
      'visitorId'=>$visitor, 'visitId'=>$visit, 'sessionId'=>$session,
      'houseCode'=>$house, 'pagePath'=>$path,
      'source'=>dnpAnalyticsText($data['source'] ?? 'direct',80) ?? 'direct',
      'utmMedium'=>dnpAnalyticsText($data['utmMedium'] ?? null,80),
      'utmCampaign'=>dnpAnalyticsText($data['utmCampaign'] ?? null,120),
      'utmContent'=>dnpAnalyticsText($data['utmContent'] ?? null,120),
      'referrerHost'=>dnpAnalyticsText($data['referrerHost'] ?? null,120),
      'deviceClass'=>$device, 'viewportBucket'=>$viewport,
      'sectionId'=>dnpAnalyticsText($data['sectionId'] ?? null,80),
      'tourMode'=>$tourMode,
      'sceneId'=>dnpAnalyticsText($data['sceneId'] ?? null,100),
      'durationMs'=>$duration,
    ];
    if ($eventId !== null) $record['eventId']=$eventId;
    $record=array_filter($record, static fn($value)=>$value!==null);
    if (!dnpAppendAnalytics($dir,$record)) dnpRespond(503,['ok'=>false],3600);
    dnpRespond(200,['ok'=>true]);
} catch(Throwable $error){
    error_log('[DNP analytics] storage or configuration failure');
    dnpRespond(503,['ok'=>false],60);
}
