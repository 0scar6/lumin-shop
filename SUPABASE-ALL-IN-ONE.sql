-- ============================================================
-- LUMIN SHOP — SETUP COMPLETO EN 1 SOLA EJECUCION
-- ============================================================
-- COMO USAR:
--   1. Crea un proyecto en supabase.com
--   2. Ve a SQL Editor > New Query
--   3. Pega TODO este codigo
--   4. Click RUN
--   5. Ve a Storage > New Bucket > nombre: "media" > Public: ON
--   6. Crea archivo .env con tu URL y Key
--   7. npm install && npm run dev
-- ============================================================
-- SAFE TO RE-RUN: Usa IF EXISTS / ON CONFLICT
-- ============================================================


-- ============================================================
-- 1. LIMPIAR TABLAS EXISTENTES (si las hay)
-- ============================================================

DROP POLICY IF EXISTS "pub" ON configuracion;
DROP POLICY IF EXISTS "pub" ON categorias;
DROP POLICY IF EXISTS "pub" ON productos;
DROP POLICY IF EXISTS "pub" ON usuarios;
DROP POLICY IF EXISTS "pub" ON perfiles;
DROP POLICY IF EXISTS "pub" ON favoritos;
DROP POLICY IF EXISTS "pub" ON carrito;
DROP POLICY IF EXISTS "pub" ON pedidos;
DROP POLICY IF EXISTS "pub" ON ideas_personalizadas;

DROP TABLE IF EXISTS ideas_personalizadas CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;


-- ============================================================
-- 2. CREAR TABLAS
-- ============================================================

CREATE TABLE categorias (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    icono TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE productos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria_id TEXT REFERENCES categorias(id),
    precio DECIMAL(10,2) NOT NULL,
    precio_original DECIMAL(10,2),
    tecnica TEXT,
    tiempo_produccion TEXT,
    imagen TEXT,
    galeria JSONB,
    descripcion TEXT,
    etiqueta TEXT,
    personalizable BOOLEAN DEFAULT false,
    opciones_ropa JSONB,
    opciones_vaso JSONB,
    destacado BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    avatar_url TEXT,
    rol TEXT DEFAULT 'user',
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE perfiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT UNIQUE NOT NULL,
    tema TEXT DEFAULT 'dark',
    nombre_completo TEXT,
    telefono TEXT,
    direccion TEXT,
    dni TEXT,
    updated_at TIMESTAMP
);

CREATE TABLE favoritos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT NOT NULL,
    producto_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

