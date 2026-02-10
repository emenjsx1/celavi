# Como Criar uma Mesa de Teste

## Opção 1: Via Dashboard (Recomendado)

1. Acesse http://localhost:3000/dashboard
2. Faça login
3. Vá para a aba **"Mesas"**
4. Clique em **"+ Nova Mesa"**
5. Digite o número: **1**
6. Marque **"Mesa Ativa"**
7. Clique em **"Salvar"**

## Opção 2: Via SQL (Supabase)

Execute este SQL no SQL Editor do Supabase:

```sql
-- Criar mesa número 1 para a loja "frango-dourado"
INSERT INTO tables (store_id, number, is_active)
SELECT id, 1, true
FROM stores
WHERE slug = 'frango-dourado'
LIMIT 1
ON CONFLICT (store_id, number) DO NOTHING;
```

## Verificar se foi criada

```sql
SELECT t.*, s.name as store_name 
FROM tables t
JOIN stores s ON s.id = t.store_id
WHERE t.number = 1;
```









