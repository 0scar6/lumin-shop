# LUMIN SHOP — E-Commerce Sublimacion

Tienda online de productos sublimados (polos, vasos, placas de aluminio) con panel de administracion WYSIWYG. Checkout via WhatsApp + Yape/Plin.

**Live:** https://lumin-shop-nine.vercel.app

---

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL + Storage) |
| Deploy | Vercel (auto-deploy on push) |
| Iconos | Lucide React |
| Seguridad | DOMPurify (XSS protection) |

---

## Estructura

```
lumin-shop/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx          # Panel admin WYSIWYG (5 tabs)
│   │   ├── FaqSection.tsx          # Preguntas frecuentes
│   │   ├── FloatingDock.tsx        # Navegacion inferior fija
│   │   ├── Footer.tsx              # Pie de pagina + links legales
│   │   ├── Header.tsx              # Cabecera con busqueda
│   │   ├── HeroBanner.tsx          # Banner principal (img/video)
│   │   ├── ProductCard.tsx         # Tarjeta de producto
│   │   ├── ProductModal.tsx        # Detalle + personalizacion
│   │   ├── ProductionBadgeBar.tsx  # Barra "Como funciona"
│   │   ├── SocialQuickBar.tsx      # WhatsApp + redes sociales
│   │   └── TermsAndPrivacy.tsx     # Politica privacidad + Terminos
│   ├── data/
│   │   └── products.ts             # Fallback estatico + Supabase mapper
│   ├── lib/
│   │   ├── config.ts               # CMS config (cfg() con cache)
│   │   ├── generateOrderImage.ts   # Generador JPG de pedido (Canvas)
│   │   ├── sanitize.ts             # DOMPurify wrapper
│   │   ├── supabase.ts             # Cliente Supabase
│   │   └── supabase-data.ts        # Sync de datos
│   ├── types.ts                    # Definiciones TypeScript
│   ├── App.tsx                     # Componente raiz
│   ├── index.css                   # Tailwind v4 + custom styles
│   └── main.tsx                    # Entry point
├── supabase-rls-secure.sql         # RLS policies (auth)
├── supabase-restore-access.sql     # Emergency restore
├── supabase-all-config-keys.sql    # Config keys SQL
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Funcionalidades

### Tienda Publica
- **Hero Banner** con imagenes/videos configurables desde admin
- **Catalogo** con filtros por categoria, tecnica y busqueda
- **Productos** con opciones de talla, corte, color, tipo de vaso, acabado
- **Precios dinamicos** con extras por talla/tipo
- **Galeria de imagenes** por producto (main image + gallery)
- **Favoritos** con persistencia en Supabase
- **Carrito** con cantidades, envio por zona, calculo de total
- **Checkout por WhatsApp** con imagen de pedido generada (Canvas JPG) + upload a Supabase Storage
- **Ideas personalizadas** con envio a WhatsApp
- **Politica de Privacidad** + Terminos y Condiciones (Ley N 29733)
- **Consentimiento obligatorio** antes de enviar pedido
- **Temas** Oscuro / AMOLED / Claro
- **Responsive** mobile-first, bottom sheet modal en celular

### Panel de Administracion (WYSIWYG)
- **Inicio** — Editor visual: doble clic en cualquier texto para editarlo inline
- **Catalogo** — CRUD de productos con galeria de imagenes, opciones de talla/color/tipo
- **Favoritos** — Configuracion de la pagina de favoritos
- **Pedidos** — Gestion de estados de entrega + zonas de envio
- **Mi Cuenta** — Marca, perfil, envios, footer, navegacion, backup/restore

### Seguridad
- **DOMPurify** en todos los `dangerouslySetInnerHTML`
- **RLS SQL scripts** para Row Level Security en Supabase
- **Backup/Restore** dinamico de todas las tablas desde admin
- **Sanitizacion** de inputs en checkout

### Sistema de Configuracion (CMS)
- Claves configurables desde admin (Supabase `configuracion`)
- Todos los textos del sitio son editables via `cfg()`
- Imagenes hero editables con upload a Supabase Storage
- Cache en memoria con recarga dinamica

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripcion |
|-------|-------------|
| `configuracion` | Pares clave-valor para todo el contenido |
| `productos` | Catalogo con opciones JSON |
| `categorias` | Categorias de productos |
| `usuarios` | Usuarios (requiere columna `rol`) |
| `perfiles` | Perfiles extendidos |
| `favoritos` | Favoritos por usuario |
| `carrito` | Carrito persistido |
| `pedidos` | Pedidos con estado + zona_envio + costo_envio |
| `ideas_personalizadas` | Consultas personalizadas |

### Storage
- Bucket `media` (publico) — imagenes de hero, productos y pedidos

### Columnas necesarias en `pedidos`
```sql
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS zona_envio text DEFAULT 'huamanga';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS costo_envio numeric DEFAULT 0;
```

### Columna necesaria en `usuarios`
```sql
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'user';
```

---

## Variables de Entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Claves de Configuracion Principales

| Seccion | Claves |
|---------|--------|
| Marca | `brand_name`, `brand_phone`, `brand_location` |
| Hero | `hero_badge`, `hero_title_1`, `hero_title_2` |
| Envio | `shipping_price_huamanga`, `shipping_price_provincia`, `shipping_price_internacional` |
| Navegacion | `nav_home`, `nav_catalog`, `nav_favorites` |
| Footer | `footer_description`, `footer_copyright` |

### Zonas de Envio

| Zona | Precio | Editable |
|------|--------|----------|
| Ayacucho / Huamanga | Gratis (default) | Si |
| Provincia | S/ 25 | Si |
| Internacional | S/ 80 | Si |
| Recojo en tienda | Gratis | No |

---

## Optimizaciones

- **React.memo** en ProductCard, Header, Footer, FloatingDock
- **useCallback** en todos los handlers del App.tsx
- **useMemo** para valores derivados (carrito, favoritos, envio, filtros)
- **Lazy loading** en imagenes de productos
- **Config cache** en memoria con `cfg()`
- **FavoriteIds Set** para busqueda O(1)
- **Eliminacion de dependencias muertas** (motion, express, dotenv)

---

## Desarrollo

```bash
npm install
npm run dev       # Dev server
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # TypeScript check
```

---

## Deploy

Auto-deploy en Vercel al hacer push a `master`.

```bash
npx vercel --prod  # Deploy manual
```

---

## Autor

**Oscar Daniel** — [@0scar6](https://github.com/0scar6)

LUMIN SHOP — Ayacucho, Huamanga, Peru
