# 🔧 CORREÇÃO URGENTE: NEXTAUTH_URL Incorreto

## ⚠️ Problema Identificado

A variável `NEXTAUTH_URL` está configurada com a URL **ERRADA**:

**❌ Atual (ERRADO):** `https://frangodourado.vercel.app`  
**✅ Correto:** `https://frangodouradoo.vercel.app` (com dois "o")

Isso está causando problemas de autenticação e conexão com o Supabase!

## ✅ Solução Rápida (2 minutos)

### Passo 1: Corrigir NEXTAUTH_URL

1. Acesse: https://vercel.com/emenjs-projects/frangodourado/settings/environment-variables
2. Encontre a variável `NEXTAUTH_URL`
3. Clique nos **3 pontos** (⋯) ao lado dela
4. Selecione **Edit**
5. Altere o valor de:
   ```
   https://frangodourado.vercel.app
   ```
   Para:
   ```
   https://frangodouradoo.vercel.app
   ```
6. Clique em **Save**

### Passo 2: Fazer Redeploy OBRIGATÓRIO

⚠️ **IMPORTANTE:** Após alterar a variável, você **DEVE** fazer um redeploy!

1. Vá em **Deployments** (no menu superior)
2. Clique nos **3 pontos** (⋯) do deployment mais recente
3. Selecione **Redeploy**
4. Aguarde o deploy terminar (1-2 minutos)

### Passo 3: Verificar

Após o redeploy, teste:
- https://frangodouradoo.vercel.app/api/test-supabase
- https://frangodouradoo.vercel.app/dashboard

## 📋 Checklist

- [ ] NEXTAUTH_URL corrigido para `https://frangodouradoo.vercel.app`
- [ ] Redeploy realizado
- [ ] Teste `/api/test-supabase` funcionando
- [ ] Dashboard carregando dados

## 🔍 Por que isso é importante?

O `NEXTAUTH_URL` deve ser **exatamente** a URL do seu site. Se estiver diferente, o NextAuth não consegue:
- Validar sessões corretamente
- Redirecionar após login
- Conectar com o Supabase adequadamente

## ⚠️ Outras Variáveis

As outras variáveis parecem estar corretas:
- ✅ `NEXTAUTH_SECRET` - configurado
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - configurado
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - configurado
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - configurado

Apenas o `NEXTAUTH_URL` precisa ser corrigido!







