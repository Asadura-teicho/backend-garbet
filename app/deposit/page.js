// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { useTranslation } from '@/hooks/useTranslation'
// import Navbar from '@/components/Navbar'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import { paymentAPI, authAPI } from '@/lib/api'

// function DepositPage() {
//   const { t } = useTranslation()
//   const [selectedMethod, setSelectedMethod] = useState('Banka Havalesi')
//   const [amount, setAmount] = useState('0.00')

//   const paymentMethods = [
//     {
//       id: 'bank-transfer',
//       name: 'Banka Havalesi',
//       min: '₺100',
//       max: '₺50,000',
//       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsZgsgcGE2JUbFmuBZ7K-47xXWev8BktkcvH5HsmBWtmRK2EMgX61pnEPNhRZrEjsltHla1jx33Yf62rBJc5sXnfpVbpP4J1F8uof_BLaI-jWFsN85TnMV-jjZes6oHLnVc5ZjC-H-AdE8H_jQen_7ctJYHExykKUmj-eE5kRH3xi7j1usN94Pw1OUOy643-2dzULa30kCfXP48jp--Or6te6Hs89W-OhZcNe-Z-dAWeqf287g96kmTnzR9JvNSNSboL-PwdnFVf4'
//     },
//     {
//       id: 'papara',
//       name: 'Papara',
//       min: '₺50',
//       max: '₺25,000',
//       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3VxJu8h4_zpOJHHMpF2wympCuAITT-W0b-UXUHQzyML_0MwFSW1jX2DjNQ3ZlH-Z6KomIs1WXQTkqC8dADBN-mWV8hIveBXwRbQssEdUSYQsBf8FA45CGOuWnAOAbGq2YyjTe5fMWIaiDSKylFxS-yFsvDBb69rKmJI-nGdTAxlLZr1H3fqCVzkP_e1sErR8CKHijt85gGV-7d18cUWnCkOJJm3e9-2SgZNboy2rW70Y_vstqPlt1yMRV1IiiUwExjNZ5PSLPp6o'
//     },
//     {
//       id: 'credit-card',
//       name: 'Kredi Kartı',
//       min: '₺75',
//       max: '₺10,000',
//       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbrkqhIF9yLuSu4wfYO1fxIUmJ5S7my0LBb4I3lQeSCYkURWhv7aegkmXyBFtXz8Niwpd_VyhcMUDY_QivlocBe4qWjTQvZatsWEcy88fqVrxkeB1wGRcS6iz8OVRCG_TRZ6xlBoxjM84yBby6qnfVlGR3Ob9owN3ZlYHGjrYJV0YgGCWjyKM2xmscw66y-9umdKkGs_HlSutEXJWu_X-DDa_fRGRNSYjnRkR7Cyr_-wv9SfLcJRiiBbsljN41SBvrh_9mPs-sxVY'
//     },
//     {
//       id: 'payfix',
//       name: 'PayFix',
//       min: '₺25',
//       max: '₺5,000',
//       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdp3mmIlh7EJ3ZZIskySQbEfE4E-oPmCx-YyE5eI2rI1ulrDnC3zpX6ufS9mLuEu-7f37S-G0luayBRKaq5APWSilqllI-Q-hX8i6JlhD5u-JCU-rTsXaYssV-z4NwkmRAXZGuRtkTUb8qQvFnDAVXW1JaMKwHPYLRYfiBKXbqVgxoPMCFyWReWlqReggUlHBpOYEVx_t3rwS-oOk-Vff-w1gkURupAfsj4LBSrWBvlqkXgtgAv5vNu8D9f959TGqIU1J8iysHVo0'
//     },
//     {
//       id: 'crypto',
//       name: 'Kripto Para',
//       min: '₺200',
//       max: '₺100,000',
//       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvTtxho8uFm1oh9KtLz4wgysSzct3hXmNc4OmMIs4uCUz4rZYazhOCTRlYvOEWpGlcrh1sksuok3MG-hfEemp8eTYFJIp_Svvb__qu-e6j0FsA71YUhRFxnHSMenjBpaoykUWE2WBiMJnJccxwOYO5mXBCKYXL_IpAzWiAcMRku-ssyeH-P6CHmMeXgipGtTxeaxZ3V8PzaCpCSiWd_hIqvh77EbqVnw-1WEUTaCG2Rx0_kokp7uz2F0n6FPwSBnToyr6hcGJbTjQ'
//     }
//   ]

