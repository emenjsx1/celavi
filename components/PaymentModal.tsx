'use client'

import { useState } from 'react'
import { CartItem } from './Cart'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  customerName: string
  customerPhone: string
  tableId: number
  mpesaName?: string
  mpesaPhone?: string
  emolaName?: string
  emolaPhone?: string
  onPaymentComplete: (paymentMethod: 'cash' | 'mpesa' | 'emola' | 'pos', receiptFile?: File) => Promise<void>
}

export default function PaymentModal({
  isOpen,
  onClose,
  items,
  total,
  customerName,
  customerPhone,
  tableId,
  mpesaName,
  mpesaPhone,
  emolaName,
  emolaPhone,
  onPaymentComplete,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'mpesa' | 'emola' | 'pos' | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setError('Formato inválido. Use JPG, PNG ou PDF')
        return
      }
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 5MB')
        return
      }
      setReceiptFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploading(true)

    try {
      if (selectedMethod === 'cash' || selectedMethod === 'pos') {
        await onPaymentComplete(selectedMethod)
      } else if (selectedMethod === 'mpesa' || selectedMethod === 'emola') {
        if (!receiptFile) {
          setError('Por favor, faça upload do comprovante de pagamento')
          setUploading(false)
          return
        }
        await onPaymentComplete(selectedMethod, receiptFile)
      }
    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.')
      setUploading(false)
    }
  }

  const getPaymentNumber = () => {
    if (selectedMethod === 'mpesa') return mpesaPhone
    if (selectedMethod === 'emola') return emolaPhone
    return null
  }

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
            <h2 className="text-xl font-bold">Forma de Pagamento</h2>
            <button
              onClick={onClose}
              className="text-black-pure hover:text-gold-dark transition"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Resumo */}
            <div className="mb-6 bg-black-main rounded-lg p-4 border border-border">
              <p className="text-sm text-gray-medium mb-1">Cliente: <span className="font-semibold text-white">{customerName}</span></p>
              <p className="text-sm text-gray-medium mb-3">Total: <span className="font-bold text-gold text-lg">MT {total.toFixed(0)}</span></p>
            </div>

            {/* Opções de Pagamento */}
            <div className="space-y-4 mb-6">
              {/* Dinheiro */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('cash')
                  setError('')
                }}
                className={`w-full p-4 border-2 rounded-lg text-left transition bg-black-main ${
                  selectedMethod === 'cash'
                    ? 'border-gold bg-gold bg-opacity-10'
                    : 'border-border hover:border-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'cash' ? 'border-gold bg-gold' : 'border-border'
                  }`}>
                    {selectedMethod === 'cash' && (
                      <div className="w-3 h-3 rounded-full bg-black-pure" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Dinheiro em Mão</h3>
                    <p className="text-sm text-gray-medium">Pague diretamente no estabelecimento</p>
                  </div>
                </div>
              </button>

              {/* M-Pesa */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('mpesa')
                  setError('')
                }}
                disabled={!mpesaPhone}
                className={`w-full p-4 border-2 rounded-lg text-left transition bg-black-main ${
                  !mpesaPhone
                    ? 'border-border bg-dark-gray opacity-50 cursor-not-allowed'
                    : selectedMethod === 'mpesa'
                    ? 'border-gold bg-gold bg-opacity-10'
                    : 'border-border hover:border-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'mpesa' ? 'border-gold bg-gold' : 'border-border'
                  }`}>
                    {selectedMethod === 'mpesa' && (
                      <div className="w-3 h-3 rounded-full bg-black-pure" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {mpesaName ? (
                        <span className="text-gold">{mpesaName}</span>
                      ) : (
                        'M-Pesa'
                      )}
                    </h3>
                    {mpesaPhone ? (
                      <p className="text-sm text-gray-medium">Envie para: <span className="font-semibold text-white">{mpesaPhone}</span></p>
                    ) : (
                      <p className="text-sm text-red-300">M-Pesa não configurado</p>
                    )}
                  </div>
                </div>
              </button>

              {/* Emola */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('emola')
                  setError('')
                }}
                disabled={!emolaPhone}
                className={`w-full p-4 border-2 rounded-lg text-left transition bg-black-main ${
                  !emolaPhone
                    ? 'border-border bg-dark-gray opacity-50 cursor-not-allowed'
                    : selectedMethod === 'emola'
                    ? 'border-gold bg-gold bg-opacity-10'
                    : 'border-border hover:border-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'emola' ? 'border-gold bg-gold' : 'border-border'
                  }`}>
                    {selectedMethod === 'emola' && (
                      <div className="w-3 h-3 rounded-full bg-black-pure" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {emolaName ? (
                        <span className="text-gold">{emolaName}</span>
                      ) : (
                        'Emola'
                      )}
                    </h3>
                    {emolaPhone ? (
                      <p className="text-sm text-gray-medium">Envie para: <span className="font-semibold text-white">{emolaPhone}</span></p>
                    ) : (
                      <p className="text-sm text-red-300">Emola não configurado</p>
                    )}
                  </div>
                </div>
              </button>

              {/* POS */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('pos')
                  setError('')
                }}
                className={`w-full p-4 border-2 rounded-lg text-left transition bg-black-main ${
                  selectedMethod === 'pos'
                    ? 'border-gold bg-gold bg-opacity-10'
                    : 'border-border hover:border-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'pos' ? 'border-gold bg-gold' : 'border-border'
                  }`}>
                    {selectedMethod === 'pos' && (
                      <div className="w-3 h-3 rounded-full bg-black-pure" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">💳 POS (Terminal de Pagamento)</h3>
                    <p className="text-sm text-gray-medium">Um atendente irá à sua mesa para processar o pagamento</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Instruções e Upload (para M-Pesa/Emola) */}
            {(selectedMethod === 'mpesa' || selectedMethod === 'emola') && getPaymentNumber() && (
              <div className="mb-6 bg-gold bg-opacity-10 border-2 border-gold rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">Instruções de Pagamento:</h3>
                <div className="bg-black-main rounded p-3 mb-4 border border-border">
                  <p className="text-sm text-gray-medium mb-1">Método de Pagamento:</p>
                  <p className="text-base font-bold text-gold mb-3">
                    {selectedMethod === 'mpesa' ? (mpesaName || 'M-Pesa') : (emolaName || 'Emola')}
                  </p>
                  <p className="text-sm text-gray-medium mb-1">Valor a enviar:</p>
                  <p className="text-lg font-bold text-white mb-3">MT {total.toFixed(0)}</p>
                  <p className="text-sm text-gray-medium mb-1">Número para envio:</p>
                  <p className="text-base font-bold text-gold">{getPaymentNumber()}</p>
                </div>
                <p className="text-sm text-white mb-4">
                  Após realizar o pagamento, faça upload do comprovante abaixo:
                </p>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Comprovante de Pagamento *
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                    required={true}
                  />
                  {receiptFile && (
                    <p className="text-sm text-gold mt-2">
                      ✓ Arquivo selecionado: {receiptFile.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-medium mt-1">
                    Formatos aceitos: JPG, PNG, PDF (máx. 5MB)
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-dark-red bg-opacity-20 border border-dark-red text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-dark-gray text-white py-3 rounded-lg font-semibold hover:bg-gold hover:text-black-pure transition"
                disabled={uploading}
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={!selectedMethod || uploading || ((selectedMethod === 'mpesa' || selectedMethod === 'emola') && !receiptFile)}
                className="flex-1 bg-gold text-black-pure py-3 rounded-lg font-bold hover:bg-gold-bright transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Processando...' : (selectedMethod === 'cash' || selectedMethod === 'pos') ? 'Confirmar Pedido' : 'Enviar Comprovante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

