-- ============================================
-- MIGRAÇÃO: Adicionar colunas de métodos de pagamento
-- Execute este script no SQL Editor do Supabase
-- ============================================

DO $$ 
BEGIN
  -- Adicionar mpesa_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'mpesa_name'
  ) THEN
    ALTER TABLE stores ADD COLUMN mpesa_name TEXT;
    RAISE NOTICE 'Coluna mpesa_name adicionada';
  END IF;
  
  -- Adicionar mpesa_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'mpesa_phone'
  ) THEN
    ALTER TABLE stores ADD COLUMN mpesa_phone TEXT;
    RAISE NOTICE 'Coluna mpesa_phone adicionada';
  END IF;
  
  -- Adicionar emola_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'emola_name'
  ) THEN
    ALTER TABLE stores ADD COLUMN emola_name TEXT;
    RAISE NOTICE 'Coluna emola_name adicionada';
  END IF;
  
  -- Adicionar emola_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'emola_phone'
  ) THEN
    ALTER TABLE stores ADD COLUMN emola_phone TEXT;
    RAISE NOTICE 'Coluna emola_phone adicionada';
  END IF;
  
  RAISE NOTICE 'Migração concluída com sucesso!';
END $$;









