"""Genera versiones del logo con fondo transparente.
- logo-dark.png : negro (para header sobre fondo claro)
- logo-light.png: blanco (para footer sobre fondo oscuro)
El logo original es negro sobre blanco, así que el alpha se deriva de la luminancia.
"""
from PIL import Image
import os

SRC = os.path.join("public", "img", "logo.png")
OUT_DIR = os.path.join("public", "img")

def make_variant(src_path, out_path, rgb):
    img = Image.open(src_path).convert("RGBA")
    # Luminancia (0=oscuro, 255=claro). Logo oscuro => alpha alto.
    lum = img.convert("L")
    # alpha = 255 - luminancia  (oscuro -> opaco, blanco -> transparente)
    alpha = lum.point(lambda v: 255 - v)
    # Color fijo para la variante
    color = Image.new("RGBA", img.size, rgb + (255,))
    color.putalpha(alpha)
    # Recortar el padding transparente con un pequeño margen
    bbox = alpha.getbbox()
    if bbox:
        pad = 8
        x0 = max(0, bbox[0] - pad)
        y0 = max(0, bbox[1] - pad)
        x1 = min(color.width, bbox[2] + pad)
        y1 = min(color.height, bbox[3] + pad)
        color = color.crop((x0, y0, x1, y1))
    color.save(out_path, "PNG", optimize=True)
    print(f"OK {out_path}  {color.width}x{color.height}  {os.path.getsize(out_path)} bytes")

make_variant(SRC, os.path.join(OUT_DIR, "logo-dark.png"), (17, 17, 17))    # #111
make_variant(SRC, os.path.join(OUT_DIR, "logo-light.png"), (255, 255, 255)) # #fff
