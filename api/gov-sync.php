<?php
declare(strict_types=1);
require_once __DIR__.'/lib/gov-sync.php';
$config=dnpConfig();dnpRequireAdmin($config);
[$data]=dnpGuard('contact',8192,$config);$action=(string)($data['action']??'status');
try{
  $state=dnpGovState($config);$transport=dnpGovTransportReady($config);
  if($action==='status')dnpRespond(200,['ok'=>true,'state'=>$state,'transport'=>$transport]);
  if($action==='preview')dnpRespond(200,['ok'=>true,'state'=>$state,'transport'=>$transport,'payload'=>dnpGovPayload($config)]);
  if($action==='enable'){
    if(!$transport['ready'])dnpRespond(409,['ok'=>false,'message'=>'Nie można włączyć: brak oficjalnie skonfigurowanego endpointu i transportu.','transport'=>$transport]);
    $state['enabled']=true;$state['lastError']=null;dnpGovWriteState($config,$state);dnpRespond(200,['ok'=>true,'state'=>$state,'message'=>'Gov Sync włączony.']);
  }
  if($action==='disable'){$state['enabled']=false;dnpGovWriteState($config,$state);dnpRespond(200,['ok'=>true,'state'=>$state,'message'=>'Gov Sync wyłączony.']);}
  if($action==='publish'){$result=dnpGovPublish($config);dnpRespond(200,['ok'=>true,'result'=>$result,'state'=>dnpGovState($config)]);}
  dnpRespond(422,['ok'=>false,'message'=>'Nieznana akcja.']);
}catch(Throwable $e){dnpRespond(503,['ok'=>false,'message'=>$e->getMessage()]);}
