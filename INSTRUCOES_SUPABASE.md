# 🚀 Instruções de Configuração do Supabase

## ✅ O que já foi feito:

1. ✅ Instalado `@supabase/supabase-js`
2. ✅ Criado `lib/supabase.ts` com configuração do cliente
3. ✅ Criado `supabase/schema.sql` com todas as tabelas
4. ✅ Criado `scripts/migrate-to-supabase.ts` para popular dados
5. ✅ Criado `scripts/setup-storage.sql` para configurar storage
6. ✅ Atualizado `app/api/upload/route.ts` para usar Supabase Storage
7. ✅ Adicionado script `npm run migrate` no package.json

## 📋 Passos para completar a configuração:

### 1. Criar arquivo `.env.local`

Crie o arquivo `.env.local` na raiz do projeto com:

```
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjE3NDMsImV4cCI6MjA3OTYzNzc0M30.DqNqaVPZf45XsxN2QcAl2b06Ohaq4vxCmMimdwdKFDw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ
```

### 2. Criar tabelas no Supabase

1. Acesse: https://supabase.com/dashboard/project/cdmzweszhjxdscjhsbma
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `supabase/schema.sql`
4. Clique em **Run**

### 3. Configurar Storage Bucket

1. No Dashboard do Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Nome: `product-images`
4. Marque **Public bucket**
5. Clique em **Create bucket**

### 4. Configurar políticas do Storage

1. No **SQL Editor**, copie e cole o conteúdo de `scripts/setup-storage.sql`
2. Clique em **Run**

### 5. Executar migração de dados

Execute no terminal:

```bash
npm run migrate
```

Este comando irá:
- ✅ Criar usuário admin (frango@gmail.com / 123456)
- ✅ Criar loja "Frango Dourado"
- ✅ Criar 7 categorias (Recomendados, Hambúrgueres, Frango, etc.)
- ✅ Criar 26 produtos com imagens
- ✅ Criar algumas avaliações de exemplo

## 📁 Estrutura das Tabelas

- **users**: Usuários do sistema (id, name, email, password)
- **stores**: Lojas (id, user_id, name, slug, address, phone, email, redes sociais)
- **categories**: Categorias (id, store_id, name, description, order_position)
- **products**: Produtos (id, category_id, store_id, name, description, price, image, is_available, is_hot)
- **reviews**: Avaliações (id, product_id, user_name, rating, comment, created_at)

## 🔄 Próximos Passos (Opcional)

Para migrar completamente do mock data para Supabase, você precisará atualizar:

1. `lib/mock-data.ts` → Criar `lib/db.ts` usando Supabase
2. Todas as rotas de API em `app/api/**/route.ts` para usar Supabase
3. `lib/auth.ts` para autenticação via Supabase

Por enquanto, o sistema continua funcionando com mock data, mas o upload de imagens já está usando Supabase Storage.

## 🎯 Verificação

Após executar a migração, você pode verificar:

1. **Usuário**: No Dashboard → Authentication → Users (deve ter frango@gmail.com)
2. **Dados**: No Dashboard → Table Editor → Verificar stores, categories, products
3. **Storage**: No Dashboard → Storage → product-images (bucket criado)

## ⚠️ Notas Importantes

- O script de migração é **idempotente** (pode rodar múltiplas vezes sem duplicar)
- As imagens dos produtos estão usando URLs do Unsplash (podem ser substituídas depois)
- O bucket `product-images` deve ser público para as imagens aparecerem no cardápio
- As políticas RLS permitem leitura pública e escrita apenas para autenticados










