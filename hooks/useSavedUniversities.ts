// hooks/useSavedUniversities.ts
// One place to save / unsave a university. Bookmarks live on the student's
// profile as users/{uid}.savedPrograms = [{ universityId, name, scholarshipAvailable }]
// and show up on the Saved page.
'use client'
import { useCallback, useMemo, useState } from 'react'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useToast } from '@/hooks/useToast'

export function useSavedUniversities() {
  const { savedPrograms } = useStudentData()
  const { toast } = useToast()
  const [pending, setPending] = useState<Set<string>>(new Set())

  const entries = useMemo(() => (Array.isArray(savedPrograms) ? savedPrograms : []) as Record<string, any>[], [savedPrograms])
  const savedIds = useMemo(() => new Set(entries.map(e => e?.universityId || e?.id).filter(Boolean) as string[]), [entries])

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds])

  const toggleSave = useCallback(async (uni: { id: string; name?: string; scholarships?: unknown }) => {
    const uid = auth.currentUser?.uid
    if (!uid) { toast.error('Sign in again to save universities.'); return }
    if (pending.has(uni.id)) return
    setPending(p => new Set(p).add(uni.id))
    const wasSaved = savedIds.has(uni.id)
    try {
      if (wasSaved) {
        // remove every bookmark for this university (older entries may differ slightly)
        const matches = entries.filter(e => e?.universityId === uni.id || e?.id === uni.id)
        await updateDoc(doc(db, 'users', uid), { savedPrograms: arrayRemove(...matches) })
        toast.success(`Removed ${uni.name || 'university'} from Saved.`)
      } else {
        const entry = {
          universityId: uni.id,
          name: uni.name || 'University',
          scholarshipAvailable: Array.isArray(uni.scholarships) ? uni.scholarships.length > 0 : !!uni.scholarships,
          savedAt: new Date().toISOString(),
        }
        await updateDoc(doc(db, 'users', uid), { savedPrograms: arrayUnion(entry) })
        toast.success(`Saved ${uni.name || 'university'}. Find it under Saved.`)
      }
    } catch {
      toast.error('Couldn’t update Saved. Check your connection and try again.')
    } finally {
      setPending(p => { const n = new Set(p); n.delete(uni.id); return n })
    }
  }, [entries, pending, savedIds, toast])

  return { isSaved, toggleSave, isPending: (id: string) => pending.has(id), count: savedIds.size }
}
