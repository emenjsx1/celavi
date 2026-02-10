# Configuração do Supabase

## Passos para configurar o Supabase

### 1. Criar as tabelas no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o conteúdo do arquivo `supabase/schema.sql`

Ou você pode executar via linha de comando usando o Supabase CLI (se tiver instalado).

### 2. Configurar o Storage Bucket para imagens

1. No Dashboard do Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Nome do bucket: `product-images`
4. Marque como **Public bucket**
5. Clique em **Create bucket**

### 3. Configurar políticas do Storage

No **SQL Editor**, execute:

```sql
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
```

### 4. Executar a migração de dados

Execute o script de migração para popular o banco com os dados iniciais:

```bash
npm run migrate
```

Este script irá:
- Criar o usuário admin (frango@gmail.com / 123456)
- Criar a loja "Frango Dourado"
- Criar todas as categorias
- Criar todos os produtos
- Criar algumas avaliações de exemplo

### 5. Variáveis de ambiente

Certifique-se de que o arquivo `.env.local` está configurado com:

```
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Estrutura das Tabelas

- **users**: Usuários do sistema
- **stores**: Lojas cadastradas
- **categories**: Categorias de produtos
- **products**: Produtos do cardápio
- **reviews**: Avaliações dos produtos

## Notas

- O bucket `product-images` deve ser criado manualmente no Dashboard
- As políticas RLS estão configuradas para permitir leitura pública e escrita apenas para usuários autenticados
- O script de migração é idempotente (pode ser executado múltiplas vezes sem duplicar dados)










