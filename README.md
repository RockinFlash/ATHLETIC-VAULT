# ⚡ Athletic Vault — Premium Activewear

Tienda-catalogo **estática** construida con **Astro** (usa Vite). Replica una
interfaz premium: top bar, header con navegación, hero, tiles de categorías,
productos destacados con siluetas de ropa, banners y footer. Cualquier persona abre
tu enlace y ve tallas, colores y precios, y puede **apartar una prenda por WhatsApp o
escribirte por Instagram**.

> Genera una página estática (`dist/`) que puedes servir gratis en **GitHub Pages**.

---

## ✅ Qué incluye

| Función | Detalle |
|---|---|
| Filtros por pestañas | Todos / Mujer / Hombre / Accesorios |
| Tiles de categoría | Mujer, Hombre, Accesorios, Ofertas |
| Buscador | Por nombre, categoría o marca |
| Ficha de producto | Colores, tallas, cantidad y total en vivo |
| Apartar prenda | Botón directo a **WhatsApp** con mensaje listo |
| Escribir por chat | Abre tu perfil de **Instagram** y copia el mensaje al DM |
| Mis apartados | Panel lateral con tus reservas guardadas (localStorage) |
| Responsive | Se ve bien en celular y computadora |

---

## 🚀 Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (solo la primera vez) |
| `npm run dev` | Servidor de desarrollo en `http://localhost:4321` (recarga en vivo) |
| `npm run build` | Genera el sitio estático en la carpeta `dist/` |
| `npm run preview` | Previsualiza el build localmente |

---

## 📁 Estructura

```
ATHLETIC-VAULT/
├─ astro.config.mjs        # Configuración (site, base para GitHub Pages)
├─ package.json
└─ src/
   ├─ layouts/Base.astro   # <html> base + CSS global + script
   ├─ pages/index.astro    # Página principal (compone todo)
   ├─ styles/global.css    # Todos los estilos
   ├─ data/products.js     # ⭐ CATÁLOGO + CONFIG (edítalo aquí)
   ├─ scripts/main.js      # Lógica: filtros, modal, apartado, reservas
   └─ components/
      ├─ TopBar.astro
      ├─ Header.astro
      ├─ Hero.astro
      ├─ CategoryTiles.astro
      ├─ FeaturedProducts.astro
      ├─ Banners.astro
      ├─ Footer.astro
      └─ ProductModal.astro
```

---

## ⚙️ PASO 1 — Pon tus datos reales (obligatorio)

Abre `src/data/products.js` y edita el objeto `CONFIG` al inicio:

```js
export const CONFIG = {
  whatsapp:  "5215500000000", // ← TU número con código de país, SOLO números
  instagram: "athleticvault", // ← TU usuario de Instagram SIN el @
  storeName: "Athletic Vault",// ← Nombre que aparece en los mensajes
};
```

- **whatsapp**: código de país + número, sin `+`, espacios ni guiones.
  México = `52` + `1` + número (ej. `5215512345678`).
- **instagram**: solo el nombre, sin `@`.

> Sin esto, los botones de "Apartar" no llegarán a ti.

---

## 🛍️ PASO 2 — Edita tu catálogo

En el mismo `src/data/products.js`, edita el arreglo `PRODUCTS`. Cada prenda:

```js
{
  brand: "Lululemon",        // 'Gymshark' | 'Lululemon'
  gender: "Mujer",           // 'Hombre' | 'Mujer'
  category: "Legging",       // tipo de prenda → determina la silueta dibujada
  name: "Align™ Leggings",
  price: 1799,               // precio en MXN (sin $ ni comas)
  sizes: ["XS","S","M","L"],
  colors: [{name:"Negro",hex:"#1a1a1a"},{name:"Cereza",hex:"#7f1d1d"}],
  badge: "Más vendido",      // opcional: etiqueta roja en la esquina
  desc: "Descripción corta." // opcional
}
```

Para **agregar** una prenda, copia un objeto `{ ... }`, pégalo dentro de `PRODUCTS`
y cambia sus valores. Para **eliminarla**, borra su línea completa.

### Categorías disponibles (determinan la silueta)
`Legging`, `Bra deportivo`, `Tank top`, `Camiseta`, `Short`, `Hoodie`, `Chaqueta`,
`Pantalón`, `Gorra`, `Bolsa`, `Botella`, `Conjunto`.

> Las categorías `Bolsa`, `Botella` y `Gorra` se agrupan automáticamente en la
> pestaña **Accesorios**.

---

## 🎨 PASO 3 (opcional) — Colores de la marca

En `src/styles/global.css`, variables en `:root`:

```css
--red:#e11d2e;   /* accent principal (botones, Ofertas, badges) */
--gym:#ef4444;   /* Gymshark */
--lu:#84cc16;    /* Lululemon */
```

---

## 🌐 PASO 4 — Publica gratis en GitHub Pages

1. `npm run build` → genera la carpeta `dist/`.
2. Sube el proyecto a un repositorio de GitHub.
3. Agrega el flujo de GitHub Actions (abajo) para que cada `push` a `main` publique
   el build automáticamente.

#### Flujo de GitHub Actions (automático)
Crea `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. En *Settings → Pages*, elige **Source: GitHub Actions**.
5. Tu enlace será `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

> 💡 Si tu sitio vive en un subdirectorio (ej. `https://usuario.github.io/athleticvault/`),
> agrega `base: '/athleticvault/'` en `astro.config.mjs`. Si usas el dominio raíz del
> usuario, déjalo vacío.

---

## 📱 Flujo para tu cliente

1. Entra a tu enlace → catálogo filtrado por pestañas (Todos / Mujer / Hombre /
   Accesorios) y tiles (Mujer, Hombre, Accesorios, Ofertas).
2. Toca una prenda → elige **color, talla y cantidad** (el total se calcula solo).
3. Pulsa **"Apartar por WhatsApp"** → abre WhatsApp con un mensaje ya escrito:
   ```
   Hola Athletic Vault 👋
   Quiero apartar esta prenda:
   • Producto: Align™ Leggings
   • Marca: Lululemon
   • Género: Mujer
   • Talla: XS
   • Color: Cereza
   • Cantidad: 2
   • Total: $3,598
   ¿Me confirmas disponibilidad?
   ```
4. La reserva queda guardada en **"Mis apartados"** (icono de bolsa, arriba a la
   derecha).

---

## 🖼️ Fotos reales (mejora sugerida)

Hoy cada prenda muestra una **silueta SVG** generada por código (funciona sin fotos
externas). Cuando tengas fotos reales:

1. Crea `public/img/` y pon ahí las fotos, ej. `align-leggings.jpg`.
2. En `src/data/products.js`, agrega a cada producto un campo
   `img: "/img/align-leggings.jpg"`.
3. En `FeaturedProducts.astro` y `ProductModal`, usa `p.img` en vez de la silueta.

---

Hecho con ❤️ para **Athletic Vault**.
