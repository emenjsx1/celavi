# 🔑 Credenciais Corretas do Supabase

## ⚠️ IMPORTANTE: Atualize seu `.env.local`

O projeto Supabase conectado via MCP é diferente do que está configurado no código.

### URL Correta do Supabase:
```
https://qbjrdytwoyoysfnweugf.supabase.co
```

### Chaves de API:

#### 1. Anon Key (Legacy):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianJkeXR3b3lveXNmbndldWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjU2MDAsImV4cCI6MjA4NDc0MTYwMH0._fjT0src_7QuKxU3yN5uEoL5FukdNqWq-R4y7qIk5is
```

#### 2. Publishable Key (Moderno):
```
sb_publishable_izgB_whPy1HfVw-AHZzX_g_CqyJDZNV
```

### ⚠️ Service Role Key

A Service Role Key não pode ser obtida via MCP por questões de segurança. Você precisa:

1. Acessar o Dashboard do Supabase: https://supabase.com/dashboard/project/qbjrdytwoyoysfnweugf
2. Ir em **Settings** → **API**
3. Copiar a **Service Role Key** (ela começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 📝 Arquivo `.env.local` Completo:

Crie ou atualize o arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qbjrdytwoyoysfnweugf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianJkeXR3b3lveXNmbndldWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjU2MDAsImV4cCI6MjA4NDc0MTYwMH0._fjT0src_7QuKxU3yN5uEoL5FukdNqWq-R4y7qIk5is
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_A_SERVICE_ROLE_KEY_DO_DASHBOARD

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui
```

### ✅ Após Atualizar:

1. **Reinicie o servidor Next.js** (pare e inicie novamente com `npm run dev`)
2. **Teste a conexão** acessando: `http://localhost:3000/api/test-supabase`
3. **Verifique os logs** - deve aparecer: `✅ Supabase configurado: https://qbjrdytwoyoysfnweugf.supabase.co`

### 🔍 Verificar se está funcionando:

Se o Supabase não estiver acessível (erro ENOTFOUND), o sistema agora usa **fallback para mock data**, então você ainda pode:
- ✅ Criar mesas (salvas em memória)
- ✅ Fazer pedidos (salvos em memória)
- ⚠️ Mas os dados serão perdidos ao reiniciar o servidor

### 📌 Nota:

O banco de dados já foi criado e populado via MCP com:
- ✅ 1 usuário admin (frango@gmail.com / 123456)
- ✅ 1 loja "Frango Dourado"
- ✅ 3 categorias
- ✅ 8 produtos
- ✅ 10 mesas





