-- ============================================
-- TABLA CONFIGURACION (textos editables desde Supabase)
-- ============================================
-- Permite editar textos de la tienda sin tocar código.
-- Ejecuta esto UNA SOLA VEZ en tu SQL Editor.

CREATE TABLE IF NOT EXISTS configuracion (
    id TEXT PRIMARY KEY,
    seccion TEXT NOT NULL,
    clave TEXT NOT NULL,
    valor TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(seccion, clave)
);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub" ON configuracion FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INSERTAR TEXTOS POR DEFECTO (valores actuales)
-- ============================================
-- Si un texto no está aquí, se usa el valor hardcodeado del código.
-- Solo inserta los que quieras EDITAR desde Supabase.

INSERT INTO configuracion (id, seccion, clave, valor) VALUES

-- === MARCA / NEGOCIO ===
('brand_name',          'marca',     'nombre',                   'LÚMIN SHOP'),
('brand_slogan',        'marca',     'slogan',                   'URBAN APPAREL & SUBLIMATION'),
('brand_description',   'marca',     'descripcion',              'Marca independiente de ropa urbana streetwear (polos gráficos de alta definición) y vasos/tazas sublimadas de alta temperatura. Trabajamos 100% bajo pedido para garantizar máxima calidad.'),
('brand_phone',         'marca',     'telefono',                 '993 365 099'),
('brand_phone_raw',     'marca',     'telefono_raw',             '51993365099'),
('brand_holder',        'marca',     'titular_yape',             'Oscar Daniel'),
('brand_location',      'marca',     'ubicacion',                'Lima, Perú'),
('brand_instagram',     'marca',     'instagram',                '@.lumin.shop'),
('brand_tiktok',        'marca',     'tiktok',                   '@.lumin.shop'),
('brand_facebook',      'marca',     'facebook',                 '@.lumin.shop'),
('brand_whatsapp_msg',  'marca',     'whatsapp_saludo',          '¡Hola LÚMIN SHOP! ⚡ Quisiera realizar el siguiente pedido:'),
('brand_whatsapp_idea', 'marca',     'whatsapp_idea',            '⚡ *CONSULTA DE IDEA PERSONALIZADA LÚMIN SHOP*'),
('brand_whatsapp_help', 'marca',     'whatsapp_ayuda',           'Hola LÚMIN SHOP! ⚡ Quisiera hacer una consulta o realizar un pedido por WhatsApp.'),

-- === HERO / PÁGINA PRINCIPAL ===
('hero_badge',          'hero',      'badge',                    'Exclusivo — COLECCIÓN BAJO DEMANDA'),
('hero_title_1',        'hero',      'titulo_1',                 'MODA URBANA &'),
('hero_title_2',        'hero',      'titulo_2',                 'VASOS SUBLIMADOS'),
('hero_subtitle_1',     'hero',      'subtitulo_1',              'Polos Sublimados con'),
('hero_subtitle_2',     'hero',      'subtitulo_2',              'Estampado Urbano HD High-Density'),
('hero_description',    'hero',      'descripcion',              'Sin sobre-stock. Fabricado especialmente para ti al confirmar tu orden.'),
('hero_badge_1',        'hero',      'badge_produccion',         '⚡ Producción Express: 24 a 48 hrs'),
('hero_badge_2',        'hero',      'badge_garantia',           '🛡️ Garantía de Fijación Térmica & Color'),
('hero_cta_catalogo',   'hero',      'cta_catalogo',             'EXPLORAR CATÁLOGO'),
('hero_cta_idea',       'hero',      'cta_idea',                 'Personalizar Mi Idea'),
('hero_street_title',   'hero',      'street_titulo',            'STREETWEAR'),
('hero_street_sub',     'hero',      'street_subtitulo',         'Acid Tokyo 1988'),
('hero_subli_title',    'hero',      'subli_titulo',             'SUBLIMACIÓN'),
('hero_subli_sub',      'hero',      'subli_subtitulo',          'Frosted Glass 16oz'),

