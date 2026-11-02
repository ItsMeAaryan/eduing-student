// Firebase ID token for /api/ai — the route only answers signed-in users.
import { auth } from '@/lib/firebase/config'

export async function aiAuthHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken().catch(() => '')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
