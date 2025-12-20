'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { adminAPI } from '@/lib/api'
import { formatDate } from '@/utils/formatters'
import { log } from '@/utils/logger'

function GameManagement() {
  const pathname = usePathname()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [gameTypeFilter, setGameTypeFilter] = useState('all')
  const [providerFilter, setProviderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [providers, setProviders] = useState([])
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    gameType: 'slots',
    gameId: '',
    thumbnail: '',
    status: 'active',
    description: '',
    minBet: 0,
    maxBet: null,
    rtp: null,
    features: [],
    tags: [],
    isNew: false,
    isFeatured: false,
    isHot: false,
  })

const navItems = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', href: '/admin' },
  { id: 'users', label: 'User Management', icon: 'group', href: '/admin/users' },
  { id: 'kyc', label: 'KYC Management', icon: 'badge', href: '/admin/kyc' }, // <-- Added KYC Management
  { id: 'games', label: 'Game Management', icon: 'gamepad', href: '/admin/games' },
  { id: 'betting', label: 'Betting Management', icon: 'sports_soccer', href: '/admin/betting' },
  { id: 'promotions', label: 'Promotions Management', icon: 'campaign', href: '/admin/promotions' },
  { id: 'deposits', label: 'Deposits', icon: 'arrow_downward', href: '/admin/deposits' },
  { id: 'withdrawals', label: 'Withdrawals', icon: 'arrow_upward', href: '/admin/withdrawals' },
  { id: 'tournaments', label: 'Tournaments', icon: 'emoji_events', href: '/admin/tournaments' },
  { id: 'content', label: 'Content Management', icon: 'wysiwyg', href: '/admin/content' },
]

  useEffect(() => {
    fetchGames()
    fetchProviders()
  }, [gameTypeFilter, providerFilter, statusFilter, searchQuery, currentPage])

  const fetchGames = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 20,
      }
      
      if (searchQuery) params.search = searchQuery
      if (gameTypeFilter !== 'all') params.gameType = gameTypeFilter
      if (providerFilter !== 'all') params.provider = providerFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await adminAPI.getGames(params)
      setGames(response.data.games || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load games')
      log.apiError('/admin/games', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      const response = await adminAPI.getProviders()
      setProviders(response.data.providers || [])
    } catch (err) {
      log.apiError('/admin/games/providers', err)
    }
  }

  const handleAdd = async () => {
    setSaving(true)
    setError('')
    try {
      await adminAPI.createGame(formData)
      setSuccess('Game created successfully!')
      setShowAddModal(false)
      resetForm()
      fetchGames()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create game')
      log.apiError('/admin/games', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedGame) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.updateGame(selectedGame._id, formData)
      setSuccess('Game updated successfully!')
      setShowEditModal(false)
      setSelectedGame(null)
      resetForm()
      fetchGames()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update game')
      log.apiError(`/admin/games/${selectedGame._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedGame) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.deleteGame(selectedGame._id)
      setSuccess('Game deleted successfully!')
      setShowDeleteModal(false)
      setSelectedGame(null)
      fetchGames()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete game')
      log.apiError(`/admin/games/${selectedGame._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      gameType: 'slots',
      gameId: '',
      thumbnail: '',
      status: 'active',
      description: '',
      minBet: 0,
      maxBet: null,
      rtp: null,
      features: [],
      tags: [],
      isNew: false,
      isFeatured: false,
      isHot: false,
    })
  }

  const openEditModal = (game) => {
    setSelectedGame(game)
    setFormData({
      name: game.name || '',
      provider: game.provider || '',
      gameType: game.gameType || 'slots',
      gameId: game.gameId || '',
      thumbnail: game.thumbnail || '',
      status: game.status || 'active',
      description: game.description || '',
      minBet: game.minBet || 0,
      maxBet: game.maxBet || null,
      rtp: game.rtp || null,
      features: game.features || [],
      tags: game.tags || [],
      isNew: game.isNew || false,
      isFeatured: game.isFeatured || false,
      isHot: game.isHot || false,
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400'
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getGameTypeLabel = (type) => {
    const labels = {
      slots: 'Slots',
      live_casino: 'Live Casino',
      crash: 'Crash',
      sports: 'Sports',
      live_betting: 'Live Betting'
    }
    return labels[type] || type
  }

  return (
    <div className="flex min-h-screen w-full bg-background-dark">
   <div className="flex bg-background-dark min-h-screen">
  {/* FIXED SIDEBAR */}
  <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-background-dark border-r border-surface p-4 z-50">
    <div className="flex items-center gap-3 mb-8 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <span className="material-symbols-outlined text-black">casino</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-white">Casino Admin</h1>
        <p className="text-sm text-gray-400">Management</p>
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
      <Link
        href="/admin/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined">settings</span>
        <p className="text-sm font-medium">Settings</p>
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
        <p className="text-sm font-medium">Logout</p>
      </button>

      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAeBaCCsTptl1trq-7t7S9yHg2U-j1m_3eQJ6dpRP-IZjxZIDKL6U_iFBKUwWt18HwxovSG8ldqiQCa7NbmEcelTnHQGSwTeQORHSMYn7gGZDs-U982dOqo8QbAOQy7uCWkHjlHxe0m_eXtY2xDHYQYW3KAKuLgW2ZrQlV3yrUSs8tMyu4QaShzTzhohnzpDGQllaTrkdAQoFvcjS9zzhmKAnFrldqCRC16_VfbZD7OYbVjNJOiQ4Gz2-oKSG6XZ4azP4qWoBeSO74")'
          }}
        />
        <div className="flex flex-col">
          <h2 className="text-sm font-medium text-white">
            {typeof window !== 'undefined'
              ? (() => {
                  try {
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                      const user = JSON.parse(userStr)
                      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User'
                    }
                  } catch {}
                  return 'Admin User'
                })()
              : 'Admin User'}
          </h2>
          <p className="text-xs text-gray-400">
            {typeof window !== 'undefined'
              ? (() => {
                  try {
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                      const user = JSON.parse(userStr)
                      return user.email || 'admin@casino.com'
                    }
                  } catch {}
                  return localStorage.getItem('adminEmail') || 'admin@casino.com'
                })()
              : 'admin@casino.com'}
          </p>
        </div>
      </div>
    </div>
  </aside>

  {/* MAIN CONTENT */}
  <main className="ml-64 flex-1 min-h-screen">
    {/* Your existing topbar */}
    {/* Your existing dashboard content */}
  </main>
</div>


      <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark overflow-y-auto">
        <div className="layout-content-container flex flex-col w-full max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Game Management
            </p>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Game
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 min-w-[200px] h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              />
              
              <select
                value={gameTypeFilter}
                onChange={(e) => {
                  setGameTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="all" className="bg-[#1E1E2B]">All Types</option>
                <option value="slots" className="bg-[#1E1E2B]">Slots</option>
                <option value="live_casino" className="bg-[#1E1E2B]">Live Casino</option>
                <option value="crash" className="bg-[#1E1E2B]">Crash</option>
                <option value="sports" className="bg-[#1E1E2B]">Sports</option>
                <option value="live_betting" className="bg-[#1E1E2B]">Live Betting</option>
              </select>

              <select
                value={providerFilter}
                onChange={(e) => {
                  setProviderFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="all" className="bg-[#1E1E2B]">All Providers</option>
                {providers.map((provider) => (
                  <option key={provider} value={provider} className="bg-[#1E1E2B]">
                    {provider}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="all" className="bg-[#1E1E2B]">All Status</option>
                <option value="active" className="bg-[#1E1E2B]">Active</option>
                <option value="inactive" className="bg-[#1E1E2B]">Inactive</option>
                <option value="maintenance" className="bg-[#1E1E2B]">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Games Table */}
          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No games found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-medium">Game</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Provider</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Type</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Status</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Date Added</th>
                      <th className="px-6 py-4 text-right text-white font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {games.map((game) => (
                      <tr key={game._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {game.thumbnail && (
                              <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10"
                                style={{ backgroundImage: `url("${game.thumbnail}")` }}
                              ></div>
                            )}
                            <span className="font-medium text-white">{game.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{game.provider}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{getGameTypeLabel(game.gameType)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                            {game.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDate(game.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(game)}
                              className="text-gray-400 hover:text-[#0dccf2] transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedGame(game)
                                setShowDeleteModal(true)
                              }}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} games
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-white px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-semibold mb-4">
              {showAddModal ? 'Add New Game' : 'Edit Game'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Game Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Game ID *</label>
                  <input
                    type="text"
                    value={formData.gameId}
                    onChange={(e) => setFormData({...formData, gameId: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Provider *</label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Game Type *</label>
                  <select
                    value={formData.gameType}
                    onChange={(e) => setFormData({...formData, gameType: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  >
                    <option value="slots" className="bg-[#1E1E2B]">Slots</option>
                    <option value="live_casino" className="bg-[#1E1E2B]">Live Casino</option>
                    <option value="crash" className="bg-[#1E1E2B]">Crash</option>
                    <option value="sports" className="bg-[#1E1E2B]">Sports</option>
                    <option value="live_betting" className="bg-[#1E1E2B]">Live Betting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="active" className="bg-[#1E1E2B]">Active</option>
                    <option value="inactive" className="bg-[#1E1E2B]">Inactive</option>
                    <option value="maintenance" className="bg-[#1E1E2B]">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Min Bet</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBet}
                    onChange={(e) => setFormData({...formData, minBet: parseFloat(e.target.value) || 0})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Max Bet</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBet || ''}
                    onChange={(e) => setFormData({...formData, maxBet: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                    className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  <span className="text-white text-sm">New</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  <span className="text-white text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHot}
                    onChange={(e) => setFormData({...formData, isHot: e.target.checked})}
                    className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  <span className="text-white text-sm">Hot</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={showAddModal ? handleAdd : handleEdit}
                  disabled={saving || !formData.name || !formData.gameId || !formData.provider}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (showAddModal ? 'Create Game' : 'Update Game')}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedGame(null)
                    resetForm()
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-4">Delete Game</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;{selectedGame.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedGame(null)
                }}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GameManagementPage() {
  return (
    <AdminProtectedRoute>
      <GameManagement />
    </AdminProtectedRoute>
  )
}
