-- ============================================
-- LUMIN SHOP - ESQUEMA COMPLETO DESDE CERO
-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a supabase.com/dashboard
-- 2. Selecciona tu proyecto
-- 3. SQL Editor > New Query
-- 4. Pega TODO este codigo
-- 5. Click RUN
-- ============================================

-- ELIMINAR TABLAS EXISTENTES (en orden por dependencias)
DROP TABLE IF EXISTS ideas_personalizadas CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

-- ============================================
-- CREAR TABLAS
-- ============================================

-- TABLA: categorias
-- Que guarda: las categorias de productos (polos, vasos, etc)
CREATE TABLE categorias (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    icono TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: productos
-- Que guarda: todos los productos de la tienda
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

-- TABLA: usuarios
-- Que guarda: usuarios que se loguean con Google
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    avatar_url TEXT,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: perfiles
-- Que guarda: datos de envio y preferencias del usuario
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

-- TABLA: favoritos
-- Que guarda: productos que el usuario marco como favorito
CREATE TABLE favoritos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT NOT NULL,
    producto_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- TABLA: pedidos
-- Que guarda: pedidos realizados por WhatsApp
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- TABLA: carrito
-- Que guarda: estado actual del carrito del usuario (se actualiza en tiempo real)
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

-- TABLA: ideas_personalizadas
-- Que guarda: ideas personalizadas que los clientes envian
CREATE TABLE ideas_personalizadas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT NOT NULL,
    tipo_producto TEXT,
    descripcion TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INSERTAR CATEGORIAS
-- ============================================

INSERT INTO categorias (id, nombre, icono, activo, orden) VALUES
('streetwear', 'Polos Oversized & Boxy Fit', 'Shirt', true, 1),
('cups', 'Vasos Frosted Glass 16oz', 'Coffee', true, 2),
('drops', 'Edición Especial Drop 04', 'Flame', true, 3);

-- ============================================
-- INSERTAR PRODUCTOS
-- ============================================

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
 true, true, true);

-- ============================================
-- HABILITAR RLS Y POLITICAS
-- ============================================

-- Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas_personalizadas ENABLE ROW LEVEL SECURITY;

-- POLITICAS: Todo publico (lectura y escritura)
-- La app usa localStorage como fallback local,
-- Supabase es backup remoto sincronizado.

CREATE POLICY "pub" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON perfiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON favoritos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON carrito FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pub" ON ideas_personalizadas FOR ALL USING (true) WITH CHECK (true);
