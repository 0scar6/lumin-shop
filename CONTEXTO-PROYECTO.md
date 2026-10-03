# CONTEXTO DEL PROYECTO — LUMIN SHOP
> Documento para pasar a una IA (ChatGPT, etc.) antes de pedirle cambios o una nueva interfaz.
> Leé completo: describe CÓMO está construido, qué reglas NO se deben romper y cómo se conecta todo.

---

## 1. Qué es

**LUMIN SHOP** — tienda online de productos personalizados por sublimación (polos, vasos, tazas, placas) de Ayacucho, Perú. Checkout por WhatsApp + Yape/Plin.

- **Web en vivo:** https://lumin-shop-nine.vercel.app
- **Repo:** https://github.com/0scar6/lumin-shop (rama `master`)
- **Carpeta local:** `C:\Users\ASUS\Documents\Default Project\lúmin-shop` (Windows)
- **Idioma de la UI y del dueño:** español

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 (`npm run build` → carpeta `dist/`) |
| Estilos | Tailwind CSS **v4** (sin tailwind.config; vía plugin `@tailwindcss/vite`; arbitrary values como `text-[var(--accent)]`) |
| Backend/BDD | Supabase (PostgreSQL + Storage), cliente `@supabase/supabase-js` v2 |
| Deploy | Vercel (auto-deploy en cada push a `master`) |
| Iconos | lucide-react |
| Seguridad front | DOMPurify (todo HTML inyectado pasa por `sanitize()`) |

### Comandos
```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo en puerto 3000
npm run build     # build de producción → dist/
npm run preview   # sirve dist/ localmente en puerto 4173
npm run lint      # chequeo TypeScript (tiene errores PREEXISTENTES, ver §10)
```

---

## 3. Ciclo de trabajo: Git → GitHub → Vercel

1. Los cambios se editan en la carpeta local.
2. Se verifica con `npm run build` (debe decir `✓ built in ...`).
3. Se commitea y pushea:
   ```bash
   git add src/ index.html
   git commit -m "feat: descripción"
   git push   # rama master
   ```
4. **Vercel detecta el push y despliega automáticamente** (~1-2 min). No hay `vercel.json`; usa los defaults de Vite (build `npm run build`, output `dist`).
5. Variables de entorno en Vercel: **Project → Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

⚠️ **Nunca** subir `.env` al repo. Nunca poner la clave `service_role` en el frontend.

---

## 4. Cómo se usa OpenCode (importante para entender quién hace qué)

- **OpenCode** es la herramienta con la que trabaja el dueño: un agente de IA (yo) con acceso directo a la carpeta, shell (PowerShell) y un navegador para probar la web.
- Flujo habitual de OpenCode: editar archivos → `npm run build` para verificar → `git commit/push` → probar visualmente con `npm run preview` + capturas de pantalla.
- **ChatGPT (web) NO puede tocar archivos ni desplegar.** El flujo con ChatGPT es: ChatGPT genera código/HTML → el dueño lo guarda en la carpeta (ej. `LUMIN-propuesta.html`) → OpenCode lo revisa, integra o compara.
- PowerShell no soporta `&&` (usar `;` o comandos separados).
- Los colores/tema del admin y la web se han ido construyendo incrementalmente; respetar estilos existentes (`#0A0A0A` fondo, acento configurable, `font-display` = Space Grotesk, `font-sans` = Outfit).

---

## 5. Estructura del código

