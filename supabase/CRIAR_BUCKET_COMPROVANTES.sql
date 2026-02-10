-- ============================================
-- CRIAR BUCKET PARA COMPROVANTES DE PAGAMENTO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar bucket para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLÍTICAS DE ACESSO
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete receipts" ON storage.objects;

-- Política para permitir upload de comprovantes (público - clientes precisam fazer upload)
CREATE POLICY "Anyone can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-receipts');

-- Política para permitir leitura pública dos comprovantes
CREATE POLICY "Anyone can view receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts');

-- Política para permitir exclusão (apenas autenticados - admins)
CREATE POLICY "Authenticated users can delete receipts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'payment-receipts' AND
    auth.role() = 'authenticated'
  );

-- ============================================
-- FIM
-- ============================================









