-- ============================================================
-- LUMIN SHOP — Row Level Security (RLS) Policies
-- Execute this in Supabase SQL Editor AFTER enabling auth
-- ============================================================

-- STEP 0: Add 'rol' column to usuarios table (run once)
-- ============================================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'user';

-- STEP 1: Disable overly permissive policies
-- ============================================================

-- Drop the old "pub" policies that allow everything
DO $$
BEGIN
  DROP POLICY IF EXISTS "pub" ON categorias;
  DROP POLICY IF EXISTS "pub" ON productos;
  DROP POLICY IF EXISTS "pub" ON usuarios;
  DROP POLICY IF EXISTS "pub" ON perfiles;
  DROP POLICY IF EXISTS "pub" ON favoritos;
  DROP POLICY IF EXISTS "pub" ON carrito;
  DROP POLICY IF EXISTS "pub" ON pedidos;
  DROP POLICY IF EXISTS "pub" ON ideas_personalizadas;
  DROP POLICY IF EXISTS "pub" ON configuracion;
END $$;

-- STEP 2: Public read-only policies (for catalog browsing)
-- ============================================================

-- Productos: Anyone can READ, only admin can INSERT/UPDATE/DELETE
CREATE POLICY "productos_public_read" ON productos
  FOR SELECT USING (true);

CREATE POLICY "productos_admin_insert" ON productos
  FOR INSERT WITH CHECK (auth.uid()::text IN (
    SELECT id FROM usuarios WHERE rol = 'admin'
  ));

CREATE POLICY "productos_admin_update" ON productos
  FOR UPDATE USING (auth.uid()::text IN (
    SELECT id FROM usuarios WHERE rol = 'admin'
  ));

CREATE POLICY "productos_admin_delete" ON productos
  FOR DELETE USING (auth.uid()::text IN (
    SELECT id FROM usuarios WHERE rol = 'admin'
  ));

-- Categorías: Public read
CREATE POLICY "categorias_public_read" ON categorias
  FOR SELECT USING (true);

-- Configuración: Public read (needed for site config), admin write
CREATE POLICY "config_public_read" ON configuracion
  FOR SELECT USING (true);

CREATE POLICY "config_admin_update" ON configuracion
  FOR UPDATE USING (auth.uid()::text IN (
    SELECT id FROM usuarios WHERE rol = 'admin'
  ));

-- STEP 3: Authenticated user policies
-- ============================================================

-- Usuarios: Users can only read/update their own record
CREATE POLICY "usuarios_own_read" ON usuarios
  FOR SELECT USING (
    auth.uid()::text = id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

CREATE POLICY "usuarios_own_insert" ON usuarios
  FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "usuarios_own_update" ON usuarios
  FOR UPDATE USING (
    auth.uid()::text = id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

-- Perfiles: Users can read/update their own profile
CREATE POLICY "perfiles_own_read" ON perfiles
  FOR SELECT USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

CREATE POLICY "perfiles_own_insert" ON perfiles
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "perfiles_own_update" ON perfiles
  FOR UPDATE USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

-- Favoritos: Users manage their own favorites
CREATE POLICY "favoritos_own_read" ON favoritos
  FOR SELECT USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

CREATE POLICY "favoritos_own_insert" ON favoritos
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "favoritos_own_delete" ON favoritos
  FOR DELETE USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

-- Carrito: Users manage their own cart
CREATE POLICY "carrito_own_read" ON carrito
  FOR SELECT USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

CREATE POLICY "carrito_own_insert" ON carrito
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "carrito_own_update" ON carrito
  FOR UPDATE USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

CREATE POLICY "carrito_own_delete" ON carrito
  FOR DELETE USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

-- Pedidos: Users can read their own orders, admin can read all
CREATE POLICY "pedidos_own_read" ON pedidos
  FOR SELECT USING (
    auth.uid()::text = usuario_id OR
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

CREATE POLICY "pedidos_own_insert" ON pedidos
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id);

-- Admin can update order status
CREATE POLICY "pedidos_admin_update" ON pedidos
  FOR UPDATE USING (
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

-- Ideas personalizadas: Users can insert, admin can read all
CREATE POLICY "ideas_own_insert" ON ideas_personalizadas
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id OR usuario_id IS NOT NULL);

CREATE POLICY "ideas_admin_read" ON ideas_personalizadas
  FOR SELECT USING (
    auth.uid()::text IN (SELECT id FROM usuarios WHERE rol = 'admin')
  );

-- STEP 4: Create admin user (run once)
-- ============================================================
-- First create a user via Supabase Auth (sign up in the dashboard or via API),
-- then get their auth.uid() and run:
--
-- INSERT INTO usuarios (id, email, nombre, rol) 
-- VALUES ('YOUR_AUTH_USER_ID', 'admin@luminshop.com', 'Admin', 'admin')
-- ON CONFLICT (id) DO UPDATE SET rol = 'admin';

-- STEP 5: Remove admin password from configuracion (security)
-- ============================================================
-- DELETE FROM configuracion WHERE id = 'admin_password';
