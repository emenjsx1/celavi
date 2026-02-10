// Script para criar uma mesa de teste
// Execute: npx tsx scripts/create-test-table.ts

import { createTable, getStoreBySlug } from '../lib/db-supabase'

async function createTestTable() {
  try {
    // Buscar a loja "frango-dourado"
    const store = await getStoreBySlug('frango-dourado')
    
    if (!store) {
      console.error('Loja "frango-dourado" não encontrada')
      process.exit(1)
    }

    console.log(`Loja encontrada: ${store.name} (ID: ${store.id})`)

    // Criar mesa número 1
    const table = await createTable({
      storeId: store.id,
      number: 1,
      isActive: true,
    })

    if (table) {
      console.log(`✅ Mesa criada com sucesso!`)
      console.log(`   ID: ${table.id}`)
      console.log(`   Número: ${table.number}`)
      console.log(`   Status: ${table.isActive ? 'Ativa' : 'Inativa'}`)
    } else {
      console.error('Erro ao criar mesa')
      process.exit(1)
    }
  } catch (error) {
    console.error('Erro:', error)
    process.exit(1)
  }
}

createTestTable()









