# Usando o Projeto SEM Composer

O projeto foi configurado para funcionar sem Composer. Siga estes passos:

## 1. Configurar Banco de Dados

Crie um arquivo `config/local.php` (ou edite `config/database.php` diretamente):

```php
<?php
// config/local.php
return [
    'host' => 'localhost',
    'database' => 'cardapio_digital',
    'username' => 'root',
    'password' => 'sua_senha_aqui',
    'charset' => 'utf8mb4',
];
```

## 2. Criar o Banco de Dados

Execute o script SQL em `database/schema.sql` no seu MySQL:
- Via phpMyAdmin: importe o arquivo
- Via linha de comando: `mysql -u root -p < database/schema.sql`

## 3. Iniciar o Servidor

```powershell
php -S localhost:8000
```

## 4. Acessar

Abra no navegador: `http://localhost:8000/login`

## Nota

O projeto não precisa do Composer para funcionar. A única dependência (dotenv) foi removida e substituída por configuração direta.











