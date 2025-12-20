// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { authAPI, paymentAPI, kycAPI } from '@/lib/api'
// import ProtectedRoute from '@/components/ProtectedRoute'

// function ProfilePage() {
//   const router = useRouter()
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     phone: '',
//     iban: '',
//     ibanHolderName: '',
//     bankName: ''
//   })
//   const [kycStatus, setKycStatus] = useState('not_submitted')
//   const [kycDocuments, setKycDocuments] = useState({
//     idFront: null,
//     idBack: null,
//     addressProof: null,
//   })
//   const [kycUploading, setKycUploading] = useState(false)
//   const [showKYCSection, setShowKYCSection] = useState(false)

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const [userResponse, kycResponse] = await Promise.all([
//           authAPI.getMe(),
//           kycAPI.getKYC().catch(() => ({ data: { kycStatus: 'not_submitted', documents: {} } })),
//         ])
//         const userData = userResponse.data
//         setUser(userData)
//         setFormData({
//           firstName: userData.firstName || '',
//           lastName: userData.lastName || '',
//           phone: userData.phone || '',
//           iban: userData.iban || '',
//           ibanHolderName: userData.ibanHolderName || '',
//           bankName: userData.bankName || ''
//         })
//         setKycStatus(kycResponse.data.kycStatus || 'not_submitted')
//         setKycDocuments(kycResponse.data.documents || {})
//       } catch (err) {
//         if (err.response?.status === 401) {
//           router.push('/auth/login')
//         } else {
//           setError('Failed to load profile')
//         }
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchUser()
//   }, [router])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setSuccess('')
//     setLoading(true)

//     try {
//       await paymentAPI.updateProfile(formData)
//       setSuccess('Profile updated successfully!')
//       const response = await authAPI.getMe()
//       setUser(response.data)
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to update profile')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleKYCUpload = async (e) => {
//     e.preventDefault()
//     setError('')
//     setSuccess('')
//     setKycUploading(true)

//     try {
//       const formData = new FormData()
//       const idFrontFile = e.target.idFront?.files[0]
//       const idBackFile = e.target.idBack?.files[0]
//       const addressProofFile = e.target.addressProof?.files[0]

//       if (idFrontFile) formData.append('idFront', idFrontFile)
//       if (idBackFile) formData.append('idBack', idBackFile)
//       if (addressProofFile) formData.append('addressProof', addressProofFile)

//       if (!idFrontFile && !idBackFile && !addressProofFile) {
//         setError('Please select at least one document to upload')
//         setKycUploading(false)
//         return
//       }

//       const response = await kycAPI.uploadKYCDocuments(formData)
//       setSuccess('KYC documents uploaded successfully! Status: Pending Review')
//       setKycStatus('pending')
//       setKycDocuments(response.data.documents || {})
//       e.target.reset()
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to upload KYC documents')
//     } finally {
//       setKycUploading(false)
//     }
//   }

//   const getKYCStatusColor = (status) => {
//     switch (status) {
//       case 'approved':
//         return 'bg-green-500/20 text-green-400'
//       case 'pending':
//         return 'bg-yellow-500/20 text-yellow-400'
//       case 'rejected':
//         return 'bg-red-500/20 text-red-400'
//       default:
//         return 'bg-gray-500/20 text-gray-400'
//     }
//   }

//   const getKYCStatusText = (status) => {
//     switch (status) {
//       case 'approved':
//         return 'Approved'
//       case 'pending':
//         return 'Pending Review'
//       case 'rejected':
//         return 'Rejected'
//       default:
//         return 'Not Submitted'
//     }
//   }

//   if (loading && !user) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-background-dark">
//         <p className="text-white">Loading...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA]">
//       <main className="flex-grow">
//         <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-4xl">
//             <h1 className="text-white text-4xl font-bold mb-2">My Profile</h1>
//             <p className="text-white/60 mb-8">Manage your account information</p>

//             {error && (
//               <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
//                 <p className="text-sm text-red-400">{error}</p>
//               </div>
//             )}

//             {success && (
//               <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
//                 <p className="text-sm text-green-400">{success}</p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <div className="bg-component-dark rounded-lg p-6 border border-white/10">
//                 <p className="text-white/70 text-sm mb-1">Balance</p>
//                 <p className="text-white text-2xl font-bold">₺{user?.balance?.toFixed(2) || '0.00'}</p>
//               </div>
//               <div className="bg-component-dark rounded-lg p-6 border border-white/10">
//                 <p className="text-white/70 text-sm mb-1">Bonus Balance</p>
//                 <p className="text-white text-2xl font-bold">₺{user?.bonusBalance?.toFixed(2) || '0.00'}</p>
//               </div>
//               <div className="bg-component-dark rounded-lg p-6 border border-white/10">
//                 <p className="text-white/70 text-sm mb-1">Status</p>
//                 <p className="text-white text-2xl font-bold capitalize">{user?.status || 'Active'}</p>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="bg-component-dark rounded-lg p-6 border border-white/10 space-y-6">
//               <h2 className="text-white text-xl font-semibold mb-4">Personal Information</h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-white mb-2">First Name</label>
//                   <input
//                     type="text"
//                     value={formData.firstName}
//                     onChange={(e) => setFormData({...formData, firstName: e.target.value})}
//                     className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-white mb-2">Last Name</label>
//                   <input
//                     type="text"
//                     value={formData.lastName}
//                     onChange={(e) => setFormData({...formData, lastName: e.target.value})}
//                     className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-white mb-2">Phone</label>
//                   <input
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                     className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-white mb-2">Email</label>
//                   <input
//                     type="email"
//                     value={user?.email || ''}
//                     disabled
//                     className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white/50 cursor-not-allowed"
//                   />
//                 </div>
//               </div>

//               <h2 className="text-white text-xl font-semibold mt-8 mb-4">Banking Information</h2>

//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-white mb-2">IBAN</label>
//                   <input
//                     type="text"
//                     value={formData.iban}
//                     onChange={(e) => setFormData({...formData, iban: e.target.value})}
//                     placeholder="TR330006100519786457841326"
//                     className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
//                   />
//                   <p className="text-white/50 text-xs mt-1">Required for withdrawals</p>
//                 </div>
//                 <div>
//                   <label className="block text-white mb-2">IBAN Holder Name</label>
//                   <input
//                     type="text"
//                     value={formData.ibanHolderName}
//                     onChange={(e) => setFormData({...formData, ibanHolderName: e.target.value})}
//                     className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-white mb-2">Bank Name</label>
//                   <input
//                     type="text"
//                     value={formData.bankName}
//                     onChange={(e) => setFormData({...formData, bankName: e.target.value})}
//                     className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-primary text-black h-12 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
//               >
//                 {loading ? 'Saving...' : 'Save Changes'}
//               </button>
//             </form>

//             {/* KYC Section */}
//             <div className="bg-component-dark rounded-lg p-6 border border-white/10 mt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <h2 className="text-white text-xl font-semibold">KYC Verification</h2>
//                   <p className="text-white/60 text-sm mt-1">Upload your identity documents for verification</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKYCStatusColor(kycStatus)}`}>
//                     {getKYCStatusText(kycStatus)}
//                   </span>
//                   <button
//                     onClick={() => setShowKYCSection(!showKYCSection)}
//                     className="text-primary hover:text-yellow-400 transition-colors"
//                   >
//                     <span className="material-symbols-outlined">
//                       {showKYCSection ? 'expand_less' : 'expand_more'}
//                     </span>
//                   </button>
//                 </div>
//               </div>

//               {showKYCSection && (
//                 <form onSubmit={handleKYCUpload} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block text-white mb-2 text-sm">ID Front</label>
//                       <input
//                         type="file"
//                         name="idFront"
//                         accept="image/*,.pdf"
//                         className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-yellow-400 file:cursor-pointer"
//                       />
//                       {kycDocuments.idFront && (
//                         <a
//                           href={kycDocuments.idFront}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-primary text-xs mt-1 hover:underline"
//                         >
//                           View uploaded
//                         </a>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-white mb-2 text-sm">ID Back</label>
//                       <input
//                         type="file"
//                         name="idBack"
//                         accept="image/*,.pdf"
//                         className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-yellow-400 file:cursor-pointer"
//                       />
//                       {kycDocuments.idBack && (
//                         <a
//                           href={kycDocuments.idBack}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-primary text-xs mt-1 hover:underline"
//                         >
//                           View uploaded
//                         </a>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-white mb-2 text-sm">Address Proof</label>
//                       <input
//                         type="file"
//                         name="addressProof"
//                         accept="image/*,.pdf"
//                         className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-yellow-400 file:cursor-pointer"
//                       />
//                       {kycDocuments.addressProof && (
//                         <a
//                           href={kycDocuments.addressProof}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-primary text-xs mt-1 hover:underline"
//                         >
//                           View uploaded
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={kycUploading}
//                     className="w-full bg-primary text-black h-12 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
//                   >
//                     {kycUploading ? 'Uploading...' : 'Upload KYC Documents'}
//                   </button>
//                 </form>
//               )}
//             </div>

//             <div className="mt-6 flex gap-4">
//               <Link href="/dashboard" className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors">
//                 Back to Dashboard
//               </Link>
//               <Link href="/withdraw" className="bg-primary text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
//                 Withdraw Funds
//               </Link>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default function ProfilePageWrapper() {
//   return (
//     <ProtectedRoute>
//       <ProfilePage />
//     </ProtectedRoute>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI, paymentAPI, kycAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import UserSidebar from '@/components/UserSidebar'

function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    iban: '',
    ibanHolderName: '',
    bankName: ''
  })
  const [kycStatus, setKycStatus] = useState('not_submitted')
  const [kycDocuments, setKycDocuments] = useState({
    idFront: null,
    idBack: null,
    addressProof: null,
  })
  const [kycUploading, setKycUploading] = useState(false)
  const [showKYCSection, setShowKYCSection] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError('')
        setLoading(true)
        
        // Try to get user from localStorage first as fallback
        let userData = null
        try {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            userData = JSON.parse(userStr)
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        
        // Fetch user data and KYC data in parallel
        const [userResponse, kycResponse] = await Promise.all([
          authAPI.getMe().catch((err) => {
            // If API fails but we have localStorage data, use it
            if (userData) {
              return { data: userData }
            }
            throw err
          }),
          kycAPI.getKYC().catch((err) => {
            // If KYC endpoint fails, return default values
            if (process.env.NODE_ENV === 'development') {
              console.warn('KYC fetch failed:', err)
            }
            return { data: { kycStatus: 'not_submitted', documents: {} } }
          }),
        ])
        
        const fetchedUserData = userResponse.data || userData
        if (!fetchedUserData) {
          throw new Error('No user data available')
        }
        
        // Update localStorage with fresh data
        try {
          localStorage.setItem('user', JSON.stringify(fetchedUserData))
        } catch (e) {
          // Ignore localStorage errors
        }
        
        setUser(fetchedUserData)
        setFormData({
          firstName: fetchedUserData.firstName || '',
          lastName: fetchedUserData.lastName || '',
          phone: fetchedUserData.phone || '',
          iban: fetchedUserData.iban || '',
          ibanHolderName: fetchedUserData.ibanHolderName || '',
          bankName: fetchedUserData.bankName || ''
        })
        
        // Set KYC data if available
        if (kycResponse?.data) {
          setKycStatus(kycResponse.data.kycStatus || 'not_submitted')
          setKycDocuments(kycResponse.data.documents || {})
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        if (err.response?.status === 401) {
          window.location.href = '/auth/login'
          return
        }
        // Don't show error if we have fallback data
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const fallbackUser = JSON.parse(userStr)
            setUser(fallbackUser)
            setFormData({
              firstName: fallbackUser.firstName || '',
              lastName: fallbackUser.lastName || '',
              phone: fallbackUser.phone || '',
              iban: fallbackUser.iban || '',
              ibanHolderName: fallbackUser.ibanHolderName || '',
              bankName: fallbackUser.bankName || ''
            })
            setError('') // Clear error if we have fallback data
          } catch (e) {
            setError('Failed to load profile. Please refresh the page.')
          }
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load profile. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await paymentAPI.updateProfile(formData)
      setSuccess('Profile updated successfully!')
      const response = await authAPI.getMe()
      setUser(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  /* ===========================================
     ✅ FIXED KYC UPLOAD (LOGIC ONLY)
  =========================================== */
  const handleKYCUpload = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setKycUploading(true)

    try {
      const form = e.currentTarget
      const data = new FormData()

      const idFrontFile = form.elements.namedItem('idFront')?.files[0]
      const idBackFile = form.elements.namedItem('idBack')?.files[0]
      const addressProofFile = form.elements.namedItem('addressProof')?.files[0]

      if (idFrontFile) data.append('idFront', idFrontFile)
      if (idBackFile) data.append('idBack', idBackFile)
      if (addressProofFile) data.append('addressProof', addressProofFile)

      if (!idFrontFile && !idBackFile && !addressProofFile) {
        setError('Please select at least one document to upload')
        return
      }

      const response = await kycAPI.uploadKYCDocuments(data)

      setSuccess('KYC documents uploaded successfully! Status: Pending Review')
      setKycStatus('pending')
      setKycDocuments(response.data.documents || {})
      form.reset()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload KYC documents')
    } finally {
      setKycUploading(false)
    }
  }

  const getKYCStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getKYCStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'pending':
        return 'Pending Review'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Not Submitted'
    }
  }

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background-dark font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* ⬇⬇⬇ UI BELOW IS 100% UNCHANGED ⬇⬇⬇ */}
            {/* YOUR ORIGINAL JSX CONTINUES HERE */}
