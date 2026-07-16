'use client'

import StudentSidebar from '@/components/dashboard/StudentSidebar'
import StudentTopBar from '@/components/dashboard/StudentTopBar'
import { StudentDataProvider } from '@/components/providers/StudentDataProvider'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentDataProvider>
      <div className="min-h-screen bg-[#08080B] flex text-white font-sans selection:bg-brand-indigo/30">
        <StudentSidebar />
        <div className="flex-1 lg:pl-[72px] flex flex-col min-h-screen max-w-full">
          <StudentTopBar />
          <main className="flex-1 pb-20 lg:pb-8 p-4 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </StudentDataProvider>
  )
}
