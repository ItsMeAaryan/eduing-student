"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, User, Shield, Bell, Palette, Lock, AlertOctagon, 
  Camera, CheckCircle2, Monitor, Smartphone, Globe, Download, 
  Trash2, LogOut, Key, Mail, Fingerprint, ChevronRight, Save, Sparkles
} from "lucide-react";
import { useStudentData } from "@/components/providers/StudentDataProvider";
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "danger", label: "Danger Zone", icon: AlertOctagon },
];

export default function SettingsPage() {
  const { profile } = useStudentData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Form state for profile (only visual, no backend modification per instructions)
  const [formData, setFormData] = useState({
    name: profile?.fullName || user?.displayName || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "Not provided",
  });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col p-4 md:p-8 font-sans pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 mb-12"
      >
        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
          <Settings size={14} /> Preferences
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Account Settings</h1>
        <p className="text-[16px] text-white/50 max-w-xl font-medium">
          Manage your personal information, security preferences, and application notifications.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-64 flex flex-col gap-1 shrink-0 lg:sticky lg:top-24"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
                  isActive 
                    ? tab.id === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-white' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive && tab.id === 'danger' ? 'text-red-500' : (isActive ? 'text-indigo-400' : '')} />
                  <span className="text-sm font-bold">{tab.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="opacity-50" />}
              </button>
            )
          })}
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full max-w-3xl min-h-[600px]"
        >
          <AnimatePresence mode="wait">
            {/* PROFILE SETTINGS */}
            {activeTab === "profile" && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#111114] border border-white/[0.06] rounded-[32px] overflow-hidden">
                  <div className="p-8 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-white mb-1">Public Profile</h2>
                      <p className="text-sm text-white/40">This information will be visible to university admissions.</p>
                    </div>
                    {isEditing ? (
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                        <Save size={14} /> Save
                      </button>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                        Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                          {profile?.profilePhotoURL ? (
                            <Image src={profile.profilePhotoURL} alt="Avatar" fill className="object-cover" />
                          ) : (
                            <span className="text-3xl font-black text-white/50">{formData.name.charAt(0) || 'U'}</span>
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-1">Profile Photo</div>
                        <div className="text-xs text-white/40 mb-3">Recommended size: 400x400px. JPG, PNG or GIF.</div>
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-xs font-bold transition-all">
                          Upload new picture
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-white/40">Full Name</label>
                        <input 
                          id="fullName"
                          type="text" 
                          disabled={!isEditing}
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-white/40">Email Address</label>
                        <input 
                          id="email"
                          type="email" 
                          disabled={!isEditing}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-white/40">Phone Number</label>
                        <input 
                          id="phone"
                          type="text" 
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-white/40">Home Address</label>
                        <input 
                          id="address"
                          type="text" 
                          disabled={!isEditing}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECURITY SETTINGS */}
            {activeTab === "security" && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#111114] border border-white/[0.06] rounded-[32px] overflow-hidden p-8 space-y-8">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Authentication</h2>
                    <p className="text-sm text-white/40">Manage your password and active sessions.</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Key size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Password</div>
                        <div className="text-xs text-white/40">Last changed 3 months ago</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all">Change</button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.36,22 12.2,22C17,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Google Workspace</div>
                        <div className="text-xs text-white/40">Linked to {user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 size={14} /> Connected
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Fingerprint size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Two-Factor Authentication</div>
                        <div className="text-xs text-white/40">Add an extra layer of security</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all">Enable 2FA</button>
                  </div>
                </div>

                <div className="bg-[#111114] border border-white/[0.06] rounded-[32px] overflow-hidden p-8 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-2">Active Sessions</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <Monitor size={20} className="text-white/40" />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">MacBook Pro <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[9px] uppercase tracking-wider">Current</span></div>
                        <div className="text-xs text-white/40">Chrome • India</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <Smartphone size={20} className="text-white/40" />
                      <div>
                        <div className="text-sm font-bold text-white">iPhone 14 Pro</div>
                        <div className="text-xs text-white/40">Safari • India</div>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-white/40 hover:text-white transition-colors">Revoke</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#111114] border border-white/[0.06] rounded-[32px] overflow-hidden p-8 space-y-8"
              >
                <div>
                  <h2 className="text-xl font-black text-white mb-1">Communication</h2>
                  <p className="text-sm text-white/40">Decide how we contact you regarding your admissions.</p>
                </div>

                <div className="space-y-1">
                  {[
                    { title: "Email Notifications", desc: "Receive daily digests and important updates via email.", icon: Mail, active: true },
                    { title: "Push Notifications", desc: "Get real-time alerts on your devices.", icon: Bell, active: true },
                    { title: "Deadline Reminders", desc: "Alerts 7 days and 24 hours before a deadline.", icon: AlertOctagon, active: true },
                    { title: "Offer Alerts", desc: "Immediate notifications when you receive an admission offer.", icon: Sparkles, active: true },
                    { title: "Platform Newsletter", desc: "Weekly insights on university admissions and tips.", icon: Globe, active: false }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-4">
                        <item.icon size={18} className="text-white/40" />
                        <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-white/40">{item.desc}</div>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-indigo-600' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <motion.div 
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#111114] border border-white/[0.06] rounded-[32px] overflow-hidden p-8 space-y-8"
              >
                <div>
                  <h2 className="text-xl font-black text-white mb-1">Interface</h2>
                  <p className="text-sm text-white/40">Customize how the platform looks and feels on your device.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-bold text-white mb-3">Theme Preference</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border border-indigo-500 rounded-2xl bg-indigo-500/5 text-center cursor-pointer">
                        <div className="w-full h-16 bg-black rounded-lg mb-2" />
                        <span className="text-xs font-bold text-white">Dark</span>
                      </div>
                      <div className="p-4 border border-white/[0.06] rounded-2xl bg-white/[0.02] text-center cursor-not-allowed opacity-50">
                        <div className="w-full h-16 bg-white rounded-lg mb-2" />
                        <span className="text-xs font-bold text-white">Light (Soon)</span>
                      </div>
                      <div className="p-4 border border-white/[0.06] rounded-2xl bg-white/[0.02] text-center cursor-not-allowed opacity-50">
                        <div className="w-full h-16 bg-gradient-to-r from-black to-white rounded-lg mb-2" />
                        <span className="text-xs font-bold text-white">System</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-white/[0.04]">
                    <div>
                      <div className="text-sm font-bold text-white">Compact Mode</div>
                      <div className="text-xs text-white/40">Reduce padding and show more data on screen.</div>
                    </div>
                    <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-white/10">
                      <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-0" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-white/[0.04]">
                    <div>
                      <div className="text-sm font-bold text-white">Rich Animations</div>
                      <div className="text-xs text-white/40">Enable hover effects, blur, and page transitions.</div>
                    </div>
                    <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-indigo-600">
                      <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
                    </div>
                  </div>

                  <div className="space-y-2 py-4 border-t border-white/[0.04]">
                    <label htmlFor="language" className="text-sm font-bold text-white">Language</label>
                    <select id="language" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all">
                      <option value="en">English (US)</option>
                      <option value="uk">English (UK)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRIVACY */}
            {activeTab === "privacy" && (
              <motion.div 
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#111114] border border-white/[0.06] rounded-[32px] overflow-hidden p-8 space-y-8"
              >
                <div>
                  <h2 className="text-xl font-black text-white mb-1">Data & Privacy</h2>
                  <p className="text-sm text-white/40">Control your personal data footprint.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Download Your Data</div>
                      <div className="text-xs text-white/40 max-w-sm">Get a copy of all your application data, uploaded documents, and profile history in JSON format.</div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all">
                      <Download size={14} /> Request Archive
                    </button>
                  </div>

                  <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Profile Visibility</div>
                      <div className="text-xs text-white/40 max-w-sm">Allow universities to discover your profile for potential scholarship matching.</div>
                    </div>
                    <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-indigo-600">
                      <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DANGER ZONE */}
            {activeTab === "danger" && (
              <motion.div 
                key="danger"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-red-500/5 border border-red-500/10 rounded-[32px] overflow-hidden p-8 space-y-8"
              >
                <div>
                  <h2 className="text-xl font-black text-red-500 mb-1 flex items-center gap-2"><AlertOctagon size={20} /> Danger Zone</h2>
                  <p className="text-sm text-red-400/60">Irreversible actions regarding your account.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-black/20 border border-red-500/10 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Logout Everywhere</div>
                      <div className="text-xs text-white/40 max-w-sm">Force logout on all active sessions across all devices immediately.</div>
                    </div>
                    <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all">
                      <LogOut size={14} /> Revoke Sessions
                    </button>
                  </div>

                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Delete Account</div>
                      <div className="text-xs text-red-200/60 max-w-sm">Permanently remove your account, withdraw all active applications, and delete all uploaded documents. This cannot be undone.</div>
                    </div>
                    <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20">
                      <Trash2 size={14} /> Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
