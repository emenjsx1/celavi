# Instruções: Migração para Retirada no Caixa

## O que foi implementado?

Agora os clientes podem escolher entre:
- **Receber na Mesa**: Para clientes que estão no estabelecimento
- **Retirar no Caixa**: Para pedidos de viagem/entrega (sem mesa)

## Migração do Banco de Dados

Execute o script SQL abaixo no **SQL Editor** do Supabase:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo: `supabase/MIGRACAO_RETIRADA_CAIXA.sql`

Este script:
- Remove a constraint `NOT NULL` de `table_id` na tabela `orders`
- Permite que `table_id` seja `NULL` para pedidos de retirada no caixa
- Atualiza a foreign key para permitir valores NULL

## Como funciona?

- Quando o cliente escolhe **"Retirar no Caixa"**, o sistema salva `table_id = NULL` no banco
- O pedido aparece no dashboard com **"Retirar no Caixa"** em vez de número de mesa
- O cliente recebe um número de pedido para apresentar no caixa

## Teste

1. Faça um pedido como cliente
2. No checkout, escolha **"Retirar no Caixa"**
3. Complete o pagamento
4. Verifique no dashboard que o pedido aparece como **"Retirar no Caixa"**









