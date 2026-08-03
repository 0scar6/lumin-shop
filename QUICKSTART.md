# SETUP EN 5 MINUTOS

> **Descargas el repo -> Ejecutas 1 SQL -> Conectas Supabase -> Listo.**

---

## Paso 1: Crear Proyecto Supabase

1. Ve a https://supabase.com/dashboard
2. **New Project** > ponle nombre (ej: `lumin-shop`)
3. Elige region mas cercana
4. Espera ~2 minutos

---

## Paso 2: Ejecutar 1 Solo SQL

1. Dentro de tu proyecto, ve a **SQL Editor**
2. Click **New Query**
3. Abre el archivo `SUPABASE-ALL-IN-ONE.sql` de este repo
4. Copia **TODO** el contenido
5. Pegalo en el SQL Editor
6. Click **RUN**

**Eso es todo.** Crea 9 tablas, 8 productos, 100+ config keys, y RLS abierto.

---

## Paso 3: Crear Storage Bucket

1. Ve a **Storage** en el dashboard
2. **New Bucket**
3. Nombre: `media`
4. **Public**: ON (toggle)
5. **Create Bucket**

---

## Paso 4: Variables de Entorno

Crea archivo `.env` en la raiz del proyecto:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Donde encontrarlos:**
- **URL**: Settings > API > Project URL
- **Key**: Settings > API > `anon` `public`

---

## Paso 5: Correr

```bash
npm install
npm run dev
```

Abre http://localhost:5173 y ya funciona.

---

## Panel de Admin

- Click 5 veces en el logo, o ve a "Mi Cuenta"
- Contrasena: `Ratitaxd12`
- Desde ahi editas textos, productos, imagenes, etc.

---

## Deploy a Vercel

```bash
npx vercel --prod
```

O conecta tu repo de GitHub a Vercel para deploy automatico.

---

## Resumen

| Paso | Que haces | Tiempo |
|------|-----------|--------|
| 1 | Crear proyecto Supabase | 1 min |
| 2 | Ejecutar `SUPABASE-ALL-IN-ONE.sql` | 30 seg |
| 3 | Crear bucket `media` | 15 seg |
| 4 | Poner `.env` | 15 seg |
| 5 | `npm install && npm run dev` | 1 min |

**Total: ~3 minutos.**

---

## Archivos SQL del Repo

| Archivo | Cuándo usar |
|---------|-------------|
| **`SUPABASE-ALL-IN-ONE.sql`** | **Primera vez** — ejecuta esto y nada mas |
| `supabase-rls-secure.sql` | Si quieres activar auth/roles |
| `supabase-restore-access.sql` | Si se rompe el acceso |

---

## Personalizar

Una vez funcionando, desde el **Admin Panel** puedes cambiar:

- Nombre de la marca, telefono, ubicacion
- Textos del hero, footer, navegacion
- Productos (agregar, editar, eliminar)
- Imagenes (upload directo a Supabase)
- Precios de envio por zona
- Y todo lo demas via `cfg()` keys
