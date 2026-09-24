<?php
declare(strict_types=1);
require_once __DIR__.'/lib/security.php';
$config=dnpConfig();
[$data,$dir]=dnpGuard('analytics',4096,$config);
dnpRequireAdmin($config);
$days=(int)($data['rangeDays']??30);$days=max(1,min(200,$days));
$cutoff=time()-$days*86400;
$files=glob($dir.'/analytics/analytics-*.ndjson') ?: [];
$visitors=[];$visits=[];$devices=[];$sections=[];$tours=[];$houses=[];$sources=[];$events=0;$engaged=0;
foreach($files as $file){
    if(filemtime($file)<$cutoff-86400)continue;
    $fh=fopen($file,'rb');if(!$fh)continue;
    while(($line=fgets($fh))!==false){
        if(trim($line)==='')continue;
        try{$e=json_decode($line,true,16,JSON_THROW_ON_ERROR);}catch(Throwable){continue;}
        $ts=strtotime((string)($e['createdAt']??''));if(!$ts||$ts<$cutoff)continue;
        $events++;
        $vid=(string)($e['visitorId']??'');$visit=(string)($e['visitId']??'');
        if($vid!==''){
            $v=$visitors[$vid]??['id'=>$vid,'firstSeen'=>$ts,'lastSeen'=>$ts,'visits'=>[],'durationMs'=>0,'device'=>$e['deviceClass']??'unknown','lastPath'=>$e['pagePath']??'/'];
            $v['firstSeen']=min($v['firstSeen'],$ts);$v['lastSeen']=max($v['lastSeen'],$ts);$v['device']=$e['deviceClass']??$v['device'];$v['lastPath']=$e['pagePath']??$v['lastPath'];
            if($visit!=='')$v['visits'][$visit]=true;
            if(in_array($e['eventName']??'', ['section_time','tour_scene_time'],true))$v['durationMs']+=(int)($e['durationMs']??0);
            $visitors[$vid]=$v;
        }
        if($visit!=='')$visits[$visit]=true;
        $device=(string)($e['deviceClass']??'unknown');$devices[$device]=($devices[$device]??0)+1;
        $source=(string)($e['source']??'direct');$sources[$source]=($sources[$source]??0)+1;
        $house=(string)($e['houseCode']??'unknown');
        if(in_array($e['eventName']??'', ['house_select','house_pdf_download','house_contact_click','contact_submit'],true)){
            $houses[$house]??=['select'=>0,'pdf'=>0,'contact'=>0,'submit'=>0];
            $key=match($e['eventName']){'house_select'=>'select','house_pdf_download'=>'pdf','house_contact_click'=>'contact',default=>'submit'};$houses[$house][$key]++;
        }
        $duration=(int)($e['durationMs']??0);
        if(($e['eventName']??'')==='section_view' || ($e['eventName']??'')==='section_time'){
            $id=(string)($e['sectionId']??'unknown');$sections[$id]??=['id'=>$id,'views'=>0,'durationMs'=>0];
            if(($e['eventName']??'')==='section_view')$sections[$id]['views']++;else{$sections[$id]['durationMs']+=$duration;$engaged+=$duration;}
        }
        if(($e['eventName']??'')==='tour_scene_view' || ($e['eventName']??'')==='tour_scene_time'){
            $mode=(string)($e['tourMode']??'unknown');$tours[$mode]??=['mode'=>$mode,'views'=>0,'durationMs'=>0];
            if(($e['eventName']??'')==='tour_scene_view')$tours[$mode]['views']++;else{$tours[$mode]['durationMs']+=$duration;$engaged+=$duration;}
        }
    }
    fclose($fh);
}
$visitorRows=[];$returning=0;
$lookupSecret=dnpSecret($dir);
foreach($visitors as $v){$count=count($v['visits']);if($count>1)$returning++;$visitorRows[]=['id'=>substr($v['id'],0,12).'…','lookup'=>hash_hmac('sha256','visitor:'.$v['id'],$lookupSecret),'firstSeen'=>gmdate('c',$v['firstSeen']),'lastSeen'=>gmdate('c',$v['lastSeen']),'visits'=>$count,'durationMs'=>$v['durationMs'],'device'=>$v['device'],'lastPath'=>$v['lastPath']];}
usort($visitorRows,fn($a,$b)=>strcmp($b['lastSeen'],$a['lastSeen']));$visitorRows=array_slice($visitorRows,0,100);
$sortDesc=fn(&$array,$key)=>usort($array,fn($a,$b)=>($b[$key]??0)<=>($a[$key]??0));
$sectionRows=array_values($sections);$sortDesc($sectionRows,'durationMs');$tourRows=array_values($tours);$sortDesc($tourRows,'durationMs');
arsort($sources);
dnpRespond(200,['ok'=>true,'rangeDays'=>$days,'events'=>$events,'uniqueVisitors'=>count($visitors),'uniqueVisits'=>count($visits),'returningVisitors'=>$returning,'engagedDurationMs'=>$engaged,'devices'=>$devices,'sections'=>array_slice($sectionRows,0,30),'tours'=>$tourRows,'houses'=>$houses,'sources'=>array_slice($sources,0,20,true),'visitors'=>$visitorRows]);
