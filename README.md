# LUMIN SHOP — E-Commerce Sublimación

Tienda online de productos sublimados (polos, vasos, tazas, placas de aluminio) con panel de administración WYSIWYG. construida con React + Vite + Supabase.

**Live:** https://lumin-shop-nine.vercel.app

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS 4 |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel |
| Iconos | Lucide React |

---

## Estructura del Proyecto

```
lúmin-shop/
├── public/
│   └── yape_qr_code.jpg          # QR de pago Yape
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx         # Panel admin WYSIWYG (5 pestañas)
│   │   ├── CartDrawer.tsx         # Carrito lateral
│   │   ├── FavoritesModal.tsx     # Modal de favoritos
│   │   ├── FloatingDock.tsx       # Navegación inferior fija
│   │   ├── Footer.tsx             # Pie de página
│   │   ├── Header.tsx             # Cabecera con búsqueda
│   │   ├── HeroBanner.tsx         # Banner principal con media
│   │   ├── ProductCard.tsx        # Tarjeta de producto
│   │   ├── ProductModal.tsx       # Modal de detalle de producto
│   │   ├── ProductionBadgeBar.tsx # Barra "Cómo funciona"
│   │   ├── FaqSection.tsx         # Sección preguntas frecuentes
│   │   ├── SocialQuickBar.tsx     # Barra WhatsApp + redes sociales
│   │   └── UserProfileModal.tsx   # Modal de perfil de usuario
│   ├── data/
│   │   └── products.ts            # Datos estáticos fallback + Supabase mapper
│   ├── lib/
│   │   ├── config.ts              # Sistema de configuración CMS (cfg())
│   │   ├── generateOrderImage.ts  # Generador de imagen de pedido (Canvas)
│   │   ├── supabase.ts            # Cliente Supabase
│   │   └── supabase-data.ts       # Sync de datos a Supabase
│   ├── types.ts                   # Definiciones TypeScript
│   ├── App.tsx                    # Componente raíz (~1800 líneas)
│   └── main.tsx                   # Entry point
├── supabase-all-config-keys.sql   # SQL de configuración completa
├── supabase-configuracion.sql     # Seed de configuración
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Funcionalidades

### Tienda (Público)
- **Hero Banner** con imágenes/videos configurables desde admin
- **Catálogo** con filtros por categoría, técnica y búsqueda
- **Productos** con opciones de talla, corte, color, tipo de vaso, acabado
- **Precios dinámicos** con extras por talla/tipo
- **Favoritos** con persistencia localStorage + Supabase
- **Carrito** con cantidades, envío por zona, cálculo de total
- **Checkout por WhatsApp** con imagen de pedido generada por Canvas
- ** Ideas personalizadas** con envío a WhatsApp
- **Temas** Oscuro / AMOLED / Claro
- **Responsive** mobile-first, bottom navigation dock

### Panel de Administración (WYSIWYG)
- **Inicio** — Editor visual del sitio: doble clic en cualquier texto para editarlo inline
- **Catálogo** — CRUD completo de productos con opciones de talla/color/tipo
- **Favoritos** — Configuración de la página de favoritos
- **Pedidos** — Gestión de estados de entrega
- **Mi Cuenta** — Marca, perfil, envíos, footer, navegación

### Sistema de Configuración (CMS)
- ~100+ claves configurables desde admin
- Todas las textos del sitio son editables (cfg() en Supabase `configuracion`)
- Imágenes hero editables con upload a Supabase Storage
- Persistencia en Supabase con cache en memoria

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `configuracion` | Pares clave-valor para todo el contenido del sitio |
| `productos` | Catálogo de productos con opciones JSON |
| `categorias` | Categorías de productos |
| `usuarios` | Usuarios autenticados |
| `perfiles` | Perfiles de usuario extendidos |
| `favoritos` | Productos favoritos por usuario |
| `carrito` | Estado del carrito persistido |
| `pedidos` | Pedidos con estado y totales |
| `ideas_personalizadas` | Consultas de ideas personalizadas |

### Storage
- Bucket `media` (público) — imágenes de hero y productos

---

## Configuración

### Variables de Entorno

El archivo `.env` debe contener:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Claves de Configuración Principales

| Sección | Ejemplo de claves |
|---------|-------------------|
| Marca | `brand_name`, `brand_phone`, `brand_location`, `brand_instagram` |
| Hero | `hero_badge`, `hero_title_1`, `hero_title_2`, `hero_cta_catalogo` |
| Social | `social_bar_title`, `brand_facebook`, `brand_tiktok` |
| Envío | `shipping_price_lima`, `shipping_price_provincia` |
| Navegación | `nav_home`, `nav_catalog`, `nav_favorites` |
| Footer | `footer_description`, `footer_collections`, `footer_copyright` |

---

## Optimizaciones de Rendimiento

- **React.memo** en ProductCard, HeroBanner, Header, Footer, FloatingDock
- **useCallback** en todos los handlers del App.tsx
- **useMemo** para valores derivados (carrito, favoritos, envío, filtros)
- **lazy loading** en imágenes de productos
- **HeroMedia** memoizado para evitar re-renders en cambios de tema
- **Config cache** en memoria con `cfg()`
- **Eliminación de dependencias muertas** (motion, express, dotenv)

---

## Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint (TypeScript)
npm run lint
```

---

## Deploy

El proyecto se despliega automáticamente en Vercel al hacer push a `main`.

```bash
# Deploy manual
npx vercel --prod
```

---

## Autor

**Oscar Daniel** — [@lumin.shop](https://instagram.com/lumin.shop)

LUMIN SHOP — Ayacucho, Perú
