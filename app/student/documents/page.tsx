'use client'
import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Upload, FileText, CheckCircle2, Clock, XCircle, AlertTriangle, Sparkles, Eye, Download, Trash2, X, FolderOpen, Mic, MoreHorizontal, Shield, Zap, ChevronRight, Bot } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import AIHealthBanner from '@/components/documents/AIHealthBanner'
import DocPreviewPanel from '@/components/documents/DocPreviewPanel'
import { EmptyState } from '@/components/ui/EmptyState'

const TABS = ['All', 'Identity', 'Academic', 'Entrance Exams', 'Certificates', 'Portfolio']

type DocStatus = 'verified' | 'pending' | 'rejected' | 'missing'
interface Doc { id:string; name:string; category:string; status:DocStatus; date:string; size:string; aiScore:number; apps:number; required:boolean }

const DOCS: Doc[] = [
  { id:'d1', name:'10th_Marksheet.pdf',      category:'Academic',       status:'verified',  date:'20 May 2024', size:'2.4 MB', aiScore:98, apps:6, required:true  },
  { id:'d2', name:'12th_Marksheet.pdf',      category:'Academic',       status:'pending',   date:'19 May 2024', size:'2.1 MB', aiScore:87, apps:5, required:true  },
  { id:'d3', name:'Aadhaar_Card.jpg',        category:'Identity',       status:'verified',  date:'18 May 2024', size:'0.8 MB', aiScore:99, apps:8, required:true  },
  { id:'d4', name:'JEE_Main_Scorecard.pdf',  category:'Entrance Exams', status:'verified',  date:'17 May 2024', size:'1.2 MB', aiScore:95, apps:4, required:true  },
  { id:'d5', name:'Caste_Certificate.jpg',   category:'Certificates',   status:'pending',   date:'16 May 2024', size:'0.6 MB', aiScore:76, apps:3, required:false },
  { id:'d6', name:'Income_Certificate.pdf',  category:'Certificates',   status:'rejected',  date:'15 May 2024', size:'0.9 MB', aiScore:42, apps:2, required:false },
  { id:'d7', name:'Gap_Certificate.docx',    category:'Academic',       status:'verified',  date:'14 May 2024', size:'0.3 MB', aiScore:91, apps:2, required:false },
  { id:'d8', name:'Passport_Photo.jpg',      category:'Identity',       status:'missing',   date:'—',           size:'—',       aiScore:0,  apps:0, required:true  },
  { id:'d9', name:'PAN_Card.jpg',            category:'Identity',       status:'missing',   date:'—',           size:'—',       aiScore:0,  apps:0, required:false },
  { id:'d10',name:'Domicile_Certificate.pdf',category:'Certificates',   status:'verified',  date:'12 May 2024', size:'0.5 MB', aiScore:93, apps:1, required:false },
]

const FOLDERS = [
  { name:'Academic',       count:4, verified:3, icon:'📚', color:'#4F6BFF' },
  { name:'Identity',       count:3, verified:2, icon:'🪪', color:'#10B981' },
  { name:'Entrance Exams', count:2, verified:2, icon:'📝', color:'#F59E0B' },
  { name:'Certificates',   count:3, verified:1, icon:'🏆', color:'#8B5CF6' },
  { name:'Portfolio',      count:0, verified:0, icon:'🎨', color:'#EC4899' },
]

const TIMELINE = [
  { time:'Today',      text:'Aadhaar Card verified by AI',         ok:true  },
  { time:'Yesterday',  text:'10th Marksheet OCR completed',        ok:true  },
  { time:'2 days ago', text:'AI detected blur in 12th Marksheet',  ok:false },
  { time:'3 days ago', text:'Duplicate PAN Card removed',          ok:false },
]

const AI_ACTIONS = ['Find missing documents','Scan new document','Auto-rename files','Explain rejection','Compress documents']

const STATUS_MAP: Record<DocStatus,{label:string;color:string;bg:string;icon:React.ReactNode}> = {
  verified: { label:'Verified', color:'#059669', bg:'#F0FDF4', icon:<CheckCircle2 size={11}/> },
  pending:  { label:'Pending',  color:'#D97706', bg:'#FFFBEB', icon:<Clock size={11}/> },
  rejected: { label:'Rejected', color:'#DC2626', bg:'#FEF2F2', icon:<XCircle size={11}/> },
  missing:  { label:'Missing',  color:'#6B7280', bg:'#F9FAFB', icon:<AlertTriangle size={11}/> },
}

