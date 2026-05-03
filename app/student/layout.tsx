import { Metadata } from 'next';
import StudentLayout from '@/components/StudentLayout';

export const metadata: Metadata = {
  title: 'Student Dashboard | EDUING.in',
  description: 'Manage your university applications and explore programs.',
};

export default function RootStudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>;
}
