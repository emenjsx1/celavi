'use client'

import { useState, useEffect } from 'react'

interface Table {
  id: number
  storeId: number
  number: number
  isActive: boolean
}

export default function TablesSection({ storeId }: { storeId: number }) {
  const [tables, setTables] = useState<Table[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables?active_only=false')
      if (res.ok) {
        const data = await res.json()
        setTables(data)
      }
    } catch (err) {
      console.error('Error fetching tables:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      id: editingTable?.id,
      number: parseInt(formData.get('number') as string),
      isActive: formData.get('is_active') === 'on',
    }

    try {
      const url = editingTable ? `/api/tables/${editingTable.id}` : '/api/tables'
      const method = editingTable ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro ao salvar mesa')
      } else {
        setMessage(editingTable ? 'Mesa atualizada!' : 'Mesa criada!')
        setShowForm(false)
        setEditingTable(null)
        fetchTables()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      setError('Erro ao salvar mesa')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta mesa?')) {
      return
    }

    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Mesa removida!')
        fetchTables()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao remover mesa')
      }
    } catch (err) {
      setError('Erro ao remover mesa')
    }
  }

  const handleToggleActive = async (table: Table) => {
    try {
      const res = await fetch(`/api/tables/${table.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: table.number,
          isActive: !table.isActive,
        }),
      })

      if (res.ok) {
        fetchTables()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao alterar status da mesa')
      }
    } catch (err) {
      setError('Erro ao alterar status da mesa')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Mesas</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingTable(null)
          }}
          className="bg-gold text-black-pure px-4 py-2 rounded-lg font-semibold hover:bg-gold-bright transition text-sm sm:text-base w-full sm:w-auto"
        >
          + Nova Mesa
        </button>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-dark-red bg-opacity-20 border border-dark-red text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-dark-gray p-4 sm:p-6 rounded-lg border-2 border-border mb-4">
          <h3 className="text-lg font-bold text-white mb-4">
            {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Número da Mesa
              </label>
              <input
                type="number"
                name="number"
                defaultValue={editingTable?.number || ''}
                required
                min="1"
                className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editingTable?.isActive !== false}
                  className="w-4 h-4"
                />
                <span className="text-white font-semibold">Mesa Ativa</span>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                className="bg-gold text-black-pure px-4 py-2 rounded-lg font-semibold hover:bg-gold-bright transition w-full sm:w-auto"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingTable(null)
                }}
                className="bg-dark-gray text-white px-4 py-2 rounded-lg font-semibold hover:bg-gold hover:text-black-pure transition w-full sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-dark-gray p-3 sm:p-4 rounded-lg border-2 border-border hover:shadow-md transition-shadow w-full max-w-full overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full">
              {/* Informações da Mesa */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-text-light break-words">
                    Mesa {table.number}
                  </h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 self-start sm:self-auto ${
                      table.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {table.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleToggleActive(table)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex-1 sm:flex-initial whitespace-nowrap ${
                    table.isActive
                      ? 'bg-gold text-black-pure hover:bg-gold-bright'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {table.isActive ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => {
                    setEditingTable(table)
                    setShowForm(true)
                  }}
                  className="bg-gold text-black-pure px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gold-bright transition flex-1 sm:flex-initial whitespace-nowrap"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="bg-dark-red text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-opacity-80 transition flex-1 sm:flex-initial whitespace-nowrap"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}

        {tables.length === 0 && (
          <div className="text-center py-12 bg-dark-surface rounded-lg border-2 border-dark-border">
            <p className="text-text-light text-lg mb-2">Nenhuma mesa cadastrada ainda</p>
            <p className="text-text-muted text-sm">
              Clique em "+ Nova Mesa" para começar a gerenciar suas mesas.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

