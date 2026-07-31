-- ============================================
-- TODAS LAS KEYS DE CONFIGURACION FALTANTES
-- Ejecutar en SQL Editor de Supabase
-- ============================================

-- Admin password
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('admin_password', 'admin', 'password', 'Ratitaxd12')
ON CONFLICT (id) DO NOTHING;

-- Hero media URLs
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('hero_media_1_url', 'hero', 'media_1_url', ''),
  ('hero_media_2_url', 'hero', 'media_2_url', '')
ON CONFLICT (id) DO NOTHING;

-- Hero sub-labels
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('hero_street_title', 'hero', 'street_titulo', 'STREETWEAR'),
  ('hero_street_sub', 'hero', 'street_subtitulo', 'Acid Tokyo 1988'),
  ('hero_subli_title', 'hero', 'subli_titulo', 'SUBLIMACIÓN'),
  ('hero_subli_sub', 'hero', 'subli_subtitulo', 'Frosted Glass 16oz')
ON CONFLICT (id) DO NOTHING;

-- Social bar
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('social_bar_title', 'social', 'titulo', 'WhatsApp & Redes Oficiales'),
  ('social_bar_text', 'social', 'texto', 'Contacto directo'),
  ('social_bar_sub', 'social', 'subtitulo', 'Respuesta inmediata')
ON CONFLICT (id) DO NOTHING;

-- Header
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('header_badge', 'header', 'badge', 'Atención por Pedido'),
  ('header_search', 'header', 'buscar', 'Buscar polo, taza, oversized...'),
  ('header_search_mobile', 'header', 'buscar_mobile', 'Buscar por modelo o tipo...'),
  ('header_profile_btn', 'header', 'perfil_btn', 'Yo'),
  ('header_whatsapp_btn', 'header', 'whatsapp_btn', 'Ayuda'),
  ('header_cart_btn', 'header', 'carrito_btn', 'Mi Pedido')
ON CONFLICT (id) DO NOTHING;

-- Floating Dock nav
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('nav_home', 'navegacion', 'inicio', 'Inicio'),
  ('nav_catalog', 'navegacion', 'catalogo', 'Catálogo'),
  ('nav_favorites', 'navegacion', 'favoritos', 'Favoritos'),
  ('nav_cart', 'navegacion', 'pedido', 'Pedido'),
  ('nav_profile', 'navegacion', 'mi_cuenta', 'Mi Cuenta')
ON CONFLICT (id) DO NOTHING;

-- Catalog
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('catalog_label', 'catalogo', 'label', 'PANTALLA DE CATÁLOGO & PRODUCTOS'),
  ('catalog_title', 'catalogo', 'titulo', 'COLECCIÓN DISPONIBLE'),
  ('catalog_subtitle', 'catalogo', 'subtitulo', 'Explora nuestra colección de productos sublimados'),
  ('catalog_filter_technique', 'catalogo', 'filtro_tecnica', 'Técnica:'),
  ('catalog_filter_all', 'catalogo', 'filtro_todas', 'Todas'),
  ('catalog_filter_textile', 'catalogo', 'filtro_textil', 'Textil HD'),
  ('catalog_filter_sublimation', 'catalogo', 'filtro_sublimado', 'Sublimado 200°C'),
  ('catalog_sort_featured', 'catalogo', 'orden_destacados', 'Destacados Drop'),
  ('catalog_sort_price_asc', 'catalogo', 'orden_precio_menor', 'Precio: Menor a Mayor'),
  ('catalog_sort_price_desc', 'catalogo', 'orden_precio_mayor', 'Precio: Mayor a Menor'),
  ('catalog_empty', 'catalogo', 'vacio', 'No se encontraron productos con los filtros seleccionados.'),
  ('catalog_reset_filters', 'catalogo', 'resetear_filtros', 'Restablecer Filtros')
ON CONFLICT (id) DO NOTHING;

-- Favorites
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('favorites_label', 'favoritos', 'label', 'PANTALLA DE MIS FAVORITOS'),
  ('favorites_title', 'favoritos', 'titulo', 'PRODUCTOS GUARDADOS'),
  ('favorites_clear', 'favoritos', 'vaciar', 'Vaciar Favoritos'),
  ('favorites_empty_title', 'favoritos', 'vacio_titulo', 'Aún no tienes productos guardados'),
  ('favorites_empty_desc', 'favoritos', 'vacio_desc', 'Explora el catálogo y presiona el corazón en los polos o vasos que más te gusten para guardarlos aquí.'),
  ('favorites_empty_cta', 'favoritos', 'vacio_cta', 'EXPLORAR CATÁLOGO')
ON CONFLICT (id) DO NOTHING;

