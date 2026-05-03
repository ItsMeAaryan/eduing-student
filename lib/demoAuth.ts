import { DEMO_STUDENT, DEMO_UNIVERSITY, 
         DEMO_SUPER_ADMIN } from './demo'

export function demoLogin(email: string, 
                          password: string) {
  if (email === DEMO_STUDENT.email && 
      password === DEMO_STUDENT.password) {
    localStorage.setItem('eduing_user', 
      JSON.stringify(DEMO_STUDENT))
    return { success: true, user: DEMO_STUDENT }
  }
  if (email === DEMO_UNIVERSITY.email && 
      password === DEMO_UNIVERSITY.password) {
    localStorage.setItem('eduing_user', 
      JSON.stringify(DEMO_UNIVERSITY))
    return { success: true, user: DEMO_UNIVERSITY }
  }
  if (email === DEMO_SUPER_ADMIN.email && 
      password === DEMO_SUPER_ADMIN.password) {
    localStorage.setItem('eduing_user', 
      JSON.stringify(DEMO_SUPER_ADMIN))
    return { success: true, user: DEMO_SUPER_ADMIN }
  }
  return { success: false, error: 'Invalid credentials' }
}

export function demoLogout() {
  localStorage.removeItem('eduing_user')
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('eduing_user')
  return user ? JSON.parse(user) : null
}
