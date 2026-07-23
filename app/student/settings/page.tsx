'use client'
import React, { useState } from 'react'
import {
  Settings, User, Shield, Bell, Lock, Monitor, Smartphone, Key,
  Fingerprint, Zap, MoreHorizontal, SlidersHorizontal, Download,
  CheckCircle2
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { Button, Badge } from '@/components/ui/design-system'


const TABS = ['General', 'Notifications', 'Security', 'AI Preferences']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const { user } = useAuth()
  const { profile } = useStudentData()

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* ── SUB-NAV: settings tabs only ─────────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── SETTINGS CARDS ────────────────────────────── */}
        <div className="bg-white border border-[#EAECF0] rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#EAECF0]">
            <span className="text-[15px] font-semibold text-[#111827]">{activeTab} Settings</span>
            
          </div>

          <div className="p-[20px] flex flex-col gap-[20px]">
            {activeTab === 'General' && (
              <div className="flex flex-col gap-[20px]">
                <Row title="Account Email" sub={user?.email || 'Not set'} action="Change" />
                <Row title="Phone Number" sub={profile?.phone || 'Not set'} action="Change" />
                <Row title="Timezone" sub="Asia/Kolkata (IST)" action="Edit" />
                <Row title="Language" sub="English (US)" action="Edit" />
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="flex flex-col gap-[20px]">
                <Toggle title="Email Notifications" sub="Receive daily digests and important updates." defaultOn />
                <Toggle title="Push Notifications" sub="Get real-time alerts on your devices." defaultOn />
                <Toggle title="Scholarship Alerts" sub="Notified when new scholarships match your profile." defaultOn />
                <Toggle title="Deadline Reminders" sub="Alerts 7 days and 24 hours before a deadline." defaultOn />
                <Toggle title="AI Suggestions" sub="Weekly insights on university admissions." />
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="flex flex-col gap-[24px]">
                <div className="flex flex-col gap-[20px]">
                  <Row title="Password" sub="Last changed 3 months ago" action="Update" icon={Key} />
                  <Row title="Two-Factor Authentication" sub="Add an extra layer of security" action="Enable" icon={Fingerprint} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827] mb-[12px]">Active Sessions</p>
                  <div className="flex flex-col gap-[12px]">
                    <SessionCard device="MacBook Pro" browser="Chrome · India" icon={Monitor} current />
                    <SessionCard device="iPhone 14 Pro" browser="Safari · India" icon={Smartphone} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'AI Preferences' && (
              <div className="flex flex-col gap-[20px]">
                <Toggle title="Profile Engine" sub="Allow AI to automatically match you with universities." defaultOn />
                <Toggle title="Resume Parsing" sub="Allow AI to extract text from uploaded documents." defaultOn />
                <Toggle title="Smart Auto-Fill" sub="Use AI to pre-fill application forms." defaultOn />
                <Row title="Clear AI Cache" sub="Reset all personalized recommendations." action="Clear" danger />
              </div>
            )}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  )
}

function Row({ title, sub, action, icon: Icon, danger }: any) {
  return (
    <div className="flex items-center justify-between py-[12px] border-b border-[#F3F4F6] last:border-b-0">
      <div className="flex items-center gap-[12px]">
        {Icon && (
          <div className="w-[32px] h-[32px] rounded-full bg-[#EEF2FF] flex items-center justify-center border border-[#EAECF0]">
            <Icon size={14} className="text-[#4F6BFF]" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p className="text-[14px] font-medium text-[#111827]">{title}</p>
          <p className="text-[13px] text-[#6B7280]">{sub}</p>
        </div>
      </div>
      <Button variant={danger ? 'danger' : 'secondary'} size="sm">
        {action}
      </Button>
    </div>
  )
}

function Toggle({ title, sub, defaultOn }: { title: string; sub: string; defaultOn?: boolean }) {
  const [on, setOn] = React.useState(!!defaultOn)
  return (
    <div
      className="flex items-center justify-between py-[12px] border-b border-[#F3F4F6] last:border-b-0 cursor-pointer group"
      onClick={() => setOn(v => !v)}
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOn(v => !v) } }}
    >
      <div>
        <p className="text-[14px] font-medium text-[#111827]">{title}</p>
        <p className="text-[13px] text-[#6B7280]">{sub}</p>
      </div>
      <div
        className="w-[36px] h-[20px] rounded-full p-[2px] transition-colors shrink-0"
        style={{ backgroundColor: on ? '#4F6BFF' : '#D1D5DB' }}
      >
        <div className={`w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-[16px]' : 'translate-x-0'}`} />
      </div>
    </div>
  )
}

function SessionCard({ device, browser, icon: Icon, current }: any) {
  return (
    <div className="flex items-center justify-between p-[16px] bg-[#F9FAFB] border border-[#EAECF0] rounded-[8px]">
      <div className="flex items-center gap-[12px]">
        <Icon size={20} className="text-[#9CA3AF]" strokeWidth={1.8} />
        <div>
          <div className="flex items-center gap-[8px]">
            <span className="text-[14px] font-medium text-[#111827]">{device}</span>
            {current && <Badge variant="success">Current Session</Badge>}
          </div>
          <span className="text-[13px] text-[#6B7280]">{browser}</span>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2]">Revoke</Button>
    </div>
  )
}