```
src/
├── App.tsx                    # Componente raíz (~1850 líneas): estado global,
│                              #   tabs (inicio/catalogo/favoritos/pedido/cuenta),
│                              #   carrito, favoritos, tema, gates de carga, modales
├── main.tsx                   # Entry point
├── index.css                  # Tailwind v4 (@import "tailwindcss"), variables
│                              #   :root (--accent*), tema claro, scrollbar, animaciones
├── types.ts                   # Tipos: Product, CartItem, Category, ThemeMode...
├── data/
│   └── products.ts            # loadProductsFromSupabase() + mapper ES→EN
│                              #   ⚠️ SIN datos estáticos: devuelve [] si falla
├── lib/
│   ├── supabase.ts            # Cliente Supabase desde VITE_SUPABASE_URL / _ANON_KEY
│   ├── config.ts              # CMS: loadConfig(), reloadConfig(), cfg(clave, default)
│   ├── palette.ts             # Paletas de marca (green/sand/lilac) → variables CSS
│   ├── supabase-data.ts       # Sync favoritos/perfil/carrito (fail-silently)
│   ├── sanitize.ts            # Wrapper DOMPurify
│   └── generateOrderImage.ts  # Genera JPG del pedido con Canvas (usa --accent actual)
└── components/
    ├── Header.tsx             # Cabecera; 5 clics al logo en 3s = abre admin
    ├── HeroBanner.tsx         # Banner principal (imagen O video, TikTok embed)
    ├── CampaignStrip.tsx      # Franja de campaña de temporada (si está activa)
    ├── ProductCard.tsx        # Tarjeta (badge "Agotado" + botón deshabilitado)
    ├── ProductModal.tsx       # Detalle: tallas con precio extra, tipo de vaso, agotado
    ├── CartDrawer.tsx         # Carrito + envío por zona + total
    ├── FloatingDock.tsx       # Navegación inferior fija
    ├── FaqSection / Footer / SocialQuickBar / ProductionBadgeBar /
    │   TermsAndPrivacy / FavoritesModal / UserProfileModal /
    │   GoogleAuthModal / Header
    ├── AdminPanel.tsx         # Panel admin: auth, tabs, guardado, backup/restore
    └── admin/                 # Módulos del admin
        ├── AdminShared.tsx    # Field, TextInput, Section, PreviewBox, EditableText...
        ├── AdminConfig.tsx    # Contacto, paletas de color, campañas de temporada
        ├── AdminProducts.tsx  # CRUD productos, texto del catálogo
        └── AdminOrders.tsx    # Gestión de pedidos
```

### Archivos SQL en la raíz (se ejecutan en Supabase → SQL Editor)
- `SUPABASE-ALL-IN-ONE.sql` — setup completo desde cero (tablas + políticas + datos demo). **Este es el principal.**
- `supabase-add-agotado.sql` — `ALTER TABLE productos ADD COLUMN IF NOT EXISTS agotado BOOLEAN DEFAULT false;`
- Otros (`supabase-rls-*.sql`, `supabase-fix-*.sql`, `supabase-all-config-keys.sql`) son históricos/auxiliares.

---

## 6. Supabase — estructura de la base de datos

**Proyecto:** el URL está en `.env` local y en Vercel (formato `https://XXXX.supabase.co`, también embebido en el bundle público).

### Tablas (9)

| Tabla | Columnas clave | Uso |
|-------|---------------|-----|
| `configuracion` | `id` (PK = clave), `seccion`, `clave`, `valor` (TEXT) | **CMS**: TODO el texto/imágenes de la web son pares clave-valor aquí |
| `productos` | `id` TEXT PK, `nombre`, `categoria_id` (FK), `precio`, `precio_original`, `tecnica`, `tiempo_produccion`, `imagen`, `galeria` JSONB, `descripcion`, `etiqueta`, `personalizable` BOOL, `opciones_ropa` JSONB, `opciones_vaso` JSONB, `destacado` BOOL, **`agotado` BOOL**, `activo` BOOL, `created_at` | Catálogo |
| `categorias` | `id` ('streetwear','cups','drops'), `nombre`, `icono`, `activo`, `orden` | 3 categorías |
| `pedidos` | `cliente_nombre`, `cliente_telefono`, `cliente_direccion`, `productos` JSONB, `total`, `estado` ('pendiente'...), `zona_envio`, `costo_envio`, `guia_envio`, `metodo_envio` | Pedidos |
| `usuarios` | `email`, `nombre`, `avatar_url`, `rol`, `ultimo_login` | Usuarios |
| `perfiles` | `usuario_id`, `tema`, `nombre_completo`, `telefono`, `direccion`, `dni` | Perfil extendido |
| `favoritos` | `usuario_id`, `producto_id` (UNIQUE juntos) | Sync de favoritos |
| `carrito` | `usuario_id`, `productos` JSONB, `total` | Sync de carrito |
| `ideas_personalizadas` | `tipo_producto`, `descripcion`, `email` | Consultas personalizadas |

- **Storage:** bucket **`media`** (público) — imágenes de hero, productos y pedidos.
- **RLS:** habilitado en todas las tablas, pero las políticas actuales son `"pub"` = `FOR ALL USING (true) WITH CHECK (true)` → **lectura/escritura abierta con la anon key** (así funciona el CMS sin Supabase Auth). Hay scripts para endurecer (`supabase-rls-secure.sql`) pero romperían el admin actual.
- **Anon key = credencial del frontend** (pública por diseño, va en `VITE_SUPABASE_ANON_KEY`).

### Mapeo de columnas (ES en BD → EN en el código `Product`)
`nombre→name`, `categoria_id→category` (streetwear/cups), `precio→price`, `precio_original→originalPrice`, `tecnica→technique`, `tiempo_produccion→productionTime`, `imagen→image`, `galeria→galleryImages`, `descripcion→description`, `etiqueta→tag`, `opciones_ropa→apparelOptions`, `opciones_vaso→cupOptions`, `personalizable→customizable`, `agotado→agotado`, (`activo` NO se filtra — se muestra todo).