//   const quickAmounts = ['100₺', '250₺', '500₺']

//   const selectedMethodData = paymentMethods.find(method => method.name === selectedMethod)

//   const handleAmountClick = (quickAmount) => {
//     const numericAmount = quickAmount.replace('₺', '').replace(',', '')
//     setAmount(numericAmount)
//   }

//   const router = useRouter()
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await authAPI.getMe()
//         setUser(response.data)
//       } catch (err) {
//         if (err.response?.status === 401) {
//           router.push('/auth/login')
//         }
//       }
//     }
//     fetchUser()
//   }, [router])

//   const handleDeposit = async () => {
//     if (!amount || parseFloat(amount) <= 0) {
//       setError('Lütfen geçerli bir tutar girin')
//       return
//     }

//     setLoading(true)
//     setError('')
//     setSuccess('')

//     try {
//       // Use createIbanDeposit for bank transfer, or createDeposit for other methods
//       let response
//       if (selectedMethod === 'Banka Havalesi' || selectedMethod === 'Aninda Havale') {
//         // For IBAN/bank transfer, use createIbanDeposit
//         response = await paymentAPI.createIbanDeposit({
//           amount: parseFloat(amount),
//           method: selectedMethod,
//           description: `${selectedMethod} ile yatırım`
//         })
//       } else {
//         // For other payment methods, use createDeposit
//         response = await paymentAPI.createDeposit({
//           amount: parseFloat(amount),
//           method: selectedMethod,
//           description: `${selectedMethod} ile yatırım`
//         })
//       }
//       setSuccess('Yatırım talebi başarıyla oluşturuldu!')
//       setAmount('0.00')
//       // Refresh user data
//       const userResponse = await authAPI.getMe()
//       setUser(userResponse.data)
//     } catch (err) {
//       setError(err.response?.data?.message || 'Yatırım talebi oluşturulamadı')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-text-light">
//       <Navbar />
//       <div className="layout-container flex h-full grow flex-col">
//         <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-5">
//           <div className="layout-content-container flex flex-col max-w-6xl flex-1">

//             <main className="flex-grow pt-8 sm:pt-12 pb-12">
//               {/* PageHeading */}
//               <div className="flex flex-wrap justify-between gap-4 p-4">
//                 <div className="flex flex-col gap-2">
//                 <p className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">{t('common.depositTitle')}</p>
//                 <p className="text-text-dark text-base font-normal leading-normal">{t('common.depositInstructions')}</p>
//                 </div>
//               </div>

//               {/* Main Content */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 p-4">
//                 {/* Left Column: Payment Methods */}
//                 <div className="lg:col-span-2">
//                   <h2 className="text-white text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">{t('common.paymentMethods')}</h2>
//                   {/* ImageGrid */}
//                   <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
//                     {paymentMethods.map((method) => (
//                       <div
//                         key={method.id}
//                         onClick={() => setSelectedMethod(method.name)}
//                         className={`flex flex-col gap-3 p-3 rounded-lg bg-surface-dark border-2 transition-all duration-300 cursor-pointer ${
//                           selectedMethod === method.name
//                             ? 'border-primary shadow-glow-primary'
//                             : 'border-border-dark hover:border-primary/50'
//                         }`}
//                       >
//                         <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg bg-white p-2">
//                           <img alt={method.name} className="w-full h-full object-contain" src={method.image} />
//                         </div>
//                         <div>
//                           <p className="text-white text-base font-medium leading-normal">{method.name}</p>
//                           <p className="text-text-dark text-sm font-normal leading-normal">{t('common.min')}: {method.min} / {t('common.max')}: {method.max}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Right Column: Deposit Form */}
//                 <div className="lg:col-span-1">
//                   <div className="bg-surface-dark rounded-xl p-6 border border-border-dark h-full flex flex-col">
//                     <h2 className="text-white text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">{t('common.depositDetails')}</h2>
                    
