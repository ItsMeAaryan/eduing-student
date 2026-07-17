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


const TABS = ['General', 'Notifications', 'Security', 'AI Preferences']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px]">

        {/* ── SUB-NAV: settings tabs only ─────────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── SETTINGS CARDS ────────────────────────────── */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-[15px] font-semibold text-[#111827]">{activeTab} Settings</span>
            <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
          </div>

          <div className="p-[20px] flex flex-col gap-[16px]">
            {activeTab === 'General' && (
              <div className="flex flex-col gap-[16px]">
                <Row title="Account Email" sub="john.doe@example.com" action="Change" />
                <Row title="Phone Number" sub="+91 98765 43210" action="Change" />
                <Row title="Timezone" sub="Asia/Kolkata (IST)" action="Edit" />
                <Row title="Language" sub="English (US)" action="Edit" />
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="flex flex-col gap-[16px]">
                <Toggle title="Email Notifications" sub="Receive daily digests and important updates." on />
                <Toggle title="Push Notifications" sub="Get real-time alerts on your devices." on />
                <Toggle title="Scholarship Alerts" sub="Notified when new scholarships match your profile." on />
                <Toggle title="Deadline Reminders" sub="Alerts 7 days and 24 hours before a deadline." on />
                <Toggle title="AI Suggestions" sub="Weekly insights on university admissions." on={false} />
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="flex flex-col gap-[24px]">
                <div className="flex flex-col gap-[16px]">
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
              <div className="flex flex-col gap-[16px]">
                <Toggle title="Profile Engine" sub="Allow AI to automatically match you with universities." on />
                <Toggle title="Resume Parsing" sub="Allow AI to extract text from uploaded documents." on />
                <Toggle title="Smart Auto-Fill" sub="Use AI to pre-fill application forms." on />
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
          <div className="w-[32px] h-[32px] rounded-full bg-[#EEF2FF] flex items-center justify-center border border-[#E5E7EB]">
            <Icon size={14} className="text-[#4F6BFF]" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p className="text-[14px] font-medium text-[#111827]">{title}</p>
          <p className="text-[13px] text-[#6B7280]">{sub}</p>
        </div>
      </div>
      <button className={`px-[16px] h-[32px] rounded-[8px] text-[12px] font-medium transition-colors ${
        danger 
          ? 'border border-[#EF4444]/20 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]' 
          : 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]'
      }`}>
        {action}
      </button>
    </div>
  )
}

function Toggle({ title, sub, on }: any) {
  return (
    <div className="flex items-center justify-between py-[12px] border-b border-[#F3F4F6] last:border-b-0 cursor-pointer group">
      <div>
        <p className="text-[14px] font-medium text-[#111827]">{title}</p>
        <p className="text-[13px] text-[#6B7280]">{sub}</p>
      </div>
      <div className={`w-[36px] h-[20px] rounded-full p-[2px] transition-colors ${on ? 'bg-[#4F6BFF]' : 'bg-[#D1D5DB]'}`}>
        <div className={`w-[16px] h-[16px] bg-white rounded-full transition-transform ${on ? 'translate-x-[16px]' : ''}`} />
      </div>
    </div>
  )
}

function SessionCard({ device, browser, icon: Icon, current }: any) {
  return (
    <div className="flex items-center justify-between p-[16px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px]">
      <div className="flex items-center gap-[12px]">
        <Icon size={20} className="text-[#9CA3AF]" strokeWidth={1.8} />
        <div>
          <div className="flex items-center gap-[8px]">
            <span className="text-[14px] font-medium text-[#111827]">{device}</span>
            {current && <span className="text-[11px] font-semibold text-[#059669] bg-[#D1FAE5] px-[8px] py-[2px] rounded-full">Current Session</span>}
          </div>
          <span className="text-[13px] text-[#6B7280]">{browser}</span>
        </div>
      </div>
      <button className="text-[12px] font-medium text-[#EF4444] hover:underline">Revoke</button>
    </div>
  )
}
