'use client'

interface FinancialKPIsProps {
  totalRevenue: number
  previousPeriodRevenue: number
  averageTicket: number
  ordersPerDay: number
  approvalRate: number
  averagePreparationTime: number
  cancellationRate: number
  uniqueCustomers: number
}

export default function FinancialKPIs({
  totalRevenue,
  previousPeriodRevenue,
  averageTicket,
  ordersPerDay,
  approvalRate,
  averagePreparationTime,
  cancellationRate,
  uniqueCustomers,
}: FinancialKPIsProps) {
  const growthRate =
    previousPeriodRevenue > 0
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Indicadores Principais (KPIs)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Receita Total</p>
          <p className="text-2xl font-bold text-gold">MT {totalRevenue.toFixed(0)}</p>
          {growthRate !== 0 && (
            <p className={`text-xs mt-1 ${growthRate > 0 ? 'text-gold' : 'text-red-300'}`}>
              {growthRate > 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}% vs período anterior
            </p>
          )}
        </div>

        {/* Crescimento */}
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Crescimento</p>
          <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-gold' : 'text-red-300'}`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-medium mt-1">vs período anterior</p>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Ticket Médio</p>
          <p className="text-2xl font-bold text-gold">MT {averageTicket.toFixed(0)}</p>
        </div>

        {/* Pedidos por Dia */}
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Pedidos/Dia</p>
          <p className="text-2xl font-bold text-gold">{ordersPerDay.toFixed(1)}</p>
        </div>

        {/* Taxa de Aprovação */}
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Taxa de Aprovação</p>
          <p className="text-2xl font-bold text-gold">{approvalRate.toFixed(1)}%</p>
        </div>

        {/* Tempo Médio de Preparo */}
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Tempo Médio Preparo</p>
          <p className="text-2xl font-bold text-gold">{averagePreparationTime.toFixed(0)} min</p>
        </div>

        {/* Taxa de Cancelamento */}
        <div className="p-4 border-2 border-dark-red rounded-lg bg-dark-red bg-opacity-10">
          <p className="text-sm text-red-300 font-semibold">Taxa de Cancelamento</p>
          <p className="text-2xl font-bold text-red-300">{cancellationRate.toFixed(1)}%</p>
        </div>

        {/* Clientes Únicos */}
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Clientes Únicos</p>
          <p className="text-2xl font-bold text-gold">{uniqueCustomers}</p>
        </div>
      </div>
    </div>
  )
}






