-- ============================================
-- TODAS LAS KEYS DE CONFIGURACION
-- Ejecutar en SQL Editor de Supabase
-- SAFE TO RE-RUN: actualiza valores existentes
-- ============================================

-- Admin password
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('admin_password', 'admin', 'password', 'Ratitaxd12')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Hero
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('hero_badge', 'hero', 'badge', 'Exclusivo — COLECCIÓN BAJO DEMANDA'),
  ('hero_title_1', 'hero', 'titulo_1', 'MODA URBANA &'),
  ('hero_title_2', 'hero', 'titulo_2', 'VASOS SUBLIMADOS'),
  ('hero_subtitle_1', 'hero', 'subtitulo_1', 'Polos Sublimados con'),
  ('hero_subtitle_2', 'hero', 'subtitulo_2', 'Estampado Urbano HD High-Density'),
  ('hero_description', 'hero', 'descripcion', 'Sin sobre-stock. Fabricado especialmente para ti al confirmar tu orden.'),
  ('hero_badge_1', 'hero', 'badge_1', '⚡ Producción Express: 24 a 48 hrs'),
  ('hero_badge_2', 'hero', 'badge_2', '🛡️ Garantía de Fijación Térmica & Color'),
  ('hero_cta_catalogo', 'hero', 'cta_catalogo', 'EXPLORAR CATÁLOGO'),
  ('hero_cta_idea', 'hero', 'cta_idea', 'Personalizar Mi Idea'),
  ('hero_media_1_url', 'hero', 'media_1_url', ''),
  ('hero_media_2_url', 'hero', 'media_2_url', ''),
  ('hero_media_1_scale', 'hero', 'media_1_scale', '100'),
  ('hero_media_1_opacity', 'hero', 'media_1_opacity', '100'),
  ('hero_media_2_scale', 'hero', 'media_2_scale', '100'),
  ('hero_media_2_opacity', 'hero', 'media_2_opacity', '100'),
  ('hero_street_title', 'hero', 'street_titulo', 'STREETWEAR'),
  ('hero_street_sub', 'hero', 'street_sub', 'Acid Tokyo 1988'),
  ('hero_subli_title', 'hero', 'subli_titulo', 'SUBLIMACIÓN'),
  ('hero_subli_sub', 'hero', 'subli_sub', 'Frosted Glass 16oz')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Brand
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('brand_name', 'marca', 'nombre', 'LUMIN SHOP'),
  ('brand_slogan', 'marca', 'slogan', 'URBAN APPAREL & SUBLIMATION'),
  ('brand_phone', 'marca', 'telefono', '993 365 099'),
  ('brand_phone_raw', 'marca', 'telefono_raw', '51993365099'),
  ('brand_location', 'marca', 'ubicacion', 'Ayacucho, Perú'),
  ('brand_instagram', 'marca', 'instagram', '@.lumin.shop'),
  ('brand_whatsapp', 'marca', 'whatsapp', 'https://wa.me/51993365099'),
  ('brand_whatsapp_msg', 'marca', 'whatsapp_msg', '¡Hola LUMIN! ⚡ Quisiera realizar el siguiente pedido:'),
  ('brand_whatsapp_idea', 'marca', 'whatsapp_idea', '⚡ *CONSULTA DE IDEA PERSONALIZADA LUMIN SHOP*')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Social
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('social_title', 'social', 'titulo', 'WhatsApp & Redes Oficiales'),
  ('social_text', 'social', 'texto', 'Contacto directo'),
  ('social_subtitle', 'social', 'subtitulo', 'Respuesta inmediata')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Badges / Process
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('badge_model_title', 'badges', 'titulo', 'MODELO SUSTENTABLE BAJO DEMANDA'),
  ('badge_model_subtitle', 'badges', 'subtitulo', '¿CÓMO FUNCIONA LUMIN SHOP?'),
  ('badge_step1_title', 'badges', 'paso1_titulo', 'Confirmas tu diseño'),
  ('badge_step1_desc', 'badges', 'paso1_desc', 'Envías tu arte o idea por WhatsApp'),
  ('badge_step2_title', 'badges', 'paso2_titulo', 'Producimos en 24-48h'),
  ('badge_step2_desc', 'badges', 'paso2_desc', 'Sublimamos tu pedido con acabado HD'),
  ('badge_step3_title', 'badges', 'paso3_titulo', 'Despachamos'),
  ('badge_step3_desc', 'badges', 'paso3_desc', 'Envío a todo el país o recojo en tienda')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Sections
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('section_about_title', 'secciones', 'sobre_titulo', 'SOBRE LUMIN SHOP'),
  ('section_about_subtitle', 'secciones', 'sobre_sub', 'Ropa Urbana Streetwear & Sublimación Premium'),
  ('section_about_text', 'secciones', 'sobre_texto', 'LUMIN SHOP es una marca independiente de Ayacucho especializada en polos sublimados y vasos/tazas con acabado HD. Todo es producido bajo demanda.'),
  ('section_featured_title', 'secciones', 'destacados_titulo', '🔥 SELECCIÓN DESTACADA'),
  ('section_featured_sub', 'secciones', 'destacados_sub', 'Nuestros Más Pedidos')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Navigation
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('nav_home', 'navegacion', 'inicio', 'Inicio'),
  ('nav_catalog', 'navegacion', 'catalogo', 'Catálogo'),
  ('nav_favorites', 'navegacion', 'favoritos', 'Favoritos'),
  ('nav_cart', 'navegacion', 'pedido', 'Pedido'),
  ('nav_profile', 'navegacion', 'mi_cuenta', 'Mi Cuenta'),
  ('nav_custom', 'navegacion', 'idea', 'Idea')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Catalog
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('catalog_title', 'catalogo', 'titulo', 'COLECCIÓN DISPONIBLE'),
  ('catalog_subtitle', 'catalogo', 'subtitulo', 'Explora nuestra colección de productos sublimados'),
  ('catalog_empty', 'catalogo', 'vacio', 'No se encontraron productos con los filtros seleccionados.')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Favorites
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('favorites_title', 'favoritos', 'titulo', 'PRODUCTOS GUARDADOS'),
  ('favorites_desc', 'favoritos', 'desc', 'Tus polos, vasos y placas favoritos'),
  ('favorites_empty_title', 'favoritos', 'vacio_titulo', 'Aún no tienes productos guardados'),
  ('favorites_empty_desc', 'favoritos', 'vacio_desc', 'Explora el catálogo y presiona el corazón para guardar.'),
  ('favorites_empty_cta', 'favoritos', 'vacio_cta', 'EXPLORAR CATÁLOGO')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Cart
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('cart_empty_title', 'carrito', 'vacio_titulo', 'Tu pedido está vacío'),
  ('cart_empty_desc', 'carrito', 'vacio_desc', 'Agrega polos o vasos/tazas para generar tu orden.'),
  ('cart_empty_cta', 'carrito', 'vacio_cta', 'IR AL CATÁLOGO'),
  ('cart_process_title', 'carrito', 'proceso_titulo', 'PROCESO DE FABRICACIÓN BAJO PEDIDO:'),
  ('cart_process_desc', 'carrito', 'proceso_desc', 'Envías la orden a WhatsApp, iniciamos producción y despachamos a tu domicilio.'),
  ('cart_send_whatsapp', 'carrito', 'enviar_whatsapp', 'ENVIAR PEDIDO POR WHATSAPP'),
  ('cart_total_label', 'carrito', 'total_label', 'Total a Pagar:'),
  ('cart_shipping_title', 'carrito', 'envio_titulo', 'Datos para el envío:'),
  ('cart_form_name_label', 'carrito', 'form_nombre', 'Nombre Completo:'),
  ('cart_form_address_label', 'carrito', 'form_direccion', 'Dirección de Entrega:'),
  ('cart_delivery_home', 'carrito', 'envio_domicilio', '🚀 Envío Domicilio'),
  ('cart_delivery_pickup', 'carrito', 'envio_tienda', '🏪 Recojo en Tienda')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Profile
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('profile_title', 'perfil', 'titulo', 'MI CUENTA & PREFERENCIAS'),
  ('profile_concepts', 'perfil', 'conceptos_titulo', '3. Conceptos del Servicio LUMIN SHOP:'),
  ('concept_1_title', 'perfil', 'concepto_1_titulo', '1. Elaboración Bajo Pedido'),
  ('concept_1_desc', 'perfil', 'concepto_1_desc', 'Producción personalizada en 24 a 48 hrs hábiles.'),
  ('concept_2_title', 'perfil', 'concepto_2_titulo', '2. Pagos Yape / Plin / Bancos'),
  ('concept_2_desc', 'perfil', 'concepto_2_desc', 'Pago directo al 993 365 099 a nombre de Oscar Daniel.'),
  ('concept_3_title', 'perfil', 'concepto_3_titulo', '3. Envíos a Todo el País'),
  ('concept_3_desc', 'perfil', 'concepto_3_desc', 'Envío por Olva Courier, Shalom o Express.')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Shipping
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('shipping_price_lima', 'envios', 'precio_lima', '15'),
  ('shipping_price_provincia', 'envios', 'precio_provincia', '25'),
  ('shipping_price_internacional', 'envios', 'precio_internacional', '80')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- Footer
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('footer_description', 'footer', 'descripcion', 'Marca independiente de Ayacucho especializada en sublimación premium.'),
  ('footer_production', 'footer', 'produccion', 'Producción Express 24-48 hrs'),
  ('footer_collections', 'footer', 'colecciones', 'Colecciones'),
  ('footer_col_1', 'footer', 'col_1', 'Polos Oversized & Boxy Fit'),
  ('footer_col_2', 'footer', 'col_2', 'Vasos Frosted Glass 16oz'),
  ('footer_col_3', 'footer', 'col_3', 'Tazas Térmicas 11oz'),
  ('footer_guarantee_title', 'footer', 'garantia_titulo', 'Garantía & Envíos'),
  ('footer_guarantee_1', 'footer', 'garantia_1', 'Estampados HD de alta resistencia'),
  ('footer_guarantee_2', 'footer', 'garantia_2', 'Envíos directos a todo el país'),
  ('footer_social_title', 'footer', 'social_titulo', 'Síguenos en Redes'),
  ('footer_social_text', 'footer', 'social_texto', 'Encuéntranos en'),
  ('footer_copyright', 'footer', 'copyright', '© 2026 LUMIN SHOP — Ayacucho, Perú. Todos los derechos reservados.')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;

-- WhatsApp order messages
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('whatsapp_order_header', 'whatsapp', 'orden_header', '📦 *DETALLE DE MI PEDIDO*'),
  ('whatsapp_order_total', 'whatsapp', 'orden_total', 'TOTAL DE MI ORDEN:'),
  ('whatsapp_order_closing', 'whatsapp', 'orden_cierre', 'Por favor confírmenme los datos de pago y el tiempo de entrega. ¡Muchas gracias!'),
  ('whatsapp_delivery_home', 'whatsapp', 'envio_domicilio', '🚀 Envío a Domicilio'),
  ('whatsapp_delivery_pickup', 'whatsapp', 'envio_tienda', '🏪 Recojo en Tienda')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor;
