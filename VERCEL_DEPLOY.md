# 🚀 Guia de Deploy no Vercel

## ⚠️ Erro 500 no `/api/auth/session`

Este erro ocorre porque as variáveis de ambiente **não estão configuradas no Vercel**.

## 📋 Variáveis de Ambiente Obrigatórias

Configure as seguintes variáveis de ambiente no painel do Vercel:

### 1. Acesse o Painel do Vercel
1. Vá para https://vercel.com
2. Faça login na sua conta
3. Selecione seu projeto **frangodouradoo** (ou o nome do seu projeto)
4. Vá em **Settings** → **Environment Variables**

### 2. Adicione as Variáveis

#### NextAuth (Obrigatório - DEVE ser configurado!)

**Variável 1: NEXTAUTH_URL**
```
Nome: NEXTAUTH_URL
Valor: https://frangodouradoo.vercel.app
Ambientes: Production, Preview, Development
```

**Variável 2: NEXTAUTH_SECRET**
```
Nome: NEXTAUTH_SECRET
Valor: [GERE UMA CHAVE ALEATÓRIA - veja instruções abaixo]
Ambientes: Production, Preview, Development
```

**Para gerar o NEXTAUTH_SECRET:**

**Opção 1 - Online (Mais Fácil):**
1. Acesse: https://generate-secret.vercel.app/32
2. Copie a chave gerada
3. Cole no campo "Valor" da variável

**Opção 2 - PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Opção 3 - Terminal (Linux/Mac):**
```bash
openssl rand -base64 32
```

#### Supabase (Obrigatório se usar banco de dados)
```
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjE3NDMsImV4cCI6MjA3OTYzNzc0M30.DqNqaVPZf45XsxN2QcAl2b06Ohaq4vxCmMimdwdKFDw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ
```

### 3. Ambiente de Deploy

Selecione **Production**, **Preview** e **Development** para todas as variáveis.

### 4. Redeploy

Após adicionar as variáveis:
1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deployment
3. Selecione **Redeploy**

## 🔍 Verificando se Funcionou

Após o redeploy, acesse:
- https://frangodouradoo.vercel.app/login
- https://frangodouradoo.vercel.app

O erro 500 deve desaparecer! ✅

## ⚠️ IMPORTANTE

1. **NEXTAUTH_URL**: Deve ser exatamente a URL do seu site no Vercel (com `https://`)
2. **NEXTAUTH_SECRET**: Deve ser uma string aleatória e segura. **NÃO compartilhe esta chave publicamente!**
3. **Redeploy obrigatório**: Após adicionar variáveis, você **DEVE** fazer um redeploy para que as mudanças tenham efeito
4. **Ambientes**: Configure para Production, Preview e Development para funcionar em todos os ambientes

## ⚠️ Sobre os Outros Erros no Console

Os erros de `utils.js`, `extensionState.js`, `heuristicsRedefinitions.js` e `browser is not defined` são causados por **extensões do navegador** (como bloqueadores de anúncios, tradutores, etc.) e **NÃO são problemas do seu código**.

Você pode ignorá-los com segurança. Eles não afetam o funcionamento da aplicação.

## 📝 Checklist de Deploy

- [ ] Variável `NEXTAUTH_URL` configurada
- [ ] Variável `NEXTAUTH_SECRET` configurada (chave aleatória gerada)
- [ ] Variáveis do Supabase configuradas (se usar banco)
- [ ] Redeploy realizado após adicionar variáveis
- [ ] Teste de login funcionando
- [ ] Teste do cardápio público funcionando