-- Cart
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('cart_label', 'carrito', 'label', 'PANTALLA DE PEDIDO & PROCESAMIENTO'),
  ('cart_title', 'carrito', 'titulo', 'MI PEDIDO LUMIN'),
  ('cart_clear', 'carrito', 'vaciar', 'Vaciar Carrito'),
  ('cart_empty_title', 'carrito', 'vacio_titulo', 'Tu pedido está vacío por el momento'),
  ('cart_empty_desc', 'carrito', 'vacio_desc', 'Agrega polos streetwear o vasos/tazas con tu personalización preferida para generar tu orden.'),
  ('cart_empty_cta', 'carrito', 'vacio_cta', 'IR AL CATÁLOGO'),
  ('cart_process_title', 'carrito', 'proceso_titulo', 'PROCESO DE FABRICACIÓN BAJO PEDIDO:'),
  ('cart_process_desc', 'carrito', 'proceso_desc', 'Envías la orden a WhatsApp, iniciamos producción digital/artesanal (24-48h) y despachamos a tu domicilio.'),
  ('cart_payment_title', 'carrito', 'pago_titulo', 'Pago Yape / Plin Directo'),
  ('cart_payment_holder', 'carrito', 'pago_titular', 'Titular: Oscar Daniel (LUMIN SHOP)'),
  ('cart_phone_copied', 'carrito', 'telefono_copiado', '¡Número 993365099 Copiado!'),
  ('cart_phone_copy', 'carrito', 'copiar_telefono', 'Copiar Número Yape / Plin'),
  ('cart_shipping_title', 'carrito', 'envio_titulo', 'Datos para el envío:'),
  ('cart_form_name_label', 'carrito', 'form_nombre_label', 'Nombre Completo:'),
  ('cart_form_name_placeholder', 'carrito', 'form_nombre_placeholder', 'Tu nombre...'),
  ('cart_form_address_label', 'carrito', 'form_direccion_label', 'Dirección de Entrega:'),
  ('cart_form_address_placeholder', 'carrito', 'form_direccion_placeholder', 'Av, Calle, Dpto y Referencia...'),
  ('cart_delivery_home', 'carrito', 'envio_domicilio', '🚀 Envío Domicilio'),
  ('cart_delivery_pickup', 'carrito', 'envio_tienda', '🏪 Recojo en Tienda'),
  ('cart_total_label', 'carrito', 'total_label', 'Total a Pagar:'),
  ('cart_item_size', 'carrito', 'item_talla', 'Talla:'),
  ('cart_item_fit', 'carrito', 'item_corte', 'Fit:'),
  ('cart_item_custom_text', 'carrito', 'item_texto', 'Texto personalizado:'),
  ('cart_order_copied', 'carrito', 'orden_copiada', '¡Texto de Orden Copiado!'),
  ('cart_copy_order', 'carrito', 'copiar_orden', 'Copiar Texto de Pedido Completo')
ON CONFLICT (id) DO NOTHING;

-- Profile
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('profile_label', 'perfil', 'label', 'PANTALLA DE PERFIL & CONFIGURACIÓN "YO"'),
  ('profile_title', 'perfil', 'titulo', 'MI CUENTA & PREFERENCIAS'),
  ('profile_stat_activity', 'perfil', 'stat_actividad', 'Actividad'),
  ('profile_stat_products_viewed', 'perfil', 'stat_vistos', 'Productos vistos'),
  ('profile_stat_collection', 'perfil', 'stat_coleccion', 'Colección'),
  ('profile_stat_favorites', 'perfil', 'stat_favoritos', 'Favoritos'),
  ('profile_stat_history', 'perfil', 'stat_historial', 'Historial'),
  ('profile_stat_orders', 'perfil', 'stat_pedidos', 'Pedidos'),
  ('profile_appearance_title', 'perfil', 'apariencia_titulo', '1. Apariencia Visual del Sitio Web'),
  ('theme_dark_label', 'perfil', 'tema_oscuro', 'Oscuro (Clásico)'),
  ('theme_dark_desc', 'perfil', 'tema_oscuro_desc', 'Verde Neón & Negro'),
  ('theme_amoled_desc', 'perfil', 'tema_amoled_desc', 'Negro Absoluto #000'),
  ('theme_light_label', 'perfil', 'tema_claro', 'Modo Claro'),
  ('theme_light_desc', 'perfil', 'tema_claro_desc', 'Fondo Claro Limpio'),
  ('profile_data_title', 'perfil', 'datos_titulo', '2. Mis Datos para Autocompletar Pedidos'),
  ('profile_label_name', 'perfil', 'label_nombre', 'Nombre y Apellido'),
  ('profile_placeholder_name', 'perfil', 'placeholder_nombre', 'Ej. Carlos Mendoza'),
  ('profile_label_phone', 'perfil', 'label_telefono', 'WhatsApp / Teléfono'),
  ('profile_placeholder_phone', 'perfil', 'placeholder_telefono', 'Ej. 987654321'),
  ('profile_label_dni', 'perfil', 'label_dni', 'DNI / RUC (Comprobante)'),
  ('profile_placeholder_dni', 'perfil', 'placeholder_dni', 'Ej. 72839401'),
  ('profile_label_address', 'perfil', 'label_direccion', 'Dirección de Entrega'),
  ('profile_placeholder_address', 'perfil', 'placeholder_direccion', 'Av, Calle y Distrito...'),
  ('profile_save_success', 'perfil', 'guardado_exito', '¡INFORMACIÓN GUARDADA CON ÉXITO!'),
  ('profile_save_button', 'perfil', 'guardar_btn', 'GUARDAR MI INFORMACIÓN EN MI NAVEGADOR'),
  ('profile_concepts_title', 'perfil', 'conceptos_titulo', '3. Conceptos Clave del Servicio LUMIN SHOP')
