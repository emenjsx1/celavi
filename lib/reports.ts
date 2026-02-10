// Funções utilitárias para geração de relatórios

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export interface ReportData {
  orders: Array<{
    orderNumber: string
    customerName: string
    customerPhone: string
    totalAmount: number
    paymentMethod: string
    status: string
    createdAt: string
  }>
  summary: {
    totalRevenue: number
    totalOrders: number
    averageTicket: number
    startDate?: string
    endDate?: string
  }
}

/**
 * Gera relatório em PDF
 */
export function generatePDFReport(data: ReportData, storeName: string): Blob {
  const doc = new jsPDF()
  
  // Cabeçalho
  doc.setFontSize(18)
  doc.text('Relatório Financeiro', 14, 22)
  doc.setFontSize(12)
  doc.text(storeName, 14, 30)
  
  if (data.summary.startDate && data.summary.endDate) {
    doc.setFontSize(10)
    doc.text(
      `Período: ${formatDate(data.summary.startDate)} - ${formatDate(data.summary.endDate)}`,
      14,
      38
    )
  }
  
  // Resumo
  let yPos = 50
  doc.setFontSize(12)
  doc.text('Resumo', 14, yPos)
  yPos += 8
  
  doc.setFontSize(10)
  doc.text(`Total Recebido: MT ${data.summary.totalRevenue.toFixed(0)}`, 14, yPos)
  yPos += 6
  doc.text(`Total de Pedidos: ${data.summary.totalOrders}`, 14, yPos)
  yPos += 6
  doc.text(`Ticket Médio: MT ${data.summary.averageTicket.toFixed(0)}`, 14, yPos)
  yPos += 10
  
  // Tabela de pedidos
  const tableData = data.orders.map(order => [
    order.orderNumber,
    order.customerName,
    order.customerPhone,
    `MT ${order.totalAmount.toFixed(0)}`,
    formatPaymentMethod(order.paymentMethod),
    formatStatus(order.status),
    formatDate(order.createdAt),
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [['Pedido', 'Cliente', 'Telefone', 'Valor', 'Pagamento', 'Status', 'Data']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [112, 15, 18] }, // Cor vermelha do tema
  })
  
  // Rodapé
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-MZ')}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }
  
  return doc.output('blob')
}

/**
 * Gera relatório em Excel
 */
export function generateExcelReport(data: ReportData, storeName: string): Blob {
  const workbook = XLSX.utils.book_new()
  
  // Planilha de Resumo
  const summaryData = [
    ['Relatório Financeiro', storeName],
    [''],
    ['Resumo'],
    ['Total Recebido', `MT ${data.summary.totalRevenue.toFixed(0)}`],
    ['Total de Pedidos', data.summary.totalOrders],
    ['Ticket Médio', `MT ${data.summary.averageTicket.toFixed(0)}`],
  ]
  
  if (data.summary.startDate && data.summary.endDate) {
    summaryData.push([
      'Período',
      `${formatDate(data.summary.startDate)} - ${formatDate(data.summary.endDate)}`,
    ])
  }
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')
  
  // Planilha de Pedidos
  const ordersData = [
    ['Pedido', 'Cliente', 'Telefone', 'Valor', 'Pagamento', 'Status', 'Data'],
    ...data.orders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.totalAmount,
      formatPaymentMethod(order.paymentMethod),
      formatStatus(order.status),
      formatDate(order.createdAt),
    ]),
  ]
  
  const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData)
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Pedidos')
  
  // Gerar arquivo
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/**
 * Formata data para exibição
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata método de pagamento
 */
function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'cash':
      return 'Dinheiro'
    case 'mpesa':
      return 'M-Pesa'
    case 'emola':
      return 'Emola'
    case 'pos':
      return 'POS'
    default:
      return method
  }
}

/**
 * Formata status
 */
function formatStatus(status: string): string {
  switch (status) {
    case 'pending_approval':
      return 'Aguardando aprovação'
    case 'approved':
      return 'Aprovado'
    case 'paid':
      return 'Pago'
    case 'preparing':
      return 'Preparando'
    case 'ready':
      return 'Pronto'
    case 'delivered':
      return 'Entregue'
    case 'cancelled':
      return 'Cancelado'
    default:
      return status
  }
}







