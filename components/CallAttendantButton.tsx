'use client'

import { useState, useEffect } from 'react'

interface CallAttendantButtonProps {
  storeId: number
  tableId: number
  customerName?: string
  customerPhone?: string
  storeSlug?: string
  variant?: 'fixed' | 'inline' // 'fixed' = fixo no canto, 'inline' = botão normal
}

interface Table {
  id: number
  number: number
  name?: string
}

export default function CallAttendantButton({
  storeId,
  tableId: initialTableId,
  customerName,
  customerPhone,
  storeSlug,
  variant = 'fixed',
}: CallAttendantButtonProps) {
  const [calling, setCalling] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedTableId, setSelectedTableId] = useState(initialTableId)
  const [tables, setTables] = useState<Table[]>([])
  const [loadingTables, setLoadingTables] = useState(false)

  useEffect(() => {
    setSelectedTableId(initialTableId)
  }, [initialTableId])

  const fetchTables = async () => {
    if (!storeSlug) return
    setLoadingTables(true)
    try {
      const res = await fetch(`/api/stores/${storeSlug}/tables?activeOnly=true`)
      if (res.ok) {
        const data = await res.json()
        setTables(data)
      }
    } catch (err) {
      console.error('Error fetching tables:', err)
    } finally {
      setLoadingTables(false)
    }
  }

  const handleCallAttendant = async (tableIdToUse?: number) => {
    if (calling) return

    const finalTableId = tableIdToUse || selectedTableId

    setCalling(true)
    setError('')
    setSuccess(false)
    setShowModal(false)

    try {
      const res = await fetch('/api/attendant-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          tableId: finalTableId,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          reason: 'Geral',
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setCalling(false)
        }, 3000)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Erro ao chamar atendente')
        setCalling(false)
      }
    } catch (err) {
      console.error('Erro ao chamar atendente:', err)
      setError('Erro ao chamar atendente. Tente novamente.')
      setCalling(false)
    }
  }

  const handleButtonClick = () => {
    // Se não tiver mesa selecionada e não tiver dados do checkout, mostrar modal
    if (selectedTableId === 1 && !customerName && storeSlug) {
      setShowModal(true)
      if (tables.length === 0) {
        fetchTables()
      }
      return
    }
    handleCallAttendant()
  }

  const buttonContent = (
    <button
      onClick={handleButtonClick}
      disabled={calling || success}
      className={`${
        variant === 'fixed' 
          ? 'bg-red-strong text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg hover:bg-red-dark'
          : 'bg-gold text-black-pure px-4 py-2 rounded-lg font-semibold hover:bg-gold-bright'
      } transition-all flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-base ${
        success ? 'bg-green-500 hover:bg-green-500' : ''
      } ${calling ? 'opacity-75 cursor-not-allowed' : ''}`}
      title="Chamar Atendente"
    >
      {success ? (
        <>
          <span>✓</span>
          <span className="hidden sm:inline">Atendente Chamado!</span>
          <span className="sm:hidden">Chamado!</span>
        </>
      ) : calling ? (
        <>
          <span className="animate-spin">⏳</span>
          <span className="hidden sm:inline">Chamando...</span>
        </>
      ) : (
        <>
          <span>🔔</span>
          <span className="hidden sm:inline">Chamar Atendente</span>
          <span className="sm:hidden">Atendente</span>
        </>
      )}
    </button>
  )

  return (
    <>
      {variant === 'fixed' ? (
        <div className="fixed bottom-6 right-6 z-50">
          {buttonContent}
          {error && (
            <div className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm max-w-xs">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {buttonContent}
          {error && (
            <div className="absolute top-full left-0 mt-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm max-w-xs z-50">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Modal para selecionar mesa */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface border-2 border-dark-border rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-text-light mb-4">Selecione sua Mesa</h3>
              
              {loadingTables ? (
                <p className="text-center py-4 text-text-muted">Carregando mesas...</p>
              ) : tables.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => {
                        setSelectedTableId(table.id)
                        handleCallAttendant(table.id)
                      }}
                      className={`w-full p-3 border-2 rounded-lg text-left transition ${
                        selectedTableId === table.id
                          ? 'border-gold-primary bg-gold-primary/20 text-gold-primary'
                          : 'border-dark-border bg-dark-bg text-text-light hover:border-gold-primary hover:bg-gold-primary/10'
                      }`}
                    >
                      <span className="font-semibold">
                        Mesa {table.number}
                        {table.name && ` - ${table.name}`}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-text-muted mb-4">Nenhuma mesa disponível</p>
                  <button
                    onClick={() => {
                      setSelectedTableId(1)
                      handleCallAttendant(1)
                    }}
                    className="bg-gold-primary text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition"
                  >
                    Usar Mesa Padrão
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full bg-dark-border text-text-light py-2 rounded-lg font-semibold hover:bg-dark-border/80 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

