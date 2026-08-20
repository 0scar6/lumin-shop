-- Agrega la columna 'agotado' a productos para marcar drops finalizados
-- Ejecutar en Supabase SQL Editor

ALTER TABLE productos ADD COLUMN IF NOT EXISTS agotado BOOLEAN DEFAULT false;
