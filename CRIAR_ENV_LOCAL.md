# ⚠️ IMPORTANTE: Criar arquivo .env.local

Para que as atualizações de produtos apareçam no cardápio, você precisa criar o arquivo `.env.local` na raiz do projeto.

## Passo a passo:

1. Crie um arquivo chamado `.env.local` na raiz do projeto (mesmo nível do `package.json`)

2. Cole o seguinte conteúdo no arquivo:

```
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjE3NDMsImV4cCI6MjA3OTYzNzc0M30.DqNqaVPZf45XsxN2QcAl2b06Ohaq4vxCmMimdwdKFDw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ
```

3. **Reinicie o servidor de desenvolvimento** após criar o arquivo:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

## Por que isso é necessário?

- Sem o `.env.local`, o sistema usa dados em memória (mock data) que são resetados a cada reinicialização
- Com o `.env.local` configurado, o sistema usa o Supabase e as atualizações são salvas permanentemente
- As atualizações de imagens, produtos novos e marcação como "hot" só aparecerão no cardápio se o Supabase estiver configurado

## Verificação

Após criar o arquivo e reiniciar o servidor, você verá no console:
- Se o Supabase estiver configurado: as rotas usarão o banco de dados
- Se não estiver: aparecerá um aviso e o sistema usará mock data como fallback










