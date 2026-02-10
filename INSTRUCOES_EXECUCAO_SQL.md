# Instruções para Executar os Scripts SQL

## Opção 1: Executar o Schema Completo (Recomendado)

Se você está criando o banco do zero ou quer garantir que tudo está correto:

1. Acesse o **SQL Editor** no Supabase
2. Execute o arquivo: `supabase/SCHEMA_COMPLETO.sql`
3. Este script:
   - Cria todas as tabelas necessárias
   - Adiciona colunas faltantes se as tabelas já existirem
   - Cria todos os índices
   - Configura as políticas RLS
   - É **idempotente** (pode ser executado múltiplas vezes)

## Opção 2: Executar Apenas a Migração

Se as tabelas já existem e você só precisa adicionar colunas faltantes:

1. Acesse o **SQL Editor** no Supabase
2. Execute o arquivo: `supabase/MIGRACAO_COLUNAS.sql`
3. Este script adiciona apenas:
   - `preparation_time` na tabela `products`
   - `mpesa_name` na tabela `stores`
   - `emola_name` na tabela `stores`
   - Índices necessários

## Tabelas Criadas

O schema completo cria as seguintes tabelas:

1. **users** - Usuários do sistema
2. **stores** - Lojas/Cardápios
3. **categories** - Categorias de produtos
4. **products** - Produtos do cardápio
5. **tables** - Mesas do restaurante
6. **orders** - Pedidos dos clientes
7. **order_items** - Itens de cada pedido
8. **payment_receipts** - Comprovantes de pagamento
9. **reviews** - Avaliações dos produtos/pedidos

## Colunas Importantes

### Tabela `products`:
- `preparation_time` (INTEGER, default: 5) - Tempo de preparo em minutos

### Tabela `stores`:
- `mpesa_name` (TEXT) - Nome da empresa M-Pesa
- `mpesa_phone` (TEXT) - Número M-Pesa
- `emola_name` (TEXT) - Nome da empresa Emola
- `emola_phone` (TEXT) - Número Emola

### Tabela `reviews`:
- `order_id` (BIGINT) - ID do pedido relacionado (opcional)

## Verificar se Funcionou

Após executar o script, verifique:

```sql
-- Verificar se a coluna preparation_time existe
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'preparation_time';

-- Verificar se as colunas de pagamento existem
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN ('mpesa_name', 'emola_name');
```

## Problemas Comuns

### Erro: "column does not exist"
- Execute o script `MIGRACAO_COLUNAS.sql` primeiro
- Ou execute o `SCHEMA_COMPLETO.sql` que adiciona automaticamente

### Erro: "policy already exists"
- O script já tem `DROP POLICY IF EXISTS`, então pode executar novamente
- Isso é normal e não causa problemas

### Erro: "constraint already exists"
- O script verifica antes de criar constraints
- Pode executar múltiplas vezes sem problemas









