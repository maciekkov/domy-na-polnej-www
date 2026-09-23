# Runtime lokalny
React, React DOM client, scheduler i JSX runtime: 19.1.1, produkcyjna dystrybucja MIT dostępna w zainstalowanym Playwright. Zależności wyodrębniono poprzez domknięcie symboli (bez kodu aplikacji Playwright). API eksportu: React, ReactDOM, ReactDOMClient, jsxRuntime. Źródłowe paczki React pozostają w package-lock.json dla standardowej ścieżki Vite.

TypeScript: samodzielny kompilator JavaScript z lokalnej dystrybucji, Apache 2.0. Służy tylko do kompilacji, nie trafia do przeglądarki. `build:portable` transpiluje i pakuje kod; nie zastępuje pełnego `typecheck`.

Żadne pliki fontów nie są dołączone.
