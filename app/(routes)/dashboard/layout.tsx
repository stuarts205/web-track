import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import DashboardProvider from './provider'

const DashboardLayout = async ({children}: {children: React.ReactNode}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div>
        <DashboardProvider>
          {children}
        </DashboardProvider>
    </div>

  )
}

export default DashboardLayout
