// components/StudentLayout.tsx
'use client'

import { useState } from 'react'
import { StudentDataProvider } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import StudentSidebar from '@/components/dashboard/StudentSidebar'
import StudentTopBar from '@/components/dashboard/StudentTopBar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDataProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none text-[13px] font-semibold"
        style={{ background: 'var(--accent)', color: '#fff' }}
        >
        Skip to main content
      </a>

      <div
        className="min-h-screen flex font-sans transition-colors duration-200"
        style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <div
          className={`flex-1 flex flex-col min-h-screen max-w-full transition-all duration-300 pb-[60px] lg:pb-0 ${isSidebarCollapsed ? 'lg:pl-[64px]' : 'lg:pl-[240px]'
            }`}
        >
          <StudentTopBar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-4 lg:p-6 overflow-x-hidden outline-none"
          >
            <div className="max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </StudentDataProvider>
    </ProtectedRoute >
  )
}