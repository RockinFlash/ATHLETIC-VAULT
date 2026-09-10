"""Encuadra (recorta el padding) un logo PNG usando el color de fondo de la esquina.

Uso: python scripts/crop_logo.py <entrada.png> <salida.png> [padding_px]
- Detecta el bounding box de los píxeles que difieren del fondo.
- Añade un padding uniforme alrededor del contenido.
- No altera el logo, solo quita el espacio en blanco sobrante.
"""
import sys
from PIL import Image, ImageChops


def crop_logo(src: str, dst: str, padding: int = 24) -> None:
    img = Image.open(src).convert("RGBA")
    w, h = img.size

    # Fondo = color de la esquina superior izquierda.
    bg = Image.new("RGBA", img.size, img.getpixel((0, 0)))
    diff = ImageChops.difference(img, bg)  # RGBA (incluye canal alfa)

    # Puntuación = máximo de la diferencia en CADA canal (R, G, B y A).
    # Usar el máx (no la luminancia) para detectar logos sobre fondo transparente.
    r, g, b, a = diff.split()
    score = ImageChops.lighter(ImageChops.lighter(ImageChops.lighter(r, g), b), a)

    # Umbral: píxeles que difieren del fondo por más de 24 (0-255) = contenido.
    mask = score.point(lambda p: 255 if p > 24 else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise SystemExit(f"Sin contenido detectado en {src}")

    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(w, right + padding)
    bottom = min(h, bottom + padding)

    cropped = img.crop((left, top, right, bottom))
    cropped.save(dst)
    print(f"{src} {w}x{h} -> {dst} {cropped.size[0]}x{cropped.size[1]}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit("Uso: crop_logo.py <entrada> <salida> [padding]")
    pad = int(sys.argv[3]) if len(sys.argv) > 3 else 24
    crop_logo(sys.argv[1], sys.argv[2], pad)
