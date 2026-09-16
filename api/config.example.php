<?php
return [
    // Publiczny adres biura / odbiorca leadów.
    'recipient' => 'biuro@domynapolnej.pl',

    // Skrzynka używana przez SMTP. Jeżeli na hostingu masz osobną skrzynkę www@,
    // podmień oba pola poniżej zgodnie z konfiguracją serwera pocztowego.
    'from_email' => 'biuro@domynapolnej.pl',
    'from_name' => 'Domy na Polnej — formularz WWW',
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'port' => 587,
        'encryption' => 'tls',
        'username' => 'biuro@domynapolnej.pl',
        'password' => 'UZUPELNIJ_WYŁĄCZNIE_NA_SERWERZE',
    ],
];