---

## 7. Flujos de datos clave

### 7.1 Carga de la web (CRÍTICO — hay pantalla de carga)
1. `App.tsx` monta → `Promise.all([loadProductsFromSupabase(), loadConfig(), loadCategoriesFromSupabase()])`.
2. Mientras `allLoaded = configLoaded && productsLoaded` sea `false` → **pantalla de carga animada** (no se muestra NADA de la web, para evitar flash de datos viejos/defaults). Timeout de seguridad de 5s.
3. **Regla de oro:** NUNCA mostrar datos estáticos de ejemplo. Si Supabase falla → `[]` (catálogo vacío), no productos falsos.

### 7.2 Productos
- `data/products.ts` → `loadProductsFromSupabase()` trae TODO (`from('productos').select('*')`), mapea ES→EN, hace log `[LUMIN] ✅ Loaded N products...`.
- Estado en `App.tsx` (`useState<Product[]>([])` + `productsLoaded`).
- **El admin bloquea guardar productos hasta que `productsLoaded` sea true** (evita sobreescribir la BD con defaults).

### 7.3 Configuración / CMS
- `loadConfig()` trae todas las filas de `configuracion` a un caché en memoria y retorna `boolean` (true = cargó bien).
- `cfg('hero_title_1', 'MODA URBANA &')` → valor de la BD o fallback.
- El admin edita en `cfgEdit` (dirty tracking → contador de cambios → botón "Guardar" global → `upsert` por fila, **incluye claves nuevas** que aún no existen en la tabla) → `reloadConfig()` → `onConfigChange()` sube `configVersion` en App → re-render + `applyPalette()`.
- Ejemplos de claves: `brand_name`, `brand_phone`, `brand_phone_raw`, `brand_location`, `brand_instagram`, `hero_*`, `section_*`, `footer_*`, `faq_*`, `nav_*`, `shipping_price_*`, `brand_palette`, `season_active`, `season_message`, `admin_password_hash`.

### 7.4 Autenticación del admin (actual)
- Acceso: **5 clics al logo del header dentro de 3 segundos** (también existe atajo Ctrl+Shift+L en algunas builds).
- La contraseña NO está en el código. El admin lee la fila `configuracion` con `id = 'admin_password_hash'` y compara el **SHA-256** del input (`crypto.subtle.digest`) con ese valor.
- ⚠️ **NO migrar a Supabase Auth sin consultarlo** — es decisión del dueño.
- ⚠️ Este documento NO incluye la contraseña ni su hash por seguridad.

### 7.5 Paletas de color (reciente)
- 3 paletas: `green` (verde salvia `#D2E8A3`, default), `sand`, `lilac` — en `lib/palette.ts`.
- Clave `brand_palette` en `configuracion`; al guardar el admin se llama `applyPalette()` que setea variables CSS en `:root`: `--accent`, `--accent-hover`, `--accent-hover2`, `--accent-light`, `--accent-ink`.
- ~450 referencias de color en el código usan `var(--accent)` (Tailwind v4 genera `color-mix()` para opacidades). **No reintroducir hex hardcodeados de acento** en clases nuevas.

### 7.6 Campañas de temporada (reciente)
- Claves: `season_active` (`none|halloween|christmas|newyear|blackfriday`) y `season_message`.
- `CampaignStrip.tsx` muestra una franja arriba del hero en el home SOLO si `season_active ≠ 'none'`. No toca precios ni productos.

### 7.7 Carrito, favoritos y pedidos
- **localStorage es la fuente de verdad** del carrito/favoritos del visitante (`lumin_cart`, `lumin_favorites`, `lumin_anon_id`, `lumin_theme_mode`).
- `supabase-data.ts` hace sync a `favoritos`/`perfiles` de forma opcional (falla silenciosa).
- Checkout: genera **imagen JPG del pedido con Canvas** (`generateOrderImage.ts`, sube a Storage `media`) y abre WhatsApp con el resumen; también inserta fila en `pedidos`.
- Envío por zonas: `shipping_price_huamanga` (gratis), `shipping_price_provincia`, `shipping_price_internacional`.

### 7.8 Temas
- `dark` | `amoled` | `light` — guardado en `lumin_theme_mode`. En modo claro el acento usa `--accent-ink` (variante oscura legible).

---

## 8. Reglas que NO se deben romper

