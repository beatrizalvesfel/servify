'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

export function useCompanyAccess() {
  const { user, loading } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [currentCompanySlug, setCurrentCompanySlug] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return

    if (typeof window === 'undefined') return

    const host = window.location.host
    console.log('🔍 useCompanyAccess - Host:', host, 'User:', user)
    
    // Extract subdomain
    if (host.includes('.localhost')) {
      const subdomain = host.split('.')[0]
      setCurrentCompanySlug(subdomain)
      
      // Check if user belongs to this company
      if (user?.companySlug === subdomain) {
        console.log('✅ User has access to subdomain:', subdomain)
        setHasAccess(true)
      } else {
        console.log('❌ User does not have access to subdomain:', subdomain, 'User companySlug:', user?.companySlug)
        setHasAccess(false)
      }
    } else {
      // No subdomain (localhost:3000), allow access if user is logged in
      setCurrentCompanySlug(null)
      if (user) {
        console.log('✅ User has access to main domain')
        setHasAccess(true)
      } else {
        console.log('❌ No user logged in')
        setHasAccess(false)
      }
    }
  }, [user, loading])

  return {
    hasAccess,
    currentCompanySlug,
    loading: loading || hasAccess === null,
  }
}
