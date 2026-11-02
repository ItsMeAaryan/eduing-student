import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import { ref, uploadBytes } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { it, beforeAll, afterAll } from 'vitest'
let env
beforeAll(async () => {
  const f = await initializeTestEnvironment({ projectId: 'demo-eduing', firestore: { rules: readFileSync('../firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 } })
  await f.withSecurityRulesDisabled(async c => { const d = c.firestore(); await setDoc(doc(d, 'users', 'uniA'), { role: 'uni_admin' }); await setDoc(doc(d, 'users', 's1'), { role: 'student' }) })
  env = await initializeTestEnvironment({ projectId: 'demo-eduing', storage: { rules: readFileSync('../storage.rules', 'utf8'), host: '127.0.0.1', port: 9195 } })
})
afterAll(() => env.cleanup())
const pdf = new Uint8Array([1, 2, 3])
const st = u => env.authenticatedContext(u).storage()
it('student uploads receipt', () => assertSucceeds(uploadBytes(ref(st('s1'), 'users/s1/payments/a_1.pdf'), pdf, { contentType: 'application/pdf' })))
it('student cannot upload exe receipt', () => assertFails(uploadBytes(ref(st('s1'), 'users/s1/payments/a_1.exe'), pdf, { contentType: 'application/x-msdownload' })))
it('student uploads doc', () => assertSucceeds(uploadBytes(ref(st('s1'), 'users/s1/documents/12th_marksheet'), pdf, { contentType: 'image/jpeg' })))
it('other cannot upload to s1', () => assertFails(uploadBytes(ref(st('s2'), 'users/s1/documents/x'), pdf, { contentType: 'image/jpeg' })))
it('uni uploads offer letter', () => assertSucceeds(uploadBytes(ref(st('uniA'), 'universities/uniA/applications/a/offer_letter_v1.pdf'), pdf, { contentType: 'application/pdf' })))
it('student cannot forge offer letter', () => assertFails(uploadBytes(ref(st('s1'), 'universities/uniA/applications/a/offer.pdf'), pdf, { contentType: 'application/pdf' })))
