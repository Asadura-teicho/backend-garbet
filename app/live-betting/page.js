'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import { matchAPI } from '@/lib/api'
import { log } from '@/utils/logger'

export default function LiveBettingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedBets, setSelectedBets] = useState([])
  const [stake, setStake] = useState('10.00')
  const [timeFilter, setTimeFilter] = useState(t('liveBetting.live'))
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [placingBet, setPlacingBet] = useState(false)

  // Fetch matches based on filter
  useEffect(() => {
    fetchMatches()
    // Refresh every 30 seconds for live matches
    const interval = setInterval(() => {
      if (timeFilter === t('liveBetting.live')) {
        fetchMatches()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [timeFilter])

  const fetchMatches = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: 1,
        limit: 50,
      }

      // Set status based on filter
      if (timeFilter === t('liveBetting.live')) {
        params.status = 'live'
      } else if (timeFilter === t('liveBetting.today')) {
        params.status = 'upcoming'
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        params.startDate = today.toISOString()
        params.endDate = tomorrow.toISOString()
      } else if (timeFilter === t('liveBetting.upcoming')) {
        params.status = 'upcoming'
      }

      const response = await matchAPI.getMatches(params)
      setMatches(response.data.matches || [])
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err.response?.data?.message || 'Failed to load matches')
      log.apiError('/matches', err)
    } finally {
      setLoading(false)
    }
  }

  // Group matches by league
  const groupedMatches = matches.reduce((acc, match) => {
    const league = match.league || 'Other'
    if (!acc[league]) {
      acc[league] = []
    }
    acc[league].push(match)
    return acc
  }, {})

  // Transform match for UI
  const transformMatchForUI = (match) => {
    const market1X2 = match.markets?.find(m => m.type === '1X2')
    const odds = {}
    if (market1X2) {
      market1X2.selections.forEach(sel => {
        if (sel.name === 'Team A Win') odds['1'] = sel.odds
        else if (sel.name === 'Draw') odds['X'] = sel.odds
        else if (sel.name === 'Team B Win') odds['2'] = sel.odds
      })
    }

    // Get score if available
    const score = match.result?.teamAScore !== null && match.result?.teamBScore !== null
      ? `${match.result.teamAScore} - ${match.result.teamBScore}`
      : null

    // Format time (for live matches, show elapsed time if available)
    let timeStr = match.matchTime || 'LIVE'

    return {
      id: match._id,
      _id: match._id,
      time: timeStr,
      teams: `${match.teamA} vs ${match.teamB}`,
      score,
      odds,
      matchName: match.matchName,
      league: match.league,
      status: match.status,
      rawMatch: match,
    }
  }

  const removeBet = (index) => {
    setSelectedBets(selectedBets.filter((_, i) => i !== index))
  }

  const handleSelectBet = (match, selection, odds) => {
    const bet = {
      matchId: match._id,
      matchName: match.matchName || `${match.teamA} vs ${match.teamB}`,
      selection: selection === '1' ? 'Team A Win' : selection === 'X' ? 'Draw' : 'Team B Win',
      odds: parseFloat(odds),
      marketType: '1X2',
      marketName: 'Match Winner',
      type: t('liveBetting.matchResult'),
    }

    const existingIndex = selectedBets.findIndex(b => b.matchId === match._id && b.selection === bet.selection)
    if (existingIndex >= 0) {
      setSelectedBets(selectedBets.filter((_, i) => i !== existingIndex))
    } else {
      setSelectedBets([...selectedBets, bet])
    }
  }

  const handlePlaceBet = async () => {
    if (selectedBets.length === 0 || !stake || parseFloat(stake) <= 0) {
      setError('Please select bets and enter a stake amount')
      return
    }

    setPlacingBet(true)
    setError('')

    try {
      for (const bet of selectedBets) {
        await matchAPI.placeBet(bet.matchId, {
          marketType: bet.marketType,
          marketName: bet.marketName,
          selection: bet.selection,
          stake: parseFloat(stake),
          useBonusBalance: false,
        })
      }

      setSelectedBets([])
      setStake('10.00')
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bet')
      log.apiError('/matches/bet', err)
    } finally {
      setPlacingBet(false)
    }
  }

  const totalOdds = selectedBets.length > 0 
    ? selectedBets.reduce((acc, bet) => acc * bet.odds, 1).toFixed(2)
    : '0.00'
  const maxWinnings = selectedBets.length > 0 && stake
    ? (parseFloat(stake) * parseFloat(totalOdds)).toFixed(2)
    : '0.00'

  return (
    <div className="relative min-h-screen w-full bg-background-dark">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 lg:flex-row lg:gap-8 lg:p-6">
        {/* Main Content */}
        <div className="w-full flex-1">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 rounded-lg bg-surface p-3 shadow-soft sm:flex-row sm:items-center">
            {/* Chips / Sport Type */}
            <div className="flex flex-1 gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-background-dark pl-3 pr-4 shadow-md">
                <span className="material-symbols-outlined text-lg text-primary">sports_soccer</span>
                <p className="text-sm font-medium text-primary-text">Futbol</p>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface/80 pl-3 pr-4 transition-colors hover:bg-surface">
                <span className="material-symbols-outlined text-lg text-secondary-text">sports_basketball</span>
                <p className="text-sm font-medium text-secondary-text">Basketbol</p>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface/80 pl-3 pr-4 transition-colors hover:bg-surface">
                <span className="material-symbols-outlined text-lg text-secondary-text">sports_tennis</span>
                <p className="text-sm font-medium text-secondary-text">Tenis</p>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface/80 pl-3 pr-4 transition-colors hover:bg-surface">
                <span className="material-symbols-outlined text-lg text-secondary-text">sports_volleyball</span>
                <p className="text-sm font-medium text-secondary-text">Voleybol</p>
              </button>
            </div>
            {/* SegmentedButtons */}
            <div className="flex h-10 flex-shrink-0 items-center justify-center rounded-lg bg-background-dark p-1 sm:w-auto sm:min-w-[280px]">
              <label className="flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-3 text-sm font-medium leading-normal text-secondary-text has-[:checked]:bg-surface has-[:checked]:text-primary-text">
                <span className="truncate">Canlı</span>
                <input checked={timeFilter === 'Live Now'} onChange={() => setTimeFilter('Live Now')} className="invisible w-0" name="time-filter" type="radio" value="Live Now"/>
              </label>
              <label className="flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-3 text-sm font-medium leading-normal text-secondary-text has-[:checked]:bg-surface has-[:checked]:text-primary-text">
                <span className="truncate">{t('liveBetting.today')}</span>
                <input checked={timeFilter === t('liveBetting.today')} onChange={() => setTimeFilter(t('liveBetting.today'))} className="invisible w-0" name="time-filter" type="radio" value={t('liveBetting.today')}/>
              </label>
              <label className="flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-3 text-sm font-medium leading-normal text-secondary-text has-[:checked]:bg-surface has-[:checked]:text-primary-text">
                <span className="truncate">{t('liveBetting.upcoming')}</span>
                <input checked={timeFilter === t('liveBetting.upcoming')} onChange={() => setTimeFilter(t('liveBetting.upcoming'))} className="invisible w-0" name="time-filter" type="radio" value={t('liveBetting.upcoming')}/>
              </label>
            </div>
          </div>

          {/* Match List */}
          <div className="mt-6 flex flex-col gap-4">
            {/* SectionHeader */}
            <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-primary-text px-2">{t('liveBetting.liveFootball')}</h2>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 mx-2">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-secondary-text">Loading matches...</p>
              </div>
            ) : Object.keys(groupedMatches).length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-secondary-text">No matches found</p>
              </div>
            ) : (
              Object.entries(groupedMatches).map(([league, leagueMatches], leagueIndex) => (
                <div key={leagueIndex} className={`flex flex-col gap-2 ${leagueIndex > 0 ? 'mt-4' : ''}`}>
                  <h3 className="text-sm font-semibold text-secondary-text px-2">{league}</h3>
                  {leagueMatches.map((match) => {
                    const transformed = transformMatchForUI(match)
                    return (
                      <div key={match._id} className="flex flex-col gap-3 rounded-lg bg-surface p-4 shadow-soft">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-primary">{transformed.time}</span>
                            <p className="text-base font-medium text-primary-text">{transformed.teams}</p>
                          </div>
                          {transformed.score && (
                            <span className="text-lg font-bold text-primary-text">{transformed.score}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['1', 'X', '2'].map((option) => {
                            const isSelected = selectedBets.some(
                              b => b.matchId === match._id && 
                              ((option === '1' && b.selection === 'Team A Win') ||
                               (option === 'X' && b.selection === 'Draw') ||
                               (option === '2' && b.selection === 'Team B Win'))
                            )
                            return (
                              <button
                                key={option}
                                onClick={() => handleSelectBet(match, option, transformed.odds[option])}
                                className={`group flex flex-col items-center justify-center rounded-lg py-2 transition-colors ${
                                  isSelected
                                    ? 'bg-primary/30 border-2 border-primary'
                                    : 'bg-background-dark/50 hover:bg-background-dark/80'
                                }`}
                              >
                                <span className="text-xs text-secondary-text">{option}</span>
                                <span className="font-bold text-primary-text">{transformed.odds[option]?.toFixed(2) || 'N/A'}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* BetSlip - Desktop */}
        <aside className="sticky top-24 hidden h-fit w-full max-w-xs flex-col gap-4 lg:flex">
          <div className="rounded-lg bg-surface p-4 shadow-soft">
            <h3 className="mb-4 text-lg font-bold text-primary-text">{t('liveBetting.betSlip')}</h3>

            {selectedBets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <span className="material-symbols-outlined text-4xl text-secondary-text">receipt_long</span>
                <p className="mt-2 text-sm text-secondary-text">{t('liveBetting.yourSelections')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedBets.map((bet, index) => (
                  <div key={index} className="rounded-lg bg-background-dark p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-text">{bet.match}</p>
                        <p className="text-xs text-secondary-text">{bet.type}</p>
                      </div>
                      <button onClick={() => removeBet(index)} className="text-secondary-text hover:text-primary-text">
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">{t('liveBetting.selectionLabel')}: {bet.selection}</p>
                      <p className="text-sm font-bold text-primary-text">@{bet.odds}</p>
                    </div>
                  </div>
                ))}

                {/* Total Odds and Stake */}
                <div className="mt-2 border-t border-background-dark pt-3">
                  <div className="flex justify-between text-sm font-medium text-secondary-text">
                    <span>{t('liveBetting.totalOdds')}</span>
                    <span className="text-primary-text">{totalOdds}</span>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-sm font-medium text-secondary-text" htmlFor="stake-desktop">{t('liveBetting.stake')}</label>
                    <div className="relative">
                      <input
                        className="w-full rounded-lg border-none bg-background-dark py-2 pl-3 pr-12 text-primary-text focus:ring-2 focus:ring-primary"
                        id="stake-desktop"
                        type="text"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-sm font-bold text-secondary-text">TRY</span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between text-sm font-medium text-secondary-text">
                    <span>{t('liveBetting.maxWinnings')}</span>
                    <span className="text-lg font-bold text-primary">{maxWinnings} TRY</span>
                  </div>
                </div>

                {/* CTA */}
                <button 
                  onClick={handlePlaceBet}
                  disabled={selectedBets.length === 0 || !stake || parseFloat(stake) <= 0 || placingBet}
                  className={`mt-4 flex h-12 w-full items-center justify-center rounded-lg text-base font-bold shadow-soft transition-opacity ${
                    selectedBets.length > 0 && stake && parseFloat(stake) > 0
                      ? 'bg-primary text-background-dark hover:opacity-90'
                      : 'bg-primary/30 text-primary/60 cursor-not-allowed'
                  }`}
                >
                  {placingBet ? 'Placing Bet...' : t('liveBetting.placeBet')}
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* BetSlip Trigger - Mobile */}
      {selectedBets.length > 0 && (
        <div className="sticky bottom-0 z-40 block bg-gradient-to-t from-background-dark to-transparent px-4 pb-4 pt-8 lg:hidden">
          <button 
            onClick={handlePlaceBet}
            disabled={!stake || parseFloat(stake) <= 0 || placingBet}
            className="flex h-14 w-full items-center justify-between rounded-lg bg-primary px-4 text-background-dark shadow-soft disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined font-semibold">receipt_long</span>
              <span className="text-base font-bold">Kuponu Görüntüle ({selectedBets.length})</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs">Toplam Oran</span>
              <span className="text-base font-bold">{totalOdds}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

