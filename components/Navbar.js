'use client'

import { useState, useEffect, useRef } from 'react'
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
  const userMenuRef = useRef(null)

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
    
    // Listen for user data updates
    const handleUserDataUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail)
      }
    }
    
    window.addEventListener('userDataUpdated', handleUserDataUpdate)
    
    // Check auth state periodically (when localStorage changes)
    const interval = setInterval(checkAuth, 2000) // Check every 2 seconds
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('userDataUpdated', handleUserDataUpdate)
    }
  }, [pathname])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showUserMenu])
  
  // Fetch fresh user data periodically to update balance
  useEffect(() => {
    if (!isLoggedIn) return
    
    const fetchUserBalance = async () => {
      try {
        const { authAPI } = await import('@/lib/api')
        const response = await authAPI.me()
        if (response.data) {
          const { updateUserData } = await import('@/utils/auth')
          updateUserData(response.data)
        }
      } catch (err) {
        // Silently fail - balance will update on next successful fetch
      }
    }
    
    // Fetch balance every 5 seconds
    const balanceInterval = setInterval(fetchUserBalance, 5000)
    
    return () => clearInterval(balanceInterval)
  }, [isLoggedIn])

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
    <header className="flex flex-col sticky top-0 z-50 bg-[#151328]/95 backdrop-blur-md shadow-lg border-b border-white/5">
      {/* Top Bar */}
      <div className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-4">
          <Link href="/">
            <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em] italic">Garbet</h2>
          </Link>
        </div>
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/deposit" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-green-500 text-white text-xs font-bold leading-normal tracking-wide hover:bg-green-600 transition-all gap-1">
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
              <span className="truncate">{t('common.depositButton')}</span>
            </Link>
            <Link href="/bonuses" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-yellow-500 text-black text-xs font-bold leading-normal tracking-wide hover:bg-yellow-600 transition-colors gap-1">
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
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserMenu(!showUserMenu)
                  }}
                  className="flex items-center gap-2 rounded h-9 px-3 bg-[#2b284e] text-white text-xs font-bold hover:bg-[#3a376a] transition-colors"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_Dqon_1r08olFx9dGrieAk2FkxXdxlY_aVC96bO-COx1kf4TE6RT2zvFYTnBerRh1dbUvqTXwacCTwfYwr9-WG58W72qmIaKv93ik0_SJ55IN2zR7sobveE-fk2ed44m2aPMMlvJMYVo31_fjYj3LzQtjA4lNHc5CyAhMwXIVoX-cHiZst3G6McMDdtmWY47YTEfIPeW_C5DNSH4R7JuaHK1bRHd5M8TnxjBz5ceOS5BWyKZFaxCEIodf2NJmbeWYKvZQE-d4j1c")' }}></div>
                  <span className="hidden sm:block truncate max-w-[100px]">{user?.username || user?.firstName || 'User'}</span>
                  <span className="material-symbols-outlined text-base">{showUserMenu ? 'expand_less' : 'expand_more'}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#1f1d37] border border-white/10 shadow-xl z-[60] animate-fade-in">
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
            onClick={(e) => {
              e.stopPropagation()
              const newState = !showMobileMenu
              setShowMobileMenu(newState)
              // Prevent body scroll when mobile menu is open
              if (newState) {
                document.body.classList.add('mobile-menu-open')
              } else {
                document.body.classList.remove('mobile-menu-open')
              }
            }}
            className="lg:hidden flex items-center justify-center h-9 w-9 text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Toggle menu"
            aria-expanded={showMobileMenu}
          >
            <span className="material-symbols-outlined">{showMobileMenu ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Click outside to close mobile menu only - Must be before menu */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-[45] lg:hidden bg-black/20"
          onClick={() => {
            setShowMobileMenu(false)
            document.body.classList.remove('mobile-menu-open')
          }}
        />
      )}

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-white/10 bg-[#1f1d37] animate-slide-in-left relative z-[50]" onClick={(e) => e.stopPropagation()}>
          <nav className="flex flex-col py-2">
            <Link
              href="/promotions"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/promotions') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">military_tech</span>
              {t('common.promotions')}
            </Link>
            <Link
              href="/live-betting"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/live-betting') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">bolt</span>
              {t('common.liveBet')}
            </Link>
            <Link
              href="/sports"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/sports') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">sports_soccer</span>
              {t('common.sports')}
            </Link>
            <Link
              href="/slots"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/slots') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">casino</span>
              {t('common.slotGames')}
            </Link>
            {/* COMMENTED OUT - Live Casino Disabled
            <Link
              href="/live-casino"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm ${isActive('/live-casino') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">playing_cards</span>
              {t('common.liveCasino')}
            </Link>
            */}
            <Link
              href="/dice-roll"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/dice-roll') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">casino</span>
              Dice Roll
            </Link>
            <Link
              href="/crash"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/crash') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">trending_up</span>
              {t('common.crash')}
            </Link>
            <Link
              href="/tv-games"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/tv-games') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">live_tv</span>
              {t('common.tvGames')}
            </Link>
            <Link
              href="/tournaments"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/tournaments') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">emoji_events</span>
              {t('common.tournaments')}
            </Link>
            <Link
              href="/more"
              onClick={(e) => {
                e.stopPropagation()
                setShowMobileMenu(false)
                document.body.classList.remove('mobile-menu-open')
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer ${isActive('/more') ? 'text-[#0dccf2] bg-[#0dccf2]/10' : 'text-white/80 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-2">more_horiz</span>
              {t('common.more')}
            </Link>
          </nav>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="hidden lg:flex items-center justify-center gap-6 border-t border-b border-white/10 bg-[#1f1d37] px-4 sm:px-6 lg:px-8 py-3">
  <Link
    href="/promotions"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/promotions') ? 'active' : ''}`}
  >
    <span className="material-symbols-outlined text-base">military_tech</span>
    {t('common.promotions')}
  </Link>

  <Link
    href="/live-betting"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/live-betting') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/live-betting') ? "'FILL' 1" : "'FILL' 0" }}
    >
      bolt
    </span>
    {t('common.liveBet')}
  </Link>

  <Link
    href="/sports"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/sports') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/sports') ? "'FILL' 1" : "'FILL' 0" }}
    >
      sports_soccer
    </span>
    {t('common.sports')}
  </Link>

  <Link
    href="/slots"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/slots') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/slots') ? "'FILL' 1" : "'FILL' 0" }}
    >
      casino
    </span>
    {t('common.slotGames')}
  </Link>

  {/* COMMENTED OUT - Live Casino Disabled
  <Link
    href="/live-casino"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/live-casino') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/live-casino') ? "'FILL' 1" : "'FILL' 0" }}
    >
      playing_cards
    </span>
    {t('common.liveCasino')}
  </Link>
  */}

  <Link
    href="/crash"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/crash') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/crash') ? "'FILL' 1" : "'FILL' 0" }}
    >
      trending_up
    </span>
    {t('common.crash')}
  </Link>

  <Link
    href="/tv-games"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/tv-games') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/tv-games') ? "'FILL' 1" : "'FILL' 0" }}
    >
      live_tv
    </span>
    {t('common.tvGames')}
  </Link>

  <Link
    href="/tournaments"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/tournaments') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/tournaments') ? "'FILL' 1" : "'FILL' 0" }}
    >
      emoji_events
    </span>
    {t('common.tournaments')}
  </Link>

  <Link
    href="/more"
    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg secondary-nav-item ${isActive('/more') ? 'active' : ''}`}
  >
    <span
      className="material-symbols-outlined text-base"
      style={{ fontVariationSettings: isActive('/more') ? "'FILL' 1" : "'FILL' 0" }}
    >
      more_horiz
    </span>
    {t('common.more')}
  </Link>
</nav>
    </header>
  )
}