-- === SECCIONES PÁGINA PRINCIPAL ===
('section_about_title',     'secciones',  'sobre_titulo',         'Sobre LÚMIN SHOP'),
('section_about_handle',    'secciones',  'sobre_handle',        '@.lumin.shop'),
('section_about_location',  'secciones',  'sobre_ubicacion',     '📍 Lima, Perú • Envíos a Nivel Nacional'),
('section_about_subtitle',  'secciones',  'sobre_subtitulo',     'Ropa Urbana Streetwear & Sublimación de Alta Temperatura'),
('section_about_text',      'secciones',  'sobre_texto',         'LÚMIN SHOP es una marca independiente peruana dedicada al diseño y confección de streetwear exclusivo y artículos gráficos. Nos especializamos en polos <strong>Oversized & Boxy Fit</strong> producidos en algodón reactivo de 240g (Heavyweight) de máxima durabilidad, además de <strong>Vasos Frosted Glass de 16oz</strong> y <strong>Tazas Térmicas de 11oz</strong> sublimadas térmicamente a 200°C. Cada prenda y producto se elabora 100% bajo pedido con acabado profesional.'),
('section_about_cta_cat',    'secciones',  'sobre_cta_catalogo',  'Explorar Catálogo de Productos'),
('section_about_cta_idea',   'secciones',  'sobre_cta_idea',      'Cotizar Idea Personalizada'),
('section_featured_title',   'secciones',  'destacados_titulo',   '🔥 SELECCIÓN DESTACADA DROP 04'),
('section_featured_sub',     'secciones',  'destacados_subtitulo','Nuestros Más Pedidos'),
('section_featured_cta',     'secciones',  'destacados_cta',      'Ver Catálogo Completo'),

-- === FOOTER ===
('footer_description',   'footer',    'descripcion',              'Marca independiente de ropa urbana streetwear (polos gráficos de alta definición) y vasos/tazas sublimadas de alta temperatura. Trabajamos 100% bajo pedido para garantizar máxima calidad.'),
('footer_production',    'footer',    'produccion',               'Producción Express 24-48 hrs'),
('footer_collections',   'footer',    'colecciones',              'Colecciones'),
('footer_guarantee',     'footer',    'garantia_titulo',          'Garantía & Envíos'),
('footer_guarantee_1',   'footer',    'garantia_1',               'Estampados HD de alta resistencia'),
('footer_guarantee_2',   'footer',    'garantia_2',               'Envíos directos a todo el país'),
('footer_guarantee_3',   'footer',    'garantia_3',               'Pagos seguros: Yape, Plin, Transferencia o Tarjeta'),
('footer_social_title',  'footer',    'social_titulo',            'Síguenos en Redes'),
('footer_social_text',   'footer',    'social_texto',             'Encuéntranos en TikTok, Facebook e Instagram como @.lumin.shop'),
('footer_copyright',     'footer',    'copyright',                '© 2026 LÚMIN SHOP. Todos los derechos reservados. Moda Urbana & Sublimación Bajo Pedido.'),

-- === PRODUCTION BADGE BAR ===
('badge_model_title',    'badges',    'modelo_titulo',            'MODELO SUSTENTABLE BAJO DEMANDA'),
('badge_model_subtitle', 'badges',    'modelo_subtitulo',         '¿CÓMO FUNCIONA LÚMIN SHOP?'),
('badge_model_desc',     'badges',    'modelo_descripcion',       'Cero sobre-stock, mayor frescura en estampados y acabados totalmente personalizados para ti.'),
('badge_step1_title',    'badges',    'paso1_titulo',             'Eliges y Configuras'),
('badge_step1_desc',     'badges',    'paso1_descripcion',        'Seleccionas tu prenda o vaso, talla, corte, color o texto personal.'),
('badge_step2_title',    'badges',    'paso2_titulo',             'Producción 24-48h'),
('badge_step2_desc',     'badges',    'paso2_descripcion',        'Estampamos con serigrafía/fijación térmica o sublimamos a 200°C con máxima fijación.'),
('badge_step3_title',    'badges',    'paso3_titulo',             'Despacho & Entrega'),
('badge_step3_desc',     'badges',    'paso3_descripcion',        'Empacamos con cuidado y enviamos a la puerta de tu domicilio.'),

