-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de imagens (apenas autenticados)
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- Política para permitir leitura pública
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir atualização (apenas autenticados)
CREATE POLICY "Authenticated users can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- Política para permitir exclusão (apenas autenticados)
CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );










