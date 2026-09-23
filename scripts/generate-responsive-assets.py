"""Rebuild responsive images from the supplied v4 originals. Requires Pillow.
No generative change to the architecture, scene contents or parcel geometry."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
images=ROOT/'public/assets/images';out=images/'responsive';out.mkdir(exist_ok=True)
source=[ROOT/'reference-assets/public/assets/images/hero-all-houses.webp',images/'hero-front-photoreal.webp',images/'spacer-360/exterior/webp/04_podcien_wejsciowy.webp',images/'spacer-360/exterior/webp/08_elewacja_ogrodowa.webp']
for i,f in enumerate(source):
 for w in (640,1024,1672):
  im=Image.open(f);im.thumbnail((w,2000),Image.Resampling.LANCZOS);im.save(out/f'hero-{i}-{w}.webp',quality=86,method=6)
im=Image.open(source[0]);im.crop((600,0,1250,941)).resize((650,941),Image.Resampling.LANCZOS).save(out/'hero-mobile.webp',quality=87,method=6)
im=Image.open(images/'neighborhood/panorama-360-grabik.webp');im.thumbnail((1000,1000),Image.Resampling.LANCZOS);im.save(out/'panorama-preview.webp',quality=85,method=6)
for w in (640,1024):
 im=Image.open(images/'dnp-masterplan.webp');im.thumbnail((w,2000),Image.Resampling.LANCZOS);im.save(out/f'masterplan-{w}.webp',quality=86,method=6)
print('Responsive images rebuilt; original inputs retained.')
