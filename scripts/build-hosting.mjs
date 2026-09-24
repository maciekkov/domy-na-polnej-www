import { randomBytes, createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const hosting = resolve(root, 'hosting')
const publicDir = resolve(hosting, 'public_html')
const privateDir = resolve(hosting, 'private', 'dnp')
const configFile = resolve(privateDir, 'config.php')
const accessFile = resolve(privateDir, 'DOSTEP-ANALITYKA.txt')
if (!existsSync(resolve(root, 'dist', 'api', 'analytics.php'))) throw new Error('Brak gotowego dist/ — najpierw npm run build.')
mkdirSync(privateDir, { recursive: true, mode: 0o700 })
mkdirSync(resolve(privateDir, 'data'), { recursive: true, mode: 0o700 })
if (!existsSync(configFile)) {
  if (existsSync(accessFile)) throw new Error('Plik dostępu już istnieje bez konfiguracji. Sprawdź private/dnp ręcznie.')
  const password = randomBytes(32).toString('base64url')
  const controlKey = randomBytes(32).toString('hex')
  let config = readFileSync(resolve(root, 'api', 'config.example.php'), 'utf8')
  config = config.replace('// \'storage_dir\' => \'/home/ACCOUNT/private/dnp\',', "'storage_dir' => __DIR__ . '/data',")
    .replace("'control_key' => 'UZUPELNIJ_LOSOWY_KLUCZ_MIN_32_ZNAKI',", "'control_key' => '" + controlKey + "',\n        'login' => 'analityka',\n        'password_sha256' => '" + createHash('sha256').update(password).digest('hex') + "',")
  if (!config.includes("'storage_dir' => __DIR__ . '/data'" ) || !config.includes("'password_sha256' => '")) throw new Error('Nie udało się przygotować konfiguracji PHP.')
  writeFileSync(configFile, config, { mode: 0o600, flag: 'wx' })
  writeFileSync(accessFile, `DOMY NA POLNEJ — dostęp do analityki\n\nAdres: https://domynapolnej.pl/administrator-control/\nLogin: analityka\nHasło: ${password}\n\nHasło służy do odczytu analityki i prywatnych operacji serwera. Zachowaj je w menedżerze haseł. Nie wgrywaj tego pliku ani config.php do public_html.\n`, { mode: 0o600, flag: 'wx' })
  console.log('Wygenerowano nowy login i hasło do analityki w hosting/private/dnp/DOSTEP-ANALITYKA.txt.')
} else {
  if (!existsSync(accessFile)) console.warn('Uwaga: zachowano istniejące config.php, ale nie znaleziono pliku dostępu. Nie generuję nowego hasła, aby nie zerwać dostępu.')
  console.log('Zachowano prywatną konfigurację i istniejące dane.')
}
chmodSync(privateDir, 0o700)
rmSync(publicDir, { recursive: true, force: true })
cpSync(resolve(root, 'dist'), publicDir, { recursive: true })
if (existsSync(resolve(publicDir, 'api', 'config.php'))) throw new Error('Prywatna konfiguracja trafiła do katalogu publicznego!')
writeFileSync(resolve(hosting, 'README-WDROZENIE.txt'), `Wgraj ZAWARTOŚĆ public_html/ do public_html domeny.\nWgraj ZAWARTOŚĆ private/ do private/ obok public_html/ (ta sama lokalizacja nadrzędna).\nPanel administratora: https://domynapolnej.pl/administrator/\nLogin i hasło: private/dnp/DOSTEP-ANALITYKA.txt\nZakładka Analityka odczytuje rzeczywiste dane serwera. Edycja w pozostałych zakładkach jest lokalnym szkicem i nie publikuje zmian na serwerze.\nSzczegółowa instrukcja w źródłach: WDROZENIE-HOSTING.md\nNie usuwaj katalogu private/dnp/data przy aktualizacji.\n`)
console.log('Paczka gotowa: hosting/public_html oraz hosting/private (i hosting/README-WDROZENIE.txt).')
