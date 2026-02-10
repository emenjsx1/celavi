# Instruções para Adicionar Colunas de Métodos de Pagamento

## Problema
O erro "Could not find the 'emola_phone' column" indica que as colunas de métodos de pagamento não existem na tabela `stores` do Supabase.

## Solução

### Opção 1: Executar Script de Migração (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `supabase/MIGRACAO_METODOS_PAGAMENTO.sql`
4. Clique em **Run** para executar

### Opção 2: Executar SQL Manualmente

Execute este SQL no SQL Editor do Supabase:

```sql
-- Adicionar colunas de métodos de pagamento
DO $$ 
BEGIN
  -- Adicionar mpesa_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'mpesa_name'
  ) THEN
    ALTER TABLE stores ADD COLUMN mpesa_name TEXT;
  END IF;
  
  -- Adicionar mpesa_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'mpesa_phone'
  ) THEN
    ALTER TABLE stores ADD COLUMN mpesa_phone TEXT;
  END IF;
  
  -- Adicionar emola_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'emola_name'
  ) THEN
    ALTER TABLE stores ADD COLUMN emola_name TEXT;
  END IF;
  
  -- Adicionar emola_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'emola_phone'
  ) THEN
    ALTER TABLE stores ADD COLUMN emola_phone TEXT;
  END IF;
END $$;
```

## Verificação

Após executar, você pode verificar se as colunas foram criadas:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN ('mpesa_name', 'mpesa_phone', 'emola_name', 'emola_phone');
```

## Após a Migração

1. Recarregue a página do dashboard
2. Tente salvar os métodos de pagamento novamente
3. Os dados devem ser salvos corretamente agora









