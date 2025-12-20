'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { transactionAPI } from '@/lib/api'
import { formatDate, formatDateTime, formatAmount } from '@/utils/formatters'
import UserSidebar from '@/components/UserSidebar'

function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, typeFilter, statusFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 50,
      }
      if (typeFilter !== 'all') params.type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await transactionAPI.getMyTransactions(params)
      const data = response.data?.transactions || response.data?.data || response.data || []
      
      setTransactions(Array.isArray(data) ? data : [])
      setTotalPages(response.data?.totalPages || 1)
      setTotal(response.data?.total || data.length)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(err.response?.data?.message || 'İşlem geçmişi yüklenemedi')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-500/20 text-green-400'
      case 'withdrawal':
        return 'bg-red-500/20 text-red-400'
      case 'win':
      case 'admin_credit':
        return 'bg-blue-500/20 text-blue-400'
      case 'bet':
      case 'admin_debit':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeText = (type) => {
    const typeMap = {
      deposit: 'Yatırım',
      withdrawal: 'Çekim',
      bet: 'Bahis',
      win: 'Kazanç',
      refund: 'İade',
      bet_round: 'Round Bahis',
      admin_credit: 'Admin Kredi',
      admin_debit: 'Admin Borç',
    }
    return typeMap[type] || type
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'failed':
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Beklemede',
      completed: 'Tamamlandı',
      failed: 'Başarısız',
      cancelled: 'İptal Edildi',
      rejected: 'Reddedildi',
    }
    return statusMap[status] || status
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <main className="flex-grow pt-8 sm:pt-12 pb-12">
              {/* Page Heading */}
              <div className="flex flex-wrap justify-between gap-4 p-4 mb-6">
                <div className="flex flex-col gap-2">
                  <p className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                    İşlem Geçmişi
                  </p>
                  <p className="text-text-dark text-base font-normal leading-normal">
                    Tüm işlemlerinizin detaylı geçmişi
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6 p-4">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tüm İşlemler</option>
                  <option value="deposit">Yatırımlar</option>
                  <option value="withdrawal">Çekimler</option>
                  <option value="bet">Bahisler</option>
                  <option value="win">Kazançlar</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="completed">Tamamlanan</option>
                  <option value="pending">Bekleyen</option>
                  <option value="failed">Başarısız</option>
                  <option value="cancelled">İptal Edilen</option>
                </select>

                <button
                  onClick={() => {
                    setTypeFilter('all')
                    setStatusFilter('all')
                    setCurrentPage(1)
                  }}
                  className="h-12 px-4 rounded-lg bg-transparent border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 mx-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Transactions Table */}
              <div className="p-4">
                <div className="bg-surface-dark rounded-xl border border-white/10 overflow-hidden">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-text-dark">İşlem geçmişi bulunamadı</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                                Tarih
                              </th>
                              <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                                İşlem Türü
                              </th>
                              <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                                Tutar
                              </th>
                              <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                                Durum
                              </th>
                              <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                                Açıklama
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {transactions.map((transaction) => (
                              <tr key={transaction._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-text-dark text-sm">
                                  {formatDateTime(transaction.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                    {getTypeText(transaction.type)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-white text-sm font-medium">
                                  {formatAmount(transaction.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                    {getStatusText(transaction.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-text-dark text-sm">
                                  {transaction.description || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                          <p className="text-text-dark text-sm">
                            Toplam {total} işlem
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                              Önceki
                            </button>
                            <span className="text-white px-4">
                              Sayfa {currentPage} / {totalPages}
                            </span>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                              Sonraki
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TransactionsPageWrapper() {
  return (
    <ProtectedRoute>
      <TransactionsPage />
    </ProtectedRoute>
  )
}

