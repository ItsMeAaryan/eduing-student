// Turns Firebase Auth error codes into messages a student can act on.
export function authErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const code = (err as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Email or password is incorrect.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead.'
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support@eduing.in.'
    case 'auth/network-request-failed':
      return 'No internet connection. Check your network and try again.'
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
      return 'EDUING is misconfigured right now (Firebase key). Please try again later.'
    default:
      return fallback
  }
}
