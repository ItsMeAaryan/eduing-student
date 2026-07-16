import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './config';

export function listenScholarships(onUpdate: (data: any[]) => void, onError: (err: Error) => void) {
  const q = query(collection(db, 'scholarships'));
  return onSnapshot(q, (snap) => {
    const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(results);
  }, onError);
}
