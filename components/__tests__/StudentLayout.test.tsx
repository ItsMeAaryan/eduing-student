import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import StudentLayout from '@/components/StudentLayout'

vi.mock('next/navigation', () => ({
  usePathname: () => '/student/dashboard',
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/auth', () => ({
  logoutUser: vi.fn(),
}))

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: any) => <img alt={props.alt ?? ''} {...props} />,
}))

vi.mock('@/lib/firebase/config', () => ({
  app: {},
  db: {},
  auth: {},
}))

vi.mock('@/components/providers/StudentDataProvider', () => ({
  StudentDataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useStudentData: () => ({ notifications: [] }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', role: 'student' },
    role: 'student',
    isLoggedIn: true,
    loading: false,
  }),
}))


describe('StudentLayout', () => {
  // Regression test for a Phase 0 bug: StudentLayout was a leftover copy of
  // the marketing Navbar and never rendered {children} at all, so every
  // page under /student/* rendered no page content.
  it('renders its children', () => {
    render(
      <StudentLayout>
        <div data-testid="page-content">Home content</div>
      </StudentLayout>
    )
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.getByText('Home content')).toBeInTheDocument()
  })

  it('renders the student sidebar alongside children', () => {
    render(
      <StudentLayout>
        <div>content</div>
      </StudentLayout>
    )
    // StudentSidebar renders nav items like "Dashboard"
    expect(screen.getAllByRole('link', { name: 'Dashboard' }).length).toBeGreaterThan(0)
  })
})
