<?php
declare(strict_types=1);
require_once __DIR__.'/lib/security.php';
$config=dnpConfig();
[$data,$dir]=dnpGuard('analytics',4096,$config);
dnpRequireAdmin($config);
$lookup=(string)($data['visitor']??'');
$visitLookup=(string)($data['visit']??'');
if(!preg_match('/^[a-f0-9]{64}$/D',$lookup)||($visitLookup!==''&&!preg_match('/^[a-f0-9]{64}$/D',$visitLookup)))
    dnpRespond(422,['ok'=>false,'message'=>'Nieprawidłowy identyfikator historii.']);
$days=max(1,min(180,(int)($data['rangeDays']??30)));
$cutoff=time()-$days*86400;
$secret=dnpSecret($dir);
$visits=[];$events=[];
foreach(glob($dir.'/analytics/analytics-*.ndjson')?:[] as $file){
    if(filemtime($file)<$cutoff-86400)continue;
    $fh=fopen($file,'rb');if(!$fh)continue;
    while(($line=fgets($fh))!==false){
        if(strlen($line)>16384)continue;
        try{$event=json_decode($line,true,16,JSON_THROW_ON_ERROR);}catch(Throwable){continue;}
        if(!is_array($event))continue;
        $ts=strtotime((string)($event['createdAt']??''));
        if(!$ts||$ts<$cutoff)continue;
        $visitorId=$event['visitorId']??'';$visitId=$event['visitId']??'';
        if(!is_string($visitorId)||!is_string($visitId)||$visitId===''||
            !hash_equals($lookup,hash_hmac('sha256','visitor:'.$visitorId,$secret)))continue;
        $token=hash_hmac('sha256','visit:'.$visitId,$secret);
        $visits[$token]??=['id'=>$token,'firstSeen'=>$ts,'lastSeen'=>$ts,'durationMs'=>0,
            'source'=>is_string($event['source']??null)?substr($event['source'],0,80):'direct',
            'device'=>is_string($event['deviceClass']??null)?substr($event['deviceClass'],0,20):'unknown',
            'events'=>0];
        $visits[$token]['firstSeen']=min($visits[$token]['firstSeen'],$ts);
        $visits[$token]['lastSeen']=max($visits[$token]['lastSeen'],$ts);
        $visits[$token]['events']++;
        if(in_array($event['eventName']??'',['section_time','tour_scene_time'],true))
            $visits[$token]['durationMs']+=max(0,min(21600000,(int)($event['durationMs']??0)));
        if(($visitLookup===''||hash_equals($visitLookup,$token))&&count($events[$token]??[])<401){
            $events[$token][]=['at'=>gmdate('c',$ts),'type'=>substr((string)($event['eventName']??''),0,40),
                'section'=>substr((string)($event['sectionId']??''),0,80),
                'scene'=>substr((string)($event['sceneId']??''),0,100),
                'tour'=>substr((string)($event['tourMode']??''),0,20),
                'house'=>substr((string)($event['houseCode']??''),0,10),
                'path'=>substr((string)($event['pagePath']??'/'),0,180),
                'durationMs'=>max(0,min(21600000,(int)($event['durationMs']??0)))];
        }
    }
    fclose($fh);
}
if(!$visits)dnpRespond(404,['ok'=>false,'message'=>'Brak wizyt tego identyfikatora w wybranym zakresie.']);
uasort($visits,static fn($a,$b)=>$b['lastSeen']<=>$a['lastSeen']);
$chosen=$visitLookup!==''?$visitLookup:array_key_first($visits);
if(!isset($visits[$chosen]))dnpRespond(404,['ok'=>false,'message'=>'Nie znaleziono wybranej wizyty.']);
$rows=[];
foreach($visits as $v){$v['firstSeen']=gmdate('c',$v['firstSeen']);$v['lastSeen']=gmdate('c',$v['lastSeen']);$rows[]=$v;}
$activity=$events[$chosen]??[];
usort($activity,static fn($a,$b)=>strcmp($a['at'],$b['at']));
$truncated=count($activity)>400;
if($truncated)$activity=array_slice($activity,0,400);
dnpRespond(200,['ok'=>true,'rangeDays'=>$days,'visits'=>array_slice($rows,0,200),
    'selectedVisit'=>$chosen,'events'=>$activity,'truncated'=>$truncated]);
