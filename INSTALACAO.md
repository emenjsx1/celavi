# Guia de Instalação Rápida

## Passo a Passo

### 1. Instalar Dependências
```bash
composer install
```

### 2. Configurar Banco de Dados

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
```
DB_HOST=localhost
DB_NAME=cardapio_digital
DB_USER=root
DB_PASS=sua_senha_aqui
BASE_URL=http://localhost
```

### 3. Criar Banco de Dados

Execute o script SQL em `database/schema.sql` no seu MySQL:
```bash
mysql -u root -p < database/schema.sql
```

Ou importe manualmente pelo phpMyAdmin/MySQL Workbench.

### 4. Configurar Servidor

#### Opção A: PHP Built-in Server (Desenvolvimento)
```bash
php -S localhost:8000
```

#### Opção B: Apache
- Certifique-se de que o `mod_rewrite` está habilitado
- Configure o DocumentRoot para apontar para a pasta do projeto
- O arquivo `.htaccess` já está configurado

#### Opção C: Nginx
Configure o servidor para redirecionar todas as requisições para `index.php`

### 5. Acessar o Sistema

1. Acesse: `http://localhost:8000/login` (ou sua URL configurada)
2. Crie uma conta
3. Crie sua loja no dashboard
4. Adicione categorias e produtos
5. Use o link gerado para criar seu QR Code

## Estrutura de URLs

- `/login` - Página de login/cadastro
- `/dashboard` - Painel do dono da loja
- `/loja/[slug]` - Cardápio público da loja

## Troubleshooting

### Erro de conexão com banco
- Verifique as credenciais no arquivo `.env`
- Certifique-se de que o MySQL está rodando
- Verifique se o banco de dados foi criado

### Página 404
- Verifique se o `mod_rewrite` está habilitado (Apache)
- Verifique a configuração do servidor web

### Erro de autoload
- Execute `composer dump-autoload`