CREATE TABLE carrito (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT UNIQUE NOT NULL,
    cliente_nombre TEXT,
    cliente_telefono TEXT,
    cliente_direccion TEXT,
    cliente_dni TEXT,
    productos JSONB NOT NULL,
    total DECIMAL(10,2),
    metodo_envio TEXT DEFAULT 'domicilio',
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pedidos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_direccion TEXT,
    cliente_dni TEXT,
    productos JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    guia_envio TEXT,
    metodo_envio TEXT DEFAULT 'domicilio',
    zona_envio TEXT DEFAULT 'huamanga',
    costo_envio NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE ideas_personalizadas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT NOT NULL,
    tipo_producto TEXT,
    descripcion TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE configuracion (
    id TEXT PRIMARY KEY,
    seccion TEXT NOT NULL,
    clave TEXT NOT NULL,
    valor TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(seccion, clave)
);


-- ============================================================
-- 3. HABILITAR RLS + POLITICAS ABIERTAS
-- ============================================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas_personalizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pub" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON perfiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON favoritos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON carrito FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON ideas_personalizadas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON configuracion FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- 4. INSERTAR CATEGORIAS (3)
-- ============================================================

INSERT INTO categorias (id, nombre, icono, activo, orden) VALUES
('streetwear', 'Polos Oversized & Boxy Fit', 'Shirt', true, 1),
('cups', 'Vasos Frosted Glass 16oz', 'Coffee', true, 2),
('drops', 'Edición Especial Drop 04', 'Flame', true, 3)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, icono = EXCLUDED.icono;


-- ============================================================
-- 5. INSERTAR PRODUCTOS DE EJEMPLO (8)
-- ============================================================

INSERT INTO productos (id, nombre, categoria_id, precio, precio_original, tecnica, tiempo_produccion, imagen, galeria, descripcion, etiqueta, opciones_ropa, personalizable, activo, destacado) VALUES
('polo-acid-tokyo', 'Polo Oversized "Acid Tokyo 1988"', 'streetwear', 79.00, 95.00, 'Estampado Urbano HD Ultra-Resistente', '⚡ 24-48 hrs',
 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"]'::jsonb,
 'Confeccionado en algodón reactivo 240g (Heavyweight). Estampado de alta definición con gran intensidad de color y durabilidad.',
 '🔥 DROP 04 BESTSELLER',
 '{"sizes":["S","M","L","XL","XXL"],"fits":["Oversized Streetwear","Boxy Heavyweight","Standard Fit"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Gris Washed","hex":"#374151"},{"name":"Verde Oliva Dark","hex":"#1C2818"},{"name":"Off-White","hex":"#E5E5E0"}]}'::jsonb,
 true, true, true),

('polo-cyber-lumin', 'Polo Boxy Fit "LÚMIN Vector Mesh"', 'streetwear', 75.00, NULL, 'Serigrafía Tacto Cero HD', '⚡ 24-48 hrs',
 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"]'::jsonb,
 'Diseño geométrico minimalista con acabado en tonos pistacho y blanco mate. Corte streetwear holgado con caída pesada.',
 '✨ NUEVO DROP',
 '{"sizes":["S","M","L","XL"],"fits":["Boxy Heavyweight","Oversized Streetwear"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Washed Charcoal","hex":"#262626"}]}'::jsonb,
 true, true, false),

('polo-mind-matter', 'Polo Minimal "Mind Over Matter"', 'streetwear', 69.00, 80.00, 'Estampado Micro-Print HD', '⚡ 24 hrs Express',
 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
 NULL,
 'Logo sutil en el pecho e ilustración detallada en la espalda. Algodón peruano 20/1 suave y fresco.',
 '⚡ EXPRESS 24H',
 '{"sizes":["S","M","L","XL"],"fits":["Standard Fit","Oversized Streetwear"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Blanco Puro","hex":"#FFFFFF"},{"name":"Verde Pistacho Soft","hex":"#C2D993"}]}'::jsonb,
 true, true, false),

('polo-gothic-acid', 'Polo Heavyweight "Gothic Skull Mono"', 'streetwear', 85.00, NULL, 'Serigrafía Relieve HD', '⚡ 24-48 hrs',
 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
 NULL,
 'Arte gótico reinterpretado con estética urbana. Cuello de rib grueso y costuras reforzadas.',
 '🔥 POPULAR',
 '{"sizes":["M","L","XL","XXL"],"fits":["Oversized Heavyweight"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"}]}'::jsonb,
 false, true, true),

('vaso-frosted-tokyo', 'Vaso Frosted Glass "Tokyo Skyline 16oz"', 'cups', 45.00, 55.00, 'Sublimación Premium 200°C', '⚡ 24-48 hrs',
 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80"]'::jsonb,
 'Vaso de vidrio esmerilado opaco con sorbete y tapa de bambú ecológica. Sublimado continuo full color de alta durabilidad.',
 '🔥 TOP SUBLIMACIÓN',
 '{"types":[{"name":"Vaso Frosted Glass 16oz (Vidrio Esmerilado)","extraPrice":0},{"name":"Vaso Aluminio Térmico 20oz (Mantiene frío 12h)","extraPrice":15},{"name":"Taza Cerámica Matte 11oz","extraPrice":-10}],"finishes":["Acabado Esmerilado Frosted","Brillo Cristal","Textura Mate Tacto"]}'::jsonb,
 true, true, true),

('taza-lumin-monochrome', 'Taza Cerámica "LÚMIN Dark Mode 11oz"', 'cups', 35.00, NULL, 'Sublimación Ultra HD 360°', '⚡ 24 hrs Express',
 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
 NULL,
 'Cerámica de alta calidad clase A+ negra por dentro con diseño exterior personalizado. Apta para microondas.',
 '⚡ CLÁSICO ESSENTIAL',
 '{"types":[{"name":"Taza Cerámica Negra 11oz","extraPrice":0},{"name":"Taza Cerámica Blanca 11oz","extraPrice":0},{"name":"Taza Mágica Térmica 11oz (Cambia con calor)","extraPrice":12}],"finishes":["Negro Intermitente Matte","Brillante Cristal"]}'::jsonb,
 true, true, false),

('vaso-aluminio-darkmatter', 'Vaso Térmico Aluminio "Dark Matter 20oz"', 'cups', 59.00, 69.00, 'Sublimación Térmica en Metal', '⚡ 24-48 hrs',
 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
 NULL,
 'Vaso hermético de acero/aluminio con aislamiento al vacío de doble pared. Conserva bebidas frías por 18 hrs y calientes por 8 hrs.',
 '✨ EDICIÓN TÉRMINA',
 '{"types":[{"name":"Vaso Aluminio Térmico 20oz (Con sorbete)","extraPrice":0},{"name":"Botella Deportiva 600ml","extraPrice":5}],"finishes":["Acabado Mate Anti-rayaduras","Satinado Metálico"]}'::jsonb,
 true, true, true),

('polo-retro-arcade', 'Polo Heavy "Neon Grid Synth"', 'streetwear', 78.00, NULL, 'Estampado Urbano HD 12 Colores', '⚡ 24-48 hrs',
 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
 NULL,
 'Combinación de estética retro arcade con cortes rectos modernos. Estampado suave sin sensación rígida.',
 '🔥 POPULAR',
 '{"sizes":["S","M","L","XL"],"fits":["Oversized Streetwear","Boxy Heavyweight"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Gris Washed","hex":"#374151"}]}'::jsonb,
 true, true, true)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, precio = EXCLUDED.precio;


-- ============================================================
-- 6. INSERTAR TODAS LAS CONFIGURACIONES
-- ============================================================

-- Admin
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('admin_password', 'admin', 'password', 'Ratitaxd12')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Marca
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('brand_name', 'marca', 'nombre', 'LUMIN SHOP'),
('brand_slogan', 'marca', 'slogan', 'URBAN APPAREL & SUBLIMATION'),
('brand_description', 'marca', 'descripcion', 'Marca independiente de ropa urbana streetwear (polos gráficos de alta definición) y vasos/tazas sublimadas de alta temperatura. Trabajamos 100% bajo pedido para garantizar máxima calidad.'),
('brand_phone', 'marca', 'telefono', '993 365 099'),
('brand_phone_raw', 'marca', 'telefono_raw', '51993365099'),
('brand_holder', 'marca', 'titular_yape', 'Oscar Daniel'),
('brand_location', 'marca', 'ubicacion', 'Ayacucho, Perú'),
('brand_instagram', 'marca', 'instagram', '@.lumin.shop'),
('brand_tiktok', 'marca', 'tiktok', '@.lumin.shop'),
('brand_facebook', 'marca', 'facebook', 'https://www.facebook.com/profile.php?id=61587839625876'),
('brand_whatsapp_msg', 'marca', 'whatsapp_saludo', '¡Hola LUMIN SHOP! ⚡ Quisiera realizar el siguiente pedido:'),
('brand_whatsapp_idea', 'marca', 'whatsapp_idea', '⚡ *CONSULTA DE IDEA PERSONALIZADA LUMIN SHOP*'),
('brand_whatsapp_help', 'marca', 'whatsapp_ayuda', 'Hola LUMIN SHOP! ⚡ Quisiera hacer una consulta o realizar un pedido por WhatsApp.')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Hero
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('hero_badge', 'hero', 'badge', 'Exclusivo — COLECCIÓN BAJO DEMANDA'),
('hero_title_1', 'hero', 'titulo_1', 'MODA URBANA &'),
('hero_title_2', 'hero', 'titulo_2', 'VASOS SUBLIMADOS'),
('hero_subtitle_1', 'hero', 'subtitulo_1', 'Polos Sublimados con'),
('hero_subtitle_2', 'hero', 'subtitulo_2', 'Estampado Urbano HD High-Density'),
('hero_description', 'hero', 'descripcion', 'Sin sobre-stock. Fabricado especialmente para ti al confirmar tu orden.'),
('hero_badge_1', 'hero', 'badge_produccion', '⚡ Producción Express: 24 a 48 hrs'),
('hero_badge_2', 'hero', 'badge_garantia', '🛡️ Garantía de Fijación Térmica & Color'),
('hero_cta_catalogo', 'hero', 'cta_catalogo', 'EXPLORAR CATÁLOGO'),
('hero_cta_idea', 'hero', 'cta_idea', 'Personalizar Mi Idea'),
('hero_media_1_url', 'hero', 'media_1_url', ''),
('hero_media_2_url', 'hero', 'media_2_url', ''),
('hero_media_1_scale', 'hero', 'media_1_scale', '100'),
('hero_media_1_opacity', 'hero', 'media_1_opacity', '100'),
('hero_media_2_scale', 'hero', 'media_2_scale', '100'),
('hero_media_2_opacity', 'hero', 'media_2_opacity', '100'),
('hero_street_title', 'hero', 'street_titulo', 'STREETWEAR'),
('hero_street_sub', 'hero', 'street_subtitulo', 'Acid Tokyo 1988'),
('hero_subli_title', 'hero', 'subli_titulo', 'SUBLIMACIÓN'),
('hero_subli_sub', 'hero', 'subli_subtitulo', 'Frosted Glass 16oz')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Secciones
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('section_about_title', 'secciones', 'sobre_titulo', 'Sobre LUMIN SHOP'),
('section_about_handle', 'secciones', 'sobre_handle', '@.lumin.shop'),
('section_about_location', 'secciones', 'sobre_ubicacion', '📍 Ayacucho, Perú • Envíos a Nivel Nacional'),
('section_about_subtitle', 'secciones', 'sobre_subtitulo', 'Ropa Urbana Streetwear & Sublimación de Alta Temperatura'),
('section_about_text', 'secciones', 'sobre_texto', 'LUMIN SHOP es una marca independiente peruana dedicada al diseño y confección de streetwear exclusivo y artículos gráficos. Nos especializamos en polos <strong>Oversized & Boxy Fit</strong> producidos en algodón reactivo de 240g (Heavyweight) de máxima durabilidad, además de <strong>Vasos Frosted Glass de 16oz</strong> y <strong>Tazas Térmicas de 11oz</strong> sublimadas térmicamente a 200°C. Cada prenda y producto se elabora 100% bajo pedido con acabado profesional.'),
('section_about_cta_cat', 'secciones', 'sobre_cta_catalogo', 'Explorar Catálogo de Productos'),
('section_about_cta_idea', 'secciones', 'sobre_cta_idea', 'Cotizar Idea Personalizada'),
('section_featured_title', 'secciones', 'destacados_titulo', '🔥 SELECCIÓN DESTACADA DROP 04'),
('section_featured_sub', 'secciones', 'destacados_subtitulo', 'Nuestros Más Pedidos'),
('section_featured_cta', 'secciones', 'destacados_cta', 'Ver Catálogo Completo')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Badges / Proceso
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('badge_model_title', 'badges', 'modelo_titulo', 'MODELO SUSTENTABLE BAJO DEMANDA'),
('badge_model_subtitle', 'badges', 'modelo_subtitulo', '¿CÓMO FUNCIONA LUMIN SHOP?'),
('badge_model_desc', 'badges', 'modelo_descripcion', 'Cero sobre-stock, mayor frescura en estampados y acabados totalmente personalizados para ti.'),
('badge_step1_title', 'badges', 'paso1_titulo', 'Eliges y Configuras'),
('badge_step1_desc', 'badges', 'paso1_descripcion', 'Seleccionas tu prenda o vaso, talla, corte, color o texto personal.'),
('badge_step2_title', 'badges', 'paso2_titulo', 'Producción 24-48h'),
('badge_step2_desc', 'badges', 'paso2_descripcion', 'Estampamos con serigrafía/fijación térmica o sublimamos a 200°C con máxima fijación.'),
('badge_step3_title', 'badges', 'paso3_titulo', 'Despacho & Entrega'),
('badge_step3_desc', 'badges', 'paso3_descripcion', 'Empacamos con cuidado y enviamos a la puerta de tu domicilio.')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Navegacion
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('nav_home', 'navegacion', 'inicio', 'Inicio'),
('nav_catalog', 'navegacion', 'catalogo', 'Catálogo'),
('nav_favorites', 'navegacion', 'favoritos', 'Favoritos'),
('nav_cart', 'navegacion', 'pedido', 'Pedido'),
('nav_profile', 'navegacion', 'mi_cuenta', 'Mi Cuenta'),
('nav_custom', 'navegacion', 'idea', 'Idea')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Catalogo
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('catalog_title', 'catalogo', 'titulo', 'COLECCIÓN DISPONIBLE'),
('catalog_subtitle', 'catalogo', 'subtitulo', 'Explora nuestra colección de productos sublimados'),
('catalog_empty', 'catalogo', 'vacio', 'No se encontraron productos con los filtros seleccionados.')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Favoritos
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('favorites_title', 'favoritos', 'titulo', 'PRODUCTOS GUARDADOS'),
('favorites_desc', 'favoritos', 'desc', 'Tus polos, vasos y placas favoritos'),
('favorites_empty_title', 'favoritos', 'vacio_titulo', 'Aún no tienes productos guardados'),
('favorites_empty_desc', 'favoritos', 'vacio_desc', 'Explora el catálogo y presiona el corazón para guardar.'),
('favorites_empty_cta', 'favoritos', 'vacio_cta', 'EXPLORAR CATÁLOGO')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Carrito
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('cart_empty_title', 'carrito', 'vacio_titulo', 'Tu pedido está vacío por el momento'),
('cart_empty_desc', 'carrito', 'vacio_descripcion', 'Agrega polos streetwear o vasos/tazas con tu personalización preferida para generar tu orden.'),
('cart_empty_cta', 'carrito', 'vacio_cta', 'IR AL CATÁLOGO'),
('cart_process_title', 'carrito', 'proceso_titulo', 'PROCESO DE FABRICACIÓN BAJO PEDIDO:'),
('cart_process_desc', 'carrito', 'proceso_descripcion', 'Envías la orden a WhatsApp, iniciamos producción digital/artesanal (24-48h) y despachamos a tu domicilio.'),
('cart_send_whatsapp', 'carrito', 'enviar_whatsapp', 'ENVIAR PEDIDO POR WHATSAPP'),
('cart_copy_order', 'carrito', 'copiar_pedido', 'Copiar Resumen de Pedido'),
('cart_total_label', 'carrito', 'total_label', 'Total a Pagar:'),
('cart_shipping_title', 'carrito', 'envio_titulo', 'Datos para el envío:'),
('cart_form_name_label', 'carrito', 'form_nombre', 'Nombre Completo:'),
('cart_form_address_label', 'carrito', 'form_direccion', 'Dirección de Entrega:'),
('cart_delivery_home', 'carrito', 'envio_domicilio', '🚀 Envío Domicilio'),
('cart_delivery_pickup', 'carrito', 'envio_tienda', '🏪 Recojo en Tienda')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Perfil
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('profile_title', 'perfil', 'titulo', 'MI CUENTA & PREFERENCIAS'),
('profile_concepts', 'perfil', 'conceptos_titulo', '3. Conceptos del Servicio LUMIN SHOP:'),
('profile_concepts_sub', 'perfil', 'conceptos_subtitulo', 'Garantía 100%'),
('concept_1_title', 'perfil', 'concepto_1_titulo', '1. Tiempos de Elaboración:'),
('concept_1_desc', 'perfil', 'concepto_1_descripcion', 'Confección y sublimación personalizada en 24 a 48 hrs hábiles antes del despacho final.'),
('concept_2_title', 'perfil', 'concepto_2_titulo', '2. Pagos Yape / Plin / BCP:'),
('concept_2_desc', 'perfil', 'concepto_2_descripcion', 'Pago seguro al 993 365 099 a nombre de LUMIN SHOP. Aceptamos BCP, BBVA e Interbank.'),
('concept_3_title', 'perfil', 'concepto_3_titulo', '3. Envíos Gratis & Cobertura:'),
('concept_3_desc', 'perfil', 'concepto_3_descripcion', 'Gratis por compras desde S/ 200. Envíos con Olva Courier, Shalom o Motorizado Express.'),
('concept_4_title', 'perfil', 'concepto_4_titulo', '4. Algodón 24/1 & Sublimación HD:'),
('concept_4_desc', 'perfil', 'concepto_4_descripcion', 'Telas reactivas de alto gramaje y estampado HD 1200 DPI de máxima fijación resistente a lavados.'),
('concept_5_title', 'perfil', 'concepto_5_titulo', '5. Asesoría Directa WhatsApp:'),
('concept_5_desc', 'perfil', 'concepto_5_descripcion', 'Coordinación personalizada en tiempo real para validar tu talla, color y datos de entrega antes de producir.'),
('concept_6_title', 'perfil', 'concepto_6_titulo', '6. Garantía de Calidad LUMIN:'),
('concept_6_desc', 'perfil', 'concepto_6_descripcion', '100% de cobertura ante defectos o fallas de estampado. Reemplazo o ajuste inmediato sin complicaciones.'),
('profile_footer', 'perfil', 'pie_pagina', 'LUMIN SHOP v2.0 • Urbano & Sublimación')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Envios
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('shipping_price_huamanga', 'envios', 'precio_huamanga', '0'),
('shipping_price_provincia', 'envios', 'precio_provincia', '25'),
('shipping_price_internacional', 'envios', 'precio_internacional', '80')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Footer
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('footer_description', 'footer', 'descripcion', 'Marca independiente de ropa urbana streetwear (polos gráficos de alta definición) y vasos/tazas sublimadas de alta temperatura. Trabajamos 100% bajo pedido para garantizar máxima calidad.'),
('footer_production', 'footer', 'produccion', 'Producción Express 24-48 hrs'),
('footer_collections', 'footer', 'colecciones', 'Colecciones'),
('footer_col_1', 'footer', 'col_1', 'Polos Oversized & Boxy Fit'),
('footer_col_2', 'footer', 'col_2', 'Vasos Frosted Glass 16oz'),
('footer_col_3', 'footer', 'col_3', 'Tazas Térmicas 11oz'),
('footer_col_4', 'footer', 'col_4', 'Edición Especial Drop 04'),
('footer_guarantee_title', 'footer', 'garantia_titulo', 'Garantía & Envíos'),
('footer_guarantee_1', 'footer', 'garantia_1', 'Estampados HD de alta resistencia'),
('footer_guarantee_2', 'footer', 'garantia_2', 'Envíos directos a todo el país'),
('footer_guarantee_3', 'footer', 'garantia_3', 'Pagos seguros: Yape, Plin, Transferencia o Tarjeta'),
('footer_social_title', 'footer', 'social_titulo', 'Síguenos en Redes'),
('footer_social_text', 'footer', 'social_texto', 'Encuéntranos en TikTok, Facebook e Instagram como @.lumin.shop'),
('footer_copyright', 'footer', 'copyright', '© 2026 LUMIN SHOP. Todos los derechos reservados. Moda Urbana & Sublimación Bajo Pedido.')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Social
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('social_title', 'social', 'titulo', 'WhatsApp & Redes Oficiales'),
('social_text', 'social', 'texto', 'Contacto directo'),
('social_subtitle', 'social', 'subtitulo', 'Respuesta inmediata')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- WhatsApp
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('whatsapp_order_header', 'whatsapp', 'orden_header', '📦 *DETALLE DE MI PEDIDO*'),
('whatsapp_order_total', 'whatsapp', 'orden_total', 'TOTAL DE MI ORDEN:'),
('whatsapp_order_closing', 'whatsapp', 'orden_cierre', 'Por favor confírmenme los datos de pago y el tiempo de entrega. ¡Muchas gracias!'),
('whatsapp_delivery_home', 'whatsapp', 'envio_domicilio', '🚀 Envío a Domicilio'),
('whatsapp_delivery_pickup', 'whatsapp', 'envio_tienda', '🏪 Recojo en Tienda')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Product Modal
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
('pm_close_label', 'modal', 'cerrar', 'Cerrar'),
('pm_view_prefix', 'modal', 'vista', 'Vista'),
('pm_production_time', 'modal', 'tiempo_produccion', 'Tiempo de confección: '),
('pm_quality_guarantee', 'modal', 'garantia', 'Calidad Garantizada LUMIN 100%'),
('pm_category_polo', 'modal', 'categoria_polo', 'Polo Sublimado Bajo Pedido'),
('pm_category_cup', 'modal', 'categoria_cup', 'Vaso / Taza Sublimada'),
('pm_size_label', 'modal', 'talla_label', '1. Selecciona tu Talla:'),
('pm_fit_label', 'modal', 'corte_label', '2. Tipo de Corte / Fit:'),
('pm_color_label', 'modal', 'color_label', '3. Color de Tela: '),
('pm_cup_type_label', 'modal', 'tipo_vaso_label', '1. Tipo de Vaso / Taza:'),
('pm_finish_label', 'modal', 'acabado_label', '2. Acabado de la Superficie:'),
('pm_custom_text_label', 'modal', 'texto_label', 'Añadir Texto o Apodo Personalizado:'),
('pm_free', 'modal', 'gratis', 'Gratis'),
('pm_characters', 'modal', 'caracteres', 'caracteres'),
('pm_placeholder_apparel', 'modal', 'placeholder_polo', 'Ej. Nombre en manga / "LUMIN 04"'),
('pm_placeholder_cup', 'modal', 'placeholder_vaso', 'Ej. "Carlos" o Frase corta'),
('pm_decrease', 'modal', 'disminuir', 'Disminuir cantidad'),
('pm_increase', 'modal', 'aumentar', 'Aumentar cantidad'),
('pm_total_label', 'modal', 'total_label', 'TOTAL ESTIMADO'),
('pm_add_to_cart', 'modal', 'agregar', 'AÑADIR A MI PEDIDO'),
('pm_included', 'modal', 'incluido', 'Incluido')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;


-- ============================================================
-- LISTO! Ahora crea el bucket "media" en Storage:
--   1. Ve a Storage en el dashboard
--   2. New Bucket > nombre: "media" > Public: ON
-- ============================================================
