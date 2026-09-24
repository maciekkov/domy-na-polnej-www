<?php
declare(strict_types=1);
$public=dirname(__DIR__).'/hosting/public_html';
$private=dirname(__DIR__).'/hosting/private/dnp';
require_once $public.'/api/lib/security.php';
$config=dnpConfig();
$access=file_get_contents($private.'/DOSTEP-ANALITYKA.txt');
if(!preg_match('/Hasło: ([A-Za-z0-9_-]+)/',$access,$match))throw new RuntimeException('Brak hasła.');
$_SERVER['HTTP_X_DNP_ADMIN_LOGIN']='analityka';
$_SERVER['HTTP_X_DNP_ADMIN_PASSWORD']=$match[1];
if(!dnpAdminAuthorized($config))throw new RuntimeException('Logowanie poprawnym hasłem nie działa.');
$_SERVER['HTTP_X_DNP_ADMIN_PASSWORD']='bledne';
if(dnpAdminAuthorized($config))throw new RuntimeException('Błędne hasło zostało przyjęte.');
if(realpath(dnpStorage($config))!==realpath($private.'/data'))throw new RuntimeException('Dane poza prywatnym katalogiem.');
if(is_file($public.'/api/config.php'))throw new RuntimeException('Sekret w public_html.');
echo "PASS: konfiguracja private, login/hasło, katalog danych i izolacja public_html.\n";
