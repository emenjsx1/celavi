// Script para criar mesa de teste diretamente
// Execute: node scripts/create-test-table-direct.js

// Este script cria uma mesa diretamente no banco via Supabase
// Requer que você tenha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createTestTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️ Supabase não configurado no .env.local');
    console.log('');
    console.log('Para criar a mesa de teste:');
    console.log('1. Acesse http://localhost:3000/dashboard');
    console.log('2. Vá para a aba "Mesas"');
    console.log('3. Clique em "+ Nova Mesa"');
    console.log('4. Digite o número: 1');
    console.log('5. Marque "Mesa Ativa"');
    console.log('6. Clique em "Salvar"');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Buscar loja "frango-dourado"
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', 'frango-dourado')
      .single();

    if (storeError || !store) {
      console.error('Loja "frango-dourado" não encontrada');
      return;
    }

    // Criar mesa
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .insert({
        store_id: store.id,
        number: 1,
        is_active: true,
      })
      .select()
      .single();

    if (tableError) {
      if (tableError.code === '23505') {
        console.log('✅ Mesa número 1 já existe!');
      } else {
        console.error('Erro ao criar mesa:', tableError);
      }
    } else {
      console.log('✅ Mesa criada com sucesso!');
      console.log(`   ID: ${table.id}`);
      console.log(`   Número: ${table.number}`);
      console.log(`   Status: ${table.is_active ? 'Ativa' : 'Inativa'}`);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

createTestTable();









