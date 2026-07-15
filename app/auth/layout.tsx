import { Metadata } from 'next';
import AuthContainer from '@/components/AuthContainer';

export const metadata: Metadata = {
  title: 'Authentication | EDUING.in',
  description: 'Sign in or create an account for EDUING.in.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthContainer>{children}</AuthContainer>;
}
