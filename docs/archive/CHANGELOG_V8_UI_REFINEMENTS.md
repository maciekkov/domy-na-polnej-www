# V8 targeted UI refinements

Only the requested areas were changed:

1. House selector placeholder
   - removed the instructional block with A–E / SVG / TABELA before a house is selected.

2. Layout / room panel
   - desktop right room card keeps the same top alignment with the plan image,
   - it now stretches to the same bottom edge as the left plan container,
   - the one-row room carousel is vertically centered in the remaining free space.

3. Standard section
   - the "Wyższy standard lepszego życia" bar was moved below the image,
   - the standard artwork is shown at its native 4:3 proportion with `object-fit: contain`, so the embedded labels/tables are not cropped.

4. Masterplan
   - based on v7.1 no-outline CSS: SVG parcel strokes remain fully transparent by default and on hover/selection; fill/glow remains visible.
- Hero: drugie zdjęcie karuzeli podmienione na nowy fotorealistyczny render frontu (`hero-front-photoreal.webp`); pierwsze zdjęcie całej inwestycji i dalsza kolejność slajdów pozostają bez zmian.