ON CONFLICT (id) DO NOTHING;

-- Custom Idea
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('custom_idea_badge', 'idea_personalizada', 'badge', 'COTIZACIÓN DE PRODUCTO SUBLIMADO'),
  ('custom_idea_title', 'idea_personalizada', 'titulo', '¿Tienes un diseño en mente?'),
  ('custom_idea_desc', 'idea_personalizada', 'desc', 'Escríbenos tu idea, logo o frase y te ayudaremos a sublimarlo en vasos, tazas, polos o placas de aluminio.'),
  ('custom_idea_type_label', 'idea_personalizada', 'tipo_label', 'Tipo de Producto:'),
  ('custom_idea_type_polo', 'idea_personalizada', 'tipo_polo', '👕 Polo Sublimado'),
  ('custom_idea_type_cup', 'idea_personalizada', 'tipo_vaso', '☕ Vaso/Taza'),
  ('custom_idea_type_other', 'idea_personalizada', 'tipo_otro', '⚡ Otro'),
  ('custom_idea_text_label', 'idea_personalizada', 'texto_label', 'Describe tu idea o mensaje:'),
  ('custom_idea_placeholder', 'idea_personalizada', 'placeholder', 'Ej: Quiero un polo oversized negro...'),
  ('custom_idea_cta', 'idea_personalizada', 'cta', 'COTIZAR IDEA POR WHATSAPP')
ON CONFLICT (id) DO NOTHING;

-- Footer columns
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('footer_col_1', 'footer', 'col_1', 'Polos Oversized & Boxy Fit'),
  ('footer_col_2', 'footer', 'col_2', 'Vasos Frosted Glass 16oz'),
  ('footer_col_3', 'footer', 'col_3', 'Tazas Térmicas 11oz'),
  ('footer_col_4', 'footer', 'col_4', 'Edición Especial Drop 04')
ON CONFLICT (id) DO NOTHING;

-- Profile concepts (nombres correctos)
DELETE FROM configuracion WHERE id IN (
  'profile_concept_1', 'profile_concept_1_desc',
  'profile_concept_2', 'profile_concept_2_desc',
  'profile_concept_3', 'profile_concept_3_desc'
);

INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('concept_1_title', 'perfil', 'concepto_1_titulo', '1. Elaboración Bajo Pedido'),
  ('concept_1_desc', 'perfil', 'concepto_1_descripcion', 'Producción y sublimación personalizada en 24 a 48 hrs hábiles antes de despachar.'),
  ('concept_2_title', 'perfil', 'concepto_2_titulo', '2. Pagos Yape / Plin / Bancos'),
  ('concept_2_desc', 'perfil', 'concepto_2_descripcion', 'Pago directo al 993 365 099 a nombre de Oscar Daniel (LUMIN SHOP) o BCP / Interbank.'),
  ('concept_3_title', 'perfil', 'concepto_3_titulo', '3. Envíos Gratis (S/ 200+)'),
  ('concept_3_desc', 'perfil', 'concepto_3_descripcion', 'Envío sin costo en compras mayores a S/ 200 vía Olva Courier, Shalom o Express.'),
  ('concept_4_title', 'perfil', 'concepto_4_titulo', '4. Algodón Reactivo & Sublimado HD'),
  ('concept_4_desc', 'perfil', 'concepto_4_descripcion', 'Telas 24/1 de alto gramaje y sublimación térmica 1200 DPI que no se despinta ni se agrieta.'),
  ('concept_5_title', 'perfil', 'concepto_5_titulo', '5. Verificación por WhatsApp'),
  ('concept_5_desc', 'perfil', 'concepto_5_descripcion', 'Atención personalizada humana para revisar tu diseño, confirmación de talla y datos antes del envío.'),
  ('concept_6_title', 'perfil', 'concepto_6_titulo', '6. Garantía de Satisfacción'),
  ('concept_6_desc', 'perfil', 'concepto_6_descripcion', 'Reemplazo o reembolso inmediato ante cualquier falla de fábrica o problemas en el estampado.')
ON CONFLICT (id) DO NOTHING;