<h1 className="text-white text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-white/60 mb-8">Manage your account information</p>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/70 text-sm mb-1">Balance</p>
                <p className="text-white text-2xl font-bold">₺{user?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/70 text-sm mb-1">Bonus Balance</p>
                <p className="text-white text-2xl font-bold">₺{user?.bonusBalance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/70 text-sm mb-1">Status</p>
                <p className="text-white text-2xl font-bold capitalize">{user?.status || 'Active'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-component-dark rounded-lg p-6 border border-white/10 space-y-6">
              <h2 className="text-white text-xl font-semibold mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <h2 className="text-white text-xl font-semibold mt-8 mb-4">Banking Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2">IBAN</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({...formData, iban: e.target.value})}
                    placeholder="TR330006100519786457841326"
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                  />
                  <p className="text-white/50 text-xs mt-1">Required for withdrawals</p>
                </div>
                <div>
                  <label className="block text-white mb-2">IBAN Holder Name</label>
                  <input
                    type="text"
                    value={formData.ibanHolderName}
                    onChange={(e) => setFormData({...formData, ibanHolderName: e.target.value})}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-black h-12 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            {/* KYC Section */}
            <div className="bg-component-dark rounded-lg p-6 border border-white/10 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white text-xl font-semibold">KYC Verification</h2>
                  <p className="text-white/60 text-sm mt-1">Upload your identity documents for verification</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKYCStatusColor(kycStatus)}`}>
                    {getKYCStatusText(kycStatus)}
                  </span>
                  <button
                    onClick={() => setShowKYCSection(!showKYCSection)}
                    className="text-primary hover:text-yellow-400 transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showKYCSection ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>
              </div>

              {showKYCSection && (
                <form onSubmit={handleKYCUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white mb-2 text-sm">ID Front</label>
                      <input
                        type="file"
                        name="idFront"
                        accept="image/*,.pdf"
                        className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-yellow-400 file:cursor-pointer"
                      />
                      {kycDocuments.idFront && (
                        <a
                          href={kycDocuments.idFront}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs mt-1 hover:underline"
                        >
                          View uploaded
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-white mb-2 text-sm">ID Back</label>
                      <input
                        type="file"
                        name="idBack"
                        accept="image/*,.pdf"
                        className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-yellow-400 file:cursor-pointer"
                      />
                      {kycDocuments.idBack && (
                        <a
                          href={kycDocuments.idBack}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs mt-1 hover:underline"
                        >
                          View uploaded
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-white mb-2 text-sm">Address Proof</label>
                      <input
                        type="file"
                        name="addressProof"
                        accept="image/*,.pdf"
                        className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-yellow-400 file:cursor-pointer"
                      />
                      {kycDocuments.addressProof && (
                        <a
                          href={kycDocuments.addressProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs mt-1 hover:underline"
                        >
                          View uploaded
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={kycUploading}
                    className="w-full bg-primary text-black h-12 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                  >
                    {kycUploading ? 'Uploading...' : 'Upload KYC Documents'}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <Link href="/dashboard" className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors">
                Back to Dashboard
              </Link>
              <Link href="/withdraw" className="bg-primary text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                Withdraw Funds
              </Link>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}

export default function ProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}