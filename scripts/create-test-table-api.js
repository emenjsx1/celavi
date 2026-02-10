// Script para criar uma mesa de teste via API
// Execute: node scripts/create-test-table-api.js

const fetch = require('node-fetch');

async function createTestTable() {
  try {
    // Primeiro, precisamos fazer login e obter a sessão
    // Mas para simplificar, vamos criar via API diretamente se tiver autenticação
    // Ou criar manualmente no dashboard
    
    console.log('Para criar uma mesa de teste:');
    console.log('1. Acesse http://localhost:3000/dashboard');
    console.log('2. Vá para a aba "Mesas"');
    console.log('3. Clique em "Nova Mesa"');
    console.log('4. Digite o número: 1');
    console.log('5. Marque "Mesa Ativa"');
    console.log('6. Clique em "Salvar"');
    console.log('');
    console.log('OU execute via API se tiver autenticação configurada.');
  } catch (error) {
    console.error('Erro:', error);
  }
}

createTestTable();









