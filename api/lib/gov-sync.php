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
    if (($siteData['salesStage']??null)!=='selling') throw new RuntimeException('Raportowanie wyłączone przed rozpoczęciem sprzedaży.');
    $developer=$gov['developer']??[];$investment=$gov['investment']??[];
    foreach(['name','nip'] as $field)if(!is_string($developer[$field]??null)||trim($developer[$field])==='')throw new RuntimeException('Brak danych dewelopera: '.$field);
    $houses=[];$seen=[];
    foreach(($siteData['houses']??[]) as $house){
        if(!is_array($house))continue;
        foreach(['id','parcel','price','area','plot','status'] as $field)if(!array_key_exists($field,$house))throw new RuntimeException('Brak pola domu: '.$field);
        $id=$house['id'];
        if(!in_array($id,['A','B','C','D','E'],true)||isset($seen[$id])) throw new RuntimeException('Nieprawidłowy lub powtórzony identyfikator domu.');
        $seen[$id]=true;
        if(!is_int($house['price'])||$house['price']<=0||$house['price']>100000000) throw new RuntimeException('Nieprawidłowa cena domu.');
        if(!in_array($house['status'],['Dostępny','Rezerwacja','Sprzedany'],true)) throw new RuntimeException('Nieprawidłowy status domu.');
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
          'publicOfferUrl'=>'https://domynapolnej.pl/?dom='.rawurlencode((string)$house['id']).'#domy',
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
    return ['enabled'=>false,'locked'=>true,'lastAttempt'=>null,'lastSuccess'=>null,'lastError'=>null,'lastHash'=>null];
}
function dnpGovWriteState(array $config,array $state): void {
    $path=dnpGovStatePath($config);$tmp=$path.'.'.bin2hex(random_bytes(4)).'.tmp';
    $json=json_encode($state,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
    if(file_put_contents($tmp,$json,LOCK_EX)!==strlen($json))throw new RuntimeException('Nie można zapisać stanu Gov Sync.');
    @chmod($tmp,0600);if(!rename($tmp,$path)){@unlink($tmp);throw new RuntimeException('Nie można opublikować stanu Gov Sync.');}
}
function dnpGovTransportReady(array $config): array {
    return ['ready'=>false,'mode'=>'disabled','locked'=>true,'endpointConfigured'=>false,'schemaId'=>'','note'=>'Gov Sync zablokowany na życzenie właściciela.'];
}
function dnpGovHttpPost(string $url,array $payload,array $gov): array {
    throw new RuntimeException('Gov Sync jest wyłączony i zablokowany.');
}
function dnpGovPublish(array $config,bool $force=false): array {
    throw new RuntimeException('Gov Sync jest wyłączony i zablokowany.');
}