//                     {/* ListItem */}
//                     <div className="flex items-center gap-4 bg-background-dark px-4 py-3 min-h-14 justify-between rounded-lg border border-border-dark">
//                       <div className="flex items-center gap-4">
//                         <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10 bg-white p-1">
//                           <img alt={selectedMethodData?.name} className="w-full h-full object-contain" src={selectedMethodData?.image} />
//                         </div>
//                         <p className="text-white text-base font-normal leading-normal flex-1 truncate">{selectedMethod}</p>
//                       </div>
//                       <div className="shrink-0">
//                         <button 
//                           onClick={() => setSelectedMethod('')}
//                           className="text-primary text-sm font-medium leading-normal hover:underline"
//                         >
//                           {t('common.change')}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="mt-6">
//                       <label className="block text-sm font-medium text-white mb-2" htmlFor="amount">{t('common.amount')}</label>
//                       <div className="relative">
//                         <input
//                           className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] text-white pl-12 pr-4 text-base font-normal leading-normal placeholder:text-gray-500 transition-all focus:border-primary focus:bg-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-primary/20"
//                           id="amount"
//                           name="amount"
//                           placeholder="0.00"
//                           type="text"
//                           value={amount}
//                           onChange={(e) => setAmount(e.target.value)}
//                           aria-required="true"
//                         />
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-500">₺</span>
//                       </div>
//                     </div>

//                     <div className="flex gap-2 mt-3">
//                       {quickAmounts.map((quickAmount) => (
//                         <button
//                           key={quickAmount}
//                           onClick={() => handleAmountClick(quickAmount)}
//                           className="flex-1 text-sm bg-background-dark rounded-md py-2 border border-border-dark hover:border-primary/50 transition-colors text-white"
//                         >
//                           {quickAmount}
//                         </button>
//                       ))}
//                     </div>

//                     {error && (
//                       <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3">
//                         <p className="text-sm text-red-400">{error}</p>
//                       </div>
//                     )}
//                     {success && (
//                       <div className="mt-4 rounded-lg bg-green-500/20 border border-green-500/50 p-3">
//                         <p className="text-sm text-green-400">{success}</p>
//                       </div>
//                     )}
//                     <div className="mt-6 flex-grow flex flex-col justify-between">
//                       <div>
//                         <p className="text-sm font-medium text-text-light">{t('common.instructions')}</p>
//                         <p className="text-sm text-text-dark mt-2 bg-background-dark p-3 rounded-lg border border-border-dark">
//                           {t('common.depositInstructionText')}
//                         </p>
//                       </div>
//                       <button
//                         onClick={handleDeposit}
//                         disabled={loading || !selectedMethod}
//                         className="w-full mt-6 bg-primary text-black font-bold py-4 rounded-lg text-base hover:brightness-110 transition-all duration-300 shadow-glow-primary-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         {loading ? t('common.processing') || 'İşleniyor...' : t('common.completeDeposit')}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </main>

//             {/* Footer */}
//             <footer className="text-center p-6 border-t border-border-dark mt-auto">
//               <div className="flex justify-center gap-6 mb-4">
//                 <Link className="text-text-dark hover:text-white text-sm" href="/terms">Şartlar ve Koşullar</Link>
//                 <Link className="text-text-dark hover:text-white text-sm" href="/about/responsible-gaming">Sorumlu Oyun</Link>
//                 <Link className="text-text-dark hover:text-white text-sm" href="/help/contact">Müşteri Desteği</Link>
//               </div>
//               <p className="text-xs text-text-dark">© 2024 CasinoBet. Tüm hakları saklıdır.</p>
//             </footer>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function DepositPageWrapper() {
//   return (
//     <ProtectedRoute>
//       <DepositPage />
//     </ProtectedRoute>
//   )
// }
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { paymentAPI, authAPI, publicAPI } from '@/lib/api'
import UserSidebar from '@/components/UserSidebar'

