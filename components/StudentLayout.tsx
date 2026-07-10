'use client'

import StudentSidebar from '@/components/dashboard/StudentSidebar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StudentSidebar />
      {/* Offset for desktop fixed sidebar (w-64), bottom padding for mobile bottom nav (h-16) */}
      <main className="lg:pl-64 pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
