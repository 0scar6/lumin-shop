-- Drop ALL existing policies first
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['usuarios','perfiles','favoritos','pedidos','ideas_personalizadas','productos','categorias'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s public read/write" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Productos visibles para todos" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Categorias visibles para todos" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios ven su perfil" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios crean su perfil" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios editan su perfil" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios ven sus favoritos" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios insertan favoritos" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios eliminan favoritos" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios ven sus pedidos" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios insertan pedidos" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios ven sus ideas" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios insertan ideas" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios ven su propio registro" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios insertan su registro" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Usuarios actualizan su registro" ON %I', t);
  END LOOP;
END $$;

-- Drop foreign keys
ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_usuario_id_fkey;
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_usuario_id_fkey;
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_producto_id_fkey;
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_usuario_id_fkey;
ALTER TABLE ideas_personalizadas DROP CONSTRAINT IF EXISTS ideas_personalizadas_usuario_id_fkey;

-- Convert UUID to TEXT
ALTER TABLE usuarios ALTER COLUMN id TYPE TEXT;
ALTER TABLE productos ALTER COLUMN id TYPE TEXT;
ALTER TABLE perfiles ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE favoritos ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE favoritos ALTER COLUMN producto_id TYPE TEXT;
ALTER TABLE pedidos ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE ideas_personalizadas ALTER COLUMN usuario_id TYPE TEXT;

-- Sync product IDs
UPDATE productos SET id = external_id WHERE external_id IS NOT NULL;

-- Create permissive policies
CREATE POLICY "Productos public read/write" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Categorias public read/write" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Usuarios public read/write" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Perfiles public read/write" ON perfiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Favoritos public read/write" ON favoritos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Pedidos public read/write" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Ideas public read/write" ON ideas_personalizadas FOR ALL USING (true) WITH CHECK (true);
