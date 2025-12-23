'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import { promotionAPI } from '@/lib/api/promotion.api'
import { log } from '@/utils/logger'

export default function PromotionsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState(t('promotions.all'))
  const [currentPage, setCurrentPage] = useState(1)
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [claiming, setClaiming] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null) // Now stores object with image, title, description, category

  // Fetch promotions from API
  useEffect(() => {
    fetchPromotions()
  }, [selectedFilter, currentPage])

  // Add keyboard handler for ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedImage])

  const fetchPromotions = async () => {
    setLoading(true)
    setError('')
    try {
      // Map filter to API type parameter
      let type = null
      if (selectedFilter === t('promotions.casino')) {
        type = 'deposit' // Casino promotions are typically deposit-based
      } else if (selectedFilter === t('promotions.sports')) {
        type = 'welcome' // Sports promotions
      } else if (selectedFilter === t('promotions.welcomeBonus')) {
        type = 'welcome'
      } else if (selectedFilter === t('promotions.cashback')) {
        type = 'cashback'
      } else if (selectedFilter === t('promotions.reload')) {
        type = 'reload'
      }

      const params = {
        page: currentPage,
        limit: 12,
      }
      if (type && selectedFilter !== t('promotions.all')) {
        params.type = type
      }

      const response = await promotionAPI.getActivePromotions(params)
      const fetchedPromotions = response.data.promotions || []
      
      // Ensure all promotions have images - assign default images if missing
      const promotionsWithImages = fetchedPromotions.map((promo, index) => {
        if (!promo.bannerImage) {
          // Assign default images based on promotion type or index
          const defaultImages = [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80',
          ]
          promo.bannerImage = defaultImages[index % defaultImages.length]
        }
        return promo
      })
      
      setPromotions(promotionsWithImages)
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      console.error('Error fetching promotions:', err)
      setError(err.response?.data?.message || 'Failed to load promotions')
      log.apiError('/promotions', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (promotionId) => {
    setClaiming(promotionId)
    setError('')
    try {
      await promotionAPI.claimPromotion(promotionId)
      // Refresh promotions to update claim status
      await fetchPromotions()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim promotion')
      log.apiError('/promotions/claim', err)
    } finally {
      setClaiming(null)
    }
  }

  // Transform promotion data for UI
  const transformPromotion = (promo) => {
    // Map backend type to display category
    const categoryMap = {
      welcome: 'Welcome',
      deposit: 'Deposit',
      cashback: 'Cashback',
      reload: 'Reload',
      free_spins: 'Spins',
      tournament: 'Tournament',
      other: 'Other'
    }

    const category = categoryMap[promo.type] || 'Other'
    const categoryColors = {
      Welcome: 'bg-blue-500/80',
      Deposit: 'bg-purple-500/80',
      Cashback: 'bg-teal-500/80',
      Reload: 'bg-purple-500/80',
      Spins: 'bg-green-500/80',
      Tournament: 'bg-red-500/80',
      Other: 'bg-gray-500/80'
    }

    const canClaim = promo.canClaim && !promo.hasClaimed
    const buttonText = canClaim 
      ? t('promotions.claim') 
      : promo.hasClaimed 
        ? t('promotions.claimed') 
        : t('promotions.viewDetails')
    const buttonStyle = canClaim
      ? 'bg-primary text-background-dark hover:bg-yellow-400'
      : 'bg-primary/20 text-primary hover:bg-primary/30'

    return {
      ...promo,
      id: promo._id,
      category,
      categoryColor: categoryColors[category] || 'bg-gray-500/80',
      buttonText,
      buttonStyle,
      image: (() => {
        // Always ensure an image is assigned
        if (promo.bannerImage && promo.bannerImage.trim() !== '') {
          return promo.bannerImage
        }
        // Use reliable default images for promotions - casino themed
        const defaultImages = [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80',
        ]
        // Use index based on promotion ID for consistent image assignment
        const imageIndex = promo._id ? (promo._id.toString().charCodeAt(0) % defaultImages.length) : Math.floor(Math.random() * defaultImages.length)
        return defaultImages[imageIndex]
      })(),
    }
  }

  const transformedPromotions = promotions.map(transformPromotion)

  const filters = [t('promotions.all'), t('promotions.casino'), t('promotions.sports'), t('promotions.welcomeBonus'), t('promotions.cashback'), t('promotions.reload')]

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">

        <main className="flex-1 px-4 py-8 md:px-8 lg:px-16 xl:px-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Promotions</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex h-10 cursor-pointer shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors ${
                    selectedFilter === filter
                      ? 'bg-primary text-background-dark'
                      : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white/80 hover:text-white'
                  }`}
                >
                  <p className={`text-sm leading-normal ${selectedFilter === filter ? 'font-bold' : 'font-medium'}`}>
                    {filter}
                  </p>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-white/70">Loading promotions...</p>
              </div>
            ) : transformedPromotions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-white/70">No promotions available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {transformedPromotions.map((promo) => (
                  <div key={promo.id} className="flex flex-col gap-0 overflow-hidden rounded-xl bg-[#1A1A1A] shadow-lg shadow-black/20 transition-transform hover:scale-[1.02]">
                    {/* Info Section at Top */}
                    <div className="flex flex-col gap-2 p-4 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-white text-xl font-bold leading-tight mb-1">{promo.title}</h3>
                          <p className="text-white/70 text-sm font-normal leading-normal line-clamp-2">{promo.description}</p>
                        </div>
                        <div className={`shrink-0 rounded-md ${promo.categoryColor} px-2.5 py-1 text-xs font-bold uppercase text-white backdrop-blur-sm`}>
                          {promo.category}
                        </div>
                      </div>
                    </div>
                    
                    {/* Image Section */}
                    <div className="relative w-full cursor-pointer group" onClick={() => setSelectedImage({ 
                      image: promo.image, 
                      title: promo.title, 
                      description: promo.description, 
                      category: promo.category,
                      categoryColor: promo.categoryColor
                    })}>
                      <img
                        src={promo.image}
                        alt={promo.title || 'Promotion'}
                        className="w-full aspect-video object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to a default image if the image fails to load
                          e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                        <span className="material-symbols-outlined text-white/0 group-hover:text-white/100 text-5xl transition-all duration-300 transform scale-0 group-hover:scale-100 drop-shadow-lg">
                          zoom_in
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-medium bg-black/60 backdrop-blur-sm rounded px-2 py-1">Click to view full image</p>
                      </div>
                    </div>
                    
                    {/* Button Section */}
                    <div className="p-4 pt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation() // Prevent image click from triggering
                          if (promo.canClaim) {
                            handleClaim(promo._id)
                          } else if (promo.buttonText === t('promotions.viewDetails')) {
                            // For "View Details" button, open the image modal with full promotion info
                            setSelectedImage({ 
                              image: promo.image, 
                              title: promo.title, 
                              description: promo.description, 
                              category: promo.category,
                              categoryColor: promo.categoryColor
                            })
                            // Optionally also navigate to detail page after a delay or on close
                            // router.push(`/promotions/${promo._id}`)
                          } else {
                            // For other buttons, navigate to promotion detail page
                            router.push(`/promotions/${promo._id}`)
                          }
                        }}
                        disabled={claiming === promo._id}
                        className={`flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-200 ${promo.buttonStyle} disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]`}
                      >
                        <span className="truncate">
                          {claiming === promo._id ? 'Claiming...' : promo.buttonText}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center pt-8">
                <nav className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-[#2a2a2a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`text-sm leading-normal flex size-10 items-center justify-center rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'text-background-dark bg-primary font-bold'
                            : 'text-white/60 hover:bg-[#2a2a2a] hover:text-white font-medium'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-sm font-medium leading-normal flex size-10 items-center justify-center text-white/60 rounded-lg">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="text-sm font-medium leading-normal flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-[#2a2a2a] hover:text-white transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-[#2a2a2a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Enhanced Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col items-center justify-center gap-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center size-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm hover:scale-110 shadow-lg"
              aria-label="Close image"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            
            {/* Promotion Info Card */}
            <div className="absolute top-4 left-4 right-20 z-10 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10 animate-slide-in-left">
                  <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {selectedImage.category && (
                      <span className={`rounded-md ${selectedImage.categoryColor || 'bg-blue-500/80'} px-3 py-1 text-xs font-bold uppercase text-white`}>
                        {selectedImage.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-2">{selectedImage.title || 'Promotion'}</h2>
                  {selectedImage.description && (
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-3">{selectedImage.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
              <img
                src={selectedImage.image || selectedImage}
                alt={selectedImage.title || 'Promotion'}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
                }}
              />
            </div>
            
            {/* Navigation Hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-full px-6 py-3 text-white text-sm font-medium shadow-lg border border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                <span>Click outside or press ESC to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

