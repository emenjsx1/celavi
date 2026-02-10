-- Script SQL para criar uma mesa de teste
-- Execute este script no SQL Editor do Supabase ou no seu banco de dados

-- Primeiro, vamos buscar o ID da loja "frango-dourado"
-- Se você não souber o ID, descomente a linha abaixo e execute para ver:
-- SELECT id, name, slug FROM stores WHERE slug = 'frango-dourado';

-- Substitua STORE_ID pelo ID real da sua loja
-- Exemplo: INSERT INTO tables (store_id, number, is_active) VALUES (1, 1, true);

-- Ou execute esta query que busca automaticamente:
INSERT INTO tables (store_id, number, is_active)
SELECT id, 1, true
FROM stores
WHERE slug = 'frango-dourado'
LIMIT 1
ON CONFLICT (store_id, number) DO NOTHING;

-- Verificar se foi criada
SELECT * FROM tables WHERE number = 1;









