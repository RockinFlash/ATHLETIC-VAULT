# Conectar Athletic Vault a Supabase (datos globales)

Hoy el panel admin guarda los cambios en el **localStorage de tu navegador**:
lo que editas no se ve en el navegador de tus clientes. Con Supabase (gratis)
los cambios de **precios, stock, imágenes, productos y configuración** se vuelven
**globales**: los editas una vez y todos los visitantes lo ven.

> El sitio sigue funcionando **sin** Supabase (modo demo local). La nube solo se
> activa cuando pegas tus credenciales en `src/lib/supabase.js`.

## Pasos (≈5 min)

### 1. Crea el proyecto
1. Ve a [supabase.com](https://supabase.com) → **Start your project** (cuenta gratis).
2. Crea un proyecto: elige una contraseña de base de datos y una región cercana
   a México (ej. `us-east-1`).

### 2. Crea las tablas
1. En el dashboard → **SQL Editor** → **New query**.
2. Pega TODO el contenido de `supabase/schema.sql`.
3. **Run**. (Crea las tablas `store` y `reservations` con sus políticas RLS.)

### 3. Crea tu cuenta de admin
1. **Authentication** → **Users** → **Add user** → *Create new user*.
2. Pon un **correo** y una **contraseña** (ej. `admin@athleticvault.mx`).
3. Marca **Auto confirm user** para poder entrar de inmediato.
4. **Ese correo + contraseña es tu login del panel** (reemplaza a
   `admin` / `Vault2026!AV`).

### 4. Pega tus credenciales en el código
1. **Project Settings** → **API**.
2. Copia **Project URL** (ej. `https://abcdefgh.supabase.co`).
3. Copia la key **anon public** (NO la `service_role`).
4. Edita `src/lib/supabase.js`:
   ```js
   const SUPABASE_URL = "https://abcdefgh.supabase.co";
   const SUPABASE_ANON_KEY = "eyJ...";
   ```

### 5. Prueba
1. `npm run dev`.
2. Entra a `/admin/login` con tu **correo + contraseña** de Supabase.
3. Cambia un precio en **Productos** → guarda.
4. Abre el producto en **otra pestaña / incógnito** (o el sitio publicado) →
   el precio ya cambió. ✅

## Cómo funciona
- **Lectura** (sitio público + admin): con la key `anon` (pública).
- **Escritura de catálogo** (productos/settings): solo con tu sesión de admin
  (Supabase Auth). Nadie más puede cambiar precios.
- **Reservas**: los clientes las crean sin iniciar sesión; tú las ves en el panel.

## Seguridad (producción)
- La key `anon` es pública por diseño (va en el bundle). La protección real la da
  **RLS** (las políticas de `schema.sql`): el catálogo solo lo escribe un admin
  autenticado.
- **Nunca** pongas la key `service_role` en el frontend (esa sí lo controla todo).
- Para más control: restringe el dominio en Supabase (Auth → URL Configuration)
  y revisa las políticas si agregas más tablas.

## Notas
- Las **imágenes** se guardan como dataURL (base64) dentro de cada producto. Para
  muchas imágenes pesadas, lo ideal es subirlas a **Supabase Storage** y guardar
  la URL; por ahora el límite es 2 MB por imagen.
- Si algo falla al sincronizar, el sitio **no se rompe**: usa los datos locales y
  muestra una advertencia en la consola.
