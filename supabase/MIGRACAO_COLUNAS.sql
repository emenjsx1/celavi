-- ============================================
-- SCRIPT DE MIGRAÇÃO - ADICIONAR COLUNAS FALTANTES
-- Execute este script se as tabelas já existem
-- ============================================

-- Adicionar preparation_time na tabela products se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'preparation_time'
  ) THEN
    ALTER TABLE products 
      ADD COLUMN preparation_time INTEGER DEFAULT 5;
  END IF;
END $$;

-- Adicionar mpesa_name na tabela stores se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'mpesa_name'
  ) THEN
    ALTER TABLE stores 
      ADD COLUMN mpesa_name TEXT;
  END IF;
END $$;

-- Adicionar emola_name na tabela stores se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'emola_name'
  ) THEN
    ALTER TABLE stores 
      ADD COLUMN emola_name TEXT;
  END IF;
END $$;

-- Criar índice para preparation_time se não existir
CREATE INDEX IF NOT EXISTS idx_products_preparation_time ON products(preparation_time);

-- Criar índice para reviews.order_id se não existir
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================









