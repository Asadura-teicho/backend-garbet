'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import ProtectedRoute from '@/components/ProtectedRoute'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { authAPI, transactionAPI, bonusAPI } from '@/lib/api'
import { log } from '@/utils/logger'
import { 
  mockUser, 
  mockTransactions, 
  mockBonuses, 
  mockGameHistory,
  mockRecentGames,
  getMockData,
  simulateApiDelay 
} from '@/lib/mockData'

function DashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState(t('dashboard.menuOverview'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [activeBonuses, setActiveBonuses] = useState([])
  const [recentGames, setRecentGames] = useState([])
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalWagered: 0,
    totalWon: 0,
    netResult: 0
  })

  const menuItems = [
    { id: 'overview', label: t('dashboard.menuOverview'), icon: 'dashboard', href: '/dashboard' },
    { id: 'deposit', label: t('dashboard.menuDeposit'), icon: 'account_balance_wallet', href: '/deposit' },
    { id: 'withdraw', label: t('dashboard.menuWithdraw'), icon: 'payments', href: '/withdraw' },
    { id: 'bet-history', label: t('dashboard.menuBetHistory'), icon: 'receipt_long', href: '/sports' },
    { id: 'game-history', label: t('dashboard.menuGameHistory'), icon: 'casino', href: '/slots' },
    { id: 'bonuses', label: t('dashboard.menuBonuses'), icon: 'emoji_events', href: '/bonuses' },
    { id: 'settings', label: t('dashboard.menuSettings'), icon: 'settings', href: '/profile' }
  ]

  // Fetch user data and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use mock data flag (default false - use real API)
        const USE_MOCK_DATA = false
        
        if (USE_MOCK_DATA) {
          await simulateApiDelay(800)
          setUser(mockUser || {})
          setRecentTransactions((mockTransactions || []).slice(0, 5))
          setActiveBonuses((mockBonuses || []).filter(b => b && b.status === 'active'))
          
          // Set recent games
          setRecentGames(mockRecentGames || [])
          
          // Calculate game stats
          const totalWagered = (mockGameHistory || []).reduce((sum, game) => sum + (game?.betAmount || 0), 0)
          const totalWon = (mockGameHistory || []).reduce((sum, game) => sum + (game?.winAmount || 0), 0)
          const netResult = totalWon - totalWagered
          setGameStats({
            totalGames: (mockGameHistory || []).length,
            totalWagered,
            totalWon,
            netResult
          })
          
          setLoading(false)
          return
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading dashboard data:', error)
        }
        // Set defaults on error
        setUser({ balance: 0, bonusBalance: 0 })
        setRecentTransactions([])
        setActiveBonuses([])
        setRecentGames([])
        setGameStats({ totalGames: 0, totalWagered: 0, totalWon: 0, netResult: 0 })
        setLoading(false)
        return
      }

      try {
        const userResponse = await authAPI.getMe()
        setUser(userResponse.data)
        
        // Fetch recent transactions
        try {
          const transactionsResponse = await transactionAPI.getMyTransactions({ limit: 5 })
          setRecentTransactions(transactionsResponse.data.transactions || [])
        } catch (err) {
          log.apiError('/transactions', err)
          // Fallback to mock data
          setRecentTransactions((mockTransactions || []).slice(0, 5))
        }

        // Fetch active bonuses
        try {
          const bonusesResponse = await bonusAPI.getMyBonuses()
          const allBonuses = bonusesResponse.data?.bonuses || []
          // Filter only active bonuses
          const active = allBonuses.filter(b => b && b.status === 'active')
          setActiveBonuses(active)
        } catch (err) {
          log.apiError('/bonus/my-bonuses', err)
          // Fallback to mock data
          setActiveBonuses((mockBonuses || []).filter(b => b && b.status === 'active'))
        }
      } catch (err) {
        log.apiError('/auth/me', err)
        // Fallback to mock data
        setUser(mockUser || {})
        setRecentTransactions((mockTransactions || []).slice(0, 5))
        setActiveBonuses((mockBonuses || []).filter(b => b && b.status === 'active'))
        // Don't redirect if using mock data
        // if (err.response?.status === 401) {
        //   router.push('/auth/login')
        // }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Format transaction for display
  const formatTransaction = (transaction) => {
    const isPositive = transaction.type === 'deposit' || transaction.type === 'win' || transaction.status === 'approved'
    const amount = Math.abs(transaction.amount || 0)
    
    let icon = 'receipt'
    let iconBg = 'bg-gray-500/10'
    let iconColor = 'text-gray-400'
    let title = transaction.type || 'Transaction'
    
    if (transaction.type === 'deposit') {
      icon = 'paid'
      iconBg = 'bg-teal/10'
      iconColor = 'text-teal'
      title = t('dashboard.activityDeposit')
    } else if (transaction.type === 'withdrawal') {
      icon = 'account_balance_wallet'
      iconBg = 'bg-blue-500/10'
      iconColor = 'text-blue-400'
      title = t('dashboard.activityWithdraw')
    } else if (transaction.type === 'bet') {
      icon = 'sports_soccer'
      iconBg = 'bg-red-500/10'
      iconColor = 'text-red-400'
      title = t('dashboard.activityBet')
    } else if (transaction.type === 'win') {
      icon = 'toll'
      iconBg = 'bg-green-500/10'
      iconColor = 'text-green-400'
      title = t('dashboard.activityWin')
    }

    const date = new Date(transaction.createdAt || Date.now())
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    let dateStr = ''
    if (diffDays === 0) {
      dateStr = `${t('dashboard.today')}, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      dateStr = `${t('dashboard.yesterday')}, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      dateStr = `${diffDays} ${t('dashboard.daysAgo')}`
    }

    return {
      id: transaction._id || transaction.id,
      title,
      description: transaction.description || transaction.metadata?.description || '',
      amount: `${isPositive ? '+' : '-'} ₺${amount.toFixed(2)}`,
      amountColor: isPositive ? 'text-green-400' : 'text-red-400',
      icon,
      iconBg,
      iconColor,
      date: dateStr
    }
  }

  // Active Bonuses Component
  function ActiveBonusesCard({ user, t }) {
    const [bonuses, setBonuses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchBonuses = async () => {
        const USE_MOCK_DATA = false
        
        if (USE_MOCK_DATA) {
          await simulateApiDelay(500)
          const active = mockBonuses.filter(b => b.status === 'active')
          setBonuses(active)
          setLoading(false)
          return
        }

        try {
          const response = await bonusAPI.getMyBonuses()
          const allBonuses = response.data?.bonuses || []
          const active = allBonuses.filter(b => b.status === 'active')
          setBonuses(active)
        } catch (err) {
          log.apiError('/bonus/my-bonuses', err)
          // Fallback to mock data
          setBonuses(mockBonuses.filter(b => b.status === 'active'))
        } finally {
          setLoading(false)
        }
      }
      fetchBonuses()
    }, [])

    const calculateProgress = (current, required) => {
      if (!required || required === 0) return 0
      return Math.min((current / required) * 100, 100)
    }

    if (loading) {
      return (
        <div className="rounded-lg bg-surface p-6 shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-2 bg-gray-700 rounded"></div>
          </div>
        </div>
      )
    }

    if (bonuses.length === 0) {
      return (
        <div className="rounded-lg bg-surface p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">{t('dashboard.activeBonuses')}</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">emoji_events</span>
            <p className="text-gray-400 text-sm text-center">No active bonuses</p>
            <Link
              href="/bonuses"
              className="mt-4 w-full flex items-center justify-center rounded-lg h-11 px-5 bg-[#3e3e47] text-white text-sm font-bold hover:bg-[#4a4a55] transition-colors"
            >
              <span className="truncate">{t('dashboard.seeAllBonuses')}</span>
            </Link>
          </div>
        </div>
      )
    }

    // Show first active bonus
    const firstBonus = bonuses[0]
    const progress = calculateProgress(
      firstBonus.rolloverProgress || firstBonus.currentTurnover || 0, 
      firstBonus.rolloverRequirement || firstBonus.requiredTurnover || 0
    )

    return (
      <div className="rounded-lg bg-surface p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">{t('dashboard.activeBonuses')}</h3>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-base font-semibold text-primary">
              {firstBonus.type === 'deposit_bonus' ? 'Deposit Bonus' : firstBonus.type === 'loss_bonus' ? 'Loss Bonus' : 'Bonus'}
            </p>
            <p className="text-2xl font-bold text-primary mb-1">
              ₺{firstBonus.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-sm text-gray-300">
              {firstBonus.description || (firstBonus.type === 'deposit_bonus' ? '20% deposit bonus' : '20% loss bonus')}
            </p>
          </div>
          {(firstBonus.rolloverRequirement || firstBonus.requiredTurnover) && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{t('dashboard.progress')}</span>
                <span>
                  ₺{(firstBonus.rolloverProgress || firstBonus.currentTurnover || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} / ₺{(firstBonus.rolloverRequirement || firstBonus.requiredTurnover).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-[#3e3e47] rounded-full h-2.5">
                <div
                  className="bg-blue h-2.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          <Link
            href="/bonuses"
            className="w-full mt-2 flex items-center justify-center rounded-lg h-11 px-5 bg-[#3e3e47] text-white text-sm font-bold hover:bg-[#4a4a55] transition-colors"
          >
            <span className="truncate">{t('dashboard.seeAllBonuses')}</span>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      {/* SideNavBar - Fixed */}
      <aside className="fixed left-0 top-0 h-screen w-64 flex-col bg-background-dark border-r border-surface hidden lg:flex z-50">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-surface">
          <div className="size-8 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_6_319)">
                <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"></path>
              </g>
              <defs><clipPath id="clip0_6_319"><rect fill="white" height="48" width="48"></rect></clipPath></defs>
            </svg>
          </div>
          <Link href="/">
            <h2 className="text-white text-xl font-bold">Garbet</h2>
          </Link>
        </div>
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAuhux6dpQvPR-RdOeaTaRrgQkV5Eq0ycakfmhZ14nIjMP68y4K7cXqyORaLFyN0P3tEwtd0zZqPHn5rulfpLx7bkvQElTJmDbLf6Z44yXJAlanpWVQqtzFfVEkFtQzWBb5CBABwV-PJyT82HfkwXfNrquaMr92GzVOd2NyezQu1QoSzfn8PkY_ukvA5q1szlNZBBw1SZD83oQj2FTqIMaRH8Js3ufJIyWtGhy9ml7_96FcmxSt35SIW7FQ2v-822p0zaAR0bRc0S8")' }}></div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-medium leading-normal">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User'}</h1>
              <p className="text-gray-400 text-sm font-normal leading-normal">{user?.email || 'user@email.com'}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard' && activeMenu === item.label)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    setActiveMenu(item.label)
                    // Ensure navigation works
                    console.log('Navigating to:', item.href)
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface text-primary'
                      : 'hover:bg-surface/50 text-white'
                  }`}
                  prefetch={true}
                  style={{ pointerEvents: 'auto' }}
                >
                  <span
                    className={`material-symbols-outlined ${isActive ? 'text-blue' : 'text-white/70'}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <p className="text-white text-sm font-medium leading-normal">{item.label}</p>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        {/* TopNavBar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-surface px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4 text-white">
            <button className="lg:hidden p-2 -ml-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden items-center gap-4 text-white lg:flex">
              <div className="size-5 text-primary">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip1_6_319)">
                    <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"></path>
                  </g>
                  <defs>
                    <clipPath id="clip1_6_319">
                      <rect fill="white" height="48" width="48"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <Link href="/">
                <h2 className="text-white text-lg font-bold">Garbet</h2>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-gray-400">{t('common.balance')}</span>
              <span className="font-bold text-white">₺{user?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            <Link href="/deposit" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold shadow-md hover:brightness-110 transition-all">
              <span className="truncate">{t('common.deposit')}</span>
            </Link>
            <button 
              onClick={() => {
                // TODO: Open notifications modal or navigate to notifications page
                console.log('Notifications clicked')
              }}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-surface text-white gap-2 text-sm font-bold min-w-0 px-2.5 hover:bg-surface/80 transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 hidden sm:block" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_Dqon_1r08olFx9dGrieAk2FkxXdxlY_aVC96bO-COx1kf4TE6RT2zvFYTnBerRh1dbUvqTXwacCTwfYwr9-WG58W72qmIaKv93ik0_SJ55IN2zR7sobveE-fk2ed44m2aPMMlvJMYVo31_fjYj3LzQtjA4lNHc5CyAhMwXIVoX-cHiZst3G6McMDdtmWY47YTEfIPeW_C5DNSH4R7JuaHK1bRHd5M8TnxjBz5ceOS5BWyKZFaxCEIodf2NJmbeWYKvZQE-d4j1c")' }}></div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-8">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex min-w-72 flex-col gap-1">
                <p className="text-white text-3xl md:text-4xl font-black tracking-tight">{t('dashboard.title')}</p>
                <p className="text-gray-400 text-base font-normal">{t('dashboard.welcomeBack')}</p>
              </div>
            </div>

            {/* Grid for cards */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                {/* Wallet Card */}
                <div className="rounded-lg bg-surface p-6 shadow-lg">
                  <p className="text-gray-400 text-sm font-medium mb-1">{t('dashboard.myWallet')}</p>
                  <p className="text-white text-4xl font-bold tracking-tight mb-2">₺{user?.balance?.toFixed(2) || '0.00'}</p>
                  <p className="text-gray-300 text-base font-normal mb-6">{t('dashboard.cashBalance')}: ₺{((user?.balance || 0) - (user?.bonusBalance || 0)).toFixed(2)} | {t('dashboard.bonusBalance')}: ₺{user?.bonusBalance?.toFixed(2) || '0.00'}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/deposit" className="flex flex-1 sm:flex-none min-w-[120px] items-center justify-center rounded-lg h-12 px-5 bg-primary text-background-dark text-base font-bold shadow-md hover:brightness-110 transition-all">
                      <span className="truncate">{t('common.deposit')}</span>
                    </Link>
                    <Link href="/withdraw" className="flex flex-1 sm:flex-none min-w-[120px] items-center justify-center rounded-lg h-12 px-5 bg-[#3e3e47] text-white text-base font-bold hover:bg-[#4a4a55] transition-colors">
                      <span className="truncate">{t('common.withdraw')}</span>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg bg-surface p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">{t('dashboard.recentActivities')}</h3>
                  <div className="flex flex-col gap-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => {
                        const activity = formatTransaction(transaction)
                        return (
                          <div key={activity.id} className="flex items-center gap-4">
                            <div className={`flex items-center justify-center size-10 rounded-full ${activity.iconBg}`}>
                              <span className={`material-symbols-outlined ${activity.iconColor}`}>{activity.icon}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white">{activity.title}</p>
                              <p className="text-sm text-gray-400">{activity.description}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${activity.amountColor}`}>{activity.amount}</p>
                              <p className="text-xs text-gray-500">{activity.date}</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">{t('dashboard.noActivities') || 'No recent activities'}</p>
                    )}
                  </div>
                </div>

                {/* Recent Games */}
                <div className="rounded-lg bg-surface p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Recent Games</h3>
                    <Link href="/slots" className="text-sm text-primary hover:text-primary/80 font-medium">
                      View All
                    </Link>
                  </div>
                  <div className="flex flex-col gap-4">
                    {recentGames && recentGames.length > 0 ? (
                      recentGames.map((game) => {
                        const gameHistory = mockGameHistory?.find(g => g.gameName === game.name)
                        const date = game.lastPlayed ? new Date(game.lastPlayed) : new Date()
                        const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                        
                        return (
                          <div key={game.id || game._id} className="flex items-center gap-4">
                            <div className="flex items-center justify-center size-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 overflow-hidden">
                              {game.image ? (
                                <div 
                                  className="w-full h-full bg-center bg-cover bg-no-repeat"
                                  style={{ backgroundImage: `url("${game.image}")` }}
                                ></div>
                              ) : (
                                <span className="material-symbols-outlined text-white/60">casino</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white">{game.name || 'Unknown Game'}</p>
                              <p className="text-sm text-gray-400">{game.provider || 'Unknown'} • {game.type === 'slot' ? 'Slot' : game.type === 'live_casino' ? 'Live Casino' : 'Game'}</p>
                            </div>
                            <div className="text-right">
                              {gameHistory ? (
                                <>
                                  <p className={`font-bold ${gameHistory.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {gameHistory.netResult >= 0 ? '+' : ''}₺{(gameHistory.netResult || 0).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500">{dateStr}</p>
                                </>
                              ) : (
                                <p className="text-xs text-gray-500">{dateStr}</p>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No recent games</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="xl:col-span-1 flex flex-col gap-6">
                {/* Active Bonuses Card */}
                <ActiveBonusesCard user={user} t={t} />

                {/* Game Statistics Card */}
                <div className="rounded-lg bg-surface p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Game Statistics</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Games Played</p>
                      <p className="text-2xl font-bold text-white">{gameStats.totalGames}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Wagered</p>
                      <p className="text-xl font-bold text-white">₺{gameStats.totalWagered.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Won</p>
                      <p className="text-xl font-bold text-green-400">₺{gameStats.totalWon.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Net Result</p>
                      <p className={`text-2xl font-bold ${gameStats.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {gameStats.netResult >= 0 ? '+' : ''}₺{gameStats.netResult.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Link 
                      href="/slots" 
                      className="w-full mt-2 flex items-center justify-center rounded-lg h-11 px-5 bg-[#3e3e47] text-white text-sm font-bold hover:bg-[#4a4a55] transition-colors"
                    >
                      <span className="truncate">View Game History</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardPageWrapper() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}
