-- ============================================
-- CRIAR TABELA DE CHAMADAS DE ATENDENTE
-- Execute este script no SQL Editor do Supabase
-- ============================================

CREATE TABLE IF NOT EXISTS attendant_calls (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  reason TEXT DEFAULT 'Geral', -- 'Geral', 'Dúvida', 'Problema', 'Outro'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attended', 'cancelled')),
  attended_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  attended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_attendant_calls_store_id ON attendant_calls(store_id);
CREATE INDEX IF NOT EXISTS idx_attendant_calls_table_id ON attendant_calls(table_id);
CREATE INDEX IF NOT EXISTS idx_attendant_calls_status ON attendant_calls(status);
CREATE INDEX IF NOT EXISTS idx_attendant_calls_created_at ON attendant_calls(created_at DESC);

-- Habilitar RLS
ALTER TABLE attendant_calls ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Anyone can create attendant calls" ON attendant_calls;
CREATE POLICY "Anyone can create attendant calls" ON attendant_calls
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Store owners can view calls" ON attendant_calls;
CREATE POLICY "Store owners can view calls" ON attendant_calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = attendant_calls.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Store owners can update calls" ON attendant_calls;
CREATE POLICY "Store owners can update calls" ON attendant_calls
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = attendant_calls.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- ============================================
-- FIM
-- ============================================









