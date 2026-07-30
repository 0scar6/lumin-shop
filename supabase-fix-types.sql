-- ============================================
-- LUMIN SHOP - Fix column types for app compatibility
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- Drop existing foreign key constraints first
ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_usuario_id_fkey;
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_usuario_id_fkey;
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_producto_id_fkey;
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_usuario_id_fkey;
ALTER TABLE ideas_personalizadas DROP CONSTRAINT IF EXISTS ideas_personalizadas_usuario_id_fkey;

-- Change ID columns from UUID to TEXT
ALTER TABLE usuarios ALTER COLUMN id TYPE TEXT;
ALTER TABLE productos ALTER COLUMN id TYPE TEXT;
ALTER TABLE perfiles ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE favoritos ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE favoritos ALTER COLUMN producto_id TYPE TEXT;
ALTER TABLE pedidos ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE ideas_personalizadas ALTER COLUMN usuario_id TYPE TEXT;

-- Update productos: set external_id as the id value
UPDATE productos SET id = external_id WHERE external_id IS NOT NULL;

-- Update RLS policies for public read/write
DROP POLICY IF EXISTS "Productos visibles para todos" ON productos;
CREATE POLICY "Productos public read/write" ON productos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Categorias visibles para todos" ON categorias;
CREATE POLICY "Categorias public read/write" ON categorias FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios ven su perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios crean su perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios editan su perfil" ON perfiles;
CREATE POLICY "Perfiles public read/write" ON perfiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios ven sus favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuarios insertan favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuarios eliminan favoritos" ON favoritos;
CREATE POLICY "Favoritos public read/write" ON favoritos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios ven sus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios insertan pedidos" ON pedidos;
CREATE POLICY "Pedidos public read/write" ON pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios ven sus ideas" ON ideas_personalizadas;
DROP POLICY IF EXISTS "Usuarios insertan ideas" ON ideas_personalizadas;
CREATE POLICY "Ideas public read/write" ON ideas_personalizadas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios ven su propio registro" ON usuarios;
DROP POLICY IF EXISTS "Usuarios insertan su registro" ON usuarios;
DROP POLICY IF EXISTS "Usuarios actualizan su registro" ON usuarios;
CREATE POLICY "Usuarios public read/write" ON usuarios FOR ALL USING (true) WITH CHECK (true);
