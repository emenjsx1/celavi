import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://cdmzweszhjxdscjhsbma.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrate() {
  try {
    console.log('🚀 Iniciando migração para Supabase...')

    // 1. Criar usuário admin
    console.log('📝 Criando usuário admin...')
    const hashedPassword = await bcrypt.hash('123456', 10)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: 'Admin Frango Dourado',
        email: 'frango@gmail.com',
        password: hashedPassword,
      })
      .select()
      .single()

    if (userError) {
      // Se o usuário já existe, buscar ele
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'frango@gmail.com')
        .single()
      
      if (existingUser) {
        console.log('✅ Usuário já existe, usando existente')
        const userId = existingUser.id
        await migrateStoreAndData(userId)
        return
      }
      throw userError
    }

    console.log('✅ Usuário criado:', user.id)
    const userId = user.id

    // 2. Criar loja
    console.log('🏪 Criando loja...')
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        user_id: userId,
        name: 'Frango Dourado',
        slug: 'frango-dourado',
        description: 'O melhor frango frito da cidade!',
        address: 'Quelimane. Av xxx',
        phone: '258 xxx',
        email: 'frango@gmail.com',
        facebook_url: 'https://facebook.com/frangodourado',
        instagram_url: 'https://instagram.com/frangodourado',
        whatsapp_url: 'https://wa.me/258840000000',
        app_url: 'https://play.google.com/store/apps/details?id=com.frangodourado',
      })
      .select()
      .single()

    if (storeError) {
      // Se a loja já existe, buscar ela
      const { data: existingStore } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', 'frango-dourado')
        .single()
      
      if (existingStore) {
        console.log('✅ Loja já existe, usando existente')
        await migrateStoreAndData(userId)
        return
      }
      throw storeError
    }

    console.log('✅ Loja criada:', store.id)
    await migrateStoreAndData(userId)
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  }
}

