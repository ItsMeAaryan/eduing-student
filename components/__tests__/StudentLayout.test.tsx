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

describe('StudentLayout', () => {
  // Regression test for a Phase 0 bug: StudentLayout was a leftover copy of
  // the marketing Navbar and never rendered {children} at all, so every
  // page under /student/* rendered no page content.
  it('renders its children', () => {
    render(
      <StudentLayout>
        <div data-testid="page-content">Dashboard content</div>
      </StudentLayout>
    )
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })

  it('renders the student sidebar alongside children', () => {
    render(
      <StudentLayout>
        <div>content</div>
      </StudentLayout>
    )
    // StudentSidebar renders nav items like "Dashboard"
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0)
  })
})
