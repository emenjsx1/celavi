# 🔑 Como Obter a Service Role Key Correta

## ⚠️ Problema Detectado

O teste de conexão mostrou que a **Service Role Key** atual está incorreta ou expirada.

## ✅ Solução Passo a Passo

### 1. Acesse o Dashboard do Supabase

Abra este link no seu navegador:
```
https://supabase.com/dashboard/project/qbjrdytwoyoysfnweugf/settings/api
```

### 2. Localize a Service Role Key

No dashboard, você verá uma seção chamada **"Project API keys"** com duas chaves:

- **anon/public** key (já configurada ✅)
- **service_role** key (precisa ser copiada)

### 3. Copie a Service Role Key

1. Clique no botão **👁️ Reveal** ao lado de "service_role"
2. Copie a chave completa (ela começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
3. **⚠️ IMPORTANTE:** Esta chave é secreta! Não compartilhe publicamente.

### 4. Atualize o `.env.local`

Abra o arquivo `.env.local` na raiz do projeto e atualize a linha:

```env
SUPABASE_SERVICE_ROLE_KEY=COLE_A_CHAVE_COPIADA_AQUI
```

### 5. Teste Novamente

Execute o script de teste:
```bash
node scripts/test-supabase-connection.js
```

Deve aparecer:
```
✅ Conexão com Service Role Key: OK
🎉 Tudo configurado corretamente!
```

## 🔍 Verificação Rápida

Você pode verificar se a chave está correta:

1. A chave deve começar com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
2. A chave deve ter aproximadamente 200+ caracteres
3. A chave não deve ter espaços ou quebras de linha

## ⚠️ Nota de Segurança

- A Service Role Key tem **acesso total** ao banco de dados
- **NUNCA** commite esta chave no Git
- **NUNCA** compartilhe publicamente
- Use apenas no servidor (`.env.local` para desenvolvimento)

## ✅ Status Atual

- ✅ URL do Supabase: Configurada corretamente
- ✅ Anon Key: Funcionando
- ❌ Service Role Key: Precisa ser atualizada

## 🚀 Após Configurar

Depois de atualizar a Service Role Key:

1. **Reinicie o servidor Next.js** (pare e inicie novamente)
2. **Teste criando uma mesa** no dashboard
3. **Teste fazendo um pedido** na loja

Tudo deve funcionar perfeitamente! 🎉





