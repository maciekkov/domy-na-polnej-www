<?php
return [
    // Publiczny adres biura / odbiorca leadów.
    'recipient' => 'mkdevelop2026@gmail.com',

    // Skrzynka używana przez SMTP. Jeżeli na hostingu masz osobną skrzynkę www@,
    // podmień oba pola poniżej zgodnie z konfiguracją serwera pocztowego.
    'from_email' => 'mkdevelop2026@gmail.com',
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
        // Przy npm run build:hosting login i hasło powstają automatycznie w katalogu private/.
        // Jeśli konfigurujesz ręcznie: hasło >= 32 losowe bajty, tu wpisz hash SHA-256 hasła.
        // 'login' => 'analityka',
        // 'password_sha256' => '64_ZNAKI_HEKS_SHA256',
    ],
    // Adapter Gov Sync nie jest skonfigurowany w tej paczce. Pozostaw mode=disabled do weryfikacji integracji.
    // Wpisz zweryfikowany endpoint, schemat i dane dostępowe wyłącznie na serwerze; następnie przetestuj transmisję.
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
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'encryption' => 'tls',
        'username' => 'mkdevelop2026@gmail.com',
        // Ustaw DNP_SMTP_APP_PASSWORD na serwerze albo wpisz hasło aplikacji Google
        // WYŁĄCZNIE do prywatnego config.php (nigdy do paczki public_html).
        'password' => getenv('DNP_SMTP_APP_PASSWORD') ?: '',
    ],
];
