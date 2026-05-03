import {
  DEMO_STUDENT,
  DEMO_UNIVERSITIES,
  DEMO_SUPER_ADMIN,
} from './demo'

export function demoLogin(
  email: string,
  password: string
) {

  // Student Login
  if (
    email === DEMO_STUDENT.email &&
    password === DEMO_STUDENT.password
  ) {
    localStorage.setItem(
      'eduing_user',
      JSON.stringify(DEMO_STUDENT)
    )

    return {
      success: true,
      user: DEMO_STUDENT,
    }
  }

  // University Login
  const matchedUniversity = DEMO_UNIVERSITIES.find(
    (university: any) =>
      email === university.email &&
      password === university.password
  )

  if (matchedUniversity) {
    localStorage.setItem(
      'eduing_user',
      JSON.stringify(matchedUniversity)
    )

    return {
      success: true,
      user: matchedUniversity,
    }
  }

  // Super Admin Login
  if (
    email === DEMO_SUPER_ADMIN.email &&
    password === DEMO_SUPER_ADMIN.password
  ) {
    localStorage.setItem(
      'eduing_user',
      JSON.stringify(DEMO_SUPER_ADMIN)
    )

    return {
      success: true,
      user: DEMO_SUPER_ADMIN,
    }
  }

  return {
    success: false,
    error: 'Invalid credentials',
  }
}

export function demoLogout() {
  localStorage.removeItem('eduing_user')
}

export function getCurrentUser() {
  if (typeof window === 'undefined') {
    return null
  }

  const user = localStorage.getItem('eduing_user')

  return user ? JSON.parse(user) : null
}
