# 🔍 Diagnóstico de Conexão com Supabase

## ⚠️ Problema: Dados Vazios

Se você está vendo todos os dados vazios, isso geralmente significa que o Supabase não está conectado corretamente.

## 🔧 Como Diagnosticar

### 1. Teste a Conexão

Acesse esta URL no seu navegador (ou use curl):

**Local:**
```
http://localhost:3000/api/test-supabase
```

**Produção (Vercel):**
```
https://frangodouradoo.vercel.app/api/test-supabase
```

Esta rota vai mostrar:
- ✅ Se o Supabase está configurado
- ✅ Se as variáveis de ambiente estão definidas
- ✅ Se consegue conectar com o banco
- ✅ Quantas lojas existem no banco

### 2. Verifique as Variáveis de Ambiente

#### No Vercel:

1. Acesse https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Verifique se estas variáveis estão configuradas:

```
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:**
- Todas devem estar marcadas para **Production**, **Preview** e **Development**
- Após adicionar/alterar variáveis, você **DEVE fazer um redeploy**

#### Localmente:

Verifique se o arquivo `.env.local` existe e contém:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjE3NDMsImV4cCI6MjA3OTYzNzc0M30.DqNqaVPZf45XsxN2QcAl2b06Ohaq4vxCmMimdwdKFDw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ
```

### 3. Verifique os Logs do Servidor

No Vercel:
1. Vá em **Deployments**
2. Clique no deployment mais recente
3. Clique em **View Function Logs**
4. Procure por mensagens como:
   - `✅ Supabase configurado`
   - `⚠️ Supabase não está configurado`
   - `❌ Erro ao buscar...`

### 4. Verifique se o Banco Tem Dados

1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard/project/cdmzweszhjxdscjhsbma
2. Vá em **Table Editor**
3. Verifique se as tabelas existem e têm dados:
   - `stores` - deve ter pelo menos 1 loja
   - `categories` - deve ter categorias
   - `products` - deve ter produtos
   - `users` - deve ter usuários

## 🔧 Soluções Comuns

### Problema 1: Variáveis não configuradas no Vercel

**Solução:**
1. Adicione as variáveis no Vercel (veja passo 2 acima)
2. Faça um **redeploy** após adicionar
3. Aguarde o deploy terminar
4. Teste novamente em `/api/test-supabase`

### Problema 2: Banco de dados vazio

**Solução:**
Execute a migração de dados:

```bash
npm run migrate
```

Ou manualmente no Supabase SQL Editor:
1. Execute o script `supabase/schema.sql` para criar as tabelas
2. Execute o script `scripts/migrate-to-supabase.ts` para popular dados

### Problema 3: Variáveis com valores incorretos

**Solução:**
1. Verifique se copiou as chaves corretas do Supabase
2. Não deve ter espaços extras ou quebras de linha
3. As chaves devem começar com `eyJ...` (JWT)

### Problema 4: Tabelas não existem

**Solução:**
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o conteúdo de `supabase/schema.sql`
4. Verifique se as tabelas foram criadas em **Table Editor**

## 📊 Interpretando o Resultado do Teste

### ✅ Sucesso:
```json
{
  "success": true,
  "message": "Supabase conectado com sucesso!",
  "test": {
    "canQuery": true,
    "storesCount": 1,
    "stores": [...]
  }
}
```

### ❌ Erro - Não Configurado:
```json
{
  "success": false,
  "message": "Supabase não está configurado",
  "error": "Verifique as variáveis de ambiente..."
}
```
**Ação:** Configure as variáveis no Vercel e faça redeploy

### ❌ Erro - Não Conecta:
```json
{
  "success": false,
  "message": "Erro ao conectar com Supabase",
  "error": "..."
}
```
**Ação:** Verifique se as chaves estão corretas e se o projeto Supabase está ativo

## 🆘 Ainda com Problemas?

1. Verifique os logs do servidor (Vercel Function Logs)
2. Teste a conexão em `/api/test-supabase`
3. Verifique se o projeto Supabase está ativo
4. Confirme que as variáveis estão configuradas para todos os ambientes (Production, Preview, Development)