-- === CARRITO / CHECKOUT ===
('cart_empty_title',     'carrito',   'vacio_titulo',             'Tu pedido está vacío por el momento'),
('cart_empty_desc',      'carrito',   'vacio_descripcion',        'Agrega polos streetwear o vasos/tazas con tu personalización preferida para generar tu orden.'),
('cart_empty_cta',       'carrito',   'vacio_cta',                'IR AL CATÁLOGO'),
('cart_process_title',   'carrito',   'proceso_titulo',           'PROCESO DE FABRICACIÓN BAJO PEDIDO:'),
('cart_process_desc',    'carrito',   'proceso_descripcion',      'Envías la orden a WhatsApp, iniciamos producción digital/artesanal (24-48h) y despachamos a tu domicilio.'),
('cart_send_whatsapp',   'carrito',   'enviar_whatsapp',          'ENVIAR PEDIDO POR WHATSAPP'),
('cart_copy_order',      'carrito',   'copiar_pedido',            'Copiar Resumen de Pedido'),

-- === PERFIL ===
('profile_title',        'perfil',    'titulo',                   'MI CUENTA & PREFERENCIAS'),
('profile_concepts',     'perfil',    'conceptos_titulo',         '3. Conceptos del Servicio LÚMIN SHOP:'),
('profile_concepts_sub', 'perfil',    'conceptos_subtitulo',      'Garantía 100%'),
('profile_concept_1',    'perfil',    'concepto_1_titulo',        '1. Tiempos de Elaboración:'),
('profile_concept_1_desc','perfil',   'concepto_1_descripcion',   'Confección y sublimación personalizada en 24 a 48 hrs hábiles antes del despacho final.'),
('profile_concept_2',    'perfil',    'concepto_2_titulo',        '2. Pagos Yape / Plin / BCP:'),
('profile_concept_2_desc','perfil',   'concepto_2_descripcion',   'Pago seguro al 993 365 099 a nombre de LÚMIN SHOP. Aceptamos BCP, BBVA e Interbank.'),
('profile_concept_3',    'perfil',    'concepto_3_titulo',        '3. Envíos Gratis & Cobertura:'),
('profile_concept_3_desc','perfil',   'concepto_3_descripcion',   'Gratis por compras desde S/ 200. Envíos con Olva Courier, Shalom o Motorizado Express.'),
('profile_concept_4',    'perfil',    'concepto_4_titulo',        '4. Algodón 24/1 & Sublimación HD:'),
('profile_concept_4_desc','perfil',   'concepto_4_descripcion',   'Telas reactivas de alto gramaje y estampado HD 1200 DPI de máxima fijación resistente a lavados.'),
('profile_concept_5',    'perfil',    'concepto_5_titulo',        '5. Asesoría Directa WhatsApp:'),
('profile_concept_5_desc','perfil',   'concepto_5_descripcion',   'Coordinación personalizada en tiempo real para validar tu talla, color y datos de entrega antes de producir.'),
('profile_concept_6',    'perfil',    'concepto_6_titulo',        '6. Garantía de Calidad LÚMIN:'),
('profile_concept_6_desc','perfil',   'concepto_6_descripcion',   '100% de cobertura ante defectos o fallas de estampado. Reemplazo o ajuste inmediato sin complicaciones.'),
('profile_footer',       'perfil',    'pie_pagina',               'LÚMIN SHOP v2.0 • Urbano & Sublimación');

-- ============================================
-- FIN - Los textos que no estén aquí se mantienen
-- como hardcodeados en el código original.
-- ============================================