1. **Nunca** mostrar productos/textos de ejemplo hardcodeados — cargar de Supabase o mostrar `[]` / loading / vacío.
2. **Nunca** permitir guardar en el admin antes de que carguen los productos reales de Supabase.
3. Mantener la **pantalla de carga inicial** hasta que config + productos carguen (sin flash de datos viejos).
4. Todo HTML inyectado con `dangerouslySetInnerHTML` **debe pasar por `sanitize()` (DOMPurify)**.
5. Producto `agotado` = visible, atenuado, botón deshabilitado, texto "Agotado" (sin "Drop finalizado").
6. Mantener el **WYSIWYG**: admin Inicio = doble clic en cualquier texto de la vista previa para editarlo inline (`EditableText`, `MirrorSection`).
7. No exponer `service_role` ni la contraseña del admin en el frontend/repo.
8. Los textos clave-valor de `configuracion` son contenido real del dueño — no borrar filas existentes.
9. UI en español, colores de marca respetados (acento vía `--accent`).

---

## 9. Funcionalidades existentes (inventario)

**Pública:** hero con imagen/video, catálogo con filtros/búsqueda/orden, producto con tallas (precio por talla), tipo de vaso, diseño extra, galería, badge agotado, favoritos, carrito con cantidades, envío por zona, checkout WhatsApp + imagen JPG, ideas personalizadas, FAQ, legal (términos/privacidad/reclamos), 3 temas, paletas de marca, campañas de temporada, WhatsApp flotante, redes sociales.

**Admin (5 clics al logo):** Inicio (WYSIWYG), Config (contacto/redes/paletas/campañas), Catálogo (CRUD productos con galería y opciones + texto del catálogo), Favoritos, Pedidos (estados/envíos), Mi Cuenta (marca, footer, nav, **backup/restore JSON de las 9 tablas**).

**Seguridad actual:** SHA-256 para admin, DOMPurify, RLS abierto (ver §6), sin service_role en front.

---

## 10. Estado actual y peculiaridades

- **`LUMIN-propuesta.html` en la raíz NO es la web** — es una maqueta HTML standalone (vanilla JS + localStorage, sin Supabase, auth falsa). Sirve como referencia de diseño; cualquier versión "conectada" necesita rehacer los flujos de §7.
- **Errores TypeScript preexistentes** en `npm run lint`: ~31 en `admin/AdminProducts.tsx` (casts `(p: any) => ...`) y 1 en `AdminPanel.tsx` (`.catch` sobre PromiseLike de Supabase). **No bloquean** porque `vite build` no ejecuta tsc. No los "arregles" a medias sin querer — o se arreglan completos o se ignoran.
- El repo tiene muchos `.sql` históricos; el vigente es `SUPABASE-ALL-IN-ONE.sql` + `supabase-add-agotado.sql`.
- `package.json` incluye dependencias raras de una plantilla (`esbuild`, `tsx`, `express` types) — no hacen falta para el build.

---

## 11. Si se necesita un proyecto Supabase NUEVO (checklist)

Preferible NO hacerlo. Si es inevitable:
1. Crear proyecto en supabase.com.
2. Ejecutar `SUPABASE-ALL-IN-ONE.sql` en SQL Editor.
3. Ejecutar `supabase-add-agotado.sql`.
4. Crear bucket `media` público (Storage → New Bucket).
5. Insertar la fila de auth del admin:
   ```sql
   INSERT INTO configuracion (id, seccion, clave, valor)
   VALUES ('admin_password_hash', 'admin', 'admin_password_hash', '<SHA-256 de la contraseña>')
   ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;
   ```
6. Copiar datos reales: desde el admin actual → Mi Cuenta → **Backup JSON**, y restaurar en el nuevo (o exportar/importar por tabla).
7. Actualizar `.env` local **y** las variables de Vercel → redeploy.

---

## 12. Para pedirle una nueva interfaz a una IA — qué debe cumplir

Si piden una nueva UI/index, que responda a esto o no sirve como reemplazo:

1. **Carga productos de Supabase** (mismas columnas/mapeo de §6-7.2), no datos de prueba.
2. **Config por claves** (`cfg()`) para textos/imágenes, o al menos una capa equivalente.
3. **Admin con contraseña real** (hash SHA-256 vs `admin_password_hash`) y CRUD de productos.
4. Carrito → WhatsApp con resumen, producto agotado deshabilitado, precios por talla.
5. Modo claro/oscuro, UI en español, responsive mobile-first.
6. Si solo es una **maqueta visual**, que LO DIGA CLARAMENTE — no confundir maqueta con tienda conectada.

**Recomendación del equipo:** primero rediseñar la cara visual de la app actual (manteniendo React+Supabase), o integrar ideas de la maqueta; reconstruir todo desde cero pierde funcionalidades ya probadas (§8-§9).
