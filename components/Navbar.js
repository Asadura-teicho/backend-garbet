'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import NotificationDropdown from '@/components/NotificationDropdown'
import { getCurrentUser, isAuthenticated, logout as authLogout } from '@/utils/auth'

export default function Navbar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState('00:00:00')
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      if (authenticated) {
        const userData = getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
      }
    }

    checkAuth()
    // Check auth state periodically (when localStorage changes)
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [pathname])

  const handleLogout = () => {
    authLogout()
    setUser(null)
    setIsLoggedIn(false)
    router.push('/')
  }

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="flex flex-col sticky top-0 z-50 bg-[#151328]/90 backdrop-blur-sm animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-4">
          <Link href="/">
            <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em] italic">Garbet</h2>
          </Link>
        </div>
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/deposit" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-green-500 text-white text-xs font-bold leading-normal tracking-wide hover:bg-green-600 transition-all hover-lift button-press gap-1">
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
              <span className="truncate">{t('common.depositButton')}</span>
            </Link>
            <Link href="/bonuses" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-yellow-500 text-black text-xs font-bold leading-normal tracking-wide hover:bg-yellow-600 transition-all hover-lift button-press gap-1">
              <span className="material-symbols-outlined text-base">star</span>
              <span className="truncate">{t('common.bonusesButton')}</span>
            </Link>
            {/* <Link href="/messages" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-[#2b284e] text-white text-xs font-bold leading-normal tracking-wide hover:bg-[#3a376a] transition-colors gap-1">
              <span className="material-symbols-outlined text-base">email</span>
              <span className="truncate">{t('common.messagesButton')}</span>
            </Link> */}
          </div>
        )}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* User Balance */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs text-white/70">{t('common.balance')}</span>
                <span className="font-bold text-white text-sm">₺{user?.balance?.toFixed(2) || '0.00'}</span>
              </div>

              {/* Notifications */}
              <NotificationDropdown userId={user?._id || user?.id} />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded h-9 px-3 bg-[#2b284e] text-white text-xs font-bold hover:bg-[#3a376a] transition-colors"
                >
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_Dqon_1r08olFx9dGrieAk2FkxXdxlY_aVC96bO-COx1kf4TE6RT2zvFYTnBerRh1dbUvqTXwacCTwfYwr9-WG58W72qmIaKv93ik0_SJ55IN2zR7sobveE-fk2ed44m2aPMMlvJMYVo31_fjYj3LzQtjA4lNHc5CyAhMwXIVoX-cHiZst3G6McMDdtmWY47YTEfIPeW_C5DNSH4R7JuaHK1bRHd5M8TnxjBz5ceOS5BWyKZFaxCEIodf2NJmbeWYKvZQE-d4j1c")' }}></div>
                  <span className="hidden sm:block truncate max-w-[100px]">{user?.username || user?.firstName || 'User'}</span>
                  <span className="material-symbols-outlined text-base">{showUserMenu ? 'expand_less' : 'expand_more'}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#1f1d37] border border-white/10 shadow-lg z-50">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-white text-sm font-bold">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User'}</p>
                      <p className="text-white/60 text-xs">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-white text-sm hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">dashboard</span>
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-white text-sm hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">person</span>
                        Profile
                      </Link>
                      {user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'operator' ? (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-white text-sm hover:bg-white/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                          Admin Panel
                        </Link>
                      ) : null}
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 text-sm hover:bg-red-500/10 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-blue-600 text-white text-xs font-bold leading-normal tracking-wide hover:bg-blue-700 transition-all">
                <span className="truncate">{t('common.signIn')}</span>
              </Link>
              <Link href="/auth/register" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-gray-600 text-white text-xs font-bold leading-normal tracking-wide hover:bg-gray-700 transition-colors">
                <span className="truncate">{t('common.signUp')}</span>
              </Link>
            </>
          )}
          <div className="hidden sm:flex items-center gap-4 pl-2">
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>{currentTime}</span>
            </div>
          </div>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden flex items-center justify-center h-9 w-9 text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{showMobileMenu ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-white/10 bg-[#1f1d37]">
          <nav className="flex flex-col py-2">
            <Link
              href="/promotions"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/promotions') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">military_tech</span>
              {t('common.promotions')}
            </Link>
            <Link
              href="/live-betting"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/live-betting') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">bolt</span>
              {t('common.liveBet')}
            </Link>
            <Link
              href="/sports"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/sports') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">sports_soccer</span>
              {t('common.sports')}
            </Link>
            <Link
              href="/slots"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/slots') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">casino</span>
              {t('common.slotGames')}
            </Link>
            <Link
              href="/live-casino"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/live-casino') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">playing_cards</span>
              {t('common.liveCasino')}
            </Link>
            <Link
              href="/dice-roll"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/dice-roll') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">casino</span>
              Dice Roll
            </Link>
            <Link
              href="/crash"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/crash') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">trending_up</span>
              {t('common.crash')}
            </Link>
            <Link
              href="/tv-games"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/tv-games') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">live_tv</span>
              {t('common.tvGames')}
            </Link>
            <Link
              href="/tournaments"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/tournaments') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">emoji_events</span>
              {t('common.tournaments')}
            </Link>
            <Link
              href="/more"
              onClick={() => setShowMobileMenu(false)}
              className={`px-4 py-2 text-sm ${isActive('/more') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">more_horiz</span>
              {t('common.more')}
            </Link>
          </nav>
        </div>
      )}

      {/* Navigation Bar */}

      <nav className="hidden lg:flex p-3 items-center justify-center gap-8 border-t border-b border-white/10 px-4 sm:px-6 lg:px-8 bg-[#1f1d37]">
        {[
          { href: '/promotions', label: t('common.promotions'), icon: 'military_tech' },
          { href: '/live-betting', label: t('common.liveBet'), icon: 'bolt' },
          { href: '/sports', label: t('common.sports'), icon: 'sports_soccer' },
          { href: '/slots', label: t('common.slotGames'), icon: 'casino' },
          { href: '/live-casino', label: t('common.liveCasino'), icon: 'playing_cards' },
          { href: '/crash', label: t('common.crash'), icon: 'trending_up' },
          { href: '/tv-games', label: t('common.tvGames'), icon: 'live_tv' },
          { href: '/tournaments', label: t('common.tournaments'), icon: 'emoji_events' },
          { href: '/more', label: t('common.more'), icon: 'more_horiz' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`secondary-nav-item flex items-center gap-2 text-sm px-3 py-1 rounded ${isActive(item.href) ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'
              }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: isActive(item.href) ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>


      {/* Click outside to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </header>
  )
}

