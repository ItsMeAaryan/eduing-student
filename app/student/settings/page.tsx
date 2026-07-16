'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Shield, Bell, Palette, Lock, AlertOctagon, 
  Monitor, Smartphone, Globe, Download, LogOut, Key, 
  Mail, Fingerprint, ChevronRight, HelpCircle, 
  MessageSquare, FileText, CheckCircle2, Moon, Sun, 
  Zap, Compass
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "connected", label: "Connected Accounts", icon: Globe },
  { id: "ai", label: "AI Preferences", icon: Zap },
  { id: "support", label: "Support", icon: HelpCircle },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans pb-32">
        
        {/* HEADER */}
        <section className="pt-24 pb-12 px-8 max-w-[1400px] mx-auto border-b border-white/5">
          <h1 className="text-[48px] font-medium tracking-tight mb-2">Settings</h1>
          <p className="text-[16px] text-gray-400 max-w-xl">Manage your premium account center and application preferences.</p>
        </section>

        <div className="max-w-[1400px] mx-auto px-8 mt-12 flex flex-col lg:flex-row gap-16 items-start">
          
          {/* LEFT NAVIGATION */}
          <nav className="w-full lg:w-64 shrink-0 flex flex-col gap-1 lg:sticky lg:top-8">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-[12px] transition-colors ${
                    isActive ? 'bg-[#151519] text-white font-medium border border-white/5' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={16} className={isActive ? 'text-[#6D5DF6]' : ''} />
                    <span className="text-[14px]">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* RIGHT PANEL CONTENT */}
          <div className="flex-1 w-full max-w-3xl">
            <AnimatePresence mode="wait">
              
              {/* GENERAL */}
              {activeTab === 'general' && (
                <SettingGroup key="general" title="General Settings" description="Update your basic account settings.">
                  <SettingCard title="Account Email" subtitle="john.doe@example.com" action="Change" />
                  <SettingCard title="Phone Number" subtitle="+91 98765 43210" action="Change" />
                  <SettingCard title="Timezone" subtitle="Asia/Kolkata (IST)" action="Edit" />
                  <SettingCard title="Language" subtitle="English (US)" action="Edit" />
                </SettingGroup>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <SettingGroup key="notifications" title="Notifications" description="Choose what you want to be notified about.">
                  <ToggleCard title="Email Notifications" subtitle="Receive daily digests and important updates via email." active={true} />
                  <ToggleCard title="Push Notifications" subtitle="Get real-time alerts on your devices." active={true} />
                  <ToggleCard title="Scholarship Alerts" subtitle="Get notified when new scholarships match your profile." active={true} />
                  <ToggleCard title="Deadline Reminders" subtitle="Alerts 7 days and 24 hours before a deadline." active={true} />
                  <ToggleCard title="Application Updates" subtitle="Immediate notifications when you receive an admission offer." active={true} />
                  <ToggleCard title="AI Suggestions" subtitle="Weekly insights on university admissions and tips." active={false} />
                </SettingGroup>
              )}

              {/* SECURITY */}
              {activeTab === 'security' && (
                <SettingGroup key="security" title="Security" description="Manage your password and secure your account.">
                  <div className="space-y-4 mb-8">
                    <SettingCard title="Password" subtitle="Last changed 3 months ago" action="Update" icon={Key} />
                    <SettingCard title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" action="Enable" icon={Fingerprint} />
                  </div>

                  <h3 className="text-[14px] font-medium text-white mb-4">Active Sessions</h3>
                  <div className="space-y-4">
                    <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Monitor size={20} className="text-gray-500" />
                        <div>
                          <div className="text-[14px] font-medium text-white flex items-center gap-2">MacBook Pro <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px]">Current</span></div>
                          <div className="text-[12px] text-gray-500">Chrome • India</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Smartphone size={20} className="text-gray-500" />
                        <div>
                          <div className="text-[14px] font-medium text-white">iPhone 14 Pro</div>
                          <div className="text-[12px] text-gray-500">Safari • India</div>
                        </div>
                      </div>
                      <button className="text-[12px] font-medium text-rose-400 hover:text-rose-300 transition-colors">Revoke</button>
                    </div>
                  </div>
                </SettingGroup>
              )}

              {/* APPEARANCE */}
              {activeTab === 'appearance' && (
                <SettingGroup key="appearance" title="Appearance" description="Customize how the platform looks and feels.">
                  <div className="mb-8">
                    <div className="text-[14px] font-medium text-white mb-4">Theme</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border border-[#6D5DF6] rounded-[16px] bg-[#6D5DF6]/5 text-center cursor-pointer">
                        <div className="w-full h-12 bg-black rounded-lg mb-3 border border-white/10" />
                        <span className="text-[12px] font-medium text-white">Dark</span>
                      </div>
                      <div className="p-4 border border-white/5 rounded-[16px] bg-[#111113] text-center cursor-not-allowed opacity-50">
                        <div className="w-full h-12 bg-white rounded-lg mb-3" />
                        <span className="text-[12px] font-medium text-white">Light (Soon)</span>
                      </div>
                      <div className="p-4 border border-white/5 rounded-[16px] bg-[#111113] text-center cursor-not-allowed opacity-50">
                        <div className="w-full h-12 bg-gradient-to-r from-black to-white rounded-lg mb-3 border border-white/10" />
                        <span className="text-[12px] font-medium text-white">System</span>
                      </div>
                    </div>
                  </div>
                  <ToggleCard title="Compact Density" subtitle="Reduce padding and show more data on screen." active={false} />
                  <ToggleCard title="Rich Animations" subtitle="Enable hover effects, blur, and page transitions." active={true} />
                </SettingGroup>
              )}

              {/* CONNECTED ACCOUNTS */}
              {activeTab === 'connected' && (
                <SettingGroup key="connected" title="Connected Accounts" description="Manage third-party authentication services.">
                  <SettingCard title="Google" subtitle="Connected as user@gmail.com" action="Disconnect" />
                  <SettingCard title="Microsoft" subtitle="Not connected" action="Connect" />
                  <SettingCard title="LinkedIn" subtitle="Not connected" action="Connect" />
                </SettingGroup>
              )}

              {/* PRIVACY */}
              {activeTab === 'privacy' && (
                <SettingGroup key="privacy" title="Privacy" description="Control your personal data footprint.">
                  <SettingCard title="Download Your Data" subtitle="Get a copy of all your application data in JSON format." action="Request Archive" icon={Download} />
                  <ToggleCard title="Profile Visibility" subtitle="Allow universities to discover your profile for potential scholarship matching." active={true} />
                  
                  <div className="mt-12 bg-rose-500/5 border border-rose-500/10 rounded-[24px] p-6">
                    <h3 className="text-[16px] font-medium text-rose-400 mb-2">Danger Zone</h3>
                    <p className="text-[14px] text-rose-400/60 mb-6">Permanently remove your account, withdraw all active applications, and delete all uploaded documents. This cannot be undone.</p>
                    <button className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-[12px] text-[14px] font-medium transition-colors">
                      Delete Account
                    </button>
                  </div>
                </SettingGroup>
              )}

              {/* SUPPORT */}
              {activeTab === 'support' && (
                <SettingGroup key="support" title="Support & Resources" description="Get help and read our policies.">
                  <SettingCard title="Help Center" subtitle="Read guides and documentation" action="Open" icon={HelpCircle} />
                  <SettingCard title="Contact Support" subtitle="Message our admission experts" action="Message" icon={MessageSquare} />
                  <SettingCard title="Privacy Policy" subtitle="Read our data policies" action="View" icon={FileText} />
                  <SettingCard title="Terms of Service" subtitle="Read our terms of use" action="View" icon={FileText} />
                </SettingGroup>
              )}

              {/* AI */}
              {activeTab === 'ai' && (
                <SettingGroup key="ai" title="AI Preferences" description="Manage how the Copilot interacts with your data.">
                  <ToggleCard title="Context Sync" subtitle="Allow AI to read your profile and documents for better answers." active={true} />
                  <ToggleCard title="Proactive Suggestions" subtitle="Allow AI to suggest next steps based on deadlines." active={true} />
                  <SettingCard title="Clear AI History" subtitle="Delete all past Copilot conversations." action="Clear" icon={Trash2Icon} />
                </SettingGroup>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}

function SettingGroup({ title, description, children }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-[24px] font-medium mb-1">{title}</h2>
        <p className="text-[14px] text-gray-400">{description}</p>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  )
}

function SettingCard({ title, subtitle, action, icon: Icon }: any) {
  return (
    <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6 flex items-center justify-between group">
      <div className="flex items-center gap-4">
        {Icon && <Icon size={20} className="text-gray-500" />}
        <div>
          <div className="text-[14px] font-medium text-white mb-1">{title}</div>
          <div className="text-[12px] text-gray-500">{subtitle}</div>
        </div>
      </div>
      <button className="px-6 py-2.5 bg-[#151519] border border-white/5 hover:bg-white/5 rounded-[12px] text-[12px] font-medium transition-colors">
        {action}
      </button>
    </div>
  )
}

function ToggleCard({ title, subtitle, active }: any) {
  return (
    <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6 flex items-center justify-between">
      <div>
        <div className="text-[14px] font-medium text-white mb-1">{title}</div>
        <div className="text-[12px] text-gray-500">{subtitle}</div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${active ? 'bg-[#6D5DF6]' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
    </div>
  )
}

function Trash2Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>
    </svg>
  )
}
