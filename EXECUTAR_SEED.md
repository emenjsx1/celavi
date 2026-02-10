# 🚀 Executar Seed - Dados de Exemplo

## Passo a Passo

### 1. Configure o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cardapio_digital?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=qualquer-chave-secreta-aqui
```

**Importante:** Substitua `usuario`, `senha` e `cardapio_digital` pelas suas credenciais do PostgreSQL.

### 2. Crie o banco de dados (se ainda não existir)

No PostgreSQL, crie o banco:
```sql
CREATE DATABASE cardapio_digital;
```

### 3. Crie as tabelas

```bash
npm run db:push
```

### 4. Execute o seed

```bash
npm run db:seed
```

## ✅ O que será criado:

### 👤 3 Usuários (senha: `123456`)
- joao@exemplo.com
- maria@exemplo.com
- carlos@exemplo.com

### 🏪 3 Lojas completas
- **Frango Dourado** - 8 produtos em 3 categorias
- **Burger Express** - 3 produtos em 2 categorias
- **Pizza Italiana** - 3 produtos em 2 categorias

## 🔗 Após executar, acesse:

- Login: http://localhost:3000/login
- Cardápio Frango Dourado: http://localhost:3000/loja/frango-dourado
- Cardápio Burger Express: http://localhost:3000/loja/burger-express
- Cardápio Pizza Italiana: http://localhost:3000/loja/pizza-italiana











