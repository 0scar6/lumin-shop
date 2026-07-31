-- ============================================
-- CORRECCIONES: Keys que faltan en configuracion
-- Ejecutar en SQL Editor
-- ============================================

-- Admin password (seguro en DB, no en código)
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('admin_password', 'admin', 'password', 'Ratitaxd12')
ON CONFLICT (id) DO NOTHING;

-- Hero media URLs
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('hero_media_1_url', 'hero', 'media_1_url', ''),
  ('hero_media_2_url', 'hero', 'media_2_url', '')
ON CONFLICT (id) DO NOTHING;

-- Hero street labels (faltaban)
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('hero_street_title', 'hero', 'street_titulo', 'STREETWEAR'),
  ('hero_street_sub', 'hero', 'street_subtitulo', 'Acid Tokyo 1988'),
  ('hero_subli_title', 'hero', 'subli_titulo', 'SUBLIMACIÓN'),
  ('hero_subli_sub', 'hero', 'subli_subtitulo', 'Frosted Glass 16oz')
ON CONFLICT (id) DO NOTHING;

-- Footer columns (faltaban)
INSERT INTO configuracion (id, seccion, clave, valor) VALUES
  ('footer_col_1', 'footer', 'col_1', 'Polos Oversized & Boxy Fit'),
  ('footer_col_2', 'footer', 'col_2', 'Vasos Frosted Glass 16oz'),
  ('footer_col_3', 'footer', 'col_3', 'Tazas Térmicas 11oz'),
  ('footer_col_4', 'footer', 'col_4', 'Edición Especial Drop 04')
ON CONFLICT (id) DO NOTHING;

-- Profile concepts (nombres correctos como los usa el código)
-- Primero eliminar los viejos que tienen nombre incorrecto
DELETE FROM configuracion WHERE id IN (
  'profile_concept_1', 'profile_concept_1_desc',
  'profile_concept_2', 'profile_concept_2_desc',
  'profile_concept_3', 'profile_concept_3_desc',
  'profile_concept_4', 'profile_concept_4_desc',
  'profile_concept_5', 'profile_concept_5_desc',
  'profile_concept_6', 'profile_concept_6_desc'
);

-- Insertar con los nombres que el código realmente usa
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
