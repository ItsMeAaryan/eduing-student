'use client'

import React, { useState } from 'react'
import {
  Settings, User, Shield, Bell, Lock, Monitor, Smartphone, Key,
  Fingerprint, Zap, Sun, Moon, Laptop, Palette, Layers, Activity
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useTheme } from 'next-themes'

const TABS = ['General', 'Appearance', 'Notifications', 'Security', 'AI Preferences']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const { user } = useAuth()
  const { profile } = useStudentData()
  const { theme, setTheme } = useTheme()

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* ── SUB-NAV: settings tabs only ─────────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── SETTINGS CARDS ────────────────────────────── */}
        <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-[14px] overflow-hidden transition-colors">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-border dark:border-slate-800">
            <span className="text-[15px] font-semibold text-foreground dark:text-slate-100">{activeTab} Settings</span>
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

            {activeTab === 'Appearance' && (
              <div className="flex flex-col gap-[24px]">
                {/* Theme Switcher Section */}
                <div>
                  <h3 className="text-[14px] font-bold text-foreground dark:text-slate-100 mb-[4px]">Theme Mode</h3>
                  <p className="text-[12px] text-muted-foreground dark:text-slate-400 mb-[12px]">Choose your preferred visual theme interface</p>

                  <div className="grid grid-cols-3 gap-[12px] max-w-[480px]">
                    {[
                      { key: 'light', label: 'Light', icon: Sun, desc: 'Clean, warm paper background' },
                      { key: 'dark', label: 'Dark', icon: Moon, desc: 'Notion & Linear dark mode' },
                      { key: 'system', label: 'System', icon: Laptop, desc: 'Match OS preference' },
                    ].map(opt => {
                      const IconComp = opt.icon
                      const isSelected = theme === opt.key
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setTheme(opt.key)}
                          className={`p-[14px] rounded-[10px] border flex flex-col items-start gap-[8px] transition-all text-left ${
                            isSelected
                              ? 'border-primary bg-primary/10 dark:bg-slate-800/80 ring-2 ring-primary/20'
                              : 'border-border dark:border-slate-800 bg-card dark:bg-slate-900 hover:border-primary/40'
                          }`}
                        >
                          <div className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center ${
                            isSelected ? 'bg-primary text-white' : 'bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400'
                          }`}>
                            <IconComp size={16} />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-foreground dark:text-slate-100">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground dark:text-slate-400 leading-snug mt-[2px]">{opt.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Accent Color Placeholder */}
                <div className="pt-[16px] border-t border-border dark:border-slate-800">
                  <div className="flex items-center justify-between mb-[8px]">
                    <div>
                      <h3 className="text-[14px] font-bold text-foreground dark:text-slate-100">Accent Color</h3>
                      <p className="text-[12px] text-muted-foreground dark:text-slate-400">Custom brand accent colors (Future-ready)</p>
                    </div>
                    <span className="text-[10px] font-semibold px-[8px] py-[2px] rounded-full bg-primary/10 text-primary">Default: Notion Blue</span>
                  </div>
                  <div className="flex gap-[10px]">
                    {['#0075de', '#1aae39', '#dd5b00', '#8B5CF6', '#2a9d99'].map(c => (
                      <div key={c} className="w-[28px] h-[28px] rounded-full cursor-not-allowed opacity-80 border-2 border-white dark:border-slate-800 shadow-xs" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Density & Motion Placeholders */}
                <div className="grid grid-cols-2 gap-[16px] pt-[16px] border-t border-border dark:border-slate-800">
                  <div className="p-[14px] rounded-[10px] border border-border dark:border-slate-800 bg-muted dark:bg-slate-800/40">
                    <div className="flex items-center gap-[8px] mb-[4px]">
                      <Layers size={15} className="text-primary" />
                      <h4 className="text-[13px] font-bold text-foreground dark:text-slate-100">Interface Density</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground dark:text-slate-400">Comfortable (Default)</p>
                  </div>

                  <div className="p-[14px] rounded-[10px] border border-border dark:border-slate-800 bg-muted dark:bg-slate-800/40">
                    <div className="flex items-center gap-[8px] mb-[4px]">
                      <Activity size={15} className="text-primary" />
                      <h4 className="text-[13px] font-bold text-foreground dark:text-slate-100">Motion Effects</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground dark:text-slate-400">Full Animations Enabled</p>
                  </div>
                </div>
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
                  <p className="text-[14px] font-semibold text-foreground dark:text-slate-100 mb-[12px]">Active Sessions</p>
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
    <div className="flex items-center justify-between py-[12px] border-b border-border dark:border-slate-800 last:border-b-0">
      <div className="flex items-center gap-[12px]">
        {Icon && (
          <div className="w-[32px] h-[32px] rounded-full bg-primary/10 dark:bg-slate-800 flex items-center justify-center border border-border dark:border-slate-700">
            <Icon size={14} className="text-primary" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p className="text-[14px] font-medium text-foreground dark:text-slate-100">{title}</p>
          <p className="text-[13px] text-muted-foreground dark:text-slate-400">{sub}</p>
        </div>
      </div>
      <button className={`text-[12px] font-semibold px-[12px] h-[30px] rounded-[6px] border transition-colors ${
        danger
          ? 'bg-destructive/10 text-destructive border-[#ef4444]/20 hover:bg-destructive/20'
          : 'bg-card dark:bg-slate-800 text-foreground dark:text-slate-300 border-border dark:border-slate-700 hover:bg-muted dark:hover:bg-slate-700'
      }`}>
        {action}
      </button>
    </div>
  )
}

function Toggle({ title, sub, defaultOn }: { title: string; sub: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn)
  return (
    <div className="flex items-center justify-between py-[10px] border-b border-border dark:border-slate-800 last:border-b-0">
      <div>
        <p className="text-[14px] font-medium text-foreground dark:text-slate-100">{title}</p>
        <p className="text-[12px] text-muted-foreground dark:text-slate-400">{sub}</p>
      </div>
      <button
        onClick={() => setOn(v => !v)}
        className={`w-[44px] h-[24px] rounded-full p-[2px] transition-colors ${on ? 'bg-primary' : 'bg-secondary/80 dark:bg-slate-700'}`}
      >
        <div className={`w-[20px] h-[20px] rounded-full bg-card transition-transform ${on ? 'translate-x-[20px]' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function SessionCard({ device, browser, icon: Icon, current }: any) {
  return (
    <div className="flex items-center justify-between p-[12px] bg-muted dark:bg-slate-800/40 border border-border dark:border-slate-800 rounded-[10px]">
      <div className="flex items-center gap-[12px]">
        <Icon size={18} className="text-muted-foreground dark:text-slate-400" />
        <div>
          <p className="text-[13px] font-semibold text-foreground dark:text-slate-100">{device}</p>
          <p className="text-[11px] text-muted-foreground dark:text-slate-400">{browser}</p>
        </div>
      </div>
      {current ? (
        <span className="text-[10px] font-bold px-[8px] py-[2px] rounded-full bg-success/10 text-success">This device</span>
      ) : (
        <button className="text-[11px] text-destructive font-medium hover:underline">Log out</button>
      )}
    </div>
  )
}
