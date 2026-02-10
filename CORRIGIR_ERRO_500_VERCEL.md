# 🔧 Corrigir Erro 500 no `/api/auth/session` no Vercel

## ⚠️ Problema

O erro `500 (Internal Server Error)` em `/api/auth/session` ocorre porque as variáveis de ambiente **não estão configuradas no Vercel**.

## ✅ Solução Rápida

### 1. Acesse o Painel do Vercel

1. Vá para https://vercel.com
2. Faça login na sua conta
3. Selecione o projeto **frangodouradoo** (ou o nome do seu projeto)

### 2. Configure as Variáveis de Ambiente

1. No menu do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**
3. Adicione as seguintes variáveis:

#### Variável 1: NEXTAUTH_URL
```
Nome: NEXTAUTH_URL
Valor: https://frangodouradoo.vercel.app
Ambientes: Production, Preview, Development
```

#### Variável 2: NEXTAUTH_SECRET
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

#### Variável 3: NEXT_PUBLIC_SUPABASE_URL (Se usar banco de dados)
```
Nome: NEXT_PUBLIC_SUPABASE_URL
Valor: https://cdmzweszhjxdscjhsbma.supabase.co
Ambientes: Production, Preview, Development
```

#### Variável 4: NEXT_PUBLIC_SUPABASE_ANON_KEY (Se usar banco de dados)
```
Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjE3NDMsImV4cCI6MjA3OTYzNzc0M30.DqNqaVPZf45XsxN2QcAl2b06Ohaq4vxCmMimdwdKFDw
Ambientes: Production, Preview, Development
```

#### Variável 5: SUPABASE_SERVICE_ROLE_KEY (Se usar banco de dados)
```
Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ
Ambientes: Production, Preview, Development
```

⚠️ **IMPORTANTE:** Para todas as variáveis, selecione **Production**, **Preview** e **Development**.

### 3. Faça um Redeploy

Após adicionar todas as variáveis:

1. Vá para a aba **Deployments**
2. Encontre o último deployment (o mais recente)
3. Clique nos **3 pontos** (⋯) ao lado do deployment
4. Selecione **Redeploy**
5. Aguarde o deploy terminar (pode levar 1-2 minutos)

### 4. Verifique se Funcionou

Após o redeploy, acesse:
- https://frangodouradoo.vercel.app/login
- https://frangodouradoo.vercel.app

O erro 500 deve desaparecer! ✅

## 📋 Checklist

- [ ] Variável `NEXTAUTH_URL` configurada com a URL do seu site
- [ ] Variável `NEXTAUTH_SECRET` configurada com uma chave aleatória gerada
- [ ] Variáveis do Supabase configuradas (se usar banco de dados)
- [ ] Todas as variáveis marcadas para Production, Preview e Development
- [ ] Redeploy realizado após adicionar as variáveis
- [ ] Teste de login funcionando
- [ ] Erro 500 desapareceu

## 🔍 Como Verificar os Logs do Vercel

Se ainda houver problemas:

1. No Vercel, vá em **Deployments**
2. Clique no deployment mais recente
3. Clique em **View Function Logs**
4. Procure por erros relacionados a `NEXTAUTH_SECRET` ou `NEXTAUTH_URL`

## ⚠️ Notas Importantes

1. **NEXTAUTH_URL**: Deve ser exatamente a URL do seu site no Vercel (com `https://`)
2. **NEXTAUTH_SECRET**: Deve ser uma string aleatória e segura. **NÃO compartilhe esta chave publicamente!**
3. **Redeploy obrigatório**: Após adicionar variáveis, você **DEVE** fazer um redeploy para que as mudanças tenham efeito
4. **Ambientes**: Configure para Production, Preview e Development para funcionar em todos os ambientes

## 🆘 Ainda com Problemas?

Se o erro persistir após seguir todos os passos:

1. Verifique se o `NEXTAUTH_URL` está correto (deve ser `https://frangodouradoo.vercel.app`)
2. Verifique se o `NEXTAUTH_SECRET` foi gerado corretamente (deve ter pelo menos 32 caracteres)
3. Verifique os logs do Vercel para ver erros específicos
4. Certifique-se de que fez o redeploy após adicionar as variáveis







