'use client'

import { useState, useEffect } from 'react'
import { CartItem } from './Cart'

interface Table {
  id: number
  number: number
  isActive: boolean
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  storeSlug: string
  onContinue: (data: { customerName: string; customerPhone: string; tableId: number }) => void // tableId pode ser 0 para retirada no caixa
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  storeSlug,
  onContinue,
}: CheckoutModalProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedTableId, setSelectedTableId] = useState<number | '' | 'pickup'>('')
  const [pickupOption, setPickupOption] = useState<'table' | 'pickup'>('table')
  const [errors, setErrors] = useState<{ name?: string; phone?: string; table?: string }>({})

  useEffect(() => {
    if (isOpen) {
      fetchTables()
    }
  }, [isOpen, storeSlug])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/stores/${storeSlug}/tables?active_only=true`)
      if (res.ok) {
        const data = await res.json()
        console.log('📋 Mesas carregadas:', data)
        setTables(data)
      } else {
        console.error('❌ Erro ao buscar mesas:', res.status, res.statusText)
        const errorData = await res.json().catch(() => ({}))
        console.error('Detalhes do erro:', errorData)
      }
    } catch (err) {
      console.error('❌ Erro ao buscar mesas:', err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string; table?: string } = {}

    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!customerPhone.trim()) {
      newErrors.phone = 'Número de celular é obrigatório'
    } else {
      // Validação básica de telefone (aceita +258 ou números locais)
      const phoneRegex = /^(\+258|258)?\s?[0-9]{9}$/
      const cleanPhone = customerPhone.replace(/\s/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Formato de telefone inválido'
      }
    }

    if (pickupOption === 'table' && !selectedTableId) {
      newErrors.table = 'Selecione uma mesa'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Se for retirada no caixa, usar tableId = 0
    const finalTableId = pickupOption === 'pickup' ? 0 : (selectedTableId as number)

    onContinue({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      tableId: finalTableId,
    })
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-dark-gray rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-border">
          <div className="sticky top-0 bg-gold text-black-pure p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Finalizar Pedido</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-gold transition"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Dados do Cliente */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Seus Dados</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value)
                      if (errors.name) setErrors({ ...errors, name: undefined })
                    }}
                    placeholder="Ex: João Júnior"
                    className={`w-full px-4 py-2 bg-black-main border-2 rounded-lg text-white focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-dark-red focus:ring-dark-red'
                        : 'border-border focus:ring-gold'
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Número de Celular *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value)
                      if (errors.phone) setErrors({ ...errors, phone: undefined })
                    }}
                    placeholder="+258 XXX XXX XXX ou 258 XXX XXX XXX"
                    className={`w-full px-4 py-2 bg-black-main border-2 rounded-lg text-white focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'border-dark-red focus:ring-dark-red'
                        : 'border-border focus:ring-gold'
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Onde receber o pedido? *
                  </label>
                  
                  {/* Opções: Mesa ou Retirar no Caixa */}
                  <div className="space-y-3 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPickupOption('table')
                        setSelectedTableId('')
                        if (errors.table) setErrors({ ...errors, table: undefined })
                      }}
                      className={`w-full p-3 border-2 rounded-lg text-left transition bg-black-main ${
                        pickupOption === 'table'
                          ? 'border-gold bg-gold bg-opacity-10'
                          : 'border-border hover:border-gold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          pickupOption === 'table' ? 'border-gold bg-gold' : 'border-border'
                        }`}>
                          {pickupOption === 'table' && (
                            <div className="w-3 h-3 rounded-full bg-black-pure" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Receber na Mesa</h4>
                          <p className="text-sm text-gray-medium">Você está no estabelecimento</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPickupOption('pickup')
                        setSelectedTableId('pickup')
                        if (errors.table) setErrors({ ...errors, table: undefined })
                      }}
                      className={`w-full p-3 border-2 rounded-lg text-left transition bg-black-main ${
                        pickupOption === 'pickup'
                          ? 'border-gold bg-gold bg-opacity-10'
                          : 'border-border hover:border-gold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          pickupOption === 'pickup' ? 'border-gold bg-gold' : 'border-border'
                        }`}>
                          {pickupOption === 'pickup' && (
                            <div className="w-3 h-3 rounded-full bg-black-pure" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Retirar no Caixa</h4>
                          <p className="text-sm text-gray-medium">Pedido para viagem ou entrega</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Seleção de mesa (só aparece se escolheu "Receber na Mesa") */}
                  {pickupOption === 'table' && (
                    <select
                      value={selectedTableId}
                      onChange={(e) => {
                        setSelectedTableId(e.target.value ? parseInt(e.target.value) : '')
                        if (errors.table) setErrors({ ...errors, table: undefined })
                      }}
                      className={`w-full px-4 py-2 bg-black-main border-2 rounded-lg text-white focus:outline-none focus:ring-2 ${
                        errors.table
                          ? 'border-dark-red focus:ring-dark-red'
                          : 'border-border focus:ring-gold'
                      }`}
                      required={pickupOption === 'table'}
                    >
                      <option value="">Selecione uma mesa</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Mesa {table.number}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {errors.table && (
                    <p className="text-red-500 text-sm mt-1">{errors.table}</p>
                  )}
                  
                  {pickupOption === 'pickup' && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-2">
                      <p className="text-sm text-yellow-800">
                        <strong>Importante:</strong> Você receberá um número de pedido. Apresente este número no caixa para retirar seu pedido.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Resumo do Pedido</h3>
              <div className="bg-black-main rounded-lg p-4 space-y-3 border border-border">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {item.name} x{item.quantity}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-medium italic">"{item.notes}"</p>
                      )}
                    </div>
                    <p className="text-white font-semibold">
                      MT {(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
                <div className="border-t-2 border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total:</span>
                    <span className="text-2xl font-bold text-gold">
                      MT {total.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-dark-gray text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gold hover:text-black-pure transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gold text-black-pure px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gold-bright transition"
              >
                Continuar para Pagamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

