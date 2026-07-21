'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, RefreshCcw, Trash2, FileText, CheckCircle2, Clock, XCircle, AlertTriangle, Sparkles, Shield, Eye, ZoomIn, RotateCw, Share2 } from 'lucide-react'

type DocStatus = 'verified' | 'pending' | 'rejected' | 'missing'
interface Doc { id:string; name:string; category:string; status:DocStatus; date:string; size:string; aiScore:number; apps:number; required:boolean }

const STATUS: Record<DocStatus,{label:string;color:string;bg:string;icon:React.ReactNode}> = {
  verified: { label:'Verified',  color:'#059669', bg:'#F0FDF4', icon:<CheckCircle2 size={11}/> },
  pending:  { label:'Pending',   color:'#D97706', bg:'#FFFBEB', icon:<Clock size={11}/> },
  rejected: { label:'Rejected',  color:'#DC2626', bg:'#FEF2F2', icon:<XCircle size={11}/> },
  missing:  { label:'Missing',   color:'#6B7280', bg:'#F9FAFB', icon:<AlertTriangle size={11}/> },
}

const OCR_FIELDS: Record<string,string> = {
  'Student Name':'Aaryan Sharma','Roll Number':'1234567','Board':'CBSE','Marks':'92%','Passing Year':'2024','DOB':'01/01/2006','School':'Delhi Public School','Category':'General',
}

const AI_CHECKS = [
  { label:'Forgery Detection', value:'None Detected', ok:true },
  { label:'Image Quality',     value:'High',          ok:true },
  { label:'Blur Detection',    value:'None',          ok:true },
  { label:'OCR Accuracy',      value:'98%',           ok:true },
  { label:'Duplicate Check',   value:'Unique',        ok:true },
  { label:'Acceptance Prob.',  value:'Very High',     ok:true },
]

const LINKED_APPS = [
  { name:'BITS Pilani',      status:'verified' as DocStatus },
  { name:'IIT Bombay',       status:'verified' as DocStatus },
  { name:'Delhi University', status:'pending'  as DocStatus },
]

type Tab = 'preview'|'info'|'ai'|'ocr'

