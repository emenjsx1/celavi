-- ============================================
-- CRIAR TABELA DE CUSTOMERS (GUEST USERS)
-- Para salvar dados dos clientes automaticamente
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por telefone
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode criar e ver customers
DROP POLICY IF EXISTS "Anyone can create customers" ON customers;
CREATE POLICY "Anyone can create customers" ON customers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view customers" ON customers;
CREATE POLICY "Anyone can view customers" ON customers
  FOR SELECT USING (true);

-- Função para criar ou atualizar customer automaticamente
CREATE OR REPLACE FUNCTION create_or_update_customer(
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  customer_id BIGINT;
BEGIN
  -- Tentar encontrar customer existente
  SELECT id INTO customer_id
  FROM customers
  WHERE phone = p_phone
  LIMIT 1;

  IF customer_id IS NULL THEN
    -- Criar novo customer
    INSERT INTO customers (name, phone, email)
    VALUES (p_name, p_phone, p_email)
    RETURNING id INTO customer_id;
  ELSE
    -- Atualizar customer existente
    UPDATE customers
    SET 
      name = p_name,
      email = COALESCE(p_email, email),
      updated_at = NOW()
    WHERE id = customer_id;
  END IF;

  RETURN customer_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIM
-- ============================================









