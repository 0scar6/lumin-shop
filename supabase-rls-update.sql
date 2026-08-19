-- ============================================
-- LUMIN SHOP - Update RLS Policies
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- CONFIGURACION: deshabilitar RLS (es config pública, no necesita protección)
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Configuracion public read" ON configuracion;
DROP POLICY IF EXISTS "Configuracion public update" ON configuracion;
DROP POLICY IF EXISTS "Configuracion public write" ON configuracion;
DROP POLICY IF EXISTS "Configuracion admin write" ON configuracion;
DROP POLICY IF EXISTS "pub" ON configuracion;

-- PERFILES: permitir lectura/escritura a todos (anon)
DROP POLICY IF EXISTS "Usuarios ven su perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios crean su perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios editan su perfil" ON perfiles;

CREATE POLICY "Perfiles public read/write" ON perfiles
  FOR ALL USING (true) WITH CHECK (true);

-- FAVORITOS: permitir lectura/escritura a todos
DROP POLICY IF EXISTS "Usuarios ven sus favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuarios insertan favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuarios eliminan favoritos" ON favoritos;

CREATE POLICY "Favoritos public read/write" ON favoritos
  FOR ALL USING (true) WITH CHECK (true);

-- PEDIDOS: permitir lectura/escritura a todos
DROP POLICY IF EXISTS "Usuarios ven sus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios insertan pedidos" ON pedidos;

CREATE POLICY "Pedidos public read/write" ON pedidos
  FOR ALL USING (true) WITH CHECK (true);

-- IDEAS PERSONALIZADAS: permitir lectura/escritura a todos
DROP POLICY IF EXISTS "Usuarios ven sus ideas" ON ideas_personalizadas;
DROP POLICY IF EXISTS "Usuarios insertan ideas" ON ideas_personalizadas;

CREATE POLICY "Ideas public read/write" ON ideas_personalizadas
  FOR ALL USING (true) WITH CHECK (true);

-- USUARIOS: permitir lectura/escritura a todos
DROP POLICY IF EXISTS "Usuarios ven su propio registro" ON usuarios;
DROP POLICY IF EXISTS "Usuarios insertan su registro" ON usuarios;
DROP POLICY IF EXISTS "Usuarios actualizan su registro" ON usuarios;

CREATE POLICY "Usuarios public read/write" ON usuarios
  FOR ALL USING (true) WITH CHECK (true);
