# CLEANUP REPORT — Domy na Polnej WWW

Audit: 2026-09-28  
Source version: `5.2.0-rc.23`

## Wynik

- Source package: **319.30 MiB → 48.82 MiB** (**-84.7%**).
- Files: **1043 → 391**.
- Public assets after cleanup: **47.56 MiB**.
- Asset inventory: **150 references, 0 missing, 0 unused**.
- Removed production assets: **95 unused files**.
- Removed generated/history material: QA screenshots, historical audit/reference folders, stale docs, duplicate/reference assets.
- Removed obsolete source: six `*Refinement.css`, old per-house entrypoint/helpers, unused mobile contact component, unused contact snapshot module.
- Removed redundant `vendor/` + broken `build:portable`; one canonical build remains: `npm ci` → `npm run build`.

## Bezstratna optymalizacja aktywnych grafik

Three active RGBA PNG files were converted to lossless WebP. ImageMagick pixel comparison (`AE`) returned **0** for all three:

- `standard-illustrations.png` → `standard-illustrations.webp`
- `olive-branch.png` → `olive-branch.webp`
- `pin-premium.png` → `pin-premium.webp`

## Verification

- `tests/source-check.mjs`: **PASS**, 148 conditions.
- Core logic/audit tests: **87/87 PASS**.
- Analytics runtime: **13/13 PASS**.
- Tour data/integration: **1136 checks PASS**; 29 interior + 14 exterior scenes reachable.
- Syntax check: **PASS** for 59 TS/TSX and 17 JS/MJS files.
- Full Vite build after the final cleanup was **not run in this sandbox**, because the uploaded source contains no `node_modules`, Vite is not installed globally, and network package installation is unavailable here. Before deployment run locally:

```sh
npm ci
npm test
npm run build
npm run test:dist
```

## Biggest remaining file

`public/documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf` is ~25.83 MiB. It is an active 15-page image-based technical document. Lossless PDF stream optimization reduced it by only about 4 KiB, therefore the original was intentionally retained. Meaningful further reduction would require lossy image recompression/downsampling and should be treated as a separate document-quality decision.

## GitHub

The uploaded package matches the code line `5.2.0-rc.23`. On GitHub, branch `update5` is also `5.2.0-rc.23`; `main` remains older (`5.2.0-rc.16`). Do **not** overwrite `main` from its current state and then try to reapply rc.23 changes. Use `update5` (or a cleanup branch created from it) as the base, run the checks above, then merge deliberately.

Full machine-readable removal manifest: `CLEANUP_REPORT.json`.
