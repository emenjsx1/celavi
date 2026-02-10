'use client'

import { useState, useEffect, useRef } from 'react'
import { useNotificationSound } from '@/lib/useNotificationSound'

interface AttendantCall {
  id: number
  storeId: number
  tableId: number
  customerName?: string
  customerPhone?: string
  reason: string
  status: 'pending' | 'attended' | 'cancelled'
  attendedBy?: number
  attendedAt?: string
  createdAt: string
  updatedAt: string
}

export default function AttendantCallsSection({ storeId }: { storeId: number }) {
  const [calls, setCalls] = useState<AttendantCall[]>([])
  const [filteredCalls, setFilteredCalls] = useState<AttendantCall[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('pending')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const previousCallsRef = useRef<number[]>([])
  const playNotificationSound = useNotificationSound('call') // Som de campainha para chamadas

  const fetchCalls = async () => {
    try {
      const statusParam = selectedFilter === 'all' ? '' : `&status=${selectedFilter}`
      const res = await fetch(`/api/attendant-calls?storeId=${storeId}${statusParam}`)
      if (res.ok) {
        const data = await res.json()
        setCalls(data)
      }
    } catch (err) {
      console.error('Error fetching attendant calls:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalls()
    const interval = setInterval(fetchCalls, 5000) // Atualizar a cada 5 segundos
    return () => clearInterval(interval)
  }, [storeId, selectedFilter])

  useEffect(() => {
    // Detectar novas chamadas
    const currentCallIds = calls.map(c => c.id)
    const newCallIds = currentCallIds.filter(id => !previousCallsRef.current.includes(id))
    
    if (newCallIds.length > 0 && previousCallsRef.current.length > 0) {
      // Nova chamada de atendente detectada
      playNotificationSound()
    }
    
    previousCallsRef.current = currentCallIds
  }, [calls, playNotificationSound])

  useEffect(() => {
    // Filtrar chamadas
    if (selectedFilter === 'all') {
      setFilteredCalls(calls)
    } else {
      setFilteredCalls(calls.filter(call => call.status === selectedFilter))
    }
  }, [calls, selectedFilter])

  const handleUpdateStatus = async (callId: number, newStatus: 'attended' | 'cancelled') => {
    try {
      const res = await fetch(`/api/attendant-calls/${callId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setMessage('Status atualizado!')
        fetchCalls()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao atualizar status')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err) {
      setError('Erro ao atualizar status')
      setTimeout(() => setError(''), 5000)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${Math.floor(diffHours / 24)}d atrás`
  }

  if (loading) {
    return (
      <div className="text-center py-12 !bg-dark-surface rounded-lg border-2 border-dark-border" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-primary mx-auto mb-4"></div>
        <p className="text-text-light text-lg font-semibold">Carregando chamadas...</p>
        <p className="text-text-muted text-sm mt-2">Aguarde enquanto buscamos as informações</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Chamadas de Atendente</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playNotificationSound()
              setMessage('Som de campainha tocado!')
              setTimeout(() => setMessage(''), 2000)
            }}
            className="px-3 py-1.5 bg-gold text-black-pure rounded-lg text-xs font-semibold hover:bg-gold-bright transition"
            title="Testar som de campainha (chamadas)"
          >
            🔔 Testar Som
          </button>
          <div className="text-sm text-text-muted">
            {filteredCalls.length} chamada(s)
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-dark-red bg-opacity-20 border border-dark-red text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setSelectedFilter('attended')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'attended'
              ? 'bg-green-500 text-white'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Atendidas
        </button>
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'all'
              ? 'bg-gold text-black-pure'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Lista de Chamadas */}
      <div className="space-y-4">
        {filteredCalls.map((call) => (
          <div
            key={call.id}
            className={`!bg-dark-surface border-2 rounded-lg p-4 ${
              call.status === 'pending'
                ? 'border-orange-500 !bg-orange-900/30'
                : call.status === 'attended'
                ? 'border-green-500 !bg-green-900/30'
                : 'border-dark-border !bg-dark-gray'
            }`}
            style={{ backgroundColor: call.status === 'pending' ? 'rgba(251, 146, 60, 0.1)' : call.status === 'attended' ? 'rgba(34, 197, 94, 0.1)' : '#1F1F1F' }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <h3 className="text-xl font-bold text-red-strong">Mesa #{call.tableId}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    call.status === 'pending'
                      ? 'bg-orange-500 text-white'
                      : call.status === 'attended'
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-border text-white'
                  }`}>
                    {call.status === 'pending' ? 'Pendente' : call.status === 'attended' ? 'Atendida' : 'Cancelada'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white">
                  {call.customerName && (
                    <div>
                      <p className="font-semibold text-text-muted text-xs mb-1">Cliente</p>
                      <p>{call.customerName}</p>
                    </div>
                  )}
                  {call.customerPhone && (
                    <div>
                      <p className="font-semibold text-text-muted text-xs mb-1">Telefone</p>
                      <p>{call.customerPhone}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-text-muted text-xs mb-1">Motivo</p>
                    <p>{call.reason}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-text-muted text-xs mb-1">Há</p>
                    <p>{formatTimeAgo(call.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Ações */}
              {call.status === 'pending' && (
                <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => handleUpdateStatus(call.id, 'attended')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition whitespace-nowrap"
                  >
                    ✓ Marcar como Atendida
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(call.id, 'cancelled')}
                    className="bg-dark-border text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-dark-border/80 transition whitespace-nowrap"
                  >
                    ✗ Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredCalls.length === 0 && (
          <div className="text-center py-12 !bg-dark-surface rounded-lg border-2 border-dark-border" style={{ backgroundColor: '#1F1F1F' }}>
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-text-light text-lg font-semibold mb-2">Nenhuma chamada encontrada</p>
            <p className="text-text-muted text-sm">
              {selectedFilter === 'pending' 
                ? 'Não há chamadas pendentes no momento.'
                : selectedFilter === 'attended'
                ? 'Não há chamadas atendidas no período selecionado.'
                : 'Quando houver chamadas, elas aparecerão aqui.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

