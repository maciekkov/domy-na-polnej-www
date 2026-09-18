<?php
declare(strict_types=1);
require_once __DIR__.'/security.php';

function dnpGovConfig(array $config): array { return is_array($config['gov_sync'] ?? null) ? $config['gov_sync'] : []; }
function dnpGovSiteDataPath(): string {
    $candidates=[dirname(__DIR__,2).'/data/site-data.json', dirname(__DIR__,2).'/public/data/site-data.json', dirname(__DIR__).'/../data/site-data.json'];
    foreach($candidates as $path) if(is_file($path)) return $path;
    throw new RuntimeException('Nie znaleziono public/data/site-data.json.');
}
function dnpGovLoadSiteData(): array {
    $raw=file_get_contents(dnpGovSiteDataPath());if(!is_string($raw))throw new RuntimeException('Nie można odczytać danych oferty.');
    $data=json_decode($raw,true,32,JSON_THROW_ON_ERROR);if(!is_array($data))throw new RuntimeException('Nieprawidłowe dane oferty.');
    return $data;
}
function dnpGovPricePerSqm(array $house): float {
    $area=(float)($house['area']??0);$price=(float)($house['price']??0);
    if($area<=0||$price<=0)throw new RuntimeException('Brak ceny lub powierzchni użytkowej.');
    return round($price/$area,2);
}
/** Stable normalized payload. The final official transport/schema is configured server-side once published by the authority. */
function dnpGovPayload(array $config, ?array $siteData=null): array {
    $siteData??=dnpGovLoadSiteData();$gov=dnpGovConfig($config);
    $developer=$gov['developer']??[];$investment=$gov['investment']??[];
    foreach(['name','nip'] as $field)if(!is_string($developer[$field]??null)||trim($developer[$field])==='')throw new RuntimeException('Brak danych dewelopera: '.$field);
    $houses=[];
    foreach(($siteData['houses']??[]) as $house){
        if(!is_array($house))continue;
        foreach(['id','parcel','price','area','plot','status'] as $field)if(!array_key_exists($field,$house))throw new RuntimeException('Brak pola domu: '.$field);
        $houses[]=[
          'houseId'=>(string)$house['id'],
          'parcel'=>(string)$house['parcel'],
          'status'=>(string)$house['status'],
          'usableAreaM2'=>(float)$house['area'],
          'plotAreaM2'=>(float)$house['plot'],
          'grossPricePln'=>(int)$house['price'],
          'grossPricePerM2Pln'=>dnpGovPricePerSqm($house),
          'mandatoryPayments'=>array_values(is_array($house['mandatoryPayments']??null)?$house['mandatoryPayments']:[]),
          'priceHistory'=>array_values(is_array($house['priceHistory']??null)?$house['priceHistory']:[]),
          'publicOfferUrl'=>'https://domynapolnej.pl/dom-'.strtolower((string)$house['id']).'/',
        ];
    }
    if(count($houses)!==5)throw new RuntimeException('Raport wymaga kompletu domów A–E.');
    return [
      'schema'=>'dnp.developer-price-report.normalized',
      'schemaVersion'=>1,
      'generatedAt'=>gmdate('c'),
      'siteRevision'=>(int)($siteData['revision']??0),
      'sitePublishedAt'=>(string)($siteData['publishedAt']??''),
      'developer'=>[
        'name'=>(string)$developer['name'],'nip'=>(string)$developer['nip'],
        'regon'=>(string)($developer['regon']??''),'krs'=>(string)($developer['krs']??''),
      ],
      'investment'=>[
        'name'=>(string)($investment['name']??'Domy na Polnej'),
        'location'=>(string)($investment['location']??'Grabik, gmina Żary'),
      ],
      'houses'=>$houses,
    ];
}
function dnpGovStatePath(array $config): string { return dnpStorage($config).'/gov-sync-state.json'; }
function dnpGovState(array $config): array {
    $path=dnpGovStatePath($config);if(!is_file($path))return ['enabled'=>false,'lastAttempt'=>null,'lastSuccess'=>null,'lastError'=>null,'lastHash'=>null];
    $raw=file_get_contents($path);$state=$raw?json_decode($raw,true):null;
    return is_array($state)?array_replace(['enabled'=>false,'lastAttempt'=>null,'lastSuccess'=>null,'lastError'=>null,'lastHash'=>null],$state):['enabled'=>false,'lastAttempt'=>null,'lastSuccess'=>null,'lastError'=>'Uszkodzony stan synchronizacji.','lastHash'=>null];
}
function dnpGovWriteState(array $config,array $state): void {
    $path=dnpGovStatePath($config);$tmp=$path.'.'.bin2hex(random_bytes(4)).'.tmp';
    $json=json_encode($state,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
    if(file_put_contents($tmp,$json,LOCK_EX)!==strlen($json))throw new RuntimeException('Nie można zapisać stanu Gov Sync.');
    @chmod($tmp,0600);if(!rename($tmp,$path)){@unlink($tmp);throw new RuntimeException('Nie można opublikować stanu Gov Sync.');}
}
function dnpGovTransportReady(array $config): array {
    $gov=dnpGovConfig($config);$endpoint=(string)($gov['endpoint']??'');$mode=(string)($gov['mode']??'disabled');
    $ready=$mode==='http' && filter_var($endpoint,FILTER_VALIDATE_URL) && str_starts_with($endpoint,'https://');
    return ['ready'=>(bool)$ready,'mode'=>$mode,'endpointConfigured'=>$endpoint!=='','schemaId'=>(string)($gov['official_schema_id']??''),'note'=>$ready?'Transport skonfigurowany.':'Brak aktywnego, oficjalnie skonfigurowanego endpointu.'];
}
function dnpGovHttpPost(string $url,array $payload,array $gov): array {
    $body=json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
    $headers=['Content-Type: application/json','Accept: application/json'];
    $token=(string)($gov['bearer_token']??'');if($token!=='')$headers[]='Authorization: Bearer '.$token;
    if(is_array($gov['headers']??null))foreach($gov['headers'] as $name=>$value)if(is_string($name)&&is_string($value)&&preg_match('/^[A-Za-z0-9-]{1,60}$/',$name))$headers[]=$name.': '.$value;
    if(function_exists('curl_init')){
        $ch=curl_init($url);curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>$body,CURLOPT_HTTPHEADER=>$headers,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>20,CURLOPT_CONNECTTIMEOUT=>8,CURLOPT_FOLLOWLOCATION=>false]);
        $response=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);$error=curl_error($ch);curl_close($ch);
        if($response===false)throw new RuntimeException('Błąd transportu: '.$error);
        return ['status'=>$status,'body'=>substr((string)$response,0,4000)];
    }
    $context=stream_context_create(['http'=>['method'=>'POST','header'=>implode("\r\n",$headers),'content'=>$body,'timeout'=>20,'ignore_errors'=>true]]);
    $response=@file_get_contents($url,false,$context);$status=0;
    foreach($http_response_header??[] as $line)if(preg_match('~^HTTP/\S+\s+(\d{3})~',$line,$m)){$status=(int)$m[1];break;}
    return ['status'=>$status,'body'=>substr((string)($response?:''),0,4000)];
}
function dnpGovPublish(array $config,bool $force=false): array {
    $state=dnpGovState($config);if(!$state['enabled']&&!$force)throw new RuntimeException('Gov Sync jest wyłączony.');
    $transport=dnpGovTransportReady($config);if(!$transport['ready'])throw new RuntimeException('Nie skonfigurowano oficjalnego transportu.');
    $payload=dnpGovPayload($config);$hash=hash('sha256',json_encode($payload['houses'],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
    $state['lastAttempt']=gmdate('c');$state['lastError']=null;dnpGovWriteState($config,$state);
    try{
        $result=dnpGovHttpPost((string)dnpGovConfig($config)['endpoint'],$payload,dnpGovConfig($config));
        if($result['status']<200||$result['status']>=300)throw new RuntimeException('Endpoint odpowiedział HTTP '.$result['status'].'.');
        $state['lastSuccess']=gmdate('c');$state['lastHash']=$hash;$state['lastError']=null;dnpGovWriteState($config,$state);
        return ['ok'=>true,'status'=>$result['status'],'hash'=>$hash,'publishedAt'=>$state['lastSuccess']];
    }catch(Throwable $e){$state['lastError']=$e->getMessage();dnpGovWriteState($config,$state);throw $e;}
}
