# Como Instalar o Composer no Windows

## Opção 1: Instalador Oficial (Recomendado)

1. Acesse: https://getcomposer.org/download/
2. Baixe o instalador `Composer-Setup.exe`
3. Execute o instalador e siga as instruções
4. Certifique-se de marcar a opção "Add to PATH"
5. Reinicie o PowerShell/Terminal

## Opção 2: Instalação Manual

1. Baixe o arquivo `composer.phar` de: https://getcomposer.org/composer-stable.phar
2. Coloque o arquivo em uma pasta (ex: `C:\composer\`)
3. Crie um arquivo `composer.bat` na mesma pasta com o conteúdo:
```batch
@echo off
php "%~dp0composer.phar" %*
```
4. Adicione a pasta ao PATH do Windows:
   - Pressione `Win + R`, digite `sysdm.cpl` e pressione Enter
   - Vá em "Avançado" > "Variáveis de Ambiente"
   - Em "Variáveis do sistema", encontre "Path" e clique em "Editar"
   - Clique em "Novo" e adicione o caminho da pasta (ex: `C:\composer`)
   - Clique em "OK" em todas as janelas
5. Reinicie o PowerShell/Terminal

## Verificar Instalação

Após instalar, execute no PowerShell:
```powershell
composer --version
```

Se aparecer a versão, está instalado corretamente!

## Alternativa: Usar sem Composer

O projeto foi modificado para funcionar sem Composer. Veja o arquivo `SEM_COMPOSER.md` para instruções.











