import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | EDUING.in',
  description: 'Sign in or create an account for EDUING.in.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
