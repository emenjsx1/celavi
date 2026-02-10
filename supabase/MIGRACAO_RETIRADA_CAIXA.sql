-- ============================================
-- MIGRAÇÃO: Permitir retirada no caixa (table_id NULL)
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Remover constraint NOT NULL de table_id em orders
ALTER TABLE orders 
  ALTER COLUMN table_id DROP NOT NULL;

-- Remover foreign key constraint (se existir)
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_table_id_fkey;

-- Recriar foreign key como opcional (ON DELETE SET NULL)
ALTER TABLE orders 
  ADD CONSTRAINT orders_table_id_fkey 
  FOREIGN KEY (table_id) 
  REFERENCES tables(id) 
  ON DELETE SET NULL;

-- ============================================
-- FIM
-- ============================================









