// lib/firebase/notifications.ts
import {
  collection, query, where,
  onSnapshot, orderBy, updateDoc, doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './config'
import { Notification } from '@/types/firebase'

export function listenNotifications(
  userId: string,
  callback: (notifs: Notification[]) => void,
  errorCallback?: (error: unknown) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(
    q,
    (snap) => {
      const notifs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Notification[]
      callback(notifs)
    },
    (err) => {
      if (process.env.NODE_ENV === 'development') console.error('[listenNotifications]', err)
      errorCallback?.(err)
    }
  )
}

export async function markNotificationAsRead(notificationId: string) {
  await updateDoc(
    doc(db, 'notifications', notificationId),
    {
      isRead: true,
      updatedAt: serverTimestamp()
    }
  )
}