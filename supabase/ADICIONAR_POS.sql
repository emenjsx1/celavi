-- ============================================
-- ADICIONAR MÉTODO DE PAGAMENTO POS
-- Execute este script para adicionar 'pos' como opção de pagamento
-- ============================================

-- Remover constraint antiga de payment_method em orders
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Adicionar nova constraint incluindo 'pos'
ALTER TABLE orders 
  ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('cash', 'mpesa', 'emola', 'pos'));

-- Remover constraint antiga de payment_method em payment_receipts (se existir)
ALTER TABLE payment_receipts 
  DROP CONSTRAINT IF EXISTS payment_receipts_payment_method_check;

-- Adicionar nova constraint incluindo 'pos' (se necessário)
ALTER TABLE payment_receipts 
  ADD CONSTRAINT payment_receipts_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'emola', 'pos'));

-- ============================================
-- FIM
-- ============================================









