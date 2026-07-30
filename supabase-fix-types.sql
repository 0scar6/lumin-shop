-- ============================================
-- LUMIN SHOP - Fix UUID to TEXT + RLS (safe re-run)
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- 1. Drop ALL existing policies on these tables (clean slate)
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['usuarios','perfiles','favoritos','pedidos','ideas_personalizadas','productos','categorias'])
  LOOP
    -- Drop all policies on this table
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', t || ' public read/write', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Productos visibles para todos', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Categorias visibles para todos', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios ven su perfil', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios crean su perfil', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios editan su perfil', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios ven sus favoritos', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios insertan favoritos', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios eliminan favoritos', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios ven sus pedidos', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios insertan pedidos', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios ven sus ideas', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios insertan ideas', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios ven su propio registro', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios insertan su registro', t);
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON %I', 'Usuarios actualizan su registro', t);
  END LOOP;
END $$;

-- 2. Drop foreign keys
ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_usuario_id_fkey;
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_usuario_id_fkey;
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_producto_id_fkey;
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_usuario_id_fkey;
ALTER TABLE ideas_personalizadas DROP CONSTRAINT IF EXISTS ideas_personalizadas_usuario_id_fkey;

-- 3. Convert UUID columns to TEXT
ALTER TABLE usuarios ALTER COLUMN id TYPE TEXT;
ALTER TABLE productos ALTER COLUMN id TYPE TEXT;
ALTER TABLE perfiles ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE favoritos ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE favoritos ALTER COLUMN producto_id TYPE TEXT;
ALTER TABLE pedidos ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE ideas_personalizadas ALTER COLUMN usuario_id TYPE TEXT;

-- 4. Sync existing product IDs
UPDATE productos SET id = external_id WHERE external_id IS NOT NULL;

-- 5. Create permissive RLS policies (allow all)
CREATE POLICY "Productos public read/write" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Categorias public read/write" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Usuarios public read/write" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Perfiles public read/write" ON perfiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Favoritos public read/write" ON favoritos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Pedidos public read/write" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Ideas public read/write" ON ideas_personalizadas FOR ALL USING (true) WITH CHECK (true);
