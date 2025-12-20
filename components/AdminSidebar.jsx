'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function AdminSidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const navItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: 'dashboard', href: '/admin' },
    { id: 'users', label: t('admin.users'), icon: 'group', href: '/admin/users' },
    { id: 'kyc', label: t('admin.kyc'), icon: 'badge', href: '/admin/kyc' },
    { id: 'games', label: t('admin.games'), icon: 'gamepad', href: '/admin/games' },
    { id: 'betting', label: t('admin.betting'), icon: 'sports_soccer', href: '/admin/betting' },
    { id: 'promotions', label: t('admin.promotions'), icon: 'campaign', href: '/admin/promotions' },
    { id: 'deposits', label: t('admin.deposits'), icon: 'arrow_downward', href: '/admin/deposits' },
    { id: 'withdrawals', label: t('admin.withdrawals'), icon: 'arrow_upward', href: '/admin/withdrawals' },
    { id: 'tournaments', label: t('admin.tournaments'), icon: 'emoji_events', href: '/admin/tournaments' },
    { id: 'content', label: t('admin.content'), icon: 'wysiwyg', href: '/admin/content' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-background-dark border-r border-surface p-4 z-50">
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
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === item.href || (item.id === 'dashboard' && pathname === '/admin')
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
        <div className="mb-2 px-3">
          <LanguageSwitcher />
        </div>
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <p className="text-sm font-medium">{t('admin.settings')}</p>
        </Link>

        <button
          onClick={() => {
            window.location.href = '/admin/logout'
          }}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium">{t('admin.logout')}</p>
        </button>
      </div>
    </aside>
  )
}

