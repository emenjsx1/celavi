# ⚠️ IMPORTANTE: Criar arquivo .env.local

O erro 500 em `/api/auth/session` ocorre porque o `NEXTAUTH_SECRET` não está configurado.

## Solução Rápida

1. **Crie um arquivo `.env.local` na raiz do projeto** (mesmo nível do `package.json`)

2. **Cole o seguinte conteúdo:**

```env
# NextAuth (OBRIGATÓRIO para autenticação funcionar)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=frango-dourado-secret-key-2024-change-in-production

# Supabase (Opcional - se usar banco de dados)
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjE3NDMsImV4cCI6MjA3OTYzNzc0M30.DqNqaVPZf45XsxN2QcAl2b06Ohaq4vxCmMimdwdKFDw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ
```

3. **Reinicie o servidor de desenvolvimento:**

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

## Gerar NEXTAUTH_SECRET Seguro (Opcional)

Para produção, gere uma chave mais segura:

**No Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Ou use este gerador online:**
https://generate-secret.vercel.app/32

## Sobre os Outros Erros no Console

Os seguintes erros **NÃO são problemas do seu código** e podem ser ignorados:

- `runtime.lastError` - Erro de extensões do navegador (bloqueadores de anúncios, etc.)
- `enable_copy.js`, `utils.js`, `extensionState.js`, `heuristicsRedefinitions.js` - Extensões do navegador
- `ERR_FILE_NOT_FOUND` para esses arquivos - Extensões do navegador tentando carregar recursos

**O único erro que precisa ser corrigido é o erro 500 em `/api/auth/session`**, que será resolvido ao criar o arquivo `.env.local` com `NEXTAUTH_SECRET`.







