'use client'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2, Clock, AlertTriangle, Upload, ChevronRight } from 'lucide-react'

interface Props { verified: number; pending: number; missing: number; total: number }

export default function AIHealthBanner({ verified, pending, missing, total }: Props) {
  const health = total ? Math.round((verified / total) * 100) : 0
  const ready = total ? Math.round(((total - missing) / total) * 100) : 0
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[16px] p-[1px]"
      style={{ background: 'linear-gradient(135deg, #6366F1, #4F6BFF, #10B981)' }}>
      <div className="relative rounded-[15px] overflow-hidden px-[28px] py-[22px] flex items-center justify-between gap-[24px]"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a1740 50%, #0f2318 100%)' }}>
        {/* Animated blobs */}
        {[['#6366F1','15%','-20%',120],['#10B981','70%','-10%',90],['#F59E0B','40%','60%',70]].map(([c,l,t,s],i)=>(
          <motion.div key={i} className="absolute rounded-full opacity-[0.08] pointer-events-none"
            style={{ background:c as string, left:l as string, top:t as string, width:s as number, height:s as number }}
            animate={{ scale:[1,1.15,1], rotate:[0,15,0] }} transition={{ duration:4+i, repeat:Infinity, delay:i*1.2 }} />
        ))}

        {/* Left: icon + title */}
        <div className="relative flex items-center gap-[16px]">
          <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:3, repeat:Infinity }}
            className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center shrink-0"
            style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
            <Sparkles size={22} className="text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-[8px] mb-[3px]">
              <span className="text-[11px] font-bold text-[#A5B4FC] uppercase tracking-[0.1em]">EDUING AI · Document Health</span>
              <motion.span className="w-[6px] h-[6px] rounded-full bg-[#34D399]"
                animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }} />
            </div>
            <p className="text-[13px] text-white/70 max-w-[360px] leading-snug">
              Your profile is <span className="text-white font-semibold">{ready}% document-ready.</span>
              {missing > 0 && <> Uploading <span className="text-[#FCD34D] font-semibold">{missing} missing document{missing>1?'s':''}</span> will unlock more applications.</>}
            </p>
          </div>
        </div>

        {/* Centre: score + stats */}
        <div className="relative flex items-center gap-[24px] shrink-0">
          {/* Circular health score */}
          <div className="relative w-[64px] h-[64px]">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <motion.circle cx="32" cy="32" r="26" fill="none" stroke="#34D399" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={163.4}
                initial={{ strokeDashoffset: 163.4 }}
                animate={{ strokeDashoffset: 163.4 - (163.4 * health / 100) }}
                transition={{ duration: 1.2, delay: 0.3 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-black text-white leading-none">{health}%</span>
              <span className="text-[8px] text-white/50">Health</span>
            </div>
          </div>
          {/* Stats */}
          <div className="flex flex-col gap-[5px]">
            {[{ icon:<CheckCircle2 size={12}/>, label:`${verified} Verified`, color:'#34D399' },
              { icon:<Clock size={12}/>, label:`${pending} Pending`, color:'#FBBF24' },
              { icon:<AlertTriangle size={12}/>, label:`${missing} Missing`, color:'#F87171' }].map(s=>(
              <div key={s.label} className="flex items-center gap-[6px]">
                <span style={{ color:s.color }}>{s.icon}</span>
                <span className="text-[12px] font-medium" style={{ color:s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTA */}
        <div className="relative flex flex-col gap-[8px] shrink-0">
          {missing > 0 && (
            <button className="flex items-center gap-[6px] px-[16px] h-[36px] rounded-[10px] text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background:'linear-gradient(135deg,#6366F1,#4F6BFF)' }}>
              <AlertTriangle size={13}/>Review Missing
            </button>
          )}
          <button className="flex items-center gap-[6px] px-[16px] h-[36px] rounded-[10px] text-[13px] font-semibold text-[#111827] bg-white hover:bg-[#F9FAFB] transition-colors">
            <Upload size={13}/>Upload Now<ChevronRight size={12}/>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
