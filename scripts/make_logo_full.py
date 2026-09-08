"""Genera el logo completo de ATHLETIC VAULT.

Composición horizontal:  [ AV isotipo ]  ATHLETIC VAULT
- Isotipo AV geométrico a la izquierda (negro/charcoal)
- Wordmark "ATHLETIC VAULT" en UNA SOLA LÍNEA, Montserrat Black 900,
  mayúsculas, mismo tamaño/peso en ambas palabras, negro/charcoal
- Fondo blanco limpio, sin tagline, sin texto extra, sin rojo

Salidas (en public/img/):
- logo-full.png       : negro sobre blanco (principal)
- logo-full-dark.png  : negro, fondo transparente (header sobre claro)
- logo-full-light.png : blanco, fondo transparente (footer sobre oscuro)
"""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(BASE, "fonts", "Montserrat-Black.ttf")
OUT_DIR = os.path.normpath(os.path.join(BASE, "..", "public", "img"))
os.makedirs(OUT_DIR, exist_ok=True)

INK = (10, 10, 10)   # #0a0a0a charcoal
BG = (255, 255, 255)  # blanco

# --- Isotipo AV (polígonos derivados de los paths SVG, viewBox 0 0 146 100) ---
# Path A (fill-rule evenodd): contorno exterior + hueco triangular
A_OUTER = [(55, 10), (92, 90), (74, 90), (66, 70), (44, 70), (36, 90), (18, 90)]
A_HOLE = [(55, 30), (64, 58), (46, 58)]
# Path V
V_POLY = [(78, 10), (96, 10), (112, 60), (128, 10), (146, 10), (118, 90), (106, 90)]
VB_W, VB_H = 146, 100


def draw_isotipo(d, scale, ox, oy, ink, bg):
    """Dibuja el isotipo AV escalado. (ox,oy) = origen del viewBox."""
    def T(pts):
        return [(ox + x * scale, oy + y * scale) for x, y in pts]
    d.polygon(T(A_OUTER), fill=ink)
    d.polygon(T(A_HOLE), fill=bg)  # hueco (color de fondo)
    d.polygon(T(V_POLY), fill=ink)


# --- Parámetros de composición ---
SS = 8                      # supersampling para antialiasing
iso_h = int(240 * SS)       # altura del isotipo (px de trabajo)
scale = iso_h / VB_H        # escala del viewBox
iso_w = int(VB_W * scale)   # ancho del isotipo

# Altura cap de Montserrat Black ≈ 0.70 * size.
# Alineamos la altura cap del texto con la altura visual del isotipo
# (el trazo del isotipo ocupa de y=10 a y=90 => 80/100 de iso_h).
cap_target = iso_h * 0.80
font_size = int(cap_target / 0.70)
font = ImageFont.truetype(FONT, font_size)

text = "ATHLETIC VAULT"
tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
tb = tmp.textbbox((0, 0), text, font=font)
text_w = tb[2] - tb[0]
text_h = tb[3] - tb[1]

gap = int(iso_h * 0.30)     # espacio entre isotipo y texto
pad = int(iso_h * 0.32)     # padding exterior

canvas_w = pad + iso_w + gap + text_w + pad
canvas_h = pad + iso_h + pad

img = Image.new("RGB", (canvas_w, canvas_h), BG)
d = ImageDraw.Draw(img)

# Isotipo: alineado a la parte superior del área de contenido
iso_ox = pad
iso_oy = pad
draw_isotipo(d, scale, iso_ox, iso_oy, INK, BG)

# Texto: centrado verticalmente respecto al isotipo
text_x = pad + iso_w + gap
text_y = (canvas_h - text_h) / 2 - tb[1]
d.text((text_x, text_y), text, font=font, fill=INK)

# Reducir con LANCZOS => antialiasing suave
final_w, final_h = canvas_w // SS, canvas_h // SS
img = img.resize((final_w, final_h), Image.LANCZOS)

# --- Salidas ---
out_main = os.path.join(OUT_DIR, "logo-full.png")
img.save(out_main, "PNG", optimize=True)
print(f"OK {out_main}  {img.width}x{img.height}  {os.path.getsize(out_main)} bytes")


def make_variant(rgb, out_path):
    """Deriva alpha de la luminancia (oscuro => opaco) y recolorea."""
    rgba = img.convert("RGBA")
    lum = rgba.convert("L")
    alpha = lum.point(lambda v: 255 - v)
    color = Image.new("RGBA", img.size, rgb + (255,))
    color.putalpha(alpha)
    bbox = alpha.getbbox()
    if bbox:
        m = 6
        x0, y0 = max(0, bbox[0] - m), max(0, bbox[1] - m)
        x1, y1 = min(color.width, bbox[2] + m), min(color.height, bbox[3] + m)
        color = color.crop((x0, y0, x1, y1))
    color.save(out_path, "PNG", optimize=True)
    print(f"OK {out_path}  {color.width}x{color.height}  {os.path.getsize(out_path)} bytes")


make_variant((10, 10, 10), os.path.join(OUT_DIR, "logo-full-dark.png"))
make_variant((255, 255, 255), os.path.join(OUT_DIR, "logo-full-light.png"))
