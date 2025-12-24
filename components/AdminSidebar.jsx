'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export default function AdminSidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: 'dashboard', href: '/admin' },
    { id: 'users', label: t('admin.users'), icon: 'group', href: '/admin/users' },
    { id: 'kyc', label: t('admin.kyc'), icon: 'badge', href: '/admin/kyc' },
    { id: 'games', label: t('admin.games'), icon: 'gamepad', href: '/admin/games' },
    { id: 'dice-games', label: 'Dice Games', icon: 'sports_esports', href: '/admin/dice-games' },
    { id: 'betting', label: t('admin.betting'), icon: 'sports_soccer', href: '/admin/betting' },
    { id: 'promotions', label: t('admin.promotions'), icon: 'campaign', href: '/admin/promotions' },
    { id: 'deposits', label: t('admin.deposits'), icon: 'arrow_downward', href: '/admin/deposits' },
    { id: 'withdrawals', label: t('admin.withdrawals'), icon: 'arrow_upward', href: '/admin/withdrawals' },
    { id: 'tournaments', label: t('admin.tournaments'), icon: 'emoji_events', href: '/admin/tournaments' },
    { id: 'content', label: t('admin.content'), icon: 'wysiwyg', href: '/admin/content' },
  ]

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-background-dark border border-surface rounded-lg text-white hover:bg-white/10 transition-colors"
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">{isMobileOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[55]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col bg-background-dark border-r border-surface p-4 z-40 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="material-symbols-outlined text-black">casino</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-white">{t('admin.title')}</h1>
          <p className="text-sm text-gray-400">{t('admin.management')}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === item.href || (item.id === 'dashboard' && pathname === '/admin') || pathname.startsWith(item.href + '/')
                ? 'bg-primary/20 text-primary'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <p>{item.label}</p>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Link
          href="/admin/settings"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <p className="text-sm font-medium">{t('admin.settings')}</p>
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('isAdmin')
            localStorage.removeItem('adminEmail')
            window.location.href = '/auth/login'
          }}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium">{t('admin.logout')}</p>
        </button>
      </div>
    </aside>
    </>
  )
}

