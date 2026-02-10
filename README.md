# Cardápio Digital Fast-Food - MVP

Sistema de cardápio digital acessível via QR Code para fast-foods.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **Prisma ORM**
- **NextAuth.js**

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🔧 Instalação

1. **Instale as dependências:**
```bash
npm install
# ou
yarn install
```

2. **Configure o banco de dados:**
   - Crie um arquivo `.env` baseado no `.env.example`
   - Configure a `DATABASE_URL` com suas credenciais do PostgreSQL
   - Configure o `NEXTAUTH_SECRET` (gere uma chave aleatória)

3. **Configure o Prisma:**
```bash
npm run db:generate
npm run db:push
```

4. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

5. **Acesse:** `http://localhost:3000/login`

## 🎨 Identidade Visual

A paleta de cores é fixa e obrigatória:

- **Vermelho principal**: `#700F12` (header, botões primários)
- **Vermelho secundário**: `#953834` (hover, destaques)
- **Amarelo mostarda**: `#A17A0E` (preços, promoções)
- **Marrom escuro**: `#45362E` (textos fortes, bordas)
- **Fundo principal**: `#D5DAD5`
- **Fundo dos cards**: `#C0BDAD`

## 📱 Funcionalidades

### Cliente (sem login)
- Acessa o cardápio via `/loja/[slug]`
- Visualiza categorias e produtos
- Vê preços e status de disponibilidade

### Dono da Loja (com login)
- Criar/editar perfil da loja
- Gerenciar categorias
- Gerenciar produtos
- Ativar/desativar produtos
- Gerar link único para QR Code

## 🗂️ Estrutura do Projeto

```
.
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/        # Autenticação
│   │   ├── stores/      # Lojas
│   │   ├── categories/  # Categorias
│   │   └── products/    # Produtos
│   ├── dashboard/       # Dashboard do dono
│   ├── login/           # Página de login
│   └── loja/[slug]/     # Cardápio público
├── components/          # Componentes React
├── lib/                 # Utilitários
│   ├── prisma.ts        # Cliente Prisma
│   └── auth.ts          # Configuração NextAuth
├── prisma/
│   └── schema.prisma    # Schema do banco
└── public/              # Arquivos estáticos
```

## 🔐 Primeiro Acesso

1. Acesse `/login`
2. Crie uma conta
3. Crie sua loja no dashboard
4. Adicione categorias e produtos
5. Use o link gerado para criar seu QR Code

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Sincroniza schema com banco
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:generate` - Gera Prisma Client

## 🚀 Deploy na Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
3. Deploy automático!

## 📝 Notas

- Este é um MVP, sem funcionalidades de pedidos ou pagamento
- Preparado para deploy na Vercel
- Layout mobile-first
- Código organizado e pronto para escalar

## 🚧 Próximos Passos (Futuro)

- Sistema de pedidos
- Integração com pagamentos
- WhatsApp checkout
- Delivery
