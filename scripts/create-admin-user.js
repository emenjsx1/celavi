const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário admin...');
    
    const email = 'admin@celavi.com';
    const password = 'celavi123';
    const name = 'Admin Cela VI';
    
    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      console.log('⚠️  Usuário já existe!');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nome: ${existingUser.name}`);
      console.log('\n💡 Se quiser atualizar a senha, delete o usuário primeiro e execute o script novamente.');
      process.exit(0);
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Senha hash gerada');
    
    // Criar usuário
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        name: name,
        email: email,
        password: hashedPassword,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao criar usuário:', insertError);
      process.exit(1);
    }
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log('\n📝 Credenciais de acesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log('\n🎉 Pronto! Você pode fazer login agora.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

createAdminUser();


