'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getCurrentUser, getRedirectPath } from '@/utils/auth'
import Navbar from '@/components/Navbar'

export default function ProtectedRoute({ children, requiredRole = null, allowedRoles = null }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/auth/login')
        return
      }

      const user = getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check role requirements
      if (requiredRole && user.role !== requiredRole) {
        router.push(getRedirectPath(user.role))
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push(getRedirectPath(user.role))
        return
      }

      setIsAuthorized(true)
      setLoading(false)
    }

    checkAuth()
  }, [router, requiredRole, allowedRoles])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

