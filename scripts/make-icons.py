"""Zeichnet die App-Icons in public/ neu.

Aufruf:  python scripts/make-icons.py   (braucht Pillow)

Warum ein Skript und keine fertigen Dateien im Repo? Damit die Icons
reproduzierbar sind, wenn sich das Motiv aendert. Warum Pillow statt ein SVG zu
rastern? Damit der normale Build (npm run build) an keiner zusaetzlichen
Abhaengigkeit haengt - die PNGs liegen fertig in public/ und werden nur bei
Bedarf neu erzeugt.

iOS akzeptiert fuer apple-touch-icon KEIN SVG, deshalb brauchen wir echte
Bitmaps. Intern wird gross gezeichnet und heruntergerechnet, das gibt saubere
Kanten ohne Antialiasing-Gefrickel.
"""
from PIL import Image, ImageDraw, ImageFilter

S = 1024
k = S / 512.0
KONTUR = (18, 22, 30, 255)


def p(pts):
    return [(x * k, y * k) for x, y in pts]


def polygon_mit_kontur(d, pts, fill, breite):
    """Pillow zeichnet Polygon-Konturen nur haarduenn. Fuer eine kraeftige,
    gleichmaessige Kontur malen wir die Kanten zusaetzlich als dicke Linie."""
    d.polygon(pts, fill=fill)
    d.line(pts + [pts[0]], fill=KONTUR, width=breite, joint='curve')


def zeichne(groesse):
    img = Image.new('RGBA', (S, S), (16, 19, 24, 255))

    # Warmer Lichtkegel hinter der Axt - eng gehalten, sonst wird das Icon matschig
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([S * 0.16, S * 0.10, S * 0.84, S * 0.72], fill=(255, 150, 20, 130))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.09))
    img = Image.alpha_composite(img, glow)

    d = ImageDraw.Draw(img)
    kb = int(14 * k)

    # Stiel
    d.rounded_rectangle([236 * k, 220 * k, 276 * k, 462 * k], radius=20 * k,
                        fill=(158, 106, 58, 255), outline=KONTUR, width=kb)
    for y in (300, 336, 372):
        d.rounded_rectangle([242 * k, y * k, 270 * k, (y + 15) * k], radius=6 * k,
                            fill=(70, 42, 18, 255))

    # Blatt rechts
    polygon_mit_kontur(d, p([(258, 104), (332, 114), (386, 152), (410, 196),
                             (386, 240), (332, 278), (258, 288)]),
                       (224, 232, 240, 255), kb)
    # Hammer-Sporn links
    polygon_mit_kontur(d, p([(254, 128), (154, 150), (154, 242), (254, 264)]),
                       (176, 187, 198, 255), kb)

    # Schneide-Glanz
    d.line(p([(306, 146), (364, 166), (388, 196), (364, 226), (306, 246)]),
           fill=(255, 255, 255, 205), width=int(11 * k), joint='curve')

    return img.resize((groesse, groesse), Image.LANCZOS)


if __name__ == '__main__':
    for g in (180, 192, 512):
        zeichne(g).save(f'public/icon-{g}.png')
        print(f'public/icon-{g}.png')

    # Maskierbar fuer Android: Motiv kleiner, damit das System beschneiden darf
    basis = zeichne(512)
    mask = Image.new('RGBA', (512, 512), (16, 19, 24, 255))
    klein = basis.resize((330, 330), Image.LANCZOS)
    mask.paste(klein, (91, 91), klein)
    mask.save('public/icon-maskable-512.png')
    print('public/icon-maskable-512.png')
