-- ============================================
-- LUMIN SHOP - Supabase Database Schema
-- ============================================
-- Ejecuta este SQL completo en el SQL Editor de tu dashboard Supabase:
-- https://supabase.com/dashboard → tu proyecto → SQL Editor → New Query → Paste → Run

-- ============================================
-- PASO 1: CREAR TABLAS
-- ============================================

-- TABLA: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icono TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT UNIQUE,
    nombre TEXT NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
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
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    avatar_url TEXT,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: perfiles
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) UNIQUE,
    tema TEXT DEFAULT 'dark',
    nombre_completo TEXT,
    telefono TEXT,
    direccion TEXT,
    dni TEXT,
    updated_at TIMESTAMP
);

-- TABLA: favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    producto_id UUID REFERENCES productos(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- TABLA: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
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

-- TABLA: ideas_personalizadas
CREATE TABLE IF NOT EXISTS ideas_personalizadas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    tipo_producto TEXT,
    descripcion TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PASO 2: INSERTAR CATEGORIAS
-- ============================================

INSERT INTO categorias (nombre, slug, icono, activo, orden) VALUES
('Polos Oversized & Boxy Fit', 'streetwear', 'Shirt', true, 1),
('Vasos Frosted Glass 16oz', 'cups', 'Coffee', true, 2),
('Edición Especial Drop 04', 'drops', 'Flame', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PASO 3: INSERTAR PRODUCTOS (datos actuales de products.ts)
-- ============================================

-- Obtener IDs de categorias
DO $$
DECLARE
    cat_streetwear UUID;
    cat_cups UUID;
BEGIN
    SELECT id INTO cat_streetwear FROM categorias WHERE slug = 'streetwear';
    SELECT id INTO cat_cups FROM categorias WHERE slug = 'cups';

    -- Producto 1: Polo Acid Tokyo
    INSERT INTO productos (external_id, nombre, categoria_id, precio, precio_original, tecnica, tiempo_produccion, imagen, galeria, descripcion, etiqueta, opciones_ropa, personalizable, activo, destacado)
    VALUES (
        'polo-acid-tokyo',
        'Polo Oversized "Acid Tokyo 1988"',
        cat_streetwear,
        79.00,
        95.00,
        'Estampado Urbano HD Ultra-Resistente',
        '⚡ 24-48 hrs',
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
        '["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"]'::jsonb,
        'Confeccionado en algodón reactivo 240g (Heavyweight). Estampado de alta definición con gran intensidad de color y durabilidad.',
        '🔥 DROP 04 BESTSELLER',
        '{"sizes":["S","M","L","XL","XXL"],"fits":["Oversized Streetwear","Boxy Heavyweight","Standard Fit"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Gris Washed","hex":"#374151"},{"name":"Verde Oliva Dark","hex":"#1C2818"},{"name":"Off-White","hex":"#E5E5E0"}]}'::jsonb,
        true,
        true,
        true
    ) ON CONFLICT (external_id) DO NOTHING;

    -- Producto 2: Polo Cyber Lumin
    INSERT INTO productos (external_id, nombre, categoria_id, precio, tecnica, tiempo_produccion, imagen, galeria, descripcion, etiqueta, opciones_ropa, personalizable, activo, destacado)
    VALUES (
        'polo-cyber-lumin',
        'Polo Boxy Fit "LÚMIN Vector Mesh"',
        cat_streetwear,
        75.00,
        'Serigrafía Tacto Cero HD',
        '⚡ 24-48 hrs',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"]'::jsonb,
        'Diseño geométrico minimalista con acabado en tonos pistacho y blanco mate. Corte streetwear holgado con caída pesada.',
        '✨ NUEVO DROP',
        '{"sizes":["S","M","L","XL"],"fits":["Boxy Heavyweight","Oversized Streetwear"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Washed Charcoal","hex":"#262626"}]}'::jsonb,
        true,
        true,
        false
    ) ON CONFLICT (external_id) DO NOTHING;

    -- Producto 3: Polo Mind Matter
    INSERT INTO productos (external_id, nombre, categoria_id, precio, precio_original, tecnica, tiempo_produccion, imagen, descripcion, etiqueta, opciones_ropa, personalizable, activo, destacado)
    VALUES (
        'polo-mind-matter',
        'Polo Minimal "Mind Over Matter"',
        cat_streetwear,
        69.00,
        80.00,
        'Estampado Micro-Print HD',
        '⚡ 24 hrs Express',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
        'Logo sutil en el pecho e ilustración detallada en la espalda. Algodón peruano 20/1 suave y fresco.',
        '⚡ EXPRESS 24H',
        '{"sizes":["S","M","L","XL"],"fits":["Standard Fit","Oversized Streetwear"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Blanco Puro","hex":"#FFFFFF"},{"name":"Verde Pistacho Soft","hex":"#C2D993"}]}'::jsonb,
        true,
        true,
        false
    ) ON CONFLICT (external_id) DO NOTHING;

    -- Producto 4: Polo Gothic Acid
    INSERT INTO productos (external_id, nombre, categoria_id, precio, tecnica, tiempo_produccion, imagen, descripcion, etiqueta, opciones_ropa, personalizable, activo, destacado)
    VALUES (
        'polo-gothic-acid',
        'Polo Heavyweight "Gothic Skull Mono"',
        cat_streetwear,
        85.00,
        'Serigrafía Relieve HD',
        '⚡ 24-48 hrs',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        'Arte gótico reinterpretado con estética urbana. Cuello de rib grueso y costuras reforzadas.',
        '🔥 POPULAR',
        '{"sizes":["M","L","XL","XXL"],"fits":["Oversized Heavyweight"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"}]}'::jsonb,
        false,
        true,
        true
    ) ON CONFLICT (external_id) DO NOTHING;

    -- Producto 5: Vaso Frosted Tokyo
    INSERT INTO productos (external_id, nombre, categoria_id, precio, precio_original, tecnica, tiempo_produccion, imagen, galeria, descripcion, etiqueta, opciones_vaso, personalizable, activo, destacado)
    VALUES (
        'vaso-frosted-tokyo',
        'Vaso Frosted Glass "Tokyo Skyline 16oz"',
        cat_cups,
        45.00,
        55.00,
        'Sublimación Premium 200°C',
        '⚡ 24-48 hrs',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80"]'::jsonb,
        'Vaso de vidrio esmerilado opaco con sorbete y tapa de bambú ecológica. Sublimado continuo full color de alta durabilidad.',
        '🔥 TOP SUBLIMACIÓN',
        '{"types":[{"name":"Vaso Frosted Glass 16oz (Vidrio Esmerilado)","extraPrice":0},{"name":"Vaso Aluminio Térmico 20oz (Mantiene frío 12h)","extraPrice":15},{"name":"Taza Cerámica Matte 11oz","extraPrice":-10}],"finishes":["Acabado Esmerilado Frosted","Brillo Cristal","Textura Mate Tacto"]}'::jsonb,
        true,
        true,
        true
    ) ON CONFLICT (external_id) DO NOTHING;

    -- Producto 6: Taza Lumin Monochrome
    INSERT INTO productos (external_id, nombre, categoria_id, precio, tecnica, tiempo_produccion, imagen, descripcion, etiqueta, opciones_vaso, personalizable, activo, destacado)
    VALUES (
        'taza-lumin-monochrome',
        'Taza Cerámica "LÚMIN Dark Mode 11oz"',
        cat_cups,
        35.00,
        'Sublimación Ultra HD 360°',
        '⚡ 24 hrs Express',
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
        'Cerámica de alta calidad clase A+ negra por dentro con diseño exterior personalizado. Apta para microondas.',
        '⚡ CLÁSICO ESSENTIAL',
        '{"types":[{"name":"Taza Cerámica Negra 11oz","extraPrice":0},{"name":"Taza Cerámica Blanca 11oz","extraPrice":0},{"name":"Taza Mágica Térmica 11oz (Cambia con calor)","extraPrice":12}],"finishes":["Negro Intermitente Matte","Brillante Cristal"]}'::jsonb,
        true,
        true,
        false
    ) ON CONFLICT (external_id) DO NOTHING;

    -- Producto 7: Vaso Aluminio Dark Matter
    INSERT INTO productos (external_id, nombre, categoria_id, precio, precio_original, tecnica, tiempo_produccion, imagen, descripcion, etiqueta, opciones_vaso, personalizable, activo, destacado)
    VALUES (
        'vaso-aluminio-darkmatter',
        'Vaso Térmico Aluminio "Dark Matter 20oz"',
        cat_cups,
        59.00,
        69.00,
        'Sublimación Térmica en Metal',
        '⚡ 24-48 hrs',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        'Vaso hermético de acero/aluminio con aislamiento al vacío de doble pared. Conserva bebidas frías por 18 hrs y calientes por 8 hrs.',
        '✨ EDICIÓN TÉRMINA',
        '{"types":[{"name":"Vaso Aluminio Térmico 20oz (Con sorbete)","extraPrice":0},{"name":"Botella Deportiva 600ml","extraPrice":5}],"finishes":["Acabado Mate Anti-rayaduras","Satinado Metálico"]}'::jsonb,
        true,
        true,
        true
    ) ON CONFLICT (external_id) DO NOTHING;

    -- Producto 8: Polo Retro Arcade
    INSERT INTO productos (external_id, nombre, categoria_id, precio, tecnica, tiempo_produccion, imagen, descripcion, etiqueta, opciones_ropa, personalizable, activo, destacado)
    VALUES (
        'polo-retro-arcade',
        'Polo Heavy "Neon Grid Synth"',
        cat_streetwear,
        78.00,
        'Estampado Urbano HD 12 Colores',
        '⚡ 24-48 hrs',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
        'Combinación de estética retro arcade con cortes rectos modernos. Estampado suave sin sensación rígida.',
        '🔥 POPULAR',
        '{"sizes":["S","M","L","XL"],"fits":["Oversized Streetwear","Boxy Heavyweight"],"colors":[{"name":"Negro Carbón","hex":"#0A0A0A"},{"name":"Gris Washed","hex":"#374151"}]}'::jsonb,
        true,
        true,
        true
    ) ON CONFLICT (external_id) DO NOTHING;

END $$;

-- ============================================
-- PASO 4: CONFIGURAR RLS (SEGURIDAD)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas_personalizadas ENABLE ROW LEVEL SECURITY;

-- Productos: público (todos pueden ver)
CREATE POLICY "Productos visibles para todos" ON productos FOR SELECT USING (true);

-- Categorías: público
CREATE POLICY "Categorías visibles para todos" ON categorias FOR SELECT USING (true);

-- Usuarios: solo el propio usuario puede ver/editar
CREATE POLICY "Usuarios ven su propio registro" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios insertan su registro" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuarios actualizan su registro" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- Perfiles: solo el usuario puede ver/editar su perfil
CREATE POLICY "Usuarios ven su perfil" ON perfiles FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios crean su perfil" ON perfiles FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuarios editan su perfil" ON perfiles FOR UPDATE USING (auth.uid() = usuario_id);

-- Favoritos: solo el usuario puede ver/editar sus favoritos
CREATE POLICY "Usuarios ven sus favoritos" ON favoritos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios insertan favoritos" ON favoritos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuarios eliminan favoritos" ON favoritos FOR DELETE USING (auth.uid() = usuario_id);

-- Pedidos: solo el usuario puede ver sus pedidos
CREATE POLICY "Usuarios ven sus pedidos" ON pedidos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios insertan pedidos" ON pedidos FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Ideas personalizadas: solo el usuario puede ver sus ideas
CREATE POLICY "Usuarios ven sus ideas" ON ideas_personalizadas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios insertan ideas" ON ideas_personalizadas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
