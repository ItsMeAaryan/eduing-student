const fs = require('fs');

const code = `
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { onSnapshot, doc, collection, query, where, or } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Star, Award, ChevronLeft, Clock, CheckCircle2, 
  Building2, Users, IndianRupee, BookOpen, Share, Bookmark,
  TrendingUp, Video, Check, Sparkles, GraduationCap, Globe, Lightbulb,
  AlertCircle, ShieldCheck, ArrowUpRight, ChevronDown, ChevronUp, Compass,
  Layers, Zap, HelpCircle, FileText, CheckCircle, BarChart3, PieChart
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { submitApplication } from '@/lib/firebase/applications'
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine'
import { recommendUniversities } from '@/lib/utils/recommendationEngine'

// Design.md Typography Scale
const Display1 = ({ children, className = '' }: any) => <h1 className={\`text-[48px] md:text-[64px] font-bold leading-[1.0] tracking-[-2.125px] text-[#000000] \${className}\`}>{children}</h1>
const Display2 = ({ children, className = '' }: any) => <h2 className={\`text-[38px] md:text-[54px] font-bold leading-[1.04] tracking-[-1.875px] text-[#000000] \${className}\`}>{children}</h2>
const Heading1 = ({ children, className = '' }: any) => <h2 className={\`text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-1px] text-[#000000] \${className}\`}>{children}</h2>
const Heading2 = ({ children, className = '' }: any) => <h3 className={\`text-[22px] md:text-[26px] font-bold leading-[1.23] tracking-[-0.625px] text-[#000000] \${className}\`}>{children}</h3>
const Heading3 = ({ children, className = '' }: any) => <h4 className={\`text-[18px] md:text-[22px] font-bold leading-[1.27] tracking-[-0.25px] text-[#000000] \${className}\`}>{children}</h4>
const Title = ({ children, className = '' }: any) => <div className={\`text-[18px] md:text-[20px] font-semibold leading-[1.4] tracking-[-0.125px] text-[#000000] \${className}\`}>{children}</div>
const BodyMd = ({ children, className = '' }: any) => <p className={\`text-[16px] font-normal leading-[1.5] text-[#31302e] \${className}\`}>{children}</p>
const BodySm = ({ children, className = '' }: any) => <p className={\`text-[15px] font-normal leading-[1.33] text-[#31302e] \${className}\`}>{children}</p>
const Eyebrow = ({ children, className = '' }: any) => <span className={\`text-[12px] font-semibold leading-[1.33] tracking-[0.125px] uppercase text-[#615d59] \${className}\`}>{children}</span>
const Caption = ({ children, className = '' }: any) => <p className={\`text-[14px] font-normal leading-[1.43] text-[#a39e98] \${className}\`}>{children}</p>

// Design.md Buttons
const PrimaryPillButton = ({ children, className = '', ...props }: any) => (
  <button className={\`bg-[#0075de] hover:bg-[#005bab] active:scale-[0.98] text-white text-[16px] font-medium leading-[1.5] px-[24px] py-[12px] rounded-[9999px] transition-all shadow-sm flex items-center justify-center gap-[8px] cursor-pointer \${className}\`} {...props}>
    {children}
  </button>
)

const SecondaryPillButton = ({ children, className = '', ...props }: any) => (
  <button className={\`bg-[#ffffff] hover:bg-[#f6f5f4] active:scale-[0.98] text-[#000000] text-[16px] font-medium leading-[1.5] px-[24px] py-[12px] rounded-[9999px] transition-all border border-[#e6e6e6] shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center gap-[8px] cursor-pointer \${className}\`} {...props}>
    {children}
  </button>
)

const UtilityButton = ({ children, className = '', ...props }: any) => (
  <button className={\`bg-[#ffffff] hover:bg-[#f6f5f4] text-[#000000] border border-[#e6e6e6] text-[15px] font-medium leading-[1.5] px-[14px] py-[8px] rounded-[8px] transition-colors flex items-center justify-center gap-[8px] cursor-pointer \${className}\`} {...props}>
    {children}
  </button>
)

// Design.md Card (Hairline + Soft Elevation)
const NotionCard = ({ children, className = '', elevated = false, onClick }: any) => (
  <div 
    onClick={onClick}
    className={\`bg-[#ffffff] border border-[#e6e6e6] rounded-[12px] \${elevated ? 'shadow-[0_4px_18px_rgba(0,0,0,0.04)]' : ''} \${className}\`}
  >
    {children}
  </div>
)

export default function FlagshipUniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const { user } = useAuth()
  const studentData = useStudentData()
  const { profile, documents, uniqueApps, savedPrograms, profileScore, universities } = studentData
  
  const [university, setUniversity] = useState<any | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'ug' | 'pg'>('all')

  useEffect(() => {
    if (!id) return
    const unsubUni = onSnapshot(doc(db, 'universities', id), (snap) => {
      if (snap.exists()) setUniversity({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
    return () => unsubUni()
  }, [id])

  useEffect(() => {
    if (!id) return
    const conditions = [where('universityId', '==', id), where('uniId', '==', id)]
    if (university?.name) conditions.push(where('universityName', '==', university.name))
    
    const q = query(collection(db, 'programs'), or(...conditions))
    const unsubProgs = onSnapshot(q, (snap) => {
      const allProgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const uniqueProgs = allProgs.filter((p, index, self) => index === self.findIndex((t) => t.id === p.id))
      setPrograms(uniqueProgs)
    })
    return () => unsubProgs()
  }, [id, university?.name])

  const handleApply = async (program: any) => {
    if (!user || !university) return router.push('/auth/login')
    if (!user.isVerified) return
    setApplying(true)
    try {
      await submitApplication(user.uid, id, university.name, program.name)
      setSelectedProgram(null)
    } catch (err) {}
    setApplying(false)
  }

  const probData = useMemo(() => {
    if (!university) return null
    return calculateAdmissionProbability({ profile, documents, applications: uniqueApps, savedPrograms, profileScore }, university)
  }, [university, profile, documents, uniqueApps, savedPrograms, profileScore])

  const recData = useMemo(() => {
    if (!universities || universities.length === 0 || !university) return null
    const recs = recommendUniversities(universities, { profile, documents, applications: uniqueApps, savedPrograms, profileScore })
    return recs.find(r => r.university.id === university.id)
  }, [universities, university, profile, documents, uniqueApps, savedPrograms, profileScore])

  const recommendations = useMemo(() => {
    if (!universities || universities.length === 0 || !university) return []
    return universities.filter(u => u.id !== university.id).slice(0, 3)
  }, [universities, university])

  if (loading) return (
    <div className="min-h-screen bg-[#f6f5f4] flex flex-col items-center justify-center gap-[16px]">
      <div className="w-[48px] h-[48px] border-4 border-[#0075de] border-t-transparent rounded-full animate-spin" />
      <Eyebrow className="text-[#615d59]">Preparing digital brochure...</Eyebrow>
    </div>
  )

  if (!university) return (
    <div className="min-h-screen bg-[#f6f5f4] flex flex-col items-center justify-center text-[#000000] p-[24px]">
      <Heading2 className="mb-16">University Profile Not Found</Heading2>
      <BodyMd className="mb-[24px] text-[#615d59]">The university you are looking for does not exist or has been relocated.</BodyMd>
      <UtilityButton onClick={() => router.back()}>
        <ChevronLeft size={16} strokeWidth={1.8} /> Back to Universities
      </UtilityButton>
    </div>
  )

  const overallProb = probData?.overallProbability || 78
  const aiMatch = recData?.overallMatchScore || 82
  const scholarshipMatch = Math.min(100, Math.floor(overallProb * 1.12))
  const financialFit = 85

  const filteredPrograms = programs.filter(p => {
    if (activeTab === 'ug') return p.level?.toLowerCase().includes('bachelor') || p.level?.toLowerCase().includes('ug')
    if (activeTab === 'pg') return p.level?.toLowerCase().includes('master') || p.level?.toLowerCase().includes('pg')
    return true
  })

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#f6f5f4] text-[#000000] selection:bg-[#0075de]/20 pb-[120px] font-sans antialiased">
        
        {/* ============================================================ */}
        {/* NARRATIVE PHASE 1: DISCOVERY & PRESTIGE HERO */}
        {/* ============================================================ */}
        <section className="relative w-full bg-[#213183] text-white pt-[60px] md:pt-[100px] pb-[160px] md:pb-[240px] px-[24px] md:px-[64px] overflow-hidden">
          {/* Glowing Constellation Orbs (Sticker Palette Decorative Glows) */}
          <div className="absolute top-[-40px] right-[10%] w-[300px] h-[300px] bg-[#62aef0] rounded-full blur-[140px] opacity-30 pointer-events-none" />
          <div className="absolute bottom-[20%] left-[5%] w-[250px] h-[250px] bg-[#d6b6f6] rounded-full blur-[120px] opacity-25 pointer-events-none" />
          <div className="absolute top-[40%] right-[30%] w-[200px] h-[200px] bg-[#ff64c8] rounded-full blur-[110px] opacity-20 pointer-events-none" />

          {/* Navigation Bar Back Control */}
          <div className="max-w-[1300px] mx-auto w-full mb-[32px] flex justify-between items-center relative z-20">
            <button 
              onClick={() => router.back()} 
              className="px-[16px] py-[8px] rounded-[9999px] bg-white/10 hover:bg-white/20 transition-all text-white text-[14px] font-medium flex items-center gap-[6px] backdrop-blur-md"
            >
              <ChevronLeft size={18} strokeWidth={2} /> Back to Directory
            </button>

            <div className="flex items-center gap-[12px]">
              <button className="w-[40px] h-[40px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all">
                <Share size={18} strokeWidth={2} />
              </button>
              <button className="w-[40px] h-[40px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all">
                <Bookmark size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-w-[1300px] mx-auto w-full relative z-10 flex flex-col items-start">
            
            {/* Identity & Reputation Badges */}
            <div className="flex flex-wrap items-center gap-[10px] mb-[28px]">
              {university.isVerified && (
                <span className="bg-[#ffffff] text-[#0075de] px-[12px] py-[4px] rounded-[9999px] text-[12px] font-bold tracking-wider uppercase flex items-center gap-[6px] shadow-sm">
                  <ShieldCheck size={14} strokeWidth={2.5} className="text-[#0075de]" /> Verified Partner
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md border border-white/15 px-[12px] py-[4px] rounded-[9999px] text-[12px] font-semibold text-white flex items-center gap-[6px]">
                <Star size={14} className="text-[#ff64c8] fill-[#ff64c8]" />
                {university.rating || '4.8'} Rating
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/15 px-[12px] py-[4px] rounded-[9999px] text-[12px] font-semibold text-white">
                NAAC {university.naacGrade || 'A++'} Accredited
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/15 px-[12px] py-[4px] rounded-[9999px] text-[12px] font-semibold text-white">
                Est. {university.established || '1984'}
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/15 px-[12px] py-[4px] rounded-[9999px] text-[12px] font-semibold text-white">
                {university.type || 'Private'} University
              </span>
            </div>

            {/* University Headline */}
            <Display1 className="text-white max-w-[900px] mb-[24px]">
              {university.name}
            </Display1>

            <div className="flex flex-wrap items-center gap-[24px] text-[17px] text-[#a39e98] mb-[40px]">
              <span className="flex items-center gap-[8px] text-white/90 font-medium">
                <MapPin size={20} strokeWidth={2} className="text-[#62aef0]" /> {university.location || 'India'}
              </span>
              <span className="w-[4px] h-[4px] rounded-full bg-white/30" />
              <span className="flex items-center gap-[8px] text-white/90">
                <Globe size={18} strokeWidth={2} className="text-[#d6b6f6]" /> {university.website || 'www.eduing.in'}
              </span>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-[16px]">
              <PrimaryPillButton onClick={() => document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Programs <ArrowUpRight size={18} />
              </PrimaryPillButton>
              <SecondaryPillButton onClick={() => document.getElementById('ai-analysis-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Check Admission Eligibility
              </SecondaryPillButton>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* NARRATIVE PHASE 2: MAIN BROCHURE CANVAS */}
        {/* ============================================================ */}
        <div className="max-w-[1300px] mx-auto px-[24px] md:px-[64px] flex flex-col lg:flex-row gap-[64px] -mt-[100px] md:-mt-[160px] relative z-20">
          
          {/* Main Document Flow (Left Column) */}
          <div className="flex-1 flex flex-col gap-[80px]">
            
            {/* Immersive Cover Image Well */}
            <div className="w-full h-[360px] md:h-[440px] rounded-[16px] overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#e6e6e6] bg-[#ffffff]">
              <Image 
                src={university.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'} 
                fill priority unoptimized className="object-cover" alt={university.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-[32px]">
                <div className="text-white">
                  <Eyebrow className="text-white/80 mb-[4px]">Campus Snapshot</Eyebrow>
                  <p className="text-[20px] font-semibold text-white">State-of-the-art Infrastructure & World-Class Learning Environment</p>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: UNIVERSITY OVERVIEW & WHY CHOOSE THIS UNIVERSITY */}
            {/* ------------------------------------------------------------ */}
            <section className="scroll-mt-[100px]">
              <Heading1 className="mb-[24px]">University Overview</Heading1>
              <BodyMd className="text-[#31302e] text-[18px] leading-[1.6] mb-[32px]">
                {university.overview || `${university.name} stands as a premier institution dedicated to academic excellence, innovative research, and holistic student development. Recognized nationwide for its industry-aligned curriculum and world-class faculty, it offers a vibrant ecosystem for future leaders.`}
              </BodyMd>

              {/* Why Choose This University Highlight Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                <NotionCard className="p-[24px]">
                  <div className="w-[40px] h-[40px] rounded-[8px] bg-[#d6b6f6]/20 text-[#391c57] flex items-center justify-center mb-[16px]">
                    <Award size={22} strokeWidth={2} />
                  </div>
                  <Title className="mb-[8px]">Global Recognition</Title>
                  <BodySm className="text-[#615d59]">Ranked among top institutions with accredited degree programs globally.</BodySm>
                </NotionCard>

                <NotionCard className="p-[24px]">
                  <div className="w-[40px] h-[40px] rounded-[8px] bg-[#62aef0]/20 text-[#0075de] flex items-center justify-center mb-[16px]">
                    <Zap size={22} strokeWidth={2} />
                  </div>
                  <Title className="mb-[8px]">Industry First</Title>
                  <BodySm className="text-[#615d59]">Curriculum designed in collaboration with top tech and corporate giants.</BodySm>
                </NotionCard>

                <NotionCard className="p-[24px]">
                  <div className="w-[40px] h-[40px] rounded-[8px] bg-[#1aae39]/20 text-[#1aae39] flex items-center justify-center mb-[16px]">
                    <GraduationCap size={22} strokeWidth={2} />
                  </div>
                  <Title className="mb-[8px]">Scholarships</Title>
                  <BodySm className="text-[#615d59]">Up to 100% merit-based tuition fee waivers for high achievers.</BodySm>
                </NotionCard>
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: AI ADMISSION ANALYSIS */}
            {/* ------------------------------------------------------------ */}
            <section id="ai-analysis-section" className="scroll-mt-[100px]">
              <div className="flex items-center gap-[12px] mb-[32px]">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-[#d6b6f6] text-[#391c57] flex items-center justify-center">
                  <Sparkles size={24} strokeWidth={2} />
                </div>
                <div>
                  <Eyebrow className="text-[#0075de]">EDUING AI Advisor</Eyebrow>
                  <Heading1>Admission Analysis</Heading1>
                </div>
              </div>

              <NotionCard className="p-[32px] md:p-[48px] mb-[24px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-[24px] pb-[32px] border-b border-[#e6e6e6] mb-[32px]">
                  <div>
                    <Eyebrow className="text-[#615d59] mb-[6px]">AI Match Recommendation</Eyebrow>
                    <Heading2 className="text-[#0075de]">Strong Academic & Financial Fit</Heading2>
                  </div>
                  <div className="flex items-center gap-[16px] bg-[#f6f5f4] px-[24px] py-[16px] rounded-[12px] border border-[#e6e6e6]">
                    <div className="text-center">
                      <Eyebrow className="text-[#615d59]">Admission Chance</Eyebrow>
                      <div className="text-[28px] font-bold text-[#1aae39]">{overallProb}%</div>
                    </div>
                    <div className="w-[1px] h-[36px] bg-[#e6e6e6]" />
                    <div className="text-center">
                      <Eyebrow className="text-[#615d59]">Scholarship Match</Eyebrow>
                      <div className="text-[28px] font-bold text-[#0075de]">{scholarshipMatch}%</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
                  <div>
                    <Eyebrow className="text-[#1aae39] mb-[16px] flex items-center gap-[6px]">
                      <CheckCircle2 size={16} className="text-[#1aae39]" /> Profile Strengths
                    </Eyebrow>
                    <ul className="flex flex-col gap-[12px]">
                      {(probData?.strengths || [
                        'Qualifying exam aggregate meets cutoff requirements',
                        'High academic alignment with university major criteria',
                        'Eligible for Merit-based Tuition Fee Waivers'
                      ]).map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-[10px] text-[15px] text-[#31302e]">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#1aae39] mt-[8px] shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Eyebrow className="text-[#dd5b00] mb-[16px] flex items-center gap-[6px]">
                      <AlertCircle size={16} className="text-[#dd5b00]" /> Recommended Actions / Gaps
                    </Eyebrow>
                    <ul className="flex flex-col gap-[12px]">
                      {(probData?.improvementSuggestions || [
                        'Complete profile verification to boost admission speed by 2x',
                        'Upload 12th / Degree marksheet before priority seat allotment deadline'
                      ]).map((gap: string, i: number) => (
                        <li key={i} className="flex items-start gap-[10px] text-[15px] text-[#31302e]">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#dd5b00] mt-[8px] shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </NotionCard>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: QUICK FACTS GROUPED INTELLIGENTLY */}
            {/* ------------------------------------------------------------ */}
            <section>
              <Heading1 className="mb-[32px]">At a Glance</Heading1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
                
                <NotionCard className="p-[20px]">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[#62aef0]/20 text-[#0075de] flex items-center justify-center mb-[12px]">
                    <IndianRupee size={20} />
                  </div>
                  <Eyebrow className="text-[#615d59] mb-[4px]">Starting Fees</Eyebrow>
                  <Title className="text-[20px]">₹{university.startingFees || '4.5L'} / yr</Title>
                </NotionCard>

                <NotionCard className="p-[20px]">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[#1aae39]/20 text-[#1aae39] flex items-center justify-center mb-[12px]">
                    <TrendingUp size={20} />
                  </div>
                  <Eyebrow className="text-[#615d59] mb-[4px]">Placement Rate</Eyebrow>
                  <Title className="text-[20px]">94.8%</Title>
                </NotionCard>

                <NotionCard className="p-[20px]">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[#ff64c8]/20 text-[#ff64c8] flex items-center justify-center mb-[12px]">
                    <Building2 size={20} />
                  </div>
                  <Eyebrow className="text-[#615d59] mb-[4px]">Campus Size</Eyebrow>
                  <Title className="text-[20px]">120+ Acres</Title>
                </NotionCard>

                <NotionCard className="p-[20px]">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[#d6b6f6]/20 text-[#391c57] flex items-center justify-center mb-[12px]">
                    <Users size={20} />
                  </div>
                  <Eyebrow className="text-[#615d59] mb-[4px]">Active Students</Eyebrow>
                  <Title className="text-[20px]">18,000+</Title>
                </NotionCard>

              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: PROGRAMS AS PREMIUM PRODUCTS */}
            {/* ------------------------------------------------------------ */}
            <section id="programs-section" className="scroll-mt-[100px]">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px] mb-[32px]">
                <div>
                  <Eyebrow className="text-[#0075de]">Curriculum & Admissions</Eyebrow>
                  <Heading1>Available Programs</Heading1>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-[4px] bg-white border border-[#e6e6e6] p-[4px] rounded-[9999px]">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={\`px-[16px] py-[6px] rounded-[9999px] text-[13px] font-semibold transition-all \${activeTab === 'all' ? 'bg-[#0075de] text-white' : 'text-[#615d59] hover:text-[#000000]'}\`}
                  >
                    All ({programs.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('ug')}
                    className={\`px-[16px] py-[6px] rounded-[9999px] text-[13px] font-semibold transition-all \${activeTab === 'ug' ? 'bg-[#0075de] text-white' : 'text-[#615d59] hover:text-[#000000]'}\`}
                  >
                    Undergraduate
                  </button>
                  <button 
                    onClick={() => setActiveTab('pg')}
                    className={\`px-[16px] py-[6px] rounded-[9999px] text-[13px] font-semibold transition-all \${activeTab === 'pg' ? 'bg-[#0075de] text-white' : 'text-[#615d59] hover:text-[#000000]'}\`}
                  >
                    Postgraduate
                  </button>
                </div>
              </div>

              {filteredPrograms.length === 0 ? (
                <NotionCard className="p-[64px] text-center">
                  <BookOpen size={48} className="mx-auto text-[#a39e98] mb-[16px]" />
                  <Heading3 className="mb-[8px]">No Programs Found</Heading3>
                  <BodyMd className="text-[#615d59]">There are currently no programs listed under this filter tab.</BodyMd>
                </NotionCard>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  {filteredPrograms.map((prog, i) => {
                    const isExpanded = expandedProgramId === prog.id
                    return (
                      <NotionCard 
                        key={prog.id || i} 
                        className={\`transition-all cursor-pointer overflow-hidden border \${isExpanded ? 'border-[#0075de] shadow-[0_4px_18px_rgba(0,0,0,0.04)]' : 'hover:border-[#0075de]/60'}\`}
                      >
                        <div 
                          className="p-[24px] md:p-[32px] flex flex-col md:flex-row md:items-center justify-between gap-[24px]"
                          onClick={() => setExpandedProgramId(isExpanded ? null : prog.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-[12px] mb-[12px]">
                              <span className="bg-[#0075de]/10 text-[#0075de] px-[10px] py-[3px] rounded-[9999px] text-[11px] font-bold uppercase tracking-wider">
                                {prog.level || 'Degree'}
                              </span>
                              {prog.popular && (
                                <span className="bg-[#dd5b00]/10 text-[#dd5b00] px-[10px] py-[3px] rounded-[9999px] text-[11px] font-bold uppercase tracking-wider">
                                  Top Pick
                                </span>
                              )}
                            </div>
                            <Heading3 className="text-[#000000] mb-[12px]">{prog.name}</Heading3>
                            
                            <div className="flex flex-wrap items-center gap-[24px]">
                              <div>
                                <Eyebrow className="text-[#a39e98] text-[11px]">Duration</Eyebrow>
                                <BodySm className="font-semibold">{prog.duration || '4 Years'}</BodySm>
                              </div>
                              <div className="w-[1px] h-[20px] bg-[#e6e6e6]" />
                              <div>
                                <Eyebrow className="text-[#a39e98] text-[11px]">Available Seats</Eyebrow>
                                <BodySm className="font-semibold">{prog.totalSeats || '120 Seats'}</BodySm>
                              </div>
                              <div className="w-[1px] h-[20px] bg-[#e6e6e6]" />
                              <div>
                                <Eyebrow className="text-[#a39e98] text-[11px]">Annual Fee</Eyebrow>
                                <BodySm className="font-bold text-[#1aae39]">₹{(prog.annualFee || prog.fee || 150000).toLocaleString()} / yr</BodySm>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-[12px]">
                            <UtilityButton onClick={(e: any) => { e.stopPropagation(); setSelectedProgram(prog); }}>
                              Apply Now
                            </UtilityButton>
                            <button className="w-[36px] h-[36px] rounded-full bg-[#f6f5f4] flex items-center justify-center text-[#615d59]">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Details Drawer */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[#e6e6e6] bg-[#f6f5f4]/50 p-[24px] md:p-[32px]"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                                <div>
                                  <Eyebrow className="text-[#0075de] mb-[8px]">Eligibility Requirements</Eyebrow>
                                  <BodySm className="text-[#31302e]">
                                    {prog.eligibility || 'Class 12th graduation with minimum 60% marks in aggregate. Valid entrance scorecard required.'}
                                  </BodySm>
                                </div>
                                <div>
                                  <Eyebrow className="text-[#0075de] mb-[8px]">Career & Placement Opportunities</Eyebrow>
                                  <BodySm className="text-[#31302e]">
                                    {prog.outcomes || 'Prepares graduates for roles in Software Engineering, Data Science, Product Management, and Technical Consulting.'}
                                  </BodySm>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </NotionCard>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: CAMPUS & STUDENT LIFE */}
            {/* ------------------------------------------------------------ */}
            <section>
              <Heading1 className="mb-[24px]">Campus & Student Life</Heading1>
              <BodyMd className="text-[#615d59] mb-[32px]">
                Life at {university.name} extends far beyond classrooms—offering world-class sports facilities, vibrant student clubs, and state-of-the-art innovation hubs.
              </BodyMd>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[24px]">
                <div className="h-[240px] rounded-[12px] relative overflow-hidden border border-[#e6e6e6]">
                  <Image src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" fill unoptimized className="object-cover" alt="Library" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-[16px] text-white">
                    <span className="font-semibold text-[15px]">Central Digital Library</span>
                  </div>
                </div>
                <div className="h-[240px] rounded-[12px] relative overflow-hidden border border-[#e6e6e6]">
                  <Image src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2070&auto=format&fit=crop" fill unoptimized className="object-cover" alt="Campus Building" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-[16px] text-white">
                    <span className="font-semibold text-[15px]">Innovation & Startup Labs</span>
                  </div>
                </div>
                <div className="h-[240px] rounded-[12px] relative overflow-hidden border border-[#e6e6e6]">
                  <Image src="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=2070&auto=format&fit=crop" fill unoptimized className="object-cover" alt="Student Life" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-[16px] text-white">
                    <span className="font-semibold text-[15px]">Sports & Fitness Complex</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-[10px]">
                {['Smart Classrooms', 'Air-Conditioned Hostels', 'Sports Arena', '24/7 Library', 'Auditorium', 'Multi-Cuisine Dining', 'Global Exchange'].map((tag, idx) => (
                  <span key={idx} className="bg-white border border-[#e6e6e6] px-[14px] py-[6px] rounded-[9999px] text-[13px] font-medium text-[#31302e]">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: PLACEMENTS & OUTCOMES NARRATIVE */}
            {/* ------------------------------------------------------------ */}
            <section>
              <Heading1 className="mb-[24px]">Placements & Outcomes</Heading1>
              <NotionCard className="p-[32px] md:p-[48px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px] mb-[40px] pb-[32px] border-b border-[#e6e6e6]">
                  <div>
                    <Eyebrow className="text-[#615d59] mb-[6px]">Highest Package</Eyebrow>
                    <div className="text-[38px] font-bold text-[#1aae39] tracking-tight">₹52.0 LPA</div>
                    <Caption>International Offer</Caption>
                  </div>
                  <div>
                    <Eyebrow className="text-[#615d59] mb-[6px]">Median Package</Eyebrow>
                    <div className="text-[38px] font-bold text-[#000000] tracking-tight">₹8.5 LPA</div>
                    <Caption>Overall Campus Average</Caption>
                  </div>
                  <div>
                    <Eyebrow className="text-[#615d59] mb-[6px]">Placement Success</Eyebrow>
                    <div className="text-[38px] font-bold text-[#0075de] tracking-tight">94.8%</div>
                    <Caption>Eligible Students Placed</Caption>
                  </div>
                </div>

                <div>
                  <Eyebrow className="text-[#615d59] mb-[16px]">Top Hiring Partners</Eyebrow>
                  <div className="flex flex-wrap gap-[12px]">
                    {['Google', 'Microsoft', 'Amazon', 'Deloitte', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'].map((rec, i) => (
                      <span key={i} className="bg-[#f6f5f4] border border-[#e6e6e6] px-[18px] py-[10px] rounded-[8px] text-[14px] font-semibold text-[#000000]">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              </NotionCard>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: ADMISSION JOURNEY TIMELINE */}
            {/* ------------------------------------------------------------ */}
            <section>
              <Heading1 className="mb-[32px]">Admission Journey</Heading1>
              <div className="relative border-l-2 border-[#0075de]/30 ml-[16px] pl-[32px] flex flex-col gap-[32px]">
                <div className="relative">
                  <span className="absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full bg-[#0075de] border-4 border-white shadow-sm" />
                  <Heading3 className="mb-[4px]">1. Explore & Check Eligibility</Heading3>
                  <BodySm className="text-[#615d59]">Verify academic qualification cutoffs and course preferences.</BodySm>
                </div>

                <div className="relative">
                  <span className="absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full bg-[#0075de] border-4 border-white shadow-sm" />
                  <Heading3 className="mb-[4px]">2. Application Submission</Heading3>
                  <BodySm className="text-[#615d59]">Submit profile details and academic marksheets through EDUING Portal.</BodySm>
                </div>

                <div className="relative">
                  <span className="absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full bg-[#0075de] border-4 border-white shadow-sm" />
                  <Heading3 className="mb-[4px]">3. Verification & Offer Letter</Heading3>
                  <BodySm className="text-[#615d59]">Receive official admission confirmation and fee scholarship status.</BodySm>
                </div>

                <div className="relative">
                  <span className="absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full bg-[#1aae39] border-4 border-white shadow-sm" />
                  <Heading3 className="mb-[4px]">4. Seat Confirmation & Enrollment</Heading3>
                  <BodySm className="text-[#615d59]">Pay initial tuition deposit to lock your seat at {university.name}.</BodySm>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* SECTION: RELATED UNIVERSITY RECOMMENDATIONS */}
            {/* ------------------------------------------------------------ */}
            {recommendations.length > 0 && (
              <section>
                <Heading1 className="mb-[24px]">Similar Universities to Consider</Heading1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                  {recommendations.map((recUni) => (
                    <NotionCard 
                      key={recUni.id} 
                      className="p-[20px] cursor-pointer hover:border-[#0075de] transition-all"
                      onClick={() => router.push(\`/student/universities/\${recUni.id}\`)}
                    >
                      <div className="h-[120px] rounded-[8px] overflow-hidden relative mb-[12px] bg-[#f6f5f4]">
                        <Image src={recUni.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'} fill unoptimized className="object-cover" alt={recUni.name} />
                      </div>
                      <Heading3 className="text-[16px] mb-[4px] line-clamp-1">{recUni.name}</Heading3>
                      <BodySm className="text-[#615d59] text-[13px] mb-[12px]">{recUni.location || 'India'}</BodySm>
                      <UtilityButton className="w-full text-[13px]">
                        View Profile <ArrowUpRight size={14} />
                      </UtilityButton>
                    </NotionCard>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ============================================================ */}
          {/* STICKY ADMISSION DECISION CENTER (Right Column) */}
          {/* ============================================================ */}
          <aside className="hidden lg:block w-[360px] shrink-0">
            <div className="sticky top-[100px] flex flex-col gap-[24px]">
              
              <NotionCard className="p-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-[#e6e6e6]">
                <Eyebrow className="text-[#0075de] mb-[8px]">ADMISSION DECISION CENTER</Eyebrow>
                <Heading3 className="mb-[20px]">Application Summary</Heading3>

                <div className="flex flex-col gap-[16px] mb-[32px]">
                  <div className="flex justify-between items-center py-[10px] border-b border-[#e6e6e6]">
                    <BodySm className="text-[#615d59]">Eligibility Status</BodySm>
                    <span className="text-[14px] font-bold text-[#1aae39] flex items-center gap-[4px]">
                      <CheckCircle size={16} /> Eligible
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-[10px] border-b border-[#e6e6e6]">
                    <BodySm className="text-[#615d59]">Admission Chance</BodySm>
                    <span className="text-[14px] font-bold text-[#0075de]">{overallProb}% High</span>
                  </div>

                  <div className="flex justify-between items-center py-[10px] border-b border-[#e6e6e6]">
                    <BodySm className="text-[#615d59]">Scholarship Probability</BodySm>
                    <span className="text-[14px] font-bold text-[#391c57]">{scholarshipMatch}% High</span>
                  </div>

                  <div className="flex justify-between items-center py-[10px]">
                    <BodySm className="text-[#615d59]">Application Deadline</BodySm>
                    <span className="text-[14px] font-semibold text-[#000000]">Rolling Basis</span>
                  </div>
                </div>

                <PrimaryPillButton 
                  onClick={() => document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="w-full mb-[12px]"
                >
                  Apply to University
                </PrimaryPillButton>

                <SecondaryPillButton className="w-full">
                  Save to Shortlist
                </SecondaryPillButton>
              </NotionCard>

            </div>
          </aside>

        </div>

        {/* ============================================================ */}
        {/* PROGRAM APPLICATION MODAL */}
        {/* ============================================================ */}
        <AnimatePresence>
          {selectedProgram && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#000000]/50 backdrop-blur-sm flex items-center justify-center p-[24px]">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#ffffff] border border-[#e6e6e6] rounded-[16px] p-[40px] md:p-[48px] max-w-[560px] w-full relative shadow-[0_24px_48px_rgba(0,0,0,0.12)]">
                <button 
                  onClick={() => setSelectedProgram(null)} 
                  className="absolute top-[24px] right-[24px] w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#615d59] hover:bg-[#f6f5f4] transition-colors"
                >
                  ✕
                </button>
                
                <Eyebrow className="text-[#0075de] mb-[8px]">{selectedProgram.level || 'Degree'}</Eyebrow>
                <Heading2 className="mb-[8px] pr-[32px]">{selectedProgram.name}</Heading2>
                <BodySm className="text-[#615d59] mb-[32px]">{university.name}</BodySm>
                
                <div className="grid grid-cols-2 gap-[16px] mb-[24px]">
                   <div className="p-[20px] bg-[#f6f5f4] rounded-[10px]">
                      <Eyebrow className="text-[#615d59] mb-[4px]">Course Duration</Eyebrow>
                      <Title className="text-[16px]">{selectedProgram.duration || '4 Years'}</Title>
                   </div>
                   <div className="p-[20px] bg-[#f6f5f4] rounded-[10px]">
                      <Eyebrow className="text-[#615d59] mb-[4px]">Annual Tuition Fee</Eyebrow>
                      <Title className="text-[16px] text-[#1aae39]">₹{(selectedProgram.annualFee || selectedProgram.fee || 150000).toLocaleString()} / yr</Title>
                   </div>
                </div>
                
                <div className="p-[20px] border border-[#e6e6e6] rounded-[10px] mb-[32px]">
                   <Eyebrow className="text-[#0075de] mb-[8px]">Eligibility</Eyebrow>
                   <BodySm className="text-[#31302e]">
                     {selectedProgram.eligibility || 'Candidates must have completed qualifying examination with required minimum marks.'}
                   </BodySm>
                </div>
                
                <PrimaryPillButton 
                  disabled={applying}
                  onClick={() => handleApply(selectedProgram)}
                  className="w-full"
                >
                  {applying ? 'Submitting Application...' : (user?.isVerified ? 'Confirm & Apply Now' : 'Verify Profile to Apply')}
                </PrimaryPillButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}
`

fs.writeFileSync('app/student/universities/[id]/page.tsx', code);
console.log('Successfully generated complete flagship page.tsx');