function Badge({ status }: { status: DocStatus }) {
  const s = STATUS_MAP[status]
  if (status === 'missing') return (
    <button className="flex items-center gap-[4px] px-[8px] h-[22px] rounded-full text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors">
      <AlertTriangle size={10}/>Required · Upload Now
    </button>
  )
  return (
    <span className="flex items-center gap-[4px] px-[8px] h-[22px] rounded-full text-[11px] font-semibold" style={{color:s.color,background:s.bg}}>
      {s.icon}{s.label}
    </span>
  )
}

function AIScoreCell({ score }: { score: number }) {
  if (!score) return <span className="text-[11px] text-[#D1D5DB]">—</span>
  const color = score>=90?'#059669':score>=70?'#D97706':'#DC2626'
  const label = score>=90?'Excellent':score>=70?'Needs Review':'Low Confidence'
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="flex items-center gap-[5px]">
        <div className="w-[36px] h-[3px] bg-[#F3F4F6] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{width:`${score}%`,background:color}} />
        </div>
        <span className="text-[11px] font-bold" style={{color}}>{score}%</span>
      </div>
      <span className="text-[9px]" style={{color}}>{label}</span>
    </div>
  )
}

function StatChip({ icon, label, color, bg }: { icon:React.ReactNode; label:string; color:string; bg:string }) {
  return (
    <span className="flex items-center gap-[4px] px-[8px] h-[22px] rounded-full text-[11px] font-semibold" style={{color,background:bg}}>
      {icon}{label}
    </span>
  )
}

