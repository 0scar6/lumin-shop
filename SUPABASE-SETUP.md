# SUPABASE-SETUP.md — Guia Completa de Configuracion

> **Objetivo:** Descargar el repo, crear un proyecto Supabase, ejecutar SQLs en orden, y tener la tienda funcionando en minutos.

---

## Requisitos Previos

- [Node.js 18+](https://nodejs.org)
- Cuenta gratis en [supabase.com](https://supabase.com)
- Git

---

## Paso 1: Crear Proyecto Supabase

1. Ve a https://supabase.com/dashboard
2. Click **"New Project"**
3. Elige nombre (ej: `lumin-shop`)
4. Pon una password para la DB (guardala)
5. Region: **South America (Santiago)** o la mas cercana
6. Click **"Create new project"**
7. Espera ~2 minutos a que este listo

---

## Paso 2: Obtener Credenciales

Una vez dentro del proyecto:

1. Ve a **Settings > API** (icono de engranaje)
2. Copia estos valores:

| Campo | Ubicacion | Ejemplo |
|-------|-----------|---------|
| **Project URL** | Settings > API > Project URL | `https://abcdef.supabase.co` |
| **Anon Key** | Settings > API > `anon` `public` | `eyJhbGci...` (JWT largo) |

---

## Paso 3: Configurar Variables de Entorno

En la raiz del proyecto, crea el archivo `.env`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Reemplaza con tus valores reales.

---

## Paso 4: Ejecutar SQLs en Orden

Ve a **SQL Editor** dentro de Supabase y ejecuta cada script **EN ESTE ORDEN**:

### 4.1 — Schema Base (Tablas + Datos Iniciales)

> **Archivo:** `supabase-schema.sql`
> **Que hace:** Crea las 8 tablas, inserta 3 categorias y 8 productos de ejemplo, habilita RLS con politicas abiertas.

Copia TODO el contenido del archivo y pegalo en SQL Editor. Click **RUN**.

**Tablas creadas:**
| Tabla | Descripcion |
|-------|-------------|
| `categorias` | Categorias de productos |
| `productos` | Catalogo de productos |
| `usuarios` | Usuarios que se loguean |
| `perfiles` | Perfiles extendidos |
| `favoritos` | Productos favoritos |
| `carrito` | Carrito persistido |
| `pedidos` | Pedidos WhatsApp |
| `ideas_personalizadas` | Ideas personalizadas |

### 4.2 — Tabla Configuracion (Textos Editables)

> **Archivo:** `supabase-configuracion.sql`
> **Que hace:** Crea la tabla `configuracion` e inserta todos los textos por defecto del sitio.

Copia TODO y pegalo en SQL Editor. Click **RUN**.

**Resultado:** ~76 claves de configuracion listas para editar desde el admin.

### 4.3 — Todas las Config Keys (Upsert Seguro)

> **Archivo:** `supabase-all-config-keys.sql`
> **Que hace:** Inserta/actualiza TODAS las claves de configuracion (incluye las que faltaban). Safe to re-run.

Copia TODO y pegalo. Click **RUN**.

**Incluye:** admin_password, hero, brand, social, badges, sections, navigation, catalog, favorites, cart, profile, shipping, footer, whatsapp.

### 4.4 — Correcciones de Keys

> **Archivo:** `supabase-fix-config-keys.sql`
> **Que hace:** Agrega keys que faltaban (hero media, footer columns, profile concepts con nombres correctos).

Copia TODO y pegalo. Click **RUN**.

### 4.5 — Correccion de Tipos (si vienes de otra DB)

> **Archivo:** `supabase-fix-types.sql`
> **Que hace:** Convierte UUID a TEXT, elimina foreign keys, recrea politicas permisivas.

**Solo ejecutar si:**
- Migraste de otra base de datos
- Tienes errores de tipo UUID vs TEXT
- Los IDs de productos no matchean

### 4.6 — (OPCIONAL) RLS Seguro con Auth

> **Archivo:** `supabase-rls-secure.sql`
> **Que hace:** Cierra el acceso publico, requiere Supabase Auth, agrega columna `rol` a usuarios.

**Solo ejecutar si:**
- Ya configuraste Supabase Auth (Google Login)
- Quieres que solo el admin pueda editar productos
- Quieres que cada usuario solo vea sus propios datos

### 4.7 — (EMERGENCIA) Restaurar Acceso

> **Archivo:** `supabase-restore-access.sql`
> **Que hace:** Revierte todas las politicas a modo abierto (public read/write).

**Ejecutar si:**
- La app dejó de funcionar despues de activar RLS seguro
- No puedes ver productos ni configuracion
- Necesitas recuperar acceso rapido

---

## Paso 5: Crear Storage Bucket

1. Ve a **Storage** en el dashboard de Supabase
2. Click **"New Bucket"**
3. Nombre: `media`
4. **Public**: activado (toggle ON)
5. Click **"Create Bucket"**

**Esto permite:** subir imagenes de hero, productos y pedidos.

---

## Paso 6: Columnas Adicionales

Ejecuta estas queries si no existen:

```sql
-- Para pedidos (zonas de envio)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS zona_envio text DEFAULT 'huamanga';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS costo_envio numeric DEFAULT 0;

-- Para usuarios (rol de admin)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'user';
```

---

## Paso 7: Instalar y Correr

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

---

## Paso 8: Panel de Admin

1. Abre la tienda
2. Navega a **Mi Cuenta** (o haz click 5 veces en el logo)
3. Ingresa la contrasena: `Ratitaxd12`
4. Ya puedes editar textos, productos, imagenes, etc.

---

## Zonas de Envio

| Zona | Precio Default | Config Key |
|------|---------------|------------|
| Ayacucho / Huamanga | Gratis | `shipping_price_huamanga` |
| Provincia | S/ 25 | `shipping_price_provincia` |
| Internacional | S/ 80 | `shipping_price_internacional` |
| Recojo en tienda | Gratis | (no editable) |

Para cambiar precios, edita las claves en el admin o en Supabase SQL Editor.

---

## Estructura de la DB

```
categorias
├── id (TEXT PK)
├── nombre
├── icono
├── activo (BOOLEAN)
├── orden (INTEGER)
└── created_at

productos
├── id (TEXT PK)
├── nombre
├── categoria_id (FK -> categorias)
├── precio (DECIMAL)
├── precio_original (DECIMAL)
├── tecnica
├── tiempo_produccion
├── imagen (TEXT - URL)
├── galeria (JSONB - array URLs)
├── descripcion
├── etiqueta
├── opciones_ropa (JSONB)
├── opciones_vaso (JSONB)
├── personalizable (BOOLEAN)
├── destacado (BOOLEAN)
├── activo (BOOLEAN)
└── created_at

usuarios
├── id (TEXT PK - Google sub)
├── email (UNIQUE)
├── nombre
├── avatar_url
├── rol (TEXT - 'user' | 'admin')
├── ultimo_login
└── created_at

perfiles
├── id (TEXT PK)
├── usuario_id (UNIQUE)
├── tema (TEXT)
├── nombre_completo
├── telefono
├── direccion
├── dni
└── updated_at

favoritos
├── id (TEXT PK)
├── usuario_id
├── producto_id
├── UNIQUE(usuario_id, producto_id)
└── created_at

carrito
├── id (TEXT PK)
├── usuario_id (UNIQUE)
├── cliente_nombre
├── cliente_telefono
├── cliente_direccion
├── cliente_dni
├── productos (JSONB)
├── total (DECIMAL)
├── metodo_envio
└── updated_at

pedidos
├── id (TEXT PK)
├── usuario_id
├── cliente_nombre
├── cliente_telefono
├── cliente_direccion
├── cliente_dni
├── productos (JSONB)
├── total (DECIMAL)
├── estado (TEXT - 'pendiente'|'produccion'|'enviado'|'entregado')
├── guia_envio
├── metodo_envio
├── zona_envio (TEXT)
├── costo_envio (DECIMAL)
├── created_at
└── updated_at

ideas_personalizadas
├── id (TEXT PK)
├── usuario_id
├── tipo_producto
├── descripcion
├── email
└── created_at

configuracion
├── id (TEXT PK - la clave)
├── seccion
├── clave
├── valor (TEXT)
├── UNIQUE(seccion, clave)
└── created_at
```

---

## Resumen de Archivos SQL

| Archivo | Cuándo ejecutar | Descripcion |
|---------|----------------|-------------|
| `supabase-schema.sql` | **Primera vez** | Tablas + categorias + productos + RLS abierto |
| `supabase-configuracion.sql` | **Primera vez** | Tabla configuracion + textos default |
| `supabase-all-config-keys.sql` | **Primera vez** | Todas las keys (safe to re-run) |
| `supabase-fix-config-keys.sql` | **Primera vez** | Keys que faltaban |
| `supabase-fix-types.sql` | Solo si migras | Convierte UUID a TEXT |
| `supabase-rls-secure.sql` | Cuando quieras auth | RLS seguro + admin role |
| `supabase-restore-access.sql` | Emergencia | Restaura acceso abierto |

---

## Orden Minimo para Empezar

```
1. Crear proyecto Supabase
2. Copiar URL + Anon Key -> .env
3. supabase-schema.sql          -> RUN
4. supabase-configuracion.sql   -> RUN
5. supabase-all-config-keys.sql -> RUN
6. supabase-fix-config-keys.sql -> RUN
7. Crear bucket "media" (public)
8. ALTER TABLE pedidos ADD COLUMN zona_envio/costo_envio
9. npm install && npm run dev
```

**Total: ~5 minutos de setup.**
