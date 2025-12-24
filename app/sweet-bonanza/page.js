'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI } from '@/lib/api'
import sweetBonanzaAPI from '@/lib/api/sweetBonanza.api'
import { log } from '@/utils/logger'
import { updateUserData } from '@/utils/auth'

function SweetBonanzaPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [betAmount, setBetAmount] = useState('10')
  const [spinning, setSpinning] = useState(false)
  const [reels, setReels] = useState([
    ['🍇', '🍊', '🍋'],
    ['🍇', '🍊', '🍋'],
    ['🍇', '🍊', '🍋'],
    ['🍇', '🍊', '🍋'],
    ['🍇', '🍊', '🍋'],
    ['🍇', '🍊', '🍋']
  ])
  const [winAmount, setWinAmount] = useState(0)
  const [gameHistory, setGameHistory] = useState([])
  const [autoSpin, setAutoSpin] = useState(false)
  const [autoSpinCount, setAutoSpinCount] = useState(0)
  const [isWinning, setIsWinning] = useState(false)
  const [winningSymbols, setWinningSymbols] = useState([])
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [balanceHistory, setBalanceHistory] = useState([]) // Track balance changes with percentages
  const [reelSpeeds, setReelSpeeds] = useState([0, 0, 0, 0, 0, 0]) // Individual reel speeds for realistic spinning
  const reelRefs = useRef([])

  const symbols = ['🍇', '🍊', '🍋', '🍉', '🍌', '🍎', '🍓', '⭐', '💎']
  // Weighted symbols for more realistic gameplay (lower value = more common)
  const symbolWeights = {
    '🍇': 30, '🍊': 25, '🍋': 20, '🍉': 15, '🍌': 12,
    '🍎': 8, '🍓': 5, '⭐': 3, '💎': 2
  }
  const quickBetAmounts = ['10', '50', '100', '500', '1000']

  useEffect(() => {
    // Try to get balance from localStorage first (faster initial load)
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser?.balance !== undefined && storedUser.balance !== null) {
        const initialBalance = parseFloat(storedUser.balance) || 0
        setBalance(initialBalance)
        setUser(storedUser)
        if (process.env.NODE_ENV === 'development') {
          console.log('Sweet Bonanza - Initial balance from localStorage:', initialBalance)
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Then fetch fresh data from server
    fetchUserData()
    
    // Listen for balance updates from other components
    const handleUserDataUpdate = (event) => {
      if (event.detail?.balance !== undefined && event.detail.balance !== null) {
        const newBalance = parseFloat(event.detail.balance) || 0
        setBalance(newBalance)
        setUser(event.detail)
        if (process.env.NODE_ENV === 'development') {
          console.log('Sweet Bonanza - Balance updated from event:', newBalance)
        }
      }
    }
    
    window.addEventListener('userDataUpdated', handleUserDataUpdate)
    
    // Also poll for balance updates periodically (every 3 seconds)
    const balanceInterval = setInterval(() => {
      fetchUserData()
    }, 3000)
    
    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate)
      clearInterval(balanceInterval)
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await authAPI.me()
      
      // Debug: Log the full response structure
      if (process.env.NODE_ENV === 'development') {
        console.log('Sweet Bonanza - Full API response:', response)
        console.log('Sweet Bonanza - Response data:', response?.data)
      }
      
      // Handle different response structures
      // Backend returns user directly, axios wraps it in response.data
      const userData = response?.data || response || null
      
      if (userData) {
        setUser(userData)
        // Get balance - check multiple possible locations
        const userBalance = userData.balance !== undefined ? userData.balance : 
                          (userData.user?.balance !== undefined ? userData.user.balance : 0)
        
        setBalance(userBalance)
        
        // Update localStorage to sync with navbar
        updateUserData(userData)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Sweet Bonanza - User data:', userData)
          console.log('Sweet Bonanza - User balance set to:', userBalance)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Sweet Bonanza - No user data received from API')
        }
        // Try to get balance from localStorage as fallback
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
          if (storedUser?.balance !== undefined) {
            setBalance(storedUser.balance)
            setUser(storedUser)
            if (process.env.NODE_ENV === 'development') {
              console.log('Sweet Bonanza - Using balance from localStorage:', storedUser.balance)
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    } catch (err) {
      log.apiError('/auth/me', err)
      if (process.env.NODE_ENV === 'development') {
        console.error('Sweet Bonanza - Error fetching user data:', err)
        console.error('Sweet Bonanza - Error response:', err.response)
      }
      
      // Try to get balance from localStorage as fallback
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (storedUser?.balance !== undefined) {
          setBalance(storedUser.balance)
          setUser(storedUser)
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    } finally {
      setLoading(false)
    }
  }

  // Get weighted random symbol
  const getWeightedSymbol = () => {
    const totalWeight = Object.values(symbolWeights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (const [symbol, weight] of Object.entries(symbolWeights)) {
      random -= weight
      if (random <= 0) {
        return symbol
      }
    }
    return '🍇' // Fallback
  }

  // Calculate financial flow with percentages
  const calculateFinancialFlow = (initialBalance, betAmount, winAmount) => {
    const netChange = winAmount - betAmount
    const newBalance = initialBalance + netChange
    const percentageChange = initialBalance > 0 ? (netChange / initialBalance) * 100 : 0
    
    return {
      initialBalance,
      betAmount,
      winAmount,
      netChange,
      newBalance,
      percentageChange,
      isWin: netChange > 0,
      isLoss: netChange < 0
    }
  }

  // Track balance history with percentages
  const addToBalanceHistory = (flow) => {
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date(),
      ...flow,
      gameType: 'sweet-bonanza'
    }
    
    setBalanceHistory(prev => {
      const updated = [historyEntry, ...prev].slice(0, 20) // Keep last 20 entries
      
      // Calculate cumulative statistics
      if (updated.length > 0) {
        const totalGames = updated.length
        const wins = updated.filter(e => e.isWin).length
        const losses = updated.filter(e => e.isLoss).length
        const totalWinAmount = updated.filter(e => e.isWin).reduce((sum, e) => sum + e.winAmount, 0)
        const totalLossAmount = updated.filter(e => e.isLoss).reduce((sum, e) => sum + Math.abs(e.netChange), 0)
        const winRate = (wins / totalGames) * 100
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Game Statistics:', {
            totalGames,
            wins,
            losses,
            winRate: winRate.toFixed(2) + '%',
            totalWinAmount,
            totalLossAmount,
            netProfit: totalWinAmount - totalLossAmount
          })
        }
      }
      
      return updated
    })
  }

  const calculateWin = (reelResult) => {
    const symbolCounts = {}
    reelResult.forEach((reel, reelIndex) => {
      reel.forEach((symbol, symbolIndex) => {
        const key = `${symbolIndex}-${symbol}`
        if (!symbolCounts[key]) {
          symbolCounts[key] = { symbol, position: symbolIndex, count: 0, positions: [] }
        }
        symbolCounts[key].count++
        symbolCounts[key].positions.push({ reel: reelIndex, position: symbolIndex })
      })
    })

    let totalWin = 0
    const bet = parseFloat(betAmount) || 0
    const winningPositions = []

    Object.values(symbolCounts).forEach(({ symbol, position, count, positions }) => {
      if (count >= 3) {
        const multipliers = {
          '💎': 100,
          '⭐': 50,
          '🍓': 20,
          '🍎': 15,
          '🍌': 12,
          '🍉': 10,
          '🍋': 8,
          '🍊': 6,
          '🍇': 5
        }
        const baseMultiplier = multipliers[symbol] || 5
        const multiplier = baseMultiplier * (count - 2)
        const win = bet * multiplier
        totalWin += win
        winningPositions.push(...positions)
      }
    })

    const scatterCount = reelResult.flat().filter(s => s === '⭐' || s === '💎').length
    if (scatterCount >= 3) {
      const scatterMultiplier = scatterCount === 3 ? 2 : scatterCount === 4 ? 5 : scatterCount >= 5 ? 10 : 0
      totalWin += bet * scatterMultiplier
    }

    setWinningSymbols(winningPositions)
    return totalWin
  }

  const spinReels = async () => {
    if (spinning) return
    
    const bet = parseFloat(betAmount) || 0
    
    // Validate bet amount
    if (!betAmount || betAmount === '' || betAmount === null) {
      setError('Please enter a bet amount')
      return
    }
    
    if (isNaN(bet) || !isFinite(bet)) {
      setError('Invalid bet amount format')
      return
    }
    
    if (bet <= 0) {
      setError('Bet amount must be greater than 0')
      return
    }
    
    if (bet < 1) {
      setError('Minimum bet amount is ₺1')
      return
    }

    const currentBalance = parseFloat(balance) || 0
    if (bet > currentBalance) {
      setError('Insufficient balance')
      return
    }

    setSpinning(true)
    setError('')
    setSuccess('')
    setWinAmount(0)
    setIsWinning(false)
    setShowWinAnimation(false)
    setWinningSymbols([])

    const initialBalance = balance

    // Show spinning animation first
    const baseSpinDuration = 2000
    const reelStopDelays = [0, 200, 400, 600, 800, 1000]
    const spinInterval = 50

    setReelSpeeds([100, 100, 100, 100, 100, 100])

    const reelAnimations = reelStopDelays.map((delay, reelIndex) => {
      return new Promise((resolve) => {
        let currentSpin = 0
        const spins = Math.floor((baseSpinDuration + delay) / spinInterval)
        
        const interval = setInterval(() => {
          setReels(prevReels => {
            const newReels = [...prevReels]
            newReels[reelIndex] = Array(3).fill(null).map(() => getWeightedSymbol())
            return newReels
          })
          
          setReelSpeeds(prevSpeeds => {
            const newSpeeds = [...prevSpeeds]
            const progress = currentSpin / spins
            newSpeeds[reelIndex] = 100 * (1 - progress * 0.8)
            return newSpeeds
          })
          
          currentSpin++
          
          if (currentSpin >= spins) {
            clearInterval(interval)
            setReelSpeeds(prevSpeeds => {
              const newSpeeds = [...prevSpeeds]
              newSpeeds[reelIndex] = 0
              return newSpeeds
            })
            resolve()
          }
        }, spinInterval)
      })
    })

    try {
      // Call backend API to play game
      const response = await sweetBonanzaAPI.playGame(bet)
      const gameData = response.data?.data || response.data

      // Wait for animation to complete
      await Promise.all(reelAnimations)

      // Set final reels from backend
      const finalReels = gameData.reels || []
      setReels(finalReels)
      setReelSpeeds([0, 0, 0, 0, 0, 0])

      const win = gameData.winAmount || 0
      const netChange = gameData.netChange || 0
      const percentageChange = gameData.percentageChange || 0
      // Get updated main balance from server (this is the deposited balance)
      const newBalance = gameData.userBalance || gameData.newBalance || balance

      setWinAmount(win)
      setBalance(newBalance) // Update local state with main balance
      setWinningSymbols(gameData.winningPositions || [])

      // Calculate financial flow
      const flow = calculateFinancialFlow(initialBalance, bet, win)
      addToBalanceHistory(flow)

      if (win > 0) {
        setSuccess(`🎉 You won ₺${win.toFixed(2)}! (+${percentageChange.toFixed(2)}%)`)
        setIsWinning(true)
        setShowWinAnimation(true)
        
        setGameHistory(prev => [{
          id: Date.now(),
          bet,
          win,
          result: finalReels,
          timestamp: new Date(),
          percentageChange: percentageChange
        }, ...prev].slice(0, 10))

        setTimeout(() => {
          setIsWinning(false)
          setShowWinAnimation(false)
        }, 3000)
      } else {
        setError(`No win this time. Lost ${Math.abs(percentageChange).toFixed(2)}%`)
      }

      // Update user data with new main balance (from deposits)
      // This syncs with navbar and other components
      if (user) {
        const updatedUser = { ...user, balance: newBalance }
        updateUserData(updatedUser) // Updates localStorage and triggers navbar update
        setUser(updatedUser)
      }

      // Refresh user data from server to ensure sync with main balance
      // This ensures the balance displayed is the actual deposited balance
      // Use setTimeout to prevent race conditions and allow UI to update first
      setTimeout(async () => {
        try {
          await fetchUserData()
        } catch (fetchErr) {
          // Silently handle fetch errors - balance is already updated from game response
          if (process.env.NODE_ENV === 'development') {
            console.warn('Sweet Bonanza - Error refreshing user data:', fetchErr)
          }
        }
      }, 500)
    } catch (err) {
      // Stop animations on error
      setReelSpeeds([0, 0, 0, 0, 0, 0])
      
      // Handle different error types
      let errorMessage = 'Failed to play game'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Handle specific error codes
      if (err.response?.status === 400) {
        // Bad request - validation error
        errorMessage = errorMessage || 'Invalid request. Please check your bet amount.'
      } else if (err.response?.status === 401) {
        // Unauthorized - session expired
        errorMessage = 'Session expired. Please log in again.'
        // Optionally redirect to login
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else if (err.response?.status === 403) {
        // Forbidden - account not active
        errorMessage = errorMessage || 'Account is not active'
      } else if (err.response?.status === 404) {
        // Not found
        errorMessage = 'User not found'
      } else if (err.response?.status === 500) {
        // Server error
        errorMessage = 'Server error. Please try again later.'
      } else if (!err.response) {
        // Network error
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
      
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sweet Bonanza - Game error:', err)
        console.error('Sweet Bonanza - Error response:', err.response)
      }
      
      log.apiError('/sweet-bonanza/play', err)
      
      // Refresh balance on error to ensure sync
      try {
        await fetchUserData()
      } catch (fetchErr) {
        // Ignore fetch errors on error recovery
        if (process.env.NODE_ENV === 'development') {
          console.error('Sweet Bonanza - Error fetching user data after game error:', fetchErr)
        }
      }
    } finally {
      setSpinning(false)
    }
  }

  useEffect(() => {
    if (autoSpin && autoSpinCount > 0 && !spinning) {
      const timer = setTimeout(() => {
        // Check balance before auto-spinning
        const currentBalance = parseFloat(balance) || 0
        const bet = parseFloat(betAmount) || 0
        
        if (currentBalance < bet) {
          setAutoSpin(false)
          setAutoSpinCount(0)
          setError('Insufficient balance for auto-spin')
          return
        }
        
        spinReels()
        setAutoSpinCount(prev => Math.max(0, prev - 1))
      }, 3500) // Wait for animation to complete
      return () => clearTimeout(timer)
    } else if (autoSpinCount === 0 && autoSpin) {
      setAutoSpin(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin, autoSpinCount, spinning, balance, betAmount])

  const handleQuickBet = (amount) => {
    setBetAmount(amount)
  }

  const handleAutoSpin = (count) => {
    if (spinning) return
    setAutoSpinCount(count)
    setAutoSpin(true)
    spinReels()
  }

  const isWinningPosition = (reelIndex, symbolIndex) => {
    return winningSymbols.some(pos => pos.reel === reelIndex && pos.position === symbolIndex)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="relative flex min-h-screen w-full flex-col bg-gradient-to-b from-[#0a0514] via-[#1a0f2e] to-[#0a0514]">
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ff6b9d] border-r-transparent"></div>
              <p className="text-white/70 text-lg">Loading Sweet Bonanza...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen w-full flex-col bg-gradient-to-b from-[#0a0514] via-[#1a0f2e] to-[#0a0514] overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,157,0.15),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 z-10 pt-24">
          {/* Win Celebration Animation */}
          {showWinAnimation && winAmount > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 animate-pulse"></div>
              <div className="relative text-center">
                <div className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-bounce">
                  🎉
                </div>
                <div className="mt-4 text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse">
                  BIG WIN!
                </div>
                <div className="mt-2 text-3xl md:text-5xl font-black text-yellow-400 animate-pulse">
                  ₺{winAmount.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Game Header */}
          <div className="w-full max-w-7xl mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-white text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Sweet Bonanza
                  </h1>
                  <div className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white text-xs font-bold animate-pulse">
                    HOT
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-white/80 text-sm">
                    Balance: <span className="text-[#ff6b9d] font-bold text-lg">₺{typeof balance === 'number' && !isNaN(balance) ? balance.toFixed(2) : '0.00'}</span>
                  </p>
                  {winAmount > 0 && (
                    <div className="px-4 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/50 rounded-full">
                      <span className="text-yellow-400 font-bold">Win: ₺{winAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push('/slots')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl transition-all hover:scale-105 active:scale-95 font-bold"
              >
                ← Back to Games
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="w-full max-w-7xl mb-4 animate-fade-in">
              <div className="rounded-xl bg-red-500/20 border-2 border-red-500/50 p-4 backdrop-blur-sm">
                <p className="text-red-300 text-center font-medium">{error}</p>
              </div>
            </div>
          )}
          {success && !showWinAnimation && (
            <div className="w-full max-w-7xl mb-4 animate-fade-in">
              <div className="rounded-xl bg-green-500/20 border-2 border-green-500/50 p-4 backdrop-blur-sm">
                <p className="text-green-300 text-center font-bold text-lg">{success}</p>
              </div>
            </div>
          )}

          {/* Game Area */}
          <div className="w-full max-w-7xl">
            <div className="relative bg-gradient-to-br from-[#1a0f2e]/95 via-[#2d1b4e]/95 to-[#1a0f2e]/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 border-2 border-white/10 shadow-2xl">
              {/* Glowing border effect */}
              <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 ${isWinning ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/30 via-pink-500/30 to-purple-600/30 blur-xl animate-pulse"></div>
              </div>

              {/* Reels Container */}
              <div className="relative mb-8 p-4 bg-black/30 rounded-2xl border border-white/10">
                <div className="grid grid-cols-6 gap-2 md:gap-4">
                  {reels.map((reel, reelIndex) => (
                    <div key={reelIndex} className="flex flex-col gap-2">
                      {reel.map((symbol, symbolIndex) => {
                        const isWinning = isWinningPosition(reelIndex, symbolIndex)
                        const reelSpeed = reelSpeeds[reelIndex] || 0
                        return (
                          <div
                            key={symbolIndex}
                            className={`aspect-square flex items-center justify-center text-4xl md:text-6xl lg:text-7xl rounded-xl border-2 transition-all duration-300 transform ${
                              spinning && reelSpeed > 0
                                ? 'bg-gradient-to-b from-purple-900/60 to-purple-800/40 border-purple-500/40 scale-95 blur-[1px]'
                                : isWinning
                                ? 'bg-gradient-to-b from-yellow-400/40 to-orange-500/40 border-yellow-400/80 shadow-lg shadow-yellow-400/50 scale-110 animate-bounce'
                                : 'bg-gradient-to-b from-purple-900/50 to-purple-800/30 border-purple-500/30 hover:border-purple-400/50'
                            }`}
                            style={{
                              boxShadow: isWinning ? '0 0 20px rgba(255, 215, 0, 0.8)' : 'none',
                              animation: isWinning ? 'winningGlow 0.6s ease-in-out infinite' : undefined,
                              transform: spinning && reelSpeed > 0 ? `translateY(${reelSpeed}px)` : undefined
                            }}
                          >
                            <span className={`transition-all duration-300 ${isWinning ? 'scale-125' : ''}`}>
                              {symbol}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6 relative z-10">
                {/* Bet Amount */}
                <div>
                  <label className="block text-white/90 text-sm font-bold mb-3">Bet Amount</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickBetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleQuickBet(amount)}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all transform ${
                          betAmount === amount
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-110 shadow-lg shadow-pink-500/50'
                            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                        }`}
                      >
                        ₺{amount}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-lg font-bold"
                    placeholder="Enter bet amount"
                  />
                </div>

                {/* Spin Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={spinReels}
                    disabled={spinning || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
                    className={`relative flex-1 px-10 py-5 rounded-2xl font-black text-2xl md:text-3xl transition-all transform overflow-hidden group ${
                      spinning
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-pink-500/50 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {spinning ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                        SPINNING...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">SPIN</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      </>
                    )}
                  </button>

                  {/* Auto Spin */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAutoSpin(10)}
                      disabled={spinning || autoSpin || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
                      className="px-6 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      Auto x10
                    </button>
                    <button
                      onClick={() => handleAutoSpin(25)}
                      disabled={spinning || autoSpin || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
                      className="px-6 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      Auto x25
                    </button>
                    {autoSpin && (
                      <button
                        onClick={() => {
                          setAutoSpin(false)
                          setAutoSpinCount(0)
                        }}
                        className="px-6 py-5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg animate-pulse"
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>

                {autoSpin && autoSpinCount > 0 && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/50 rounded-full">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 font-bold">Auto Spin: {autoSpinCount} remaining</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Balance History */}
            {balanceHistory.length > 0 && (
              <div className="mt-8 bg-gradient-to-br from-[#1a0f2e]/95 via-[#2d1b4e]/95 to-[#1a0f2e]/95 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl animate-fade-in">
                <h3 className="text-white text-2xl font-black mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Balance History
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {balanceHistory.slice(0, 10).map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${entry.isWin ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <div>
                          <div className="text-white/90 font-bold">
                            {entry.isWin ? 'Win' : 'Loss'}
                          </div>
                          <div className="text-white/60 text-sm">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/70 text-sm mb-1">
                          Bet: ₺{entry.betAmount.toFixed(2)} | Win: ₺{entry.winAmount.toFixed(2)}
                        </div>
                        <div className={`font-black text-lg ${entry.isWin ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.isWin ? '+' : ''}₺{entry.netChange.toFixed(2)} ({entry.percentageChange > 0 ? '+' : ''}{entry.percentageChange.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="mt-8 bg-gradient-to-br from-[#1a0f2e]/95 via-[#2d1b4e]/95 to-[#1a0f2e]/95 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl animate-fade-in">
                <h3 className="text-white text-2xl font-black mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Recent Games
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {gameHistory.map((game, index) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {game.result[0]?.slice(0, 3).map((symbol, i) => (
                            <span key={i} className="text-3xl transform hover:scale-125 transition-transform">
                              {symbol}
                            </span>
                          ))}
                        </div>
                        <div className="text-white/60 text-sm">
                          {new Date(game.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-sm mb-1">Bet: ₺{game.bet.toFixed(2)}</div>
                        <div className={`font-black text-lg ${game.win > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {game.win > 0 ? `+₺${game.win.toFixed(2)}` : '₺0.00'}
                        </div>
                        {game.percentageChange !== undefined && (
                          <div className={`text-xs ${game.percentageChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {game.percentageChange > 0 ? '+' : ''}{game.percentageChange.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game Info */}
            <div className="mt-6 bg-gradient-to-br from-[#1a0f2e]/95 via-[#2d1b4e]/95 to-[#1a0f2e]/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
              <h3 className="text-white text-2xl font-black mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                How to Play
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <p className="font-black text-white mb-4 text-lg flex items-center gap-2">
                    <span className="text-2xl">💎</span>
                    Symbol Multipliers
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-white/80 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-2xl">💎</span>
                      <span className="font-bold text-yellow-400">100x</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-2xl">⭐</span>
                      <span className="font-bold text-yellow-400">50x</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-2xl">🍓</span>
                      <span className="font-bold text-pink-400">20x</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-2xl">🍎</span>
                      <span className="font-bold text-red-400">15x</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-2xl">🍌</span>
                      <span className="font-bold text-yellow-300">12x</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-2xl">🍉</span>
                      <span className="font-bold text-green-400">10x</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <p className="font-black text-white mb-4 text-lg flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Winning Rules
                  </p>
                  <ul className="space-y-3 text-white/80 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">✓</span>
                      <span>Match <strong className="text-white">3+ symbols</strong> in the same position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">✓</span>
                      <span>More symbols = <strong className="text-white">higher multiplier</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">✓</span>
                      <span><strong className="text-white">⭐ and 💎</strong> count as scatters (anywhere)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">✓</span>
                      <span><strong className="text-white">3+ scatters</strong> trigger bonus multiplier</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes winningGlow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 40px rgba(255, 215, 0, 1);
              transform: scale(1.1);
            }
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff6b9d, #9333ea);
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #ff8fb3, #a855f7);
          }
        `}</style>
      </div>
    </ProtectedRoute>
  )
}

export default SweetBonanzaPage
