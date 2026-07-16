'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { 
  User, Mail, Phone, Calendar, Globe, FileText, CheckCircle2, 
  AlertCircle, ShieldAlert, Sparkles, MapPin, Briefcase, 
  GraduationCap, TrendingUp, PenTool, Award, Clock
} from 'lucide-react';

import { calculateProfileStrength } from '@/lib/utils/profileStrength';
import { recommendUniversities } from '@/lib/utils/recommendationEngine';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, documents, universities, uniqueApps, savedPrograms, deadlines } = useStudentData();
  
  const aiInsights = useMemo(() => {
    if (!profile) return null;
    const profileEngine = calculateProfileStrength(profile, documents || []);
    return {
      profileEngine,
    };
  }, [profile, documents]);

  if (!profile) return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[#6D5DF6]/30 border-t-[#6D5DF6] rounded-full animate-spin" />
    </div>
  );

  const docsValues = Object.values(documents || {});
  const uploadedDocs = docsValues.filter((d:any) => d.fileUrl);
  const verifiedDocs = docsValues.filter((d:any) => d.status === 'verified');
  const pendingDocs = docsValues.filter((d:any) => d.status === 'pending');

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans pb-32">
        
        {/* HEADER */}
        <section className="pt-24 pb-12 px-8 max-w-[1200px] mx-auto">
          <div className="bg-[#111113] border border-white/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D5DF6]/5 blur-[100px] pointer-events-none" />
            
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-[#151519] bg-[#151519] overflow-hidden relative">
                {profile.profilePhotoURL ? (
                  <img src={profile.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
                    <User size={64} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#111113] p-1.5 rounded-full">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400" title="Verified Identity">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <h1 className="text-[40px] font-medium leading-none">{profile.fullName || user?.displayName || 'Student Profile'}</h1>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[12px] font-medium text-gray-400">
                  {profile.entranceExam || 'B.Tech Aspiring'}
                </span>
              </div>
              <p className="text-[16px] text-gray-400 mb-8">{user?.email}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="3" fill="none" />
                      <circle 
                        cx="18" cy="18" r="16" 
                        className="stroke-[#6D5DF6]" 
                        strokeWidth="3" fill="none" strokeLinecap="round"
                        strokeDasharray="100" strokeDashoffset={100 - (aiInsights?.profileEngine.percentage || 0)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium">
                      {aiInsights?.profileEngine.percentage || 0}%
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-medium text-white">Profile Strength</div>
                    <div className="text-[12px] text-gray-500">Admission Identity</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="z-10">
              <button className="px-8 py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 text-white rounded-full text-[14px] font-medium transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            
            {/* SECTION 1: ADMISSION IDENTITY */}
            <section>
              <h2 className="text-[20px] font-medium mb-6 flex items-center gap-2"><User className="text-[#6D5DF6]" size={20} /> Admission Identity</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCard label="Full Name" value={profile.fullName || 'Not set'} icon={User} />
                <InfoCard label="Email" value={user?.email || 'Not set'} icon={Mail} />
                <InfoCard label="Phone" value={profile.phone || 'Not set'} icon={Phone} />
                <InfoCard label="Date of Birth" value={profile.dob || 'Not set'} icon={Calendar} />
                <InfoCard label="Category" value={profile.category || 'General'} icon={CheckCircle2} />
                <InfoCard label="Nationality" value={profile.nationality || 'Indian'} icon={Globe} />
              </div>
            </section>

            {/* SECTION 2: ACADEMIC JOURNEY */}
            <section>
              <h2 className="text-[20px] font-medium mb-6 flex items-center gap-2"><GraduationCap className="text-[#6D5DF6]" size={20} /> Academic Journey</h2>
              <div className="bg-[#111113] border border-white/5 rounded-[32px] p-8">
                <div className="relative pl-6 border-l border-white/10 ml-3 space-y-10">
                  <TimelineItem 
                    title="10th Standard" 
                    subtitle="Secondary Education" 
                    value={`${profile.tenthPercentage || '--'}%`} 
                    icon={Award} 
                    status="Completed" 
                  />
                  <TimelineItem 
                    title="12th Standard" 
                    subtitle="Higher Secondary" 
                    value={`${profile.twelfthPercentage || '--'}%`} 
                    icon={Award} 
                    status="Completed" 
                  />
                  <TimelineItem 
                    title="Entrance Exams" 
                    subtitle={profile.entranceExam || 'Pending'} 
                    value={profile.entranceScore ? `${profile.entranceScore} Score` : 'Not appeared'} 
                    icon={PenTool} 
                    status={profile.entranceScore ? 'Completed' : 'Upcoming'} 
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: PREFERENCES */}
            <section>
              <h2 className="text-[20px] font-medium mb-6 flex items-center gap-2"><MapPin className="text-[#6D5DF6]" size={20} /> Preferences</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="Preferred State" value={profile.state || 'Any'} icon={MapPin} />
                <InfoCard label="Career Goal" value="Software Engineering" icon={Briefcase} />
                <div className="col-span-2 bg-[#111113] border border-white/5 rounded-[24px] p-6 flex flex-col gap-2">
                  <span className="text-[12px] text-gray-500">Preferred Courses</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Computer Science', 'Artificial Intelligence', 'Data Science'].map(c => (
                      <span key={c} className="px-4 py-2 bg-[#151519] border border-white/5 rounded-[12px] text-[12px] text-white font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </div>

          <aside className="w-full space-y-12">
            
            {/* SECTION 5: AI INSIGHTS */}
            <section>
              <h2 className="text-[20px] font-medium mb-6 flex items-center gap-2"><Sparkles className="text-[#6D5DF6]" size={20} /> AI Insights</h2>
              <div className="bg-[#111113] border border-[#6D5DF6]/20 shadow-[0_0_30px_rgba(109,93,246,0.05)] rounded-[32px] p-8">
                <h3 className="text-[16px] font-medium mb-2">Admission Readiness</h3>
                <p className="text-[14px] text-gray-400 mb-8">Your profile is currently at a <strong>{aiInsights?.profileEngine.percentage}%</strong> readiness level.</p>
                
                {aiInsights?.profileEngine.missingFields && aiInsights.profileEngine.missingFields.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[12px] text-amber-400 mb-3 flex items-center gap-2"><ShieldAlert size={14}/> Missing Information</h4>
                      <ul className="space-y-2">
                        {aiInsights.profileEngine.missingFields.slice(0,3).map((field:any, i:number) => (
                          <li key={i} className="text-[14px] text-gray-300 flex items-center gap-2"><AlertCircle size={14} className="text-amber-400"/> Add {field.label}</li>
                        ))}
                      </ul>
                    </div>
                    <button className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-[16px] text-[14px] font-medium transition-colors">
                      Quick Fix
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[16px] text-emerald-400 text-[14px] flex items-center gap-2">
                    <CheckCircle2 size={16}/> Profile fully optimized
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 4: DOCUMENTS SUMMARY */}
            <section>
              <h2 className="text-[20px] font-medium mb-6 flex items-center gap-2"><FileText className="text-[#6D5DF6]" size={20} /> Documents</h2>
              <div className="bg-[#111113] border border-white/5 rounded-[32px] p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#151519] border border-white/5 rounded-[16px] p-4">
                    <div className="text-[24px] font-medium text-white mb-1">{uploadedDocs.length}</div>
                    <div className="text-[12px] text-gray-500">Uploaded</div>
                  </div>
                  <div className="bg-[#151519] border border-emerald-500/10 rounded-[16px] p-4">
                    <div className="text-[24px] font-medium text-emerald-400 mb-1">{verifiedDocs.length}</div>
                    <div className="text-[12px] text-emerald-400/60">Verified</div>
                  </div>
                </div>
                <button className="w-full py-4 bg-[#151519] border border-white/5 hover:bg-white/5 text-white rounded-[16px] text-[14px] font-medium transition-colors">
                  View Academic Locker
                </button>
              </div>
            </section>

          </aside>

        </div>
      </div>
    </ProtectedRoute>
  );
}

function InfoCard({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6 flex flex-col gap-2 relative overflow-hidden group hover:border-white/10 transition-colors">
      <Icon size={48} className="absolute right-4 bottom-4 text-white/[0.02] group-hover:text-white/[0.05] transition-colors" />
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className="text-[16px] font-medium text-white truncate z-10">{value}</span>
    </div>
  )
}

function TimelineItem({ title, subtitle, value, icon: Icon, status }: any) {
  const isComplete = status === 'Completed';
  return (
    <div className="relative">
      <div className={`absolute -left-[32px] top-1 w-3 h-3 rounded-full ${isComplete ? 'bg-[#6D5DF6] shadow-[0_0_10px_rgba(109,93,246,0.5)]' : 'bg-[#151519] border-2 border-white/20'}`} />
      <div className="bg-[#151519] border border-white/5 rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${isComplete ? 'bg-[#6D5DF6]/10 text-[#6D5DF6]' : 'bg-white/5 text-gray-500'}`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-[16px] font-medium text-white">{title}</h4>
            <div className="text-[12px] text-gray-500">{subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[20px] font-medium text-white">{value}</div>
          <div className={`text-[12px] ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>{status}</div>
        </div>
      </div>
    </div>
  )
}
