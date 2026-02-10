# Status de APIs Externas

## ZIP API
**Status**: Não implementada

Não há referências a ZIP API no código atual. Se necessário, esta funcionalidade precisaria ser implementada do zero.

**Possíveis usos**:
- Validação de CEP/endereços
- Cálculo de frete
- Busca de endereços

**Próximos passos** (se necessário):
1. Escolher uma API de CEP/ZIP (ex: ViaCEP, API CEP)
2. Adicionar variáveis de ambiente para chaves de API
3. Criar endpoints ou funções para integração
4. Implementar na interface do usuário

## Google Maps
**Status**: Não implementada

Não há referências a Google Maps no código atual. Apenas referências ao Google Fonts no `app/layout.tsx`.

**Possíveis usos**:
- Exibir localização da loja
- Mapa de entrega
- Direções para o cliente

**Próximos passos** (se necessário):
1. Obter chave de API do Google Maps
2. Adicionar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` no `.env.local`
3. Instalar biblioteca (ex: `@react-google-maps/api`)
4. Implementar componente de mapa
5. Adicionar na página da loja ou checkout

## Notas
- Ambas as funcionalidades precisam ser implementadas se desejadas
- Requerem configuração de variáveis de ambiente
- Podem ter custos associados (especialmente Google Maps)


