# 📦 Instruções para Criar Bucket de Comprovantes

## Problema
O bucket `payment-receipts` não existe no Supabase Storage, causando erro ao fazer upload de comprovantes de pagamento.

## Solução

### Passo 1: Criar o Bucket via Dashboard (Método Visual)

1. Acesse o **Supabase Dashboard**
2. Vá em **Storage** (no menu lateral)
3. Clique em **New bucket**
4. Configure:
   - **Name**: `payment-receipts`
   - **Public bucket**: ✅ Marque esta opção (importante!)
   - **File size limit**: 5 MB (ou o tamanho que preferir)
   - **Allowed MIME types**: `image/jpeg,image/png,image/jpg,application/pdf`
5. Clique em **Create bucket**

### Passo 2: Configurar Políticas de Acesso (SQL)

1. No Dashboard, vá em **SQL Editor**
2. Copie e cole o conteúdo do arquivo `supabase/CRIAR_BUCKET_COMPROVANTES.sql`
3. Clique em **Run** para executar

Ou execute este SQL diretamente:

```sql
-- Criar bucket para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete receipts" ON storage.objects;

-- Permitir upload público (clientes precisam fazer upload)
CREATE POLICY "Anyone can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-receipts');

-- Permitir leitura pública
CREATE POLICY "Anyone can view receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts');

-- Permitir exclusão apenas para admins autenticados
CREATE POLICY "Authenticated users can delete receipts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'payment-receipts' AND
    auth.role() = 'authenticated'
  );
```

## Verificação

Após criar o bucket, você pode verificar:

1. Vá em **Storage** no Dashboard
2. Você deve ver o bucket `payment-receipts` listado
3. O bucket deve estar marcado como **Public**

## Teste

Após configurar:

1. Faça um pedido com M-Pesa ou Emola
2. Tente fazer upload do comprovante
3. O upload deve funcionar agora!

## Estrutura de Pastas

Os comprovantes serão salvos na seguinte estrutura:
```
payment-receipts/
  └── receipts/
      └── {order_id}/
          └── {uuid}.{ext}
```

Exemplo:
```
payment-receipts/receipts/123/550e8400-e29b-41d4-a716-446655440000.jpg
```

## Notas Importantes

- ✅ O bucket **deve ser público** para que os comprovantes possam ser visualizados
- ✅ O upload é permitido para qualquer pessoa (clientes não autenticados)
- ✅ Apenas usuários autenticados (admins) podem deletar comprovantes
- ✅ Tamanho máximo recomendado: 5MB
- ✅ Formatos aceitos: JPG, PNG, PDF









