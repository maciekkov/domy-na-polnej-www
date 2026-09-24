import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const base=process.env.PHP_WASM_NODE_MODULES;
const {PHP}=await import(pathToFileURL(base+'/@php-wasm/universal/index.js'));
const {loadNodeRuntime}=await import(pathToFileURL(base+'/@php-wasm/node/index.js'));
const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:process.pid}}));
try{
 php.mkdir('/app');php.writeFile('/app/security.php',readFileSync('api/lib/security.php'));php.writeFile('/app/gov-sync.php',readFileSync('api/lib/gov-sync.php'));
 const result=await php.run({code:`<?php require '/app/gov-sync.php';
 $config=['gov_sync'=>['mode'=>'http','endpoint'=>'https://example.invalid','official_schema_id'=>'test']];
 $blocked=0;try{dnpGovPublish($config,true);}catch(RuntimeException $e){$blocked++;}
 try{dnpGovHttpPost('https://example.invalid',[],[]);}catch(RuntimeException $e){$blocked++;}
 echo json_encode([dnpGovState($config)['enabled'],dnpGovTransportReady($config)['ready'],$blocked]);`});
 assert.equal(result.text,'[false,false,2]');console.log('PASS: PHP transport and forced publishing blocked.');
}finally{php.exit();}
