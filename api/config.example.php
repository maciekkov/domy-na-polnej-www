<?php
return [
    // Odbiorca formularza i powiadomień. Gmail jest wyłącznie odbiorcą —
    // strona nie loguje się do Gmaila i nie potrzebuje hasła do tej skrzynki.
    'recipient' => 'mkdevelop2026@gmail.com',
    'from_email' => 'kontakt@domynapolnej.pl',
    'from_name' => 'Domy na Polnej — formularz WWW',

    // Domyślnie wiadomości przekazuje lokalny system pocztowy hostingu przez PHP mail().
    // Nie wymaga to hasła do Gmaila ani zewnętrznego SMTP.
    'mail' => [
        'transport' => 'php_mail',
        'recipient' => 'mkdevelop2026@gmail.com',
        'from_email' => 'kontakt@domynapolnej.pl',
        'from_name' => 'Domy na Polnej — formularz WWW',
    ],

    'security' => [
        'allowed_origins' => ['https://domynapolnej.pl', 'https://www.domynapolnej.pl'],
        // Empty by default: arbitrary X-Forwarded-For headers are NOT trusted.
        'trusted_proxy_ips' => [],
        // Recommended: private writable directory OUTSIDE public_html.
        // 'storage_dir' => '/home/ACCOUNT/private/dnp',
    ],

    // Prywatny klucz do odczytu zagregowanej analityki i sterowania Gov Sync.
    // Wygeneruj losowe >= 32 bajty i trzymaj WYŁĄCZNIE w config.php na serwerze.
    'admin' => [
        'control_key' => 'UZUPELNIJ_LOSOWY_KLUCZ_MIN_32_ZNAKI',
        // Przy npm run build login i hasło powstają automatycznie w katalogu private/.
        // Jeśli konfigurujesz ręcznie: hasło >= 32 losowe bajty, tu wpisz hash SHA-256 hasła.
        // 'login' => 'analityka',
        // 'password_sha256' => '64_ZNAKI_HEKS_SHA256',
    ],

    // Adapter Gov Sync nie jest skonfigurowany w tej paczce. Pozostaw mode=disabled do weryfikacji integracji.
    'gov_sync' => [
        'mode' => 'disabled',
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

    // Opcjonalny fallback SMTP. Nie jest potrzebny do standardowego działania formularza.
    // Jeżeli kiedyś zechcesz go użyć, ustaw mail.transport='smtp' lub 'auto'
    // i skonfiguruj dane serwera wyłącznie w prywatnym config.php.
    // 'smtp' => [
    //     'host' => 'smtp.hostinger.com',
    //     'port' => 465,
    //     'encryption' => 'ssl',
    //     'username' => 'kontakt@domynapolnej.pl',
    //     'password' => 'TYLKO_W_PRYWATNYM_CONFIG_PHP',
    // ],
];
