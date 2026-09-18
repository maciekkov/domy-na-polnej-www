<?php
return [
    // Publiczny adres biura / odbiorca leadów.
    'recipient' => 'biuro@domynapolnej.pl',

    // Skrzynka używana przez SMTP. Jeżeli na hostingu masz osobną skrzynkę www@,
    // podmień oba pola poniżej zgodnie z konfiguracją serwera pocztowego.
    'from_email' => 'biuro@domynapolnej.pl',
    'from_name' => 'Domy na Polnej — formularz WWW',
    'security' => [
        'allowed_origins' => ['https://domynapolnej.pl', 'https://www.domynapolnej.pl'],
        // Empty by default: arbitrary X-Forwarded-For headers are NOT trusted.
        'trusted_proxy_ips' => [],
        // Recommended: private writable directory OUTSIDE public_html.
        // 'storage_dir' => '/home/ACCOUNT/private/dnp',
    ],

    // Prywatny klucz do odczytu zagregowanej analityki i sterowania Gov Sync.
    // Wygeneruj losowe >= 32 bajty i trzymaj WYŁĄCZNIE w api/config.php na serwerze.
    'admin' => [
        'control_key' => 'UZUPELNIJ_LOSOWY_KLUCZ_MIN_32_ZNAKI',
    ],
    // Adapter Gov Sync. Do czasu opublikowania oficjalnego endpointu/struktury pozostaw mode=disabled.
    // Po otrzymaniu oficjalnych danych wpisz endpoint/credentiale; wtedy przycisk "Włącz publikację" zacznie działać.
    'gov_sync' => [
        'mode' => 'disabled', // 'http' po oficjalnej konfiguracji
        'endpoint' => '',
        'bearer_token' => '',
        'official_schema_id' => '',
        'headers' => [],
        'developer' => [
            'name' => 'X-SMART DEVELOP sp. z o.o.',
            'nip' => '8943230686',
            'regon' => '527945971',
            'krs' => '0001091198',
        ],
        'investment' => [
            'name' => 'Domy na Polnej',
            'location' => 'Grabik, gmina Żary',
        ],
    ],
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'port' => 587,
        'encryption' => 'tls',
        'username' => 'biuro@domynapolnej.pl',
        'password' => 'UZUPELNIJ_WYŁĄCZNIE_NA_SERWERZE',
    ],
];