async function migrateStoreAndData(userId: number) {
  // Buscar loja
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!store) {
    throw new Error('Loja não encontrada')
  }

  const storeId = store.id

  // 3. Criar categorias
  console.log('📂 Criando categorias...')
  const categories = [
    { name: 'Recomendados', description: 'Produtos mais populares', order_position: 0 },
    { name: 'Hambúrgueres', description: 'Hambúrgueres deliciosos', order_position: 1 },
    { name: 'Frango', description: 'Nossos deliciosos frangos', order_position: 2 },
    { name: 'Outros pratos salgados', description: 'Outros pratos salgados', order_position: 3 },
    { name: 'Bebidas (chás e refrigerantes)', description: 'Bebidas geladas', order_position: 4 },
    { name: 'Bebida alcoólica', description: 'Bebidas alcoólicas', order_position: 5 },
    { name: 'Snacks', description: 'Snacks e petiscos', order_position: 6 },
  ]

  // Verificar se categorias já existem
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)

  if (existingCategories && existingCategories.length > 0) {
    console.log('✅ Categorias já existem, pulando...')
  } else {
    const { data: createdCategories, error: catError } = await supabase
      .from('categories')
      .insert(categories.map(cat => ({ ...cat, store_id: storeId })))
      .select()

    if (catError) throw catError
    console.log('✅ Categorias criadas:', createdCategories?.length)
  }

  // Buscar categorias
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)

  if (!allCategories) throw new Error('Erro ao buscar categorias')

  const catMap: Record<string, number> = {}
  allCategories.forEach(cat => {
    catMap[cat.name] = cat.id
  })

  // 4. Criar produtos
  console.log('🍔 Criando produtos...')
  const products = [
    // Hambúrgueres
    { name: 'Hamburger completo', description: 'Hambúrguer completo com todos os acompanhamentos', price: 320, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop', is_available: true, is_hot: true, category_name: 'Hambúrgueres' },
    { name: 'Hamburger de frango', description: 'Hambúrguer de frango grelhado', price: 220, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Hambúrgueres' },
    { name: 'Hamburger de orleães', description: 'Hambúrguer estilo orleães', price: 220, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Hambúrgueres' },
    // Frango
    { name: 'Frango assado', description: 'Frango assado inteiro, suculento e temperado', price: 550, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop', is_available: true, is_hot: true, category_name: 'Frango' },
    { name: 'Frango orleães', description: 'Frango estilo orleães', price: 650, image: 'https://images.unsplash.com/photo-1608039829577-7c2f5aa5d4e3?w=800&h=600&fit=crop', is_available: true, is_hot: true, category_name: 'Frango' },
    { name: 'Asa de coxa', description: 'Asa de coxa frita, crocante por fora', price: 160, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Frango' },
    { name: 'Asa de orleães', description: 'Asa de frango estilo orleães', price: 150, image: 'https://images.unsplash.com/photo-1608039829577-7c2f5aa5d4e3?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Frango' },
    { name: 'Frango de pipoca', description: 'Frango de pipoca crocante', price: 95, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Frango' },
    // Outros pratos salgados
    { name: 'Empadas de carne de vaca', description: 'Empadas recheadas com carne de vaca', price: 180, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Outros pratos salgados' },
    { name: 'Batata grande frita', description: 'Porção grande de batata frita crocante', price: 120, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Outros pratos salgados' },
    { name: 'Arroz frito', description: 'Arroz frito temperado', price: 220, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Outros pratos salgados' },
    { name: 'Massa chinesa', description: 'Massa chinesa tradicional', price: 320, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Outros pratos salgados' },
    { name: 'Dumplings', description: 'Dumplings tradicionais', price: 280, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Outros pratos salgados' },
    { name: 'Sopas de massas e carne de vaca', description: 'Sopa de massas com carne de vaca', price: 350, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Outros pratos salgados' },
    // Bebidas
    { name: 'Chá de leite manga', description: 'Chá de leite com sabor de manga', price: 120, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Chá de maracujá', description: 'Chá refrescante de maracujá', price: 120, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Chá de uva', description: 'Chá de uva gelado', price: 120, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Chá de leite e pérola', description: 'Chá de leite com pérolas', price: 150, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Chá de ananás', description: 'Chá de ananás refrescante', price: 120, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Chá de limão', description: 'Chá de limão gelado', price: 60, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Coca-Cola', description: 'Refrigerante Coca-Cola gelado', price: 60, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Sprite', description: 'Refrigerante Sprite gelado', price: 60, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    { name: 'Fanta', description: 'Refrigerante Fanta gelado', price: 60, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebidas (chás e refrigerantes)' },
    // Bebida alcoólica
    { name: 'Heineken', description: 'Cerveja Heineken gelada', price: 100, image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Bebida alcoólica' },
    // Snacks
    { name: 'Pipoca doce', description: 'Pipoca doce crocante', price: 50, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Snacks' },
    { name: 'Amendoim frito', description: 'Amendoim frito temperado', price: 120, image: 'https://images.unsplash.com/photo-1606914469633-bdbf70ea4a91?w=800&h=600&fit=crop', is_available: true, is_hot: false, category_name: 'Snacks' },
  ]

  // Verificar se produtos já existem
  const { data: existingProducts } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)

  if (existingProducts && existingProducts.length > 0) {
    console.log('✅ Produtos já existem, pulando...')
  } else {
    const productsToInsert = products.map(prod => ({
      category_id: catMap[prod.category_name],
      store_id: storeId,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      image: prod.image,
      is_available: prod.is_available,
      is_hot: prod.is_hot || false,
    }))

    const { data: createdProducts, error: prodError } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select()

    if (prodError) throw prodError
    console.log('✅ Produtos criados:', createdProducts?.length)
  }

  // 5. Criar algumas avaliações
  console.log('⭐ Criando avaliações...')
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name')
    .eq('store_id', storeId)
    .limit(5)

  if (allProducts && allProducts.length > 0) {
    const reviews = [
      { product_id: allProducts[0].id, user_name: 'Maria Silva', rating: 5, comment: 'Delicioso! Frango muito crocante e suculento. Recomendo!' },
      { product_id: allProducts[0].id, user_name: 'João Santos', rating: 4, comment: 'Muito bom, mas poderia ter mais tempero.' },
      { product_id: allProducts[0].id, user_name: 'Ana Costa', rating: 5, comment: 'Perfeito! Sempre peço quando venho aqui.' },
    ]

    const { error: reviewError } = await supabase
      .from('reviews')
      .insert(reviews)

    if (reviewError && !reviewError.message.includes('duplicate')) {
      console.warn('⚠️ Erro ao criar avaliações:', reviewError.message)
    } else {
      console.log('✅ Avaliações criadas')
    }
  }

  console.log('🎉 Migração concluída com sucesso!')
}

migrate()










