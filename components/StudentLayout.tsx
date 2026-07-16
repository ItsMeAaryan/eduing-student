'use client'

import StudentSidebar from '@/components/dashboard/StudentSidebar'
import StudentTopBar from '@/components/dashboard/StudentTopBar'
import { StudentDataProvider } from '@/components/providers/StudentDataProvider'
import { useState } from 'react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <StudentDataProvider>
      <div className="min-h-screen bg-[#08080B] flex text-white font-sans selection:bg-brand-indigo/30">
        <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <div 
          className={`flex-1 flex flex-col min-h-screen max-w-full transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
          }`}
        >
          <StudentTopBar />
          <main className="flex-1 pb-20 lg:pb-8 p-4 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </StudentDataProvider>
  )
}
