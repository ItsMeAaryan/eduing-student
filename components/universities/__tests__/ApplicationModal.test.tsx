import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ApplicationModal from '@/components/universities/ApplicationModal'

const addDocMock = vi.fn().mockResolvedValue({ id: 'app123' })

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ __collection: name })),
  addDoc: (...args: any[]) => addDocMock(...args),
  serverTimestamp: () => 'MOCK_TIMESTAMP',
}))

vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: { uid: 'student-abc' } },
  db: {},
}))

const program = {
  id: 'prog-1',
  name: 'B.Tech Computer Science',
  applicationFee: 500,
  duration: '4 years',
} as any

describe('ApplicationModal — application submission critical path', () => {
  beforeEach(() => {
    addDocMock.mockClear()
  })

  it('blocks submission until the document checklist is confirmed', async () => {
    render(<ApplicationModal program={program} universityId="uni-1" onClose={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)

    expect(await screen.findByText(/confirm your documents/i)).toBeInTheDocument()
    expect(addDocMock).not.toHaveBeenCalled()
  })

  it('writes a payload matching the Firestore rule contract (studentId + status:"submitted")', async () => {
    render(<ApplicationModal program={program} universityId="uni-1" onClose={() => {}} />)

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }))

    await waitFor(() => expect(addDocMock).toHaveBeenCalledTimes(1))

    const [, payload] = addDocMock.mock.calls[0]
    // These two fields are load-bearing: firestore.rules requires exactly
    // this shape on create (studentId == auth.uid && status == 'submitted').
    // A regression here would silently break every application submission.
    expect(payload.studentId).toBe('student-abc')
    expect(payload.status).toBe('submitted')
    expect(payload.universityId).toBe('uni-1')
    expect(payload.programId).toBe('prog-1')
  })
})
