# 🔧 Corrigir: Pedidos Não Estão Sendo Salvos

## ❌ Problema Identificado

Os pedidos estão sendo criados apenas em **mock data** (memória), não no banco de dados Supabase. Por isso:
- ✅ O pedido parece ser criado com sucesso
- ❌ Mas não aparece no histórico
- ❌ É perdido ao reiniciar o servidor

**Causa:** A `SUPABASE_SERVICE_ROLE_KEY` está incorreta ou expirada.

## ✅ Solução Passo a Passo

### 1. Verificar o Problema

Execute o script de verificação:
```bash
node scripts/verificar-service-role-key.js
```

Se aparecer `❌ Erro ao testar conexão: Invalid API key`, a chave está incorreta.

### 2. Obter a Service Role Key Correta

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/qbjrdytwoyoysfnweugf/settings/api
   ```

2. **Localize a seção "Project API keys"**

3. **Encontre a chave "service_role"** (não a "anon/public")

4. **Clique no botão "👁️ Reveal"** ao lado de "service_role"

5. **Copie a chave completa** (ela começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Atualizar o `.env.local`

Abra o arquivo `.env.local` na raiz do projeto e atualize a linha:

```env
SUPABASE_SERVICE_ROLE_KEY=COLE_A_CHAVE_COPIADA_AQUI
```

**⚠️ IMPORTANTE:**
- A chave deve estar na mesma linha
- Não deve ter espaços antes ou depois
- Não deve ter aspas
- Deve ter aproximadamente 200+ caracteres

### 4. Verificar se Funcionou

Execute novamente:
```bash
node scripts/verificar-service-role-key.js
```

Deve aparecer:
```
✅ Conexão com Service Role Key: OK
🎉 Tudo configurado corretamente!
```

### 5. Reiniciar o Servidor

**Pare o servidor Next.js** (Ctrl+C) e **inicie novamente**:
```bash
npm run dev
```

### 6. Testar Criando um Pedido

1. Acesse: `http://localhost:3000/loja/frango-dourado`
2. Adicione produtos ao carrinho
3. Faça checkout e crie um pedido
4. Verifique os logs do servidor - deve aparecer:
   ```
   ✅ Pedido criado com sucesso no Supabase: #001
   ```
   (não mais `⚠️ Pedido criado em mock data`)

5. Verifique o histórico:
   - Acesse: `http://localhost:3000/loja/frango-dourado/pedidos?phone=SEU_TELEFONE`
   - O pedido deve aparecer agora!

## 🔍 Verificação Rápida

### Como Saber se Está Funcionando:

**✅ Funcionando Corretamente:**
- Logs mostram: `✅ Pedido criado com sucesso no Supabase`
- Pedidos aparecem no histórico
- Pedidos persistem após reiniciar o servidor

**❌ Ainda com Problema:**
- Logs mostram: `⚠️ Pedido criado em mock data`
- Pedidos não aparecem no histórico
- Pedidos são perdidos ao reiniciar

## 📋 Checklist

- [ ] Service Role Key copiada do dashboard
- [ ] `.env.local` atualizado com a chave correta
- [ ] Script de verificação executado com sucesso
- [ ] Servidor Next.js reiniciado
- [ ] Novo pedido criado e testado
- [ ] Pedido aparece no histórico

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda não funcionar:

1. **Verifique os logs do servidor** - procure por mensagens de erro
2. **Execute o script de verificação novamente**
3. **Confirme que a chave não tem espaços ou quebras de linha**
4. **Verifique se o arquivo `.env.local` está na raiz do projeto**

## 🔐 Segurança

⚠️ **NUNCA:**
- Commite a Service Role Key no Git
- Compartilhe a chave publicamente
- Use a chave no código do cliente (browser)

✅ **SEMPRE:**
- Mantenha a chave apenas no `.env.local`
- Adicione `.env.local` ao `.gitignore`
- Use apenas no servidor (API routes)


