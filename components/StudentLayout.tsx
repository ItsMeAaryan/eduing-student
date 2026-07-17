'use client'

import StudentSidebar from '@/components/dashboard/StudentSidebar'
import StudentTopBar from '@/components/dashboard/StudentTopBar'
import { StudentDataProvider } from '@/components/providers/StudentDataProvider'
import { useState } from 'react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <StudentDataProvider>
      <div className="min-h-screen bg-[#F9FAFB] flex text-[#111827] font-sans">
        <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <div className="flex-1 flex flex-col min-h-screen max-w-full lg:pl-[240px]">
          <StudentTopBar />
          <main className="flex-1 p-[32px] overflow-x-hidden">
            <div className="max-w-[1200px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </StudentDataProvider>
  )
}