export default function DocumentsPage() {
  const [activeTab, setActiveTab]   = useState('All')
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<Doc|null>(null)
  const [showBot, setShowBot]       = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)

  const filtered = DOCS.filter(d => {
    const t = activeTab==='All'||d.category===activeTab
    const s = !search||d.name.toLowerCase().includes(search.toLowerCase())
    return t && s
  })

  const verified = DOCS.filter(d=>d.status==='verified').length
  const pending  = DOCS.filter(d=>d.status==='pending').length
  const rejected = DOCS.filter(d=>d.status==='rejected').length
  const missing  = DOCS.filter(d=>d.status==='missing').length

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-[12px]">
          {[
            {l:'Total Documents',value:DOCS.length, sub:'All uploaded',  color:'#4F6BFF', Icon:FileText},
            {l:'Verified',       value:verified,     sub:'Ready to use',  color:'#059669', Icon:CheckCircle2},
            {l:'Pending Review', value:pending,      sub:'Awaiting AI',   color:'#D97706', Icon:Clock},
            {l:'Rejected',       value:rejected,     sub:'Needs action',  color:'#DC2626', Icon:XCircle},
            {l:'Missing',        value:missing,      sub:'Upload needed', color:'#6B7280', Icon:AlertTriangle},
          ].map(({l,value,sub,color,Icon})=>(
            <motion.div key={l} whileHover={{y:-2}} className="bg-white border border-[#EAECF0] rounded-[14px] p-[18px] flex items-start gap-[12px]" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
              <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0" style={{background:color+'18'}}>
                <Icon size={17} style={{color}} />
              </div>
              <div>
                <div className="text-[10px] text-[#9CA3AF] mb-[1px]">{l}</div>
                <div className="text-[24px] font-black leading-none mb-[1px]" style={{color}}>{value}</div>
                <div className="text-[10px] text-[#9CA3AF]">{sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Health Banner */}
        <AIHealthBanner verified={verified} pending={pending} missing={missing} total={DOCS.length} />

        {/* Upload Zone */}
        <button type="button" onDragOver={e=>{e.preventDefault()}} onDrop={onDrop}
          onClick={()=>uploadRef.current?.click()}
          className="w-full border-2 border-dashed border-[#EAECF0] rounded-[14px] p-[24px] flex flex-col items-center gap-[12px] cursor-pointer hover:border-[#4F6BFF] hover:bg-[#EEF2FF]/30 transition-all group text-left">
          <input ref={uploadRef} type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" />
          <motion.div className="w-[52px] h-[52px] rounded-[14px] bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#4F6BFF] transition-colors"
            whileHover={{ scale:1.05 }}>
            <Upload size={24} className="text-[#4F6BFF] group-hover:text-white transition-colors" />
          </motion.div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-[#111827]">Drag & drop or <span className="text-[#4F6BFF]">browse files</span></p>
            <p className="text-[12px] text-[#9CA3AF] mt-[2px]">PDF, PNG, JPG, DOCX · Max 25 MB</p>
          </div>
          <div className="flex flex-wrap justify-center gap-[6px]">
            {['OCR Extraction','AI Verification','Duplicate Detection','Auto Categorization','Blur Detection'].map(f=>(
              <span key={f} className="flex items-center gap-[4px] px-[8px] h-[22px] rounded-full text-[10px] font-semibold text-[#059669] bg-[#F0FDF4]">
                <CheckCircle2 size={9}/>{f}
              </span>
            ))}
          </div>
        </button>

        {/* Folders */}
        <div>
          <div className="flex items-center justify-between mb-[12px]">
            <p className="text-[15px] font-semibold text-[#111827]">Folders</p>
            <button className="text-[12px] font-medium text-[#4F6BFF] flex items-center gap-[3px] hover:underline">View all<ChevronRight size={12}/></button>
          </div>
          <div className="flex gap-[12px] overflow-x-auto pb-[4px]" style={{scrollbarWidth:'none'}}>
            {FOLDERS.map(f=>{
              const pct = f.count ? Math.round(f.verified/f.count*100) : 0
              return (
                <motion.div key={f.name} whileHover={{y:-3,scale:1.02}}
                  className="bg-white border border-[#EAECF0] rounded-[14px] p-[16px] flex flex-col gap-[10px] cursor-pointer shrink-0 w-[168px]"
                  style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center text-[24px]" style={{background:f.color+'18'}}>{f.icon}</div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#111827] leading-snug">{f.name} Documents</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-[2px]">{f.count} files · {f.verified} verified</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-[4px]">
                      <span className="text-[10px] text-[#9CA3AF]">Verified</span>
                      <span className="text-[10px] font-bold" style={{color:f.color}}>{pct}%</span>
                    </div>
                    <div className="h-[4px] bg-[#F3F4F6] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{background:f.color}}
                        initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8}} />
                    </div>
                  </div>
                  <button className="flex items-center gap-[4px] text-[10px] font-semibold mt-[2px]" style={{color:f.color}}>
                    Open Folder<ChevronRight size={10}/>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Search + Tabs */}
        <div className="flex items-center gap-[12px] flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[380px]">
            <Search size={14} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search documents, certificates or ask AI..."
              className="w-full h-[36px] pl-[34px] pr-[34px] bg-white border border-[#EAECF0] rounded-[8px] text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] transition-colors" />
            <button className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"><Mic size={13}/></button>
          </div>
          <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Document Vault Table */}
        <div className="bg-white border border-[#EAECF0] rounded-[14px] overflow-hidden" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          {/* Table header */}
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#EAECF0]">
            <div className="flex items-center gap-[10px] flex-wrap">
              <div className="flex items-center gap-[8px]">
                <FolderOpen size={16} className="text-[#4F6BFF]" />
                <span className="text-[14px] font-semibold text-[#111827]">Document Vault</span>
                <span className="text-[11px] text-[#9CA3AF] px-[7px] py-[1px] rounded-full bg-[#F3F4F6] font-medium">{filtered.length} files</span>
              </div>
              <StatChip icon={<CheckCircle2 size={10}/>} label={`${verified} Verified`} color="#059669" bg="#F0FDF4" />
              <StatChip icon={<Clock size={10}/>}         label={`${pending} Pending`}   color="#D97706" bg="#FFFBEB" />
              {rejected>0 && <StatChip icon={<XCircle size={10}/>} label={`${rejected} Rejected`} color="#DC2626" bg="#FEF2F2" />}
              {missing>0  && <StatChip icon={<AlertTriangle size={10}/>} label={`${missing} Missing`} color="#6B7280" bg="#F9FAFB" />}
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="flex items-center gap-[4px] px-[10px] h-[26px] rounded-[6px] bg-[#EEF2FF] text-[#4F6BFF] text-[10px] font-bold">
                <Shield size={10}/>AI Protected
              </div>
              <div className="flex items-center gap-[4px] px-[10px] h-[26px] rounded-[6px] bg-[#F0FDF4] text-[#059669] text-[10px] font-bold">
                <Zap size={10}/>{verified} Verified
              </div>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                {['Document','Category','Status','Uploaded','AI Score','Apps','Actions'].map(h=>(
                  <th key={h} className="px-[16px] py-[10px] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.06em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-[32px]">
                    <EmptyState
                      icon={FolderOpen}
                      title={search ? `No documents matching "${search}"` : "No documents uploaded"}
                      description={search ? "Try searching for a different file name or clear filter tabs." : "Upload your marksheets, certificates, and identity proofs to power AI verification."}
                      primaryCtaLabel="Upload Document"
                      onPrimaryClick={() => uploadRef.current?.click()}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(doc=>(
                <tr key={doc.id} onClick={()=>setSelected(doc)}
                  className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                  <td className="px-[16px] py-[12px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[30px] h-[30px] rounded-[7px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-[#4F6BFF]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#111827] truncate max-w-[150px]">{doc.name}</span>
                      {doc.required && <span className="text-[9px] font-black text-[#DC2626] bg-[#FEF2F2] px-[5px] py-[1px] rounded-full shrink-0 border border-[#FECACA]">REQ</span>}
                    </div>
                  </td>
                  <td className="px-[16px] py-[12px]"><span className="text-[12px] text-[#6B7280]">{doc.category}</span></td>
                  <td className="px-[16px] py-[12px]"><Badge status={doc.status} /></td>
                  <td className="px-[16px] py-[12px]"><span className="text-[12px] text-[#6B7280]">{doc.date}</span></td>
                  <td className="px-[16px] py-[12px]"><AIScoreCell score={doc.aiScore} /></td>
                  <td className="px-[16px] py-[12px]">
                    {doc.apps>0 ? <span className="text-[12px] font-semibold text-[#374151]">{doc.apps} apps</span> : <span className="text-[11px] text-[#D1D5DB]">—</span>}
                  </td>
                  <td className="px-[16px] py-[12px]">
                    <div className="flex items-center gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[#9CA3AF] hover:text-[#4F6BFF] transition-colors" onClick={e=>{e.stopPropagation();setSelected(doc)}}><Eye size={14}/></button>
                      <button className="text-[#9CA3AF] hover:text-[#374151] transition-colors"><Download size={14}/></button>
                      <button className="text-[#9CA3AF] hover:text-[#374151] transition-colors"><MoreHorizontal size={14}/></button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* AI Activity Timeline */}
        <div className="bg-white border border-[#EAECF0] rounded-[14px] p-[20px]" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <div className="flex items-center gap-[8px] mb-[14px]">
            <Sparkles size={15} className="text-[#4F6BFF]"/>
            <p className="text-[14px] font-semibold text-[#111827]">AI Activity</p>
          </div>
          <div className="flex flex-col gap-[10px]">
            {TIMELINE.map((t,i)=>(
              <div key={i} className="flex items-start gap-[10px]">
                <div className={`w-[7px] h-[7px] rounded-full mt-[4px] shrink-0 ${t.ok?'bg-[#059669]':'bg-[#F59E0B]'}`}/>
                <div>
                  <p className="text-[12px] font-medium text-[#374151]">{t.text}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{t.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Drawer */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="fixed inset-0 bg-black/20 z-40" onClick={()=>setSelected(null)} />
              <DocPreviewPanel doc={selected as any} onClose={()=>setSelected(null)} />
            </>
          )}
        </AnimatePresence>

        {/* Floating AI Bot */}
        <div className="fixed bottom-[24px] right-[24px] z-30 flex flex-col items-end gap-[10px]">
          <AnimatePresence>
            {showBot && (
              <motion.div initial={{opacity:0,scale:0.9,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9,y:10}}
                className="bg-white border border-[#EAECF0] rounded-[14px] p-[14px] w-[220px] shadow-xl">
                <p className="text-[11px] font-bold text-[#111827] mb-[10px] flex items-center gap-[5px]">
                  <Sparkles size={12} className="text-[#4F6BFF]"/>Need help with documents?
                </p>
                <div className="flex flex-col gap-[6px]">
                  {AI_ACTIONS.map(a=>(
                    <button key={a} className="text-left text-[11px] font-medium text-[#374151] px-[10px] py-[6px] rounded-[8px] bg-[#F9FAFB] hover:bg-[#EEF2FF] hover:text-[#4F6BFF] transition-colors">{a}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
            onClick={()=>setShowBot(v=>!v)}
            className="w-[48px] h-[48px] rounded-full flex items-center justify-center shadow-lg text-white transition-colors"
            style={{background:'linear-gradient(135deg,#4F6BFF,#6366F1)'}}>
            {showBot ? <X size={20}/> : <Bot size={20}/>}
          </motion.button>
        </div>

      </div>
    </ProtectedRoute>
  )
}