export default function DocPreviewPanel({ doc, onClose }: { doc: Doc; onClose: ()=>void }) {
  const [tab, setTab] = useState<Tab>('preview')
  const s = STATUS[doc.status]
  const scoreColor = doc.aiScore>=90?'#059669':doc.aiScore>=70?'#D97706':'#DC2626'
  const scoreLabel = doc.aiScore>=90?'Excellent':doc.aiScore>=70?'Needs Review':'Low Confidence'

  return (
    <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
      transition={{ type:'spring', damping:28, stiffness:220 }}
      className="fixed top-0 right-0 bottom-0 w-[400px] bg-white border-l border-[#EAECF0] z-50 flex flex-col shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#EAECF0] shrink-0">
        <div className="flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] rounded-[8px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <FileText size={15} className="text-[#4F6BFF]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111827] truncate max-w-[240px]">{doc.name}</p>
            <p className="text-[11px] text-[#9CA3AF]">{doc.size !== '—' ? doc.size : 'Not uploaded'} · {doc.category}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-[28px] h-[28px] rounded-[6px] border border-[#EAECF0] flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-[#EAECF0] px-[16px] shrink-0 bg-[#F9FAFB]">
        {(['preview','info','ai','ocr'] as Tab[]).map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-[14px] py-[10px] text-[12px] font-semibold capitalize transition-colors border-b-2 ${tab===t?'border-[#4F6BFF] text-[#4F6BFF]':'border-transparent text-[#6B7280] hover:text-[#374151]'}`}>
            {t==='ai'?'AI Analysis':t==='ocr'?'OCR Data':t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.15}}
            className="p-[16px] flex flex-col gap-[14px]">

            {tab==='preview' && <>
              {/* Preview area */}
              <div className="h-[200px] rounded-[12px] bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <FileText size={48} className="text-[#A5B4FC] mx-auto mb-[8px]" />
                  <p className="text-[12px] font-medium text-[#6366F1]">Document Preview</p>
                  {doc.status==='missing' && <p className="text-[11px] text-[#9CA3AF] mt-[4px]">Not yet uploaded</p>}
                </div>
                {/* Toolbar overlay */}
                <div className="absolute bottom-[10px] right-[10px] flex gap-[6px]">
                  {[ZoomIn, RotateCw, Eye].map((Icon,i)=>(
                    <button key={i} className="w-[28px] h-[28px] rounded-[6px] bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#374151] hover:bg-white shadow-sm transition-colors">
                      <Icon size={13}/>
                    </button>
                  ))}
                </div>
              </div>
              {/* Status */}
              <div className="flex items-center justify-between p-[12px] rounded-[10px] border border-[#EAECF0]">
                <span className="text-[12px] text-[#6B7280]">Status</span>
                <span className="flex items-center gap-[4px] px-[8px] h-[22px] rounded-full text-[11px] font-semibold" style={{color:s.color,background:s.bg}}>
                  {s.icon}{s.label}
                </span>
              </div>
              {/* Actions */}
              <div className="grid grid-cols-3 gap-[8px]">
                {[{I:Download,l:'Download'},{I:Share2,l:'Share'},{I:RefreshCcw,l:'Replace'}].map(({I,l})=>(
                  <button key={l} className="flex flex-col items-center gap-[4px] py-[10px] rounded-[10px] border border-[#EAECF0] text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                    <I size={15} className="text-[#6B7280]"/>{l}
                  </button>
                ))}
              </div>
              <button className="flex items-center justify-center gap-[6px] h-[36px] rounded-[8px] text-[12px] font-semibold text-[#DC2626] border border-[#FECACA] hover:bg-[#FEF2F2] transition-colors">
                <Trash2 size={13}/>Delete Document
              </button>
            </>}

            {tab==='info' && <>
              <Section title="Document Details">
                {[['Filename',doc.name],['Category',doc.category],['Upload Date',doc.date],['File Size',doc.size],['Required',doc.required?'Yes':'No']].map(([k,v])=>(
                  <Row key={k} label={k} value={v as string} />
                ))}
              </Section>
              <Section title="Verification">
                {[['Status',s.label],['Verified By','AI + Admin'],['Verification Date',doc.date]].map(([k,v])=>(
                  <Row key={k} label={k} value={v} />
                ))}
              </Section>
              {doc.apps > 0 && (
                <Section title={`Used In ${doc.apps} Applications`}>
                  {LINKED_APPS.slice(0, doc.apps).map(a=>(
                    <div key={a.name} className="flex items-center justify-between py-[6px] border-b border-[#F3F4F6] last:border-0">
                      <span className="text-[12px] text-[#374151]">{a.name}</span>
                      <span className="flex items-center gap-[4px] px-[7px] h-[20px] rounded-full text-[10px] font-semibold" style={{color:STATUS[a.status].color,background:STATUS[a.status].bg}}>
                        {STATUS[a.status].label}
                      </span>
                    </div>
                  ))}
                </Section>
              )}
            </>}

            {tab==='ai' && <>
              {/* AI Score hero */}
              <div className="rounded-[12px] p-[16px] text-center" style={{background:'linear-gradient(135deg,#0F172A,#1E1B4B)'}}>
                <div className="flex items-center justify-center gap-[6px] mb-[8px]">
                  <Sparkles size={14} className="text-[#818CF8]"/>
                  <span className="text-[11px] font-bold text-[#A5B4FC] uppercase tracking-[0.08em]">AI Confidence Score</span>
                </div>
                <div className="text-[40px] font-black leading-none mb-[4px]" style={{color:scoreColor}}>{doc.aiScore}%</div>
                <div className="text-[13px] font-semibold mb-[12px]" style={{color:scoreColor}}>{scoreLabel}</div>
                <div className="h-[4px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{background:scoreColor}}
                    initial={{width:0}} animate={{width:`${doc.aiScore}%`}} transition={{duration:1}} />
                </div>
              </div>
              {/* Checks */}
              <Section title="AI Verification Checks">
                {AI_CHECKS.map(c=>(
                  <div key={c.label} className="flex items-center justify-between py-[6px] border-b border-[#F3F4F6] last:border-0">
                    <div className="flex items-center gap-[6px]">
                      <Shield size={11} className={c.ok?'text-[#059669]':'text-[#DC2626]'}/>
                      <span className="text-[12px] text-[#374151]">{c.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold" style={{color:c.ok?'#059669':'#DC2626'}}>{c.value}</span>
                  </div>
                ))}
              </Section>
              <div className="p-[12px] rounded-[10px] bg-[#F0FDF4] border border-[#BBF7D0] text-[12px] text-[#166534] leading-relaxed">
                {doc.status==='verified'
                  ? `Document verified with ${doc.aiScore}% confidence. No inconsistencies detected. Accepted by ${doc.apps} applications.`
                  : doc.status==='pending' ? 'Under AI review. Initial scan shows good quality. Manual verification in progress.'
                  : doc.status==='rejected' ? 'Document quality insufficient. Please re-upload a clearer, higher resolution version.'
                  : 'Document not yet uploaded. Required for application submission.'}
              </div>
            </>}

            {tab==='ocr' && <>
              {doc.status==='verified' ? <>
                <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[10px] bg-[#EEF2FF] border border-[#C7D2FE]">
                  <Sparkles size={13} className="text-[#4F6BFF]"/>
                  <span className="text-[12px] font-semibold text-[#4F6BFF]">OCR Extraction Complete · 98% accuracy</span>
                </div>
                <Section title="Extracted Fields">
                  {Object.entries(OCR_FIELDS).map(([k,v])=>(
                    <div key={k} className="flex items-start justify-between py-[7px] border-b border-[#F3F4F6] last:border-0">
                      <span className="text-[11px] text-[#9CA3AF] w-[110px] shrink-0">{k}</span>
                      <span className="text-[12px] font-semibold text-[#111827] text-right">{v}</span>
                    </div>
                  ))}
                </Section>
              </> : (
                <div className="flex flex-col items-center justify-center py-[40px] gap-[10px]">
                  <FileText size={36} className="text-[#D1D5DB]"/>
                  <p className="text-[13px] font-medium text-[#374151]">OCR not available</p>
                  <p className="text-[12px] text-[#9CA3AF] text-center">Document must be verified before OCR extraction is shown.</p>
                </div>
              )}
            </>}

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F9FAFB] rounded-[12px] p-[14px]">
      <p className="text-[12px] font-semibold text-[#111827] mb-[10px]">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-[5px] border-b border-[#F3F4F6] last:border-0">
      <span className="text-[11px] text-[#9CA3AF]">{label}</span>
      <span className="text-[12px] font-semibold text-[#374151] text-right max-w-[200px] truncate">{value}</span>
    </div>
  )
}
