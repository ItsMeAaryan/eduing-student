'use client'

// Printable view of a document a university issued (offer letter, admit card,
// enrollment certificate). Nothing is stored as a file: the letter is rendered
// from the data the university saved, and "Download PDF" uses the browser's
// Save as PDF.
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { auth, db } from '@/lib/firebase/config'
import { OfferLetterTemplate } from '@/components/letters/OfferLetterTemplate'
import { AdmitCardTemplate } from '@/components/letters/AdmitCardTemplate'
import { EnrollmentCertificateTemplate } from '@/components/letters/EnrollmentCertificateTemplate'

type Issued = { type: string; data?: Record<string, string>; url?: string; version?: number }

function Letter({ type, d }: { type: string; d: Record<string, string> }) {
  if (type === 'offer_letter') {
    return <OfferLetterTemplate universityName={d.universityName} studentName={d.studentName} applicationId={d.applicationId} programName={d.programName}
      department={d.department} academicYear={d.academicYear} feeSummary={d.feeSummary} date={d.date} lastAcceptanceDate={d.lastAcceptanceDate} />
  }
  if (type === 'admit_card') {
    return <AdmitCardTemplate universityName={d.universityName} studentName={d.studentName} applicationId={d.applicationId} rollNumber={d.rollNumber}
      programName={d.programName} examName={d.examName} examDate={d.examDate} examTime={d.examTime} reportingTime={d.reportingTime} venue={d.venue} instructions={d.instructions} />
  }
  return <EnrollmentCertificateTemplate universityName={d.universityName} studentName={d.studentName} programName={d.programName}
    enrollmentNumber={d.enrollmentNumber} academicSession={d.academicSession} department={d.department} date={d.date} />
}

export default function IssuedLetterPage() {
  const { appId, docId } = useParams() as { appId: string; docId: string }
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [issued, setIssued] = useState<Issued | null>(null)

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = `/auth/login?next=/letter/${appId}/${docId}`; return }
    try {
      const snap = await getDoc(doc(db, `applications/${appId}/generated_documents/${docId}`))
      if (!snap.exists()) { setState('missing'); return }
      const data = snap.data() as Issued
      if (!data.data && data.url) { window.location.replace(data.url); return } // issued before letters moved to data
      setIssued(data)
      setState(data.data ? 'ready' : 'missing')
    } catch {
      setState('missing')
    }
  }), [appId, docId])

  return (
    <div className="min-h-screen bg-[#e9e7e2] print:bg-white">
      <style>{`@page { size: A4; margin: 0 } @media print { .no-print { display: none !important } body { background: #fff } }`}</style>
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-[12px] border-b border-black/10 bg-white/90 px-[16px] py-[12px] backdrop-blur">
        <Link href={`/student/applications/${appId}`} className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#17142B]">
          <ArrowLeft size={16} /> Back to application
        </Link>
        {state === 'ready' && (
          <button onClick={() => window.print()} className="inline-flex h-[40px] items-center gap-[8px] rounded-full bg-[#4B2FC9] px-[18px] text-[13px] font-semibold text-white">
            <Download size={15} /> Download PDF
          </button>
        )}
      </div>

      {state === 'loading' && <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#4B2FC9]" size={30} /></div>}
      {state === 'missing' && (
        <div className="mx-auto max-w-[420px] px-[16px] py-[80px] text-center text-[#17142B]">
          <h1 className="text-[20px] font-bold">This document isn&apos;t available</h1>
          <p className="mt-[8px] text-[14px] text-black/60">It may have been replaced by a newer version, or it belongs to another account.</p>
        </div>
      )}
      {state === 'ready' && issued?.data && (
        <div className="overflow-x-auto py-[24px] print:p-0">
          <div className="mx-auto w-[210mm] bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] print:shadow-none">
            <Letter type={issued.type} d={issued.data} />
          </div>
        </div>
      )}
    </div>
  )
}
