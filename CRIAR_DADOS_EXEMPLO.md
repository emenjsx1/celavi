# 📝 Como Criar Dados de Exemplo

## 1. Configure o Banco de Dados

Certifique-se de ter um arquivo `.env` com a `DATABASE_URL` configurada:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cardapio_digital?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui
```

## 2. Crie as Tabelas no Banco

```bash
npm run db:push
```

## 3. Execute o Seed (Criar Dados de Exemplo)

```bash
npm run db:seed
```

## 📋 Dados que Serão Criados

### Usuários (todos com senha: `123456`)
- **João Silva** - joao@exemplo.com
- **Maria Santos** - maria@exemplo.com  
- **Carlos Oliveira** - carlos@exemplo.com

### Lojas
1. **Frango Dourado** (slug: `frango-dourado`)
   - 3 categorias: Frangos, Acompanhamentos, Bebidas
   - 8 produtos

2. **Burger Express** (slug: `burger-express`)
   - 2 categorias: Hambúrgueres, Combos
   - 3 produtos

3. **Pizza Italiana** (slug: `pizza-italiana`)
   - 2 categorias: Pizzas Salgadas, Pizzas Doces
   - 3 produtos

## 🔗 Links dos Cardápios

Após executar o seed, você pode acessar:
- http://localhost:3000/loja/frango-dourado
- http://localhost:3000/loja/burger-express
- http://localhost:3000/loja/pizza-italiana

## 🔐 Login no Dashboard

Use qualquer um dos emails acima com a senha `123456` para acessar o dashboard e gerenciar as lojas.











