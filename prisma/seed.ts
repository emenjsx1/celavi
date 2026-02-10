import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin de exemplo
  const hashedPassword = await bcrypt.hash('123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'frango@gmail.com' },
    update: {},
    create: {
      name: 'Admin Frango Dourado',
      email: 'frango@gmail.com',
      password: hashedPassword,
    },
  })

  console.log('✅ Usuário admin criado:', admin)

  // Criar loja de exemplo
  const store = await prisma.store.upsert({
    where: { slug: 'frango-dourado' },
    update: {},
    create: {
      userId: admin.id,
      name: 'Frango Dourado',
      slug: 'frango-dourado',
      description: 'O melhor frango frito da cidade!',
    },
  })

  console.log('✅ Loja criada:', store)

  // Criar categorias
  const categoria1 = await prisma.category.upsert({
    where: { 
      id: 1 
    },
    update: {},
    create: {
      storeId: store.id,
      name: 'Frangos',
      description: 'Nossos deliciosos frangos',
      orderPosition: 1,
    },
  })

  const categoria2 = await prisma.category.upsert({
    where: { 
      id: 2 
    },
    update: {},
    create: {
      storeId: store.id,
      name: 'Acompanhamentos',
      description: 'Acompanhamentos perfeitos',
      orderPosition: 2,
    },
  })

  const categoria3 = await prisma.category.upsert({
    where: { 
      id: 3 
    },
    update: {},
    create: {
      storeId: store.id,
      name: 'Bebidas',
      description: 'Bebidas geladas',
      orderPosition: 3,
    },
  })

  console.log('✅ Categorias criadas')

  // Limpar produtos existentes e criar novos
  await prisma.product.deleteMany({
    where: { storeId: store.id },
  })

  // Criar produtos
  await prisma.product.createMany({
    data: [
      {
        categoryId: categoria1.id,
        storeId: store.id,
        name: 'Frango Frito Inteiro',
        description: 'Frango inteiro frito, crocante por fora e suculento por dentro',
        price: 35.90,
        isAvailable: true,
      },
      {
        categoryId: categoria1.id,
        storeId: store.id,
        name: 'Frango Frito (8 pedaços)',
        description: '8 pedaços de frango frito',
        price: 28.90,
        isAvailable: true,
      },
      {
        categoryId: categoria1.id,
        storeId: store.id,
        name: 'Frango Frito (4 pedaços)',
        description: '4 pedaços de frango frito',
        price: 18.90,
        isAvailable: true,
      },
      {
        categoryId: categoria2.id,
        storeId: store.id,
        name: 'Batata Frita',
        description: 'Porção de batata frita crocante',
        price: 12.90,
        isAvailable: true,
      },
      {
        categoryId: categoria2.id,
        storeId: store.id,
        name: 'Arroz',
        description: 'Arroz branco soltinho',
        price: 5.90,
        isAvailable: true,
      },
      {
        categoryId: categoria2.id,
        storeId: store.id,
        name: 'Feijão',
        description: 'Feijão temperado',
        price: 5.90,
        isAvailable: true,
      },
      {
        categoryId: categoria3.id,
        storeId: store.id,
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante gelado',
        price: 4.90,
        isAvailable: true,
      },
      {
        categoryId: categoria3.id,
        storeId: store.id,
        name: 'Suco de Laranja',
        description: 'Suco natural de laranja',
        price: 6.90,
        isAvailable: true,
      },
    ],
  })

  console.log('✅ Produtos criados')

  console.log('\n✅ Dados de exemplo criados com sucesso!')
  console.log('\n📋 Credenciais de login:')
  console.log('Email: frango@gmail.com')
  console.log('Senha: 123456')
  console.log('\n🔗 Link do cardápio:')
  console.log(`http://localhost:3000/loja/frango-dourado`)
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
