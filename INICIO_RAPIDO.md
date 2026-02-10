# 🚀 Início Rápido

## 1. Instalar Dependências

```bash
npm install
```

## 2. Configurar Banco de Dados

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cardapio_digital?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui-gere-uma-chave-aleatoria
```

**Para gerar o NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 3. Configurar Prisma

```bash
# Gerar o Prisma Client
npm run db:generate

# Criar as tabelas no banco
npm run db:push
```

## 4. Iniciar o Servidor

```bash
npm run dev
```

## 5. Acessar

Abra no navegador: **http://localhost:3000/login**

## ✅ Pronto!

1. Crie uma conta
2. Crie sua loja no dashboard
3. Adicione categorias e produtos
4. Use o link gerado para criar seu QR Code

---

**Dica:** Use `npm run db:studio` para visualizar e editar dados diretamente no banco!
