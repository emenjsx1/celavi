'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import DashboardContent from '@/components/DashboardContent'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <p className="text-text-light">Carregando...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <DashboardContent session={session} />
}