function DepositPage() {
  const { t } = useTranslation()
  const router = useRouter()

  // UI state
  const [selectedMethod, setSelectedMethod] = useState('')
  const [amount, setAmount] = useState('')
  const quickAmounts = ['100₺', '250₺', '500₺']

  // data
  const [paymentMethods, setPaymentMethods] = useState([])
  const [bankInfo, setBankInfo] = useState(null)
  const [ibans, setIbans] = useState([])
  const selectedMethodData = useMemo(
    () => paymentMethods.find((m) => m.name === selectedMethod || m.id === selectedMethod) || null,
    [paymentMethods, selectedMethod]
  )

  // user + status
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // fetch methods, iban info, and active ibans in parallel
    const fetchData = async () => {
      try {
        const [methodsRes, ibanRes, ibansRes] = await Promise.allSettled([
          paymentAPI.getDepositMethods(),
          paymentAPI.getIbanInfo(),
          publicAPI.getActiveIbans(),
        ])

        if (methodsRes.status === 'fulfilled') {
          // support both { methods } and direct array
          const m = methodsRes.value.data?.methods ?? methodsRes.value.data ?? []
          const methodsArray = Array.isArray(m) ? m : []
          setPaymentMethods(methodsArray)
          // set default selected method if not present
          if (methodsArray.length > 0 && !selectedMethod) {
            const defaultName = methodsArray[0].name || methodsArray[0].id
            setSelectedMethod(defaultName)
          }
        }

        if (ibanRes.status === 'fulfilled') {
          // response shape may be { ibanInfo: { ... } } or direct object
          const info = ibanRes.value.data?.ibanInfo ?? ibanRes.value.data ?? null
          setBankInfo(info)
        }

        if (ibansRes.status === 'fulfilled') {
          // Get active IBANs from public API
          const ibansData = ibansRes.value.data?.ibans ?? []
          setIbans(Array.isArray(ibansData) ? ibansData : [])
        }
      } catch (err) {
        console.error('Failed to fetch payment metadata', err)
      }
    }

    // fetch user separately (auth)
    const fetchUser = async () => {
      try {
        const res = await authAPI.getMe()
        setUser(res.data)
      } catch (err) {
        if (err?.response?.status === 401) {
          router.push('/auth/login')
        } else {
          console.error('Failed to load user', err)
        }
      }
    }

    fetchData()
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper: detect if a method should use IBAN flow
  const isIbanMethod = (method) => {
    if (!method) return false
    const id = (method.id || '').toString().toLowerCase()
    const name = (method.name || '').toString().toLowerCase()
    if (id === 'iban') return true
    if (/iban|havale|eft|bank|bank-transfer|bank transfer/.test(name)) return true
    return false
  }

  const handleAmountClick = (quickAmount) => {
    const numericAmount = quickAmount.replace('₺', '').replace(',', '').trim()
    setAmount(numericAmount)
  }

  const handleDeposit = async (e) => {
    if (e) e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setError('Lütfen geçerli bir tutar girin')
      return
    }

    if (!selectedMethodData || !selectedMethod) {
      setError('Lütfen bir ödeme yöntemi seçin')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let response

      if (isIbanMethod(selectedMethodData)) {
        // IBAN/bank transfer flow
        response = await paymentAPI.createIbanDeposit({
          amount: parseFloat(amount),
          // you can send more fields if backend expects, e.g. senderIban, senderName
          description: `${selectedMethodData.name} ile yatırım`,
          // include optional fields only if available
          ...(user ? { userId: user._id } : {}),
        })
      } else {
        // other payment providers flow
        response = await paymentAPI.createDeposit({
          amount: parseFloat(amount),
          method: selectedMethodData.id || selectedMethodData.name,
          description: `${selectedMethodData.name} ile yatırım`,
        })
      }

      setSuccess(response.data?.message || 'Yatırım talebi başarıyla oluşturuldu!')
      setAmount('0.00')

      // Refresh user data
      try {
        const userResponse = await authAPI.getMe()
        setUser(userResponse.data)
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Deposit error:', err)
      setError(err.response?.data?.message || 'Yatırım talebi oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <main className="flex-grow pt-8 sm:pt-12 pb-12">
              {/* PageHeading */}
              <div className="flex flex-wrap justify-between gap-4 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">{t('common.depositTitle')}</p>
                  <p className="text-text-dark text-base font-normal leading-normal">{t('common.depositInstructions')}</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 p-4">
                {/* Left Column: Payment Methods */}
                <div className="lg:col-span-2">
                  <h2 className="text-white text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">{t('common.paymentMethods')}</h2>
                  {/* ImageGrid */}
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text-dark">Ödeme yöntemleri yükleniyor...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paymentMethods.map((method) => (
                      <div
                        key={method.id || method.name}
                        onClick={() => setSelectedMethod(method.name || method.id)}
                        className={`flex flex-col gap-3 p-3 rounded-lg bg-surface-dark border-2 transition-all duration-300 cursor-pointer ${
                          (selectedMethod === method.name || selectedMethod === method.id)
                            ? 'border-primary shadow-glow-primary'
                            : 'border-border-dark hover:border-primary/50'
                        }`}
                      >
                        {method.image && (
                          <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg bg-white p-2">
                            <img alt={method.name || 'Payment method'} className="w-full h-full object-contain" src={method.image} onError={(e) => { e.target.style.display = 'none' }} />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-base font-medium leading-normal">{method.name || method.id}</p>
                          <p className="text-text-dark text-sm font-normal leading-normal">
                            {method.min && `${t('common.min') || 'Min'}: ${method.min}`}
                            {method.min && method.max && ' / '}
                            {method.max && `${t('common.max') || 'Max'}: ${method.max}`}
                          </p>
                        </div>
                      </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Deposit Form */}
                <div className="lg:col-span-1">
                  <div className="bg-surface-dark rounded-xl p-6 border border-border-dark h-full flex flex-col">
                    <h2 className="text-white text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">{t('common.depositDetails')}</h2>

                    {/* ListItem */}
                    {selectedMethodData ? (
                      <div className="flex items-center gap-4 bg-background-dark px-4 py-3 min-h-14 justify-between rounded-lg border border-border-dark">
                        <div className="flex items-center gap-4">
                          {selectedMethodData.image && (
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10 bg-white p-1">
                              <img alt={selectedMethodData.name} className="w-full h-full object-contain" src={selectedMethodData.image} />
                            </div>
                          )}
                          <p className="text-white text-base font-normal leading-normal flex-1 truncate">{selectedMethodData.name || selectedMethod}</p>
                        </div>
                        <div className="shrink-0">
                          <button
                            onClick={() => setSelectedMethod('')}
                            type="button"
                            className="text-primary text-sm font-medium leading-normal hover:underline"
                          >
                            {t('common.change')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-4 bg-background-dark px-4 py-3 min-h-14 rounded-lg border border-border-dark">
                        <p className="text-text-dark text-sm">Lütfen bir ödeme yöntemi seçin</p>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}
                    {success && (
                      <div className="mt-4 rounded-lg bg-green-500/20 border border-green-500/50 p-3">
                        <p className="text-sm text-green-400">{success}</p>
                      </div>
                    )}

                    <form onSubmit={handleDeposit} className="mt-6 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-white mb-2" htmlFor="amount">{t('common.amount') || 'Amount'}</label>
                          <div className="relative">
                            <input
                              className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] text-white pl-12 pr-4 text-base font-normal leading-normal placeholder:text-gray-500 transition-all focus:border-primary focus:bg-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-primary/20"
                              id="amount"
                              name="amount"
                              placeholder="0.00"
                              type="number"
                              min="0"
                              step="0.01"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              aria-required="true"
                              required
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-500">₺</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                          {quickAmounts.map((quickAmount) => (
                            <button
                              key={quickAmount}
                              onClick={() => handleAmountClick(quickAmount)}
                              type="button"
                              className="flex-1 text-sm bg-background-dark rounded-md py-2 border border-border-dark hover:border-primary/50 transition-colors text-white"
                            >
                              {quickAmount}
                            </button>
                          ))}
                        </div>

                        <p className="text-sm font-medium text-text-light mb-2">{t('common.instructions') || 'Instructions'}</p>
                        <p className="text-sm text-text-dark mb-4 bg-background-dark p-3 rounded-lg border border-border-dark">
                          {t('common.depositInstructionText') || 'Please follow the instructions for your selected payment method.'}
                        </p>

                        {/* show IBAN info when IBAN method selected */}
                        {isIbanMethod(selectedMethodData) && (
                          <div className="mb-4">
                            {ibans.length > 0 ? (
                              <div className="space-y-3">
                                <p className="text-white font-medium text-sm mb-2">Banka Hesapları</p>
                                {ibans.map((iban, index) => (
                                  <div
                                    key={index}
                                    className="p-4 rounded-lg border border-border-dark bg-[#0b0b0b] text-sm"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-text-dark">Banka:</p>
                                        <p className="text-white font-medium">{iban.bankName}</p>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-text-dark">Hesap Sahibi:</p>
                                        <p className="text-white font-medium">{iban.accountHolder}</p>
                                      </div>
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="text-text-dark shrink-0">IBAN:</p>
                                        <div className="flex items-center gap-2 flex-1 justify-end">
                                          <p className="text-white font-mono text-xs break-all text-right">{iban.ibanNumber}</p>
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              try {
                                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                                  await navigator.clipboard.writeText(iban.ibanNumber)
                                                  setSuccess('IBAN kopyalandı!')
                                                  setTimeout(() => setSuccess(''), 3000)
                                                } else {
                                                  // Fallback for older browsers
                                                  const textArea = document.createElement('textarea')
                                                  textArea.value = iban.ibanNumber
                                                  textArea.style.position = 'fixed'
                                                  textArea.style.left = '-999999px'
                                                  document.body.appendChild(textArea)
                                                  textArea.select()
                                                  document.execCommand('copy')
                                                  document.body.removeChild(textArea)
                                                  setSuccess('IBAN kopyalandı!')
                                                  setTimeout(() => setSuccess(''), 3000)
                                                }
                                              } catch (err) {
                                                console.error('Failed to copy IBAN:', err)
                                                setError('IBAN kopyalanamadı. Lütfen manuel olarak kopyalayın.')
                                                setTimeout(() => setError(''), 3000)
                                              }
                                            }}
                                            className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                                            title="IBAN'ı Kopyala"
                                          >
                                            <span className="material-symbols-outlined text-lg">content_copy</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <p className="text-xs text-text-dark mt-3">
                                  Lütfen yatırım yaparken yukarıdaki hesaplardan birini kullanın. Yatırım işleminiz onaylandıktan sonra bakiyenize eklenecektir.
                                </p>
                              </div>
                            ) : bankInfo ? (
                              // Fallback to old bankInfo if no IBANs from public API
                              <div className="p-3 rounded-lg border border-border-dark bg-[#0b0b0b] text-sm text-text-dark">
                                <p className="text-white font-medium">IBAN Bilgileri</p>
                                <p className="mt-1">Hesap Sahibi: <span className="text-white">{bankInfo.accountHolder}</span></p>
                                <p>Bank: <span className="text-white">{bankInfo.bankName}</span></p>
                                <p>IBAN: <span className="text-white">{bankInfo.iban}</span></p>
                                {bankInfo.instructions && Array.isArray(bankInfo.instructions) && (
                                  <ul className="mt-2 list-disc list-inside text-xs text-text-dark">
                                    {bankInfo.instructions.map((ins, i) => <li key={i}>{ins}</li>)}
                                  </ul>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border border-border-dark bg-[#0b0b0b] text-sm text-text-dark">
                                <p className="text-white font-medium">Banka Hesabı Bilgileri</p>
                                <p className="mt-2 text-xs">Banka hesap bilgileri yükleniyor...</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !selectedMethod || !selectedMethodData}
                        className="w-full mt-6 bg-primary text-black font-bold py-4 rounded-lg text-base hover:brightness-110 transition-all duration-300 shadow-glow-primary-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (t('common.processing') || 'İşleniyor...') : (t('common.completeDeposit') || 'Yatırım Yap')}
                      </button>
                    </form>
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

export default function DepositPageWrapper() {
  return (
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  )
}
