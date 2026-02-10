# 🔔 Funcionalidade de Chamar Atendente

## O que foi implementado:

1. ✅ **Tabela no banco de dados** para armazenar chamadas de atendente
2. ✅ **API para criar e gerenciar chamadas** (`/api/attendant-calls`)
3. ✅ **Botão flutuante na página da loja** para o cliente chamar atendente
4. ✅ **Seção no dashboard do admin** para ver e gerenciar chamadas
5. ✅ **Notificações sonoras** quando há novas chamadas
6. ✅ **Atualização em tempo real** (polling a cada 5 segundos)

## Como funciona:

### Para o Cliente:
- Botão flutuante "🔔 Chamar Atendente" no canto inferior direito
- Se já fez checkout, usa a mesa do checkout automaticamente
- Se não fez checkout, pode selecionar a mesa em um modal
- Após chamar, aparece confirmação "✓ Atendente Chamado!"

### Para o Admin:
- Nova aba "🔔 Atendente" no dashboard
- Filtros: Pendentes, Atendidas, Todas
- Mostra: Mesa, Cliente (se disponível), Telefone (se disponível), Motivo, Tempo
- Botões para marcar como "Atendida" ou "Cancelar"
- Notificação sonora quando há nova chamada pendente

## Configuração necessária:

### 1. Criar a tabela no Supabase

Execute o script SQL no **SQL Editor** do Supabase:

```sql
-- Arquivo: supabase/CRIAR_TABELA_ATENDENTE.sql
```

Ou copie e cole o conteúdo do arquivo `supabase/CRIAR_TABELA_ATENDENTE.sql`

### 2. Verificar se está funcionando

1. Acesse a página da loja como cliente
2. Clique no botão "🔔 Chamar Atendente"
3. Selecione a mesa (se necessário)
4. A chamada deve aparecer no dashboard do admin na aba "Atendente"

## Estrutura da Tabela:

- `id`: ID único da chamada
- `store_id`: ID da loja
- `table_id`: ID da mesa
- `customer_name`: Nome do cliente (opcional)
- `customer_phone`: Telefone do cliente (opcional)
- `reason`: Motivo da chamada (padrão: 'Geral')
- `status`: 'pending', 'attended', 'cancelled'
- `attended_by`: ID do admin que atendeu (opcional)
- `attended_at`: Data/hora do atendimento (opcional)
- `created_at`: Data/hora da criação
- `updated_at`: Data/hora da última atualização

## Notas:

- ✅ O cliente pode chamar atendente mesmo sem ter feito pedido
- ✅ A chamada aparece em tempo real no dashboard
- ✅ O admin pode marcar como atendida ou cancelar
- ✅ Há notificação sonora para novas chamadas
- ✅ As chamadas são filtradas por status









