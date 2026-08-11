import { Metadata } from 'next';
import StudentLayout from '@/components/StudentLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Student Dashboard | EDUING.in',
  description: 'Manage your university applications and explore programs.',
};

export default function RootStudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <StudentLayout>
        {children}
      </StudentLayout>
    </ErrorBoundary>
  );
}
