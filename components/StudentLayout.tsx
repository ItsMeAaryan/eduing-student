'use client'

import StudentSidebar from '@/components/dashboard/StudentSidebar'
import StudentTopBar from '@/components/dashboard/StudentTopBar'
import { StudentDataProvider } from '@/components/providers/StudentDataProvider'
import { useState } from 'react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <StudentDataProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#4F6BFF] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none text-[13px] font-semibold"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-[#f6f5f4] dark:bg-[#0b0f17] flex text-[#111827] dark:text-slate-100 font-sans transition-colors duration-200">
        <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        {/* Main content: shifts right by sidebar width; adds bottom padding for mobile nav */}
        <div className={`flex-1 flex flex-col min-h-screen max-w-full transition-all duration-300 pb-[60px] lg:pb-0 ${
          isSidebarCollapsed ? 'lg:pl-[64px]' : 'lg:pl-[240px]'
        }`}>
          <StudentTopBar />
          <main id="main-content" tabIndex={-1} className="flex-1 p-[24px] lg:p-[32px] overflow-x-hidden outline-none">
            <div className="max-w-[1200px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </StudentDataProvider>
  )
}
