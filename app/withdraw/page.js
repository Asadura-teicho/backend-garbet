'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { paymentAPI, authAPI } from '@/lib/api'
import { formatAmount } from '@/utils/formatters'
import UserSidebar from '@/components/UserSidebar'
import { useTranslation } from '@/hooks/useTranslation'
import { getErrorMessage } from '@/utils/errorHandler'

function WithdrawPage() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [withdrawals, setWithdrawals] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchWithdrawals()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe()
      setUser(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        router.push('/auth/login')
      }
    }
  }

  const fetchWithdrawals = async () => {
    setLoadingHistory(true)
    try {
      const response = await paymentAPI.getWithdrawalRequests({})
      // Backend returns { withdrawalRequests, totalPages, currentPage, total }
      const withdrawalsData = response.data?.withdrawalRequests || response.data?.withdrawals
      // Ensure it's always an array
      if (Array.isArray(withdrawalsData)) {
        setWithdrawals(withdrawalsData)
      } else if (Array.isArray(response.data)) {
        setWithdrawals(response.data)
      } else {
        setWithdrawals([])
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err)
      setWithdrawals([]) // Set empty array on error
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      setError(t('errors.invalidAmount'))
      return
    }

    if (!user?.iban || !user?.ibanHolderName) {
      setError(t('errors.ibanRequired'))
      router.push('/profile')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await paymentAPI.createWithdrawal({
        amount: parseFloat(amount),
        description: description || t('common.withdrawTitle')
      })
      
      setSuccess(t('common.withdrawTitle') + ' ' + t('common.completed'))
      setAmount('')
      setDescription('')
      
      // Refresh user data and withdrawal history
      await fetchUser()
      await fetchWithdrawals()
    } catch (err) {
      setError(getErrorMessage(err) || t('errors.withdrawalFailed'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    return t(`withdraw.status.${status}`) || status
  }

  const quickAmounts = [100, 250, 500, 1000, 2500, 5000]

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <main className="flex-grow pt-8 sm:pt-12 pb-12">
              {/* Page Heading */}
              <div className="flex flex-wrap justify-between gap-4 p-4 mb-6">
                <div className="flex flex-col gap-2">
                  <p className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                    {t('withdraw.title')}
                  </p>
                  <p className="text-text-dark text-base font-normal leading-normal">
                    {t('withdraw.subtitle')}
                  </p>
                </div>
                {user && (
                  <div className="flex flex-col items-end">
                    <p className="text-text-dark text-sm">{t('withdraw.currentBalance')}</p>
                    <p className="text-white text-2xl font-bold">{formatAmount(user.balance || 0)}</p>
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 mx-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 mx-4 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 p-4">
                {/* Left Column: Withdrawal Form */}
                <div className="lg:col-span-2">
                  <div className="bg-surface-dark rounded-xl p-6 border border-white/10">
                    <h2 className="text-white text-xl font-bold mb-6">{t('withdraw.withdrawalForm')}</h2>
                    
                    {!user?.iban || !user?.ibanHolderName ? (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                        <p className="text-yellow-400 text-sm mb-2">
                          {t('withdraw.ibanInfoMissing')}
                        </p>
                        <button
                          onClick={() => router.push('/profile')}
                          className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                        >
                          {t('withdraw.goToProfile')}
                        </button>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-white/5 rounded-lg">
                        <p className="text-text-dark text-sm mb-1">{t('withdraw.ibanInfo')}</p>
                        <p className="text-white font-medium">{user.iban}</p>
                        <p className="text-text-dark text-sm mt-1">{user.ibanHolderName}</p>
                        {user.bankName && (
                          <p className="text-text-dark text-sm">{user.bankName}</p>
                        )}
                      </div>
                    )}

                    <form onSubmit={handleWithdraw}>
                      <div className="mb-6">
                        <label className="block text-white text-sm font-medium mb-2">
                          {t('withdraw.amount')}
                        </label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min="100"
                          max={user?.balance || 0}
                          step="0.01"
                          className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                          disabled={loading || !user?.iban || !user?.ibanHolderName}
                        />
                        <p className="text-text-dark text-xs mt-2">
                          {t('withdraw.minimum')}: ₺100 | {t('withdraw.maximum')}: {formatAmount(user?.balance || 0)}
                        </p>
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="mb-6">
                        <p className="text-text-dark text-sm mb-2">{t('withdraw.quickSelection')}</p>
                        <div className="flex flex-wrap gap-2">
                          {quickAmounts.map((quickAmount) => (
                            <button
                              key={quickAmount}
                              type="button"
                              onClick={() => {
                                if (quickAmount <= (user?.balance || 0)) {
                                  setAmount(quickAmount.toString())
                                }
                              }}
                              disabled={quickAmount > (user?.balance || 0) || loading || !user?.iban || !user?.ibanHolderName}
                              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ₺{quickAmount}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-white text-sm font-medium mb-2">
                          {t('withdraw.description')}
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder={t('withdraw.descriptionPlaceholder')}
                          rows="3"
                          className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          disabled={loading || !user?.iban || !user?.ibanHolderName}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !user?.iban || !user?.ibanHolderName || !amount || parseFloat(amount) <= 0}
                        className="w-full h-12 rounded-lg bg-primary text-black font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? t('withdraw.processing') : t('withdraw.createRequest')}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: Withdrawal History */}
                <div className="lg:col-span-1">
                  <div className="bg-surface-dark rounded-xl p-6 border border-white/10">
                    <h2 className="text-white text-xl font-bold mb-6">{t('withdraw.withdrawalHistory')}</h2>
                    
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    ) : withdrawals.length === 0 ? (
                      <p className="text-text-dark text-sm text-center py-8">
                        {t('withdraw.noWithdrawals')}
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {withdrawals.map((withdrawal) => (
                          <div
                            key={withdrawal._id}
                            className="p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-white font-medium">{formatAmount(withdrawal.amount)}</p>
                                <p className="text-text-dark text-xs mt-1">
                                  {new Date(withdrawal.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                                {getStatusText(withdrawal.status)}
                              </span>
                            </div>
                            {withdrawal.rejectionReason && (
                              <p className="text-red-400 text-xs mt-2">
                                {t('withdraw.rejectionReason')}: {withdrawal.rejectionReason}
                              </p>
                            )}
                            {withdrawal.adminNotes && (
                              <p className="text-text-dark text-xs mt-2">
                                {t('withdraw.note')}: {withdrawal.adminNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WithdrawPageWrapper() {
  return (
    <ProtectedRoute>
      <WithdrawPage />
    </ProtectedRoute>
  )
}
