'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { RevenueDataPoint, PaymentMethodData, ProductSalesData } from '@/lib/analytics'

interface FinancialChartsProps {
  revenueData: RevenueDataPoint[]
  paymentData: PaymentMethodData[]
  topProducts: ProductSalesData[]
}

const COLORS = ['#F2C200', '#FFD700', '#D4AF37', '#F2C200', '#FFD700', '#D4AF37'] // Paleta dourada

export default function FinancialCharts({
  revenueData,
  paymentData,
  topProducts,
}: FinancialChartsProps) {
  return (
    <div className="space-y-6">
      {/* Gráfico de Receita ao Longo do Tempo */}
      <div className="bg-dark-gray p-4 rounded-lg border-2 border-border">
        <h3 className="text-lg font-bold text-white mb-4">Receita ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#F5F5F5' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12, fill: '#F5F5F5' }} />
            <Tooltip
              formatter={(value: number) => [`MT ${value.toFixed(0)}`, 'Receita']}
              contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#F5F5F5' }}
              labelStyle={{ color: '#F5F5F5' }}
            />
            <Legend wrapperStyle={{ color: '#F5F5F5' }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#F2C200"
              strokeWidth={2}
              name="Receita (MT)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Distribuição por Método de Pagamento */}
        <div className="bg-dark-gray p-4 rounded-lg border-2 border-border">
          <h3 className="text-lg font-bold text-white mb-4">
            Distribuição por Método de Pagamento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `MT ${value.toFixed(0)}`}
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#F5F5F5' }}
                labelStyle={{ color: '#F5F5F5' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentData.map((item, index) => (
              <div key={item.method} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-white">{item.method}</span>
                </div>
                <span className="font-semibold text-white">
                  MT {item.amount.toFixed(0)} ({item.count} pedidos)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Produtos Mais Vendidos */}
        <div className="bg-dark-gray p-4 rounded-lg border-2 border-border">
          <h3 className="text-lg font-bold text-white mb-4">Top 10 Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis
                dataKey="productName"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10, fill: '#F5F5F5' }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#F5F5F5' }} />
              <Tooltip
                formatter={(value: number) => [value, 'Quantidade']}
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#F5F5F5' }}
                labelStyle={{ color: '#F5F5F5' }}
              />
              <Legend wrapperStyle={{ color: '#F5F5F5' }} />
              <Bar dataKey="quantity" fill="#F2C200" name="Quantidade Vendida" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

