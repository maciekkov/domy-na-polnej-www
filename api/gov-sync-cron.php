<?php
declare(strict_types=1);
require_once __DIR__.'/lib/gov-sync.php';
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
try{$config=dnpConfig();$state=dnpGovState($config);if(!$state['enabled']){fwrite(STDOUT,"Gov Sync wyłączony\n");exit(0);} $result=dnpGovPublish($config);fwrite(STDOUT,json_encode($result,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."\n");}
catch(Throwable $e){fwrite(STDERR,"Gov Sync: ".$e->getMessage()."\n");exit(1);}
